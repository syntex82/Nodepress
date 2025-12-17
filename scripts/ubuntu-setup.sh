#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# WordPress Node CMS - Ubuntu Server Setup Script
#═══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO_URL="https://github.com/syntex82/WordPress-Node.git"
DB_NAME="wordpress_node"
DB_USER="wpnode"
DB_PASSWORD="wpnode123"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="SecureAdmin@2024!"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       WordPress Node CMS - Ubuntu Server Setup                ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: Run with sudo${NC}"
    exit 1
fi

ACTUAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$ACTUAL_USER)
APP_DIR="${USER_HOME}/wordpress-node"

echo -e "${GREEN}Installing to: ${APP_DIR}${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 1: System packages
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[1/8] Installing system packages...${NC}"
apt update
apt install -y curl wget git build-essential ca-certificates gnupg lsb-release

# ══════════════════════════════════════════════════════════════
# STEP 2: Node.js 20
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[2/8] Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
node -v
npm -v

# ══════════════════════════════════════════════════════════════
# STEP 3: PostgreSQL
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[3/8] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 4: Redis
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[4/8] Installing Redis...${NC}"
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
echo -e "${GREEN}✓ Redis ready${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 5: Nginx
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[5/8] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx ready${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 6: Clone repository
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[6/8] Cloning repository...${NC}"
rm -rf ${APP_DIR}
git clone ${REPO_URL} ${APP_DIR}
chown -R ${ACTUAL_USER}:${ACTUAL_USER} ${APP_DIR}
echo -e "${GREEN}✓ Repository cloned${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 7: Create .env file FIRST (before npm install)
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[7/8] Creating .env file...${NC}"
cat > ${APP_DIR}/.env << EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public
DIRECT_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
APP_URL=http://localhost:3000
JWT_SECRET=supersecretjwtkey123456789012345678901234567890
JWT_EXPIRES_IN=7d
SESSION_SECRET=supersessionsecret12345678901234567890123456789
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=wpnode:
CACHE_TTL=300
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
STORAGE_PROVIDER=local
STORAGE_LOCAL_URL=/uploads
SITE_NAME=WordPress Node
SITE_DESCRIPTION=A modern CMS built with Node.js
ACTIVE_THEME=default
EOF
chown ${ACTUAL_USER}:${ACTUAL_USER} ${APP_DIR}/.env
echo -e "${GREEN}✓ .env created${NC}"

# ══════════════════════════════════════════════════════════════
# STEP 8: Install dependencies and setup database
# ══════════════════════════════════════════════════════════════
echo -e "${BLUE}[8/8] Installing dependencies...${NC}"

cd ${APP_DIR}

# Backend dependencies
su - ${ACTUAL_USER} -c "cd ${APP_DIR} && npm install"

# Generate Prisma client
su - ${ACTUAL_USER} -c "cd ${APP_DIR} && npx prisma generate"

# Admin dependencies
su - ${ACTUAL_USER} -c "cd ${APP_DIR}/admin && npm install"

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
su - ${ACTUAL_USER} -c "cd ${APP_DIR} && npx prisma migrate deploy"

# Seed database
echo -e "${BLUE}Seeding database...${NC}"
su - ${ACTUAL_USER} -c "cd ${APP_DIR} && npx prisma db seed"

# Create uploads folder
mkdir -p ${APP_DIR}/uploads
chown -R ${ACTUAL_USER}:${ACTUAL_USER} ${APP_DIR}/uploads

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       ✓ INSTALLATION COMPLETE!                                ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "To start: ${BLUE}cd ${APP_DIR} && npm run dev${NC}"
echo ""
echo -e "Admin Panel: ${BLUE}http://localhost:3000/admin${NC}"
echo -e "Email: ${BLUE}${ADMIN_EMAIL}${NC}"
echo -e "Password: ${BLUE}${ADMIN_PASSWORD}${NC}"
echo ""

