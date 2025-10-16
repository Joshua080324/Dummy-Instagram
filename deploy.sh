#!/bin/bash

# Dummy Instagram - Deployment Script
# Usage: bash deploy.sh

echo "🚀 Starting Dummy Instagram Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}📦 Pulling latest code from git...${NC}"
git pull origin main || git pull origin development

# Step 2: Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm install --production

# Step 3: Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run migrate

# Step 4: Create logs directory if not exists
mkdir -p logs

# Step 5: Restart PM2
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
pm2 restart dummy-instagram || pm2 start ecosystem.config.js

# Step 6: Save PM2 configuration
pm2 save

# Step 7: Check status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 list

echo -e "${GREEN}📋 View logs with: pm2 logs dummy-instagram${NC}"
echo -e "${GREEN}🔍 Monitor with: pm2 monit${NC}"
