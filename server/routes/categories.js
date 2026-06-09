const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = db.findAll('categories');
  // Add product count for each category
  const enriched = categories.map(cat => {
    const count = db.find('products', { category: cat.slug, status: 'active' }).length;
    return { ...cat, productCount: count };
  });
  res.json(enriched);
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { name, slug, icon, description } = req.body;
  const category = db.create('categories', { name, slug, icon, description });
  res.status(201).json(category);
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const updated = db.update('categories', req.params.id, req.body);
  res.json(updated);
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  db.delete('categories', req.params.id);
  res.json({ message: 'Kategori dihapus' });
});

module.exports = router;