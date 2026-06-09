# 🚀 Panduan Deployment TokoKita Marketplace

## 📋 Prasyarat

- Node.js v18+ terinstall
- npm atau yarn
- (Opsional) PM2 untuk production
- (Opsional) Nginx sebagai reverse proxy

---

## 🖥️ Local Development

### 1. Clone & Setup

```bash
# Extract project
cd marketplace
```

### 2. Jalankan Backend

```bash
cd server
npm install
npm start
```

Server berjalan di: `http://localhost:5000`

### 3. Jalankan Client (Terminal baru)

```bash
cd client
npm install
npm start
```

Marketplace berjalan di: `http://localhost:3000`

### 4. Jalankan Admin Panel (Terminal baru)

```bash
cd admin
npm install
npm start
```

Admin Panel berjalan di: `http://localhost:3001`

---

## 🌐 Production Deployment

### Option 1: VPS / Cloud Server (Recommended)

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Deploy Backend

```bash
cd /var/www/marketplace/server
npm install --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'marketplace-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Step 3: Build & Deploy Frontend

```bash
# Build Client
cd /var/www/marketplace/client
npm install
npm run build

# Build Admin
cd /var/www/marketplace/admin
npm install
npm run build
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/marketplace
```

```nginx
# API Server
server {
    listen 80;
    server_name api.tokokita.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/marketplace/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Client App
server {
    listen 80;
    server_name tokokita.com;
    root /var/www/marketplace/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.tokokita.com;
    root /var/www/marketplace/admin/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL dengan Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tokokita.com -d api.tokokita.com -d admin.tokokita.com
```

---

### Option 2: Docker Deployment

#### Dockerfile - Server

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Dockerfile - Client

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_SECRET_KEY=${ADMIN_SECRET_KEY}
    volumes:
      - ./server/uploads:/app/uploads
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "3000:80"
    restart: unless-stopped

  admin:
    build: ./admin
    ports:
      - "3001:80"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - client
      - admin
    restart: unless-stopped
```

---

### Option 3: Platform Cloud (Heroku, Railway, Render)

#### Heroku

```bash
# Server
heroku create tokokita-api
heroku config:set JWT_SECRET=your-secret
heroku config:set ADMIN_SECRET_KEY=your-admin-key

git subtree push --prefix server heroku main

# Client (static)
heroku create tokokita-client
# Deploy build folder
```

#### Render / Railway / Vercel

1. Push code ke GitHub
2. Connect repository ke platform
3. Set environment variables
4. Deploy otomatis

---

## 🔒 Keamanan Production

### Wajib Dilakukan:

1. **Ubah semua secret keys**
   ```bash
   # Generate random strings
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Set NODE_ENV=production**
   ```bash
   export NODE_ENV=production
   ```

3. **Enable HTTPS** (SSL/TLS)

4. **Setup firewall**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

5. **Regular updates**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
```

---

## 🔄 Backup Database

Karena menggunakan JSON database:

```bash
# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/marketplace/server/database.json /var/backups/marketplace_db_$DATE.json
# Keep only last 30 backups
ls -t /var/backups/marketplace_db_*.json | tail -n +31 | xargs rm -f
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/marketplace/backup.sh") | crontab -
```

---

## 🆘 Troubleshooting

### Port already in use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Permission denied
```bash
sudo chown -R $USER:$USER /var/www/marketplace
```

### CORS issues
Pastikan `CORS_ORIGIN` di .env sesuai dengan domain frontend.

### Build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

Jika ada kendala, periksa:
1. Logs: `pm2 logs` atau `journalctl -u nginx`
2. Health check: `curl http://localhost:5000/api/health`
3. File permissions
4. Environment variables
