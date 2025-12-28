#!/bin/bash
# Hostinger VPS Setup Script for WordPressNode
# Run this script after uploading and extracting deploy-package.zip

echo "=== WordPressNode Hostinger VPS Setup ==="

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

# Install MySQL
echo "Installing MySQL..."
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Create database
echo "Creating database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS wordpressnode;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'wpnode'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON wordpressnode.* TO 'wpnode'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Navigate to app directory
cd /var/www/wordpressnode

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
DATABASE_URL="mysql://wpnode:YOUR_DB_PASSWORD@localhost:3306/wordpressnode"

# App
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this

# Domain
APP_URL=https://wordpressnode.co.uk
CORS_ORIGINS=https://wordpressnode.co.uk

# Email (configure your SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@wordpressnode.co.uk
SMTP_PASS=your-email-password
EOF

# Start with PM2
echo "Starting application..."
pm2 start dist/main.js --name wordpressnode
pm2 save
pm2 startup

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/wordpressnode << 'EOF'
server {
    listen 80;
    server_name wordpressnode.co.uk www.wordpressnode.co.uk;
    
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

sudo ln -sf /etc/nginx/sites-available/wordpressnode /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install SSL with Certbot
echo "Installing SSL certificate..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wordpressnode.co.uk -d www.wordpressnode.co.uk

echo "=== Setup Complete! ==="
echo "Your site should be live at https://wordpressnode.co.uk"

