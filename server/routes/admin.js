const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { adminAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    // Verify admin key
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Admin key tidak valid' });
    }

    const user = db.findOne('users', { email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Akun admin tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login admin berhasil',
      token,
      admin: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, (req, res) => {
  const stats = db.getStats();

  // Additional stats
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = db.find('orders', { status: 'completed' })
    .filter(o => o.createdAt.startsWith(today))
    .reduce((sum, o) => sum + o.total, 0);

  const newUsersToday = db.find('users', {})
    .filter(u => u.createdAt?.startsWith(today)).length;

  // Monthly revenue data
  const monthlyRevenue = {};
  db.findAll('orders').forEach(order => {
    const month = order.createdAt.substring(0, 7);
    if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
    if (order.status === 'completed') {
      monthlyRevenue[month] += order.total;
    }
  });

  res.json({
    ...stats,
    todayRevenue,
    newUsersToday,
    monthlyRevenue,
    recentOrders: db.findAll('orders')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(order => {
        const user = db.findById('users', order.userId);
        return { ...order, userName: user?.name || 'Unknown' };
      })
  });
});

// Get all users
router.get('/users', adminAuth, (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  let users = db.findAll('users');

  if (search) {
    users = users.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (role) {
    users = users.filter(u => u.role === role);
  }

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (page - 1) * limit;
  const paginated = users.slice(start, start + parseInt(limit));

  const safeUsers = paginated.map(u => {
    const { password, ...rest } = u;
    return rest;
  });

  res.json({
    data: safeUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.length,
      totalPages: Math.ceil(users.length / limit)
    }
  });
});

// Update user status
router.put('/users/:id/status', adminAuth, (req, res) => {
  const { isActive } = req.body;
  const user = db.findById('users', req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  db.update('users', req.params.id, { isActive });

  db.create('adminLogs', {
    adminId: req.user.id,
    action: 'UPDATE_USER_STATUS',
    targetId: req.params.id,
    details: `Status user diubah ke ${isActive ? 'aktif' : 'nonaktif'}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Status user diperbarui' });
});

// Get all products (admin view)
router.get('/products', adminAuth, (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  let products = db.findAll('products');

  if (status) products = products.filter(p => p.status === status);
  if (search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (page - 1) * limit;
  const paginated = products.slice(start, start + parseInt(limit));

  // Enrich with seller info
  const enriched = paginated.map(p => {
    const seller = db.findById('users', p.sellerId);
    return { ...p, sellerName: seller?.name || 'Unknown' };
  });

  res.json({
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length,
      totalPages: Math.ceil(products.length / limit)
    }
  });
});

// Moderate product
router.put('/products/:id/moderate', adminAuth, (req, res) => {
  const { status, reason } = req.body;
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  db.update('products', req.params.id, { status });

  db.create('adminLogs', {
    adminId: req.user.id,
    action: 'MODERATE_PRODUCT',
    targetId: req.params.id,
    details: `Produk ${status}. Alasan: ${reason || '-'}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Produk dimoderasi' });
});

// Get admin logs
router.get('/logs', adminAuth, (req, res) => {
  const logs = db.findAll('adminLogs')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 100);
  res.json(logs);
});

module.exports = router;