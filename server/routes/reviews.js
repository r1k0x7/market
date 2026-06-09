const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', authenticate, (req, res) => {
  const { productId, rating, comment } = req.body;

  // Check if user bought the product
  const orders = db.find('orders', { userId: req.user.id });
  const hasBought = orders.some(order => 
    order.status === 'delivered' && 
    order.items.some(item => item.productId === productId)
  );

  if (!hasBought) {
    return res.status(403).json({ message: 'Anda harus membeli produk ini terlebih dahulu' });
  }

  // Check if already reviewed
  const existingReview = db.findOne('reviews', { productId, userId: req.user.id });
  if (existingReview) {
    return res.status(400).json({ message: 'Anda sudah memberikan review' });
  }

  const review = db.create('reviews', {
    productId,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: req.user.avatar,
    rating: parseInt(rating),
    comment,
    helpful: 0
  });

  res.status(201).json({ message: 'Review berhasil ditambahkan', review });
});

// Get product reviews
router.get('/product/:productId', (req, res) => {
  const reviews = db.find('reviews', { productId: req.params.productId })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(reviews);
});

// Mark review helpful
router.post('/:id/helpful', authenticate, (req, res) => {
  const review = db.findById('reviews', req.params.id);
  if (!review) {
    return res.status(404).json({ message: 'Review tidak ditemukan' });
  }

  db.update('reviews', req.params.id, { helpful: (review.helpful || 0) + 1 });
  res.json({ message: 'Terima kasih atas feedback Anda' });
});

module.exports = router;
