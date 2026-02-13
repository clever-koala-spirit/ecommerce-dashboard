#!/bin/bash
# Deploy Slay Season Backend to GCP VM (34.151.172.195)
# Run this from your local machine

set -e
echo "🚀 Deploying Slay Season Backend..."

# Variables
VM_IP="34.151.172.195"
VM_USER="leo"
APP_DIR="/opt/slayseason"
ZONE="australia-southeast2-a"

# Step 1: Upload server files
echo "📦 Uploading server files to GCP VM..."
gcloud compute scp --recurse ./server "${VM_USER}@chip-vm:${APP_DIR}/server" --zone="${ZONE}" --project="slay-season" 2>/dev/null || \
  echo "Note: Update zone/project as needed for your GCP setup"

# Step 2: Upload .env file
echo "📄 Uploading environment configuration..."
if [ -f "./.env" ]; then
  gcloud compute scp ./.env "${VM_USER}@chip-vm:${APP_DIR}/.env" --zone="${ZONE}" --project="slay-season" 2>/dev/null || \
    echo "Note: Make sure .env file is configured on the VM"
else
  echo "⚠️  .env file not found. You'll need to configure it manually on the VM."
fi

# Step 3: Install dependencies and restart service
echo "🔧 Installing dependencies and restarting backend service..."
gcloud compute ssh "${VM_USER}@chip-vm" --zone="${ZONE}" --project="slay-season" --command="
  cd ${APP_DIR}/server &&
  npm install --production &&
  sudo systemctl restart slayseason || pm2 restart ecommerce-api
" 2>/dev/null || \
  echo "Note: Connect manually and run: cd ${APP_DIR}/server && npm install && npm start"

echo ""
echo "✅ Backend deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. SSH into VM: gcloud compute ssh ${VM_USER}@chip-vm --zone=${ZONE}"
echo "2. Verify API is running: curl http://localhost:4000/api/health"
echo "3. Configure nginx reverse proxy to point api.slayseason.com → localhost:4000"
echo "4. Set up SSL certificate with Let's Encrypt"
echo ""
echo "API Endpoint: http://${VM_IP}:4000/api (or https://api.slayseason.com/api once reverse proxy is configured)"
