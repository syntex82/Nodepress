#!/bin/bash
# Hostinger VPS Setup Script for NodePress CMS
# Run this script after uploading and extracting deploy-package.zip

echo "=== NodePress CMS - Hostinger VPS Setup ==="

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Create database
echo "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS nodepress;"
sudo -u postgres psql -c "CREATE USER IF NOT EXISTS 'nodepress'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nodepress TO nodepress;"

# Navigate to app directory
cd /var/www/NodePress

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Generate Prisma client
echo "Setting up database..."
npx prisma generate
npx prisma migrate deploy

# Create .env file
echo "Creating .env file..."
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://nodepress:YOUR_DB_PASSWORD@localhost:5432/nodepress"

# App
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this

# Domain
APP_URL=https://nodepress.co.uk
CORS_ORIGINS=https://nodepress.co.uk

# Email (configure your SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@nodepress.co.uk
SMTP_PASS=your-email-password
EOF

# Start with PM2
echo "Starting application..."
pm2 start dist/main.js --name nodepress
pm2 save
pm2 startup

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/nodepress << 'EOF'
server {
    listen 80;
    server_name nodepress.co.uk www.nodepress.co.uk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/nodepress /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install SSL with Certbot
echo "Installing SSL certificate..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nodepress.co.uk -d www.nodepress.co.uk

echo "=== Setup Complete! ==="
echo "Your site should be live at https://nodepress.co.uk"

