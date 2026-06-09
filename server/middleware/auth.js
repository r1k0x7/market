const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.findById('users', decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autentikasi diperlukan' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    next();
  };
};

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token admin diperlukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.findById('users', decoded.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses admin diperlukan' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = { authenticate, authorize, adminAuth };
