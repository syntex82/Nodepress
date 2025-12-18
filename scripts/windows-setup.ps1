#═══════════════════════════════════════════════════════════════════════════════
# WordPress Node CMS - Windows Setup Script
# Works on Windows 11 and Windows Server
# Run this from inside the cloned repository folder
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows-setup.ps1
#═══════════════════════════════════════════════════════════════════════════════

# Requires admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Run PowerShell as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Detect Windows version
$osVersion = [System.Environment]::OSVersion.VersionString
Write-Host "Detected OS: $osVersion" -ForegroundColor Cyan

$DB_NAME = "wordpress_node"
$DB_USER = "wpnode"
$DB_PASSWORD = "wpnode123"
$ADMIN_EMAIL = "admin@starter.dev"
$ADMIN_PASSWORD = "Admin123!"

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "       WordPress Node CMS - Windows Server Setup" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue

# Get the directory where the script is located
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$APP_DIR = Split-Path -Parent $SCRIPT_DIR

Write-Host "Project directory: $APP_DIR" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 1: Check and install Chocolatey
# ══════════════════════════════════════════════════════════════
Write-Host "[1/7] Checking Chocolatey..." -ForegroundColor Blue

if (-NOT (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Blue
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}
Write-Host "✓ Chocolatey ready" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 2: Install Node.js 20
# ══════════════════════════════════════════════════════════════
Write-Host "[2/7] Installing Node.js 20..." -ForegroundColor Blue

if (-NOT (Get-Command node -ErrorAction SilentlyContinue)) {
    choco install nodejs --version=20.11.0 -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
Write-Host "Node $(node -v), npm $(npm -v)" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 3: Install PostgreSQL
# ══════════════════════════════════════════════════════════════
Write-Host "[3/7] Installing PostgreSQL..." -ForegroundColor Blue

if (-NOT (Get-Command psql -ErrorAction SilentlyContinue)) {
    choco install postgresql --version=15.0 -y --params '/Password:postgres'
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Create database and user
$psqlCmd = "psql -U postgres -h localhost"

Write-Host "Creating database and user..." -ForegroundColor Blue
& cmd /c "$psqlCmd -c `"DROP DATABASE IF EXISTS $DB_NAME;`" 2>nul"
& cmd /c "$psqlCmd -c `"DROP USER IF EXISTS $DB_USER;`" 2>nul"
& cmd /c "$psqlCmd -c `"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';`""
& cmd /c "$psqlCmd -c `"CREATE DATABASE $DB_NAME OWNER $DB_USER;`""
& cmd /c "$psqlCmd -c `"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;`""

Write-Host "✓ PostgreSQL ready (db: $DB_NAME, user: $DB_USER)" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 4: Install Redis
# ══════════════════════════════════════════════════════════════
Write-Host "[4/7] Installing Redis..." -ForegroundColor Blue

if (-NOT (Get-Command redis-cli -ErrorAction SilentlyContinue)) {
    choco install redis-64 -y
}
Write-Host "✓ Redis ready" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 5: Create .env file
# ══════════════════════════════════════════════════════════════
Write-Host "[5/7] Creating .env file..." -ForegroundColor Blue

$envContent = @"
DATABASE_URL="postgresql://$DB_USER`:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
DIRECT_DATABASE_URL="postgresql://$DB_USER`:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
APP_URL=http://localhost:3000
JWT_SECRET=supersecretjwtkey123456789012345678901234567890
JWT_EXPIRES_IN=7d
SESSION_SECRET=supersessionsecret12345678901234567890123456789
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
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
SITE_NAME="WordPress Node"
SITE_DESCRIPTION="A modern CMS built with Node.js"
ACTIVE_THEME=my-theme
"@

Set-Content -Path "$APP_DIR\.env" -Value $envContent
Write-Host "✓ .env created" -ForegroundColor Green

# ══════════════════════════════════════════════════════════════
# STEP 6: Install dependencies and build
# ══════════════════════════════════════════════════════════════
Write-Host "[6/7] Installing npm dependencies and building..." -ForegroundColor Blue

Set-Location $APP_DIR

Write-Host "Installing backend dependencies..." -ForegroundColor Blue
npm install

Write-Host "Rebuilding native modules..." -ForegroundColor Blue
npm rebuild

Write-Host "Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

Write-Host "Installing admin dependencies..." -ForegroundColor Blue
Set-Location "$APP_DIR\admin"
npm install

Write-Host "Building admin frontend..." -ForegroundColor Blue
npm run build

Write-Host "Building backend..." -ForegroundColor Blue
Set-Location $APP_DIR
npm run build

# ══════════════════════════════════════════════════════════════
# STEP 7: Setup database
# ══════════════════════════════════════════════════════════════
Write-Host "[7/7] Setting up database..." -ForegroundColor Blue

Write-Host "Pushing database schema..." -ForegroundColor Blue
npx prisma db push

Write-Host "Seeding database..." -ForegroundColor Blue
npx prisma db seed

# Create folders
New-Item -ItemType Directory -Force -Path "$APP_DIR\uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "$APP_DIR\themes" | Out-Null

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "              ✓ INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Blue
Write-Host "  npm run dev" -ForegroundColor Blue
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Blue
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Blue
Write-Host "  Admin:     http://localhost:3000/admin" -ForegroundColor Blue
Write-Host "  API:       http://localhost:3000/api" -ForegroundColor Blue
Write-Host "  Health:    http://localhost:3000/health" -ForegroundColor Blue
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Blue
Write-Host "  Email:     $ADMIN_EMAIL" -ForegroundColor Blue
Write-Host "  Password:  $ADMIN_PASSWORD" -ForegroundColor Blue
Write-Host ""
Write-Host "Themes Included:" -ForegroundColor Blue
Write-Host "  • my-theme (default)" -ForegroundColor Blue
Write-Host "  • tester" -ForegroundColor Blue
Write-Host ""

