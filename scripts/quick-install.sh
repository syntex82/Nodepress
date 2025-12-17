#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# WordPress Node CMS - Quick Install (Development)
# Just installs dependencies and runs dev server
# 
# Usage: 
#   chmod +x scripts/quick-install.sh
#   sudo ./scripts/quick-install.sh
#   
# After running, just do: npm run dev
#═══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       WordPress Node CMS - Quick Install                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Run as root: sudo ./quick-install.sh${NC}"
    exit 1
fi

# Get the actual user who ran sudo
ACTUAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$ACTUAL_USER)

echo -e "${BLUE}[1/5] Updating system...${NC}"
apt update
apt install -y curl wget git build-essential

echo -e "${BLUE}[2/5] Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}Node $(node -v) installed${NC}"

echo -e "${BLUE}[3/5] Installing PostgreSQL 16...${NC}"
if ! command -v psql &> /dev/null; then
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt update && apt install -y postgresql-16
fi
systemctl start postgresql && systemctl enable postgresql

# Create database
DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
sudo -u postgres psql -c "CREATE USER wpnode WITH PASSWORD '${DB_PASS}';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE wordpress_node OWNER wpnode;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE wordpress_node TO wpnode;" 2>/dev/null || true
echo -e "${GREEN}PostgreSQL configured (password: ${DB_PASS})${NC}"

echo -e "${BLUE}[4/5] Installing Redis...${NC}"
apt install -y redis-server
systemctl start redis-server && systemctl enable redis-server
echo -e "${GREEN}Redis installed${NC}"

echo -e "${BLUE}[5/5] Setting up project...${NC}"
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

# Create .env if not exists
if [ ! -f .env ]; then
    JWT=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)
    SESSION=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)
    
    cat > .env << EOF
DATABASE_URL="postgresql://wpnode:${DB_PASS}@localhost:5432/wordpress_node?schema=public"
DIRECT_DATABASE_URL="postgresql://wpnode:${DB_PASS}@localhost:5432/wordpress_node?schema=public"
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
APP_URL=http://localhost:3000
JWT_SECRET=${JWT}
JWT_EXPIRES_IN=7d
SESSION_SECRET=${SESSION}
ADMIN_EMAIL=admin@starter.dev
ADMIN_PASSWORD=Admin123!
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
STORAGE_PROVIDER=local
STORAGE_LOCAL_URL=/uploads
SITE_NAME=WordPress Node
SITE_DESCRIPTION=A modern CMS
ACTIVE_THEME=default
EOF
    echo -e "${GREEN}.env created${NC}"
fi

# Fix ownership for npm
chown -R $ACTUAL_USER:$ACTUAL_USER "$PROJECT_DIR"

# Install as the actual user
echo -e "${BLUE}Installing npm packages...${NC}"
su - $ACTUAL_USER -c "cd '$PROJECT_DIR' && npm install"
su - $ACTUAL_USER -c "cd '$PROJECT_DIR' && npm run db:generate"
su - $ACTUAL_USER -c "cd '$PROJECT_DIR/admin' && npm install"

echo -e "${BLUE}Pushing database schema...${NC}"
su - $ACTUAL_USER -c "cd '$PROJECT_DIR' && npx prisma db push"
su - $ACTUAL_USER -c "cd '$PROJECT_DIR' && npm run db:seed"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       Installation Complete!                                  ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "To start development:"
echo -e "  Terminal 1: ${BLUE}npm run dev${NC}        (backend)"
echo -e "  Terminal 2: ${BLUE}npm run admin:dev${NC}  (admin panel)"
echo ""
echo -e "Admin: ${BLUE}http://localhost:5173/admin${NC}"
echo -e "Email: ${YELLOW}admin@starter.dev${NC}"
echo -e "Password: ${YELLOW}Admin123!${NC}"
echo ""

