#!/bin/bash

# User Registration System Deployment Script for CentOS 7

# Stop on any error
set -e

# Configuration
APP_DIR="/var/www/registration-app"
NODE_VERSION="20"
GIT_REPO="https://github.com/Bringovia/UserRegistrationSystem.git"
APP_PORT=5000

echo "=== User Registration System Deployment ==="

# 1. Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# 2. Update system packages
echo "Updating system packages..."
yum update -y

# 3. Install required dependencies
echo "Installing dependencies..."
yum install -y git curl

# 4. Install Node.js if not already installed
if ! command -v node &> /dev/null || [[ $(node -v) != *"v$NODE_VERSION"* ]]; then
    echo "Installing Node.js $NODE_VERSION..."
    curl -sL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
    yum install -y nodejs
fi

# Verify Node.js installation
echo "Node.js $(node -v) installed"
echo "NPM $(npm -v) installed"

# 5. Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# 6. Create application directory
echo "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# 7. Clone or pull the repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull
else
    echo "Cloning repository..."
    git clone $GIT_REPO .
fi

# 8. Install dependencies
echo "Installing application dependencies..."
npm install

# 9. Build the application
echo "Building application..."
npm run build

# 10. Database setup
if [ -f ".env" ]; then
    echo "Using existing .env file"
else
    echo "Creating .env file with default settings..."
    cat <<EOT > .env
DATABASE_URL=postgres://username:password@localhost:5432/registration
SESSION_SECRET=secure-session-secret-change-me
NODE_ENV=production
EOT
    echo "Please update the .env file with your database credentials"
fi

# 11. Create and set up Nginx configuration
echo "Setting up Nginx..."
yum install -y nginx

cat <<EOT > /etc/nginx/conf.d/registration-app.conf
server {
    listen 80;
    server_name _;  # Replace with your domain name

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

# 12. Start Nginx
echo "Starting Nginx..."
systemctl enable nginx
systemctl restart nginx

# 13. Configure firewall
echo "Configuring firewall..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 14. Setup PM2 to start on boot
echo "Setting up PM2 to start on boot..."
pm2 start dist/index.js --name "registration-app"
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

echo "=== Deployment completed successfully ==="
echo "Your application should now be running at http://your-server-ip"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. If using a domain, update the Nginx configuration in /etc/nginx/conf.d/registration-app.conf"
echo "3. For HTTPS, install Certbot: yum install -y certbot python3-certbot-nginx"
echo "   Then run: certbot --nginx -d yourdomain.com"