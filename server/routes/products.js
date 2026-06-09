const express = require('express');
const { body, query } = require('express-validator');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat(),
  query('maxPrice').optional().isFloat(),
  query('sort').optional().isIn(['newest', 'price-asc', 'price-desc', 'popular'])
], (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const { category, search, minPrice, maxPrice, sort = 'newest' } = req.query;

    let filter = (product) => {
      if (category && product.category !== category) return false;
      if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && 
          !product.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (minPrice && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price > parseFloat(maxPrice)) return false;
      return product.status === 'active';
    };

    let result = db.paginate('products', page, limit, filter);

    // Sorting
    const sortMap = {
      'newest': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'popular': (a, b) => (b.sold || 0) - (a.sold || 0)
    };
    result.data.sort(sortMap[sort] || sortMap['newest']);

    // Enrich with reviews
    result.data = result.data.map(product => {
      const reviews = db.find('reviews', { productId: product.id });
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      return { ...product, reviewCount: reviews.length, avgRating: parseFloat(avgRating.toFixed(1)) };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  const reviews = db.find('reviews', { productId: product.id });
  const seller = db.findById('users', product.sellerId);

  res.json({
    ...product,
    reviews,
    reviewCount: reviews.length,
    avgRating: reviews.length > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 0,
    seller: seller ? { id: seller.id, name: seller.name, avatar: seller.avatar } : null
  });
});

// Create product (seller/admin)
router.post('/', authenticate, authorize('seller', 'admin'), upload.array('images', 5), (req, res) => {
  try {
    const { name, description, price, stock, category, condition = 'new' } = req.body;
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const product = db.create('products', {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      condition,
      images: images.length > 0 ? images : [`https://via.placeholder.com/400x400?text=${encodeURIComponent(name)}`],
      sellerId: req.user.id,
      status: 'active',
      sold: 0,
      views: 0
    });

    res.status(201).json({ message: 'Produk berhasil dibuat', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', authenticate, authorize('seller', 'admin'), (req, res) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Anda tidak memiliki akses' });
  }

  const updated = db.update('products', req.params.id, req.body);
  res.json({ message: 'Produk diperbarui', product: updated });
});

// Delete product
router.delete('/:id', authenticate, authorize('seller', 'admin'), (req, res) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Anda tidak memiliki akses' });
  }

  db.delete('products', req.params.id);
  res.json({ message: 'Produk dihapus' });
});

// Get seller products
router.get('/seller/my-products', authenticate, authorize('seller'), (req, res) => {
  const products = db.find('products', { sellerId: req.user.id });
  res.json(products);
});

module.exports = router;