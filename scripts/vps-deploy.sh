#!/bin/bash
# City Plus Pet Shop - VPS Deployment Script
# Run this ON the server (Ubuntu 22.04/24.04)
# Usage: sudo bash vps-deploy.sh

set -e

DOMAIN="citypetshopbd.com"
APP_DIR="/var/www/city-plus-pet-shop"

echo "=== City Plus Pet Shop VPS Deploy ==="

# Ensure we're in app dir or it exists
if [ ! -d "$APP_DIR" ]; then
    echo "Creating $APP_DIR"
    mkdir -p "$APP_DIR"
    chown "$(whoami):$(whoami)" "$APP_DIR" 2>/dev/null || true
fi

if [ -f "package.json" ]; then
    APP_DIR="$(pwd)"
    echo "Using current dir: $APP_DIR"
fi

cd "$APP_DIR"

# 1. Install Node.js 20 if not present
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
    echo ">>> Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node: $(node -v)"

# 2. Install Nginx, Git, Certbot if not present
for pkg in nginx git; do
    if ! dpkg -l | grep -q "^ii  $pkg"; then
        echo ">>> Installing $pkg..."
        apt-get update
        apt-get install -y $pkg
    fi
done

# 3. Install PM2 globally
if ! command -v pm2 &>/dev/null; then
    echo ">>> Installing PM2..."
    npm install -g pm2
fi

# 4. Check .env.production
if [ ! -f ".env.production" ]; then
    echo ""
    echo "WARNING: .env.production not found!"
    echo "Create it with your Supabase, Sanity keys before starting."
    echo "Copy from .env.production.example"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 5. Install deps and build
echo ">>> Installing dependencies..."
npm ci --omit=dev 2>/dev/null || npm ci
echo ">>> Building..."
npm run build

# 6. Update ecosystem.config.cjs cwd if needed
if [ -f "ecosystem.config.cjs" ]; then
    sed -i "s|cwd:.*|cwd: '$APP_DIR',|" ecosystem.config.cjs
fi

# 7. PM2
echo ">>> Starting PM2..."
pm2 delete city-plus-pet-shop 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# 8. Nginx
echo ">>> Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/citypetshopbd"
if [ -f "scripts/nginx-citypetshopbd.conf" ]; then
    cp scripts/nginx-citypetshopbd.conf "$NGINX_CONF"
else
    cat > "$NGINX_CONF" << 'NGINX'
server {
    listen 80;
    server_name citypetshopbd.com www.citypetshopbd.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
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
NGINX
fi
ln -sf /etc/nginx/sites-available/citypetshopbd /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 9. SSL (optional - run if domain is pointed)
echo ""
echo ">>> SSL: Run this manually if domain is ready:"
echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "=== Done! App running on http://$(hostname -I | awk '{print $1}'):3000"
echo "    With Nginx: http://$DOMAIN (once DNS points here)"
pm2 status
