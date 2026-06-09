const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const notifications = db.find('notifications', { userId: req.user.id })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifications);
});

router.put('/:id/read', authenticate, (req, res) => {
  const notification = db.findById('notifications', req.params.id);
  if (!notification || notification.userId !== req.user.id) {
    return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
  }
  db.update('notifications', req.params.id, { read: true });
  res.json({ message: 'Notifikasi dibaca' });
});

router.put('/read-all', authenticate, (req, res) => {
  const notifications = db.find('notifications', { userId: req.user.id });
  notifications.forEach(n => {
    db.update('notifications', n.id, { read: true });
  });
  res.json({ message: 'Semua notifikasi dibaca' });
});

module.exports = router;