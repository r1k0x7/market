# 🛒 TokoKita - Marketplace Fullstack Application

Marketplace lengkap dengan **Backend API**, **Frontend Client**, dan **Admin Panel**.

## 📁 Struktur Project

```
marketplace/
├── server/           # Backend API (Express.js)
├── client/           # Frontend Marketplace (React)
└── admin/            # Admin Panel (React)
```

## 🚀 Cara Menjalankan

### 1. Backend Server

```bash
cd server
npm install
npm start
```

Server akan berjalan di `http://localhost:5000`

**Default Admin Account:**
- Email: `admin@marketplace.com`
- Password: `admin123`
- Admin Key: `admin-super-secret-2024`

### 2. Client (Marketplace)

```bash
cd client
npm install
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### 3. Admin Panel

```bash
cd admin
npm install
npm start
```

Admin Panel akan berjalan di `http://localhost:3001` (atau port berikutnya)

## ⚙️ Konfigurasi

### Server (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=admin-super-secret-2024
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Client (opsional - .env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Admin (opsional - .env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters, pagination, sorting)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller/admin)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update/:productId` - Update quantity
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order detail
- `PUT /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders` - Get all orders (admin)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/:id/helpful` - Mark helpful

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Toggle user status
- `GET /api/admin/products` - Get all products (admin view)
- `PUT /api/admin/products/:id/moderate` - Moderate product
- `GET /api/admin/logs` - Get admin logs

## 🎯 Fitur

### Client (Marketplace)
- ✅ Autentikasi (Login/Register)
- ✅ Role-based: Pembeli & Penjual
- ✅ Katalog produk dengan filter & search
- ✅ Keranjang belanja
- ✅ Checkout multi-step
- ✅ Riwayat pesanan
- ✅ Review & rating produk
- ✅ Dashboard penjual (CRUD produk)
- ✅ Upload gambar produk
- ✅ Responsive design

### Admin Panel
- ✅ Dashboard dengan statistik
- ✅ Manajemen produk (moderasi)
- ✅ Manajemen pesanan (update status)
- ✅ Manajemen pengguna (aktif/nonaktif)
- ✅ Peringatan stok rendah & pesanan pending
- ✅ Admin logs

### Backend
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ File upload (Multer)
- ✅ Input validation (express-validator)
- ✅ JSON Database (tanpa setup database eksternal)
- ✅ Pagination & Sorting
- ✅ Error handling

## 🛡️ Keamanan

- Password hashing dengan bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- File upload restrictions
- Admin key verification

## 📝 Catatan

- Database menggunakan file JSON (`server/database.json`) - tidak perlu setup database eksternal
- Untuk production, disarankan menggunakan database seperti MongoDB atau PostgreSQL
- Admin key harus diubah di file `.env` untuk keamanan
- Upload gambar disimpan di folder `server/uploads/`

## 🏗️ Tech Stack

**Backend:**
- Node.js
- Express.js
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- multer (file upload)
- express-validator (validation)
- uuid (ID generation)

**Frontend:**
- React 18
- React Router DOM
- Axios (HTTP client)
- Lucide React (icons)
- Tailwind CSS (styling)
- React Hot Toast (notifications)

**Admin Panel:**
- React 18
- React Router DOM
- Axios
- Lucide React
- Tailwind CSS
- React Hot Toast
- Recharts (charts - siap untuk integrasi)

## 📄 Lisensi

MIT License
