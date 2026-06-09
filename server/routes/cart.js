const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', authenticate, (req, res) => {
  let cart = db.findOne('carts', { userId: req.user.id });
  if (!cart) {
    cart = db.create('carts', { userId: req.user.id, items: [], total: 0 });
  }

  // Enrich with product details
  const enrichedItems = cart.items.map(item => {
    const product = db.findById('products', item.productId);
    return { ...item, product: product || null };
  }).filter(item => item.product !== null);

  const total = enrichedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  res.json({ ...cart, items: enrichedItems, total });
});

// Add to cart
router.post('/add', authenticate, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.findById('products', productId);

  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ message: 'Stok tidak mencukupi' });
  }

  let cart = db.findOne('carts', { userId: req.user.id });
  if (!cart) {
    cart = db.create('carts', { userId: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    cart.items.push({ productId, quantity: parseInt(quantity) });
  }

  db.update('carts', cart.id, { items: cart.items });
  res.json({ message: 'Ditambahkan ke keranjang', cart });
});

// Update quantity
router.put('/update/:productId', authenticate, (req, res) => {
  const { quantity } = req.body;
  const cart = db.findOne('carts', { userId: req.user.id });

  if (!cart) {
    return res.status(404).json({ message: 'Keranjang kosong' });
  }

  const item = cart.items.find(i => i.productId === req.params.productId);
  if (!item) {
    return res.status(404).json({ message: 'Item tidak ditemukan' });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  } else {
    item.quantity = parseInt(quantity);
  }

  db.update('carts', cart.id, { items: cart.items });
  res.json({ message: 'Keranjang diperbarui', cart });
});

// Remove from cart
router.delete('/remove/:productId', authenticate, (req, res) => {
  const cart = db.findOne('carts', { userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ message: 'Keranjang kosong' });
  }

  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  db.update('carts', cart.id, { items: cart.items });
  res.json({ message: 'Item dihapus', cart });
});

// Clear cart
router.delete('/clear', authenticate, (req, res) => {
  const cart = db.findOne('carts', { userId: req.user.id });
  if (cart) {
    db.update('carts', cart.id, { items: [] });
  }
  res.json({ message: 'Keranjang dikosongkan' });
});

module.exports = router;