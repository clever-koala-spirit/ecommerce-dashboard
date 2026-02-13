#!/bin/bash
# Backend Deployment Script for GCP VM (chip-vm)
# Run this script on the VM after SSH-ing in

set -e

echo "=== Ecommerce Dashboard Backend Deployment ==="

# 1. Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
    echo "[1/6] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
else
    echo "[1/6] Node.js already installed: $(node --version)"
fi

# 2. Install PM2 globally for process management
if ! command -v pm2 &> /dev/null; then
    echo "[2/6] Installing PM2..."
    sudo npm install -g pm2
else
    echo "[2/6] PM2 already installed"
fi

# 3. Clone or update the repository
APP_DIR="$HOME/ecommerce-dashboard"
if [ -d "$APP_DIR" ]; then
    echo "[3/6] Updating repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "[3/6] Cloning repository..."
    cd "$HOME"
    git clone https://github.com/clever-koala-spirit/ecommerce-dashboard.git
    cd "$APP_DIR"
fi

# 4. Create .env file
echo "[4/6] Setting up environment variables..."
cat > "$APP_DIR/.env" << 'EOF'
PORT=4000

# Shopify
SHOPIFY_STORE_URL=5ugwnx-v8.myshopify.com
SHOPIFY_ACCESS_TOKEN=ff53daaa82dd6f5049de6de75b13b0f3

# Meta Ads (add your keys)
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
META_BUSINESS_ID=

# Google Ads (add your keys)
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=

# Klaviyo (add your key)
KLAVIYO_API_KEY=

# GA4 (add your key)
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_KEY_PATH=

# AI (optional)
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
EOF

# 5. Install server dependencies
echo "[5/6] Installing server dependencies..."
cd "$APP_DIR/server"
npm install

# 6. Start with PM2
echo "[6/6] Starting server with PM2..."
pm2 delete ecommerce-api 2>/dev/null || true
pm2 start index.js --name ecommerce-api
pm2 save
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

echo ""
echo "=== Deployment Complete ==="
echo "Backend running at: http://$(curl -s ifconfig.me):4000"
echo "Health check: http://$(curl -s ifconfig.me):4000/api/health"
echo ""
echo "IMPORTANT: Make sure GCP firewall allows port 4000!"
echo "Run: gcloud compute firewall-rules create allow-api-4000 --allow tcp:4000 --source-ranges 0.0.0.0/0 --description 'Allow backend API'"
