const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'database.json');

// Initialize database with default data
const defaultData = {
  users: [],
  products: [],
  orders: [],
  categories: [
    { id: 'cat-1', name: 'Elektronik', slug: 'elektronik', icon: '💻', description: 'Gadget dan perangkat elektronik' },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion', icon: '👕', description: 'Pakaian dan aksesoris' },
    { id: 'cat-3', name: 'Makanan', slug: 'makanan', icon: '🍔', description: 'Makanan dan minuman' },
    { id: 'cat-4', name: 'Rumah Tangga', slug: 'rumah-tangga', icon: '🏠', description: 'Kebutuhan rumah tangga' },
    { id: 'cat-5', name: 'Olahraga', slug: 'olahraga', icon: '⚽', description: 'Peralatan olahraga' },
    { id: 'cat-6', name: 'Kesehatan', slug: 'kesehatan', icon: '💊', description: 'Produk kesehatan' }
  ],
  reviews: [],
  carts: [],
  notifications: [],
  adminLogs: []
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    this.save(defaultData);
    return { ...defaultData };
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Generic CRUD operations
  findAll(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return this.data[collection]?.find(item => item.id === id);
  }

  findOne(collection, query) {
    return this.data[collection]?.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  find(collection, query) {
    return this.data[collection]?.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    }) || [];
  }

  create(collection, data) {
    const newItem = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  update(collection, id, data) {
    const index = this.data[collection]?.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data[collection][index] = { 
      ...this.data[collection][index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = this.data[collection]?.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }

  // Advanced queries
  search(collection, field, query) {
    return this.data[collection]?.filter(item => 
      item[field]?.toLowerCase().includes(query.toLowerCase())
    ) || [];
  }

  paginate(collection, page = 1, limit = 10, filter = null) {
    let items = this.data[collection] || [];
    if (filter) {
      items = items.filter(filter);
    }
    const total = items.length;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);
    return {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Analytics helpers
  getStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return {
      totalUsers: this.data.users.length,
      totalProducts: this.data.products.length,
      totalOrders: this.data.orders.length,
      totalRevenue: this.data.orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0),
      todayOrders: this.data.orders.filter(o => 
        o.createdAt.startsWith(today)
      ).length,
      pendingOrders: this.data.orders.filter(o => 
        o.status === 'pending'
      ).length,
      lowStockProducts: this.data.products.filter(p => 
        p.stock < 10
      ).length
    };
  }
}

module.exports = new Database();