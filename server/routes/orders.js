const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticate, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db.findById('products', item.productId);
      if (!product) {
        return res.status(404).json({ message: `Produk ${item.productId} tidak ditemukan` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok ${product.name} tidak mencukupi` });
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]
      });

      // Update stock
      db.update('products', product.id, { 
        stock: product.stock - item.quantity,
        sold: (product.sold || 0) + item.quantity
      });
    }

    const order = db.create('orders', {
      userId: req.user.id,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
      trackingNumber: null,
      shippedAt: null,
      deliveredAt: null
    });

    // Clear cart
    const cart = db.findOne('carts', { userId: req.user.id });
    if (cart) {
      db.update('carts', cart.id, { items: [] });
    }

    // Create notification
    db.create('notifications', {
      userId: req.user.id,
      type: 'order',
      title: 'Pesanan Berhasil Dibuat',
      message: `Pesanan #${order.id.slice(-6)} telah dibuat. Total: Rp ${total.toLocaleString('id-ID')}`,
      read: false,
      orderId: order.id
    });

    res.status(201).json({ message: 'Pesanan berhasil dibuat', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', authenticate, (req, res) => {
  const orders = db.find('orders', { userId: req.user.id })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// Get order detail
router.get('/:id', authenticate, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  }
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  res.json(order);
});

// Update order status (admin)
router.put('/:id/status', authenticate, authorize('admin'), (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  }

  const updates = { status };
  if (status === 'shipped') {
    updates.trackingNumber = trackingNumber;
    updates.shippedAt = new Date().toISOString();
  }
  if (status === 'delivered') {
    updates.deliveredAt = new Date().toISOString();
    updates.paymentStatus = 'paid';
  }
  if (status === 'cancelled') {
    // Restore stock
    order.items.forEach(item => {
      const product = db.findById('products', item.productId);
      if (product) {
        db.update('products', product.id, { 
          stock: product.stock + item.quantity,
          sold: Math.max(0, (product.sold || 0) - item.quantity)
        });
      }
    });
  }

  const updated = db.update('orders', req.params.id, updates);

  // Notify user
  db.create('notifications', {
    userId: order.userId,
    type: 'order',
    title: 'Status Pesanan Diperbarui',
    message: `Pesanan #${order.id.slice(-6)} status: ${status}`,
    read: false,
    orderId: order.id
  });

  res.json({ message: 'Status diperbarui', order: updated });
});

// Get all orders (admin)
router.get('/', authenticate, authorize('admin'), (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let orders = db.findAll('orders');

  if (status) {
    orders = orders.filter(o => o.status === status);
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (page - 1) * limit;
  const paginated = orders.slice(start, start + parseInt(limit));

  // Enrich with user info
  const enriched = paginated.map(order => {
    const user = db.findById('users', order.userId);
    return { ...order, user: user ? { name: user.name, email: user.email } : null };
  });

  res.json({
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: orders.length,
      totalPages: Math.ceil(orders.length / limit)
    }
  });
});

module.exports = router;