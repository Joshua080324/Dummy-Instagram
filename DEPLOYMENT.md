# 🚀 Deployment Guide - Biznet Gio

## 📋 Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04 LTS or higher
   - Node.js 18.x or higher
   - PostgreSQL (Supabase)
   - Minimum 2GB RAM
   - PM2 installed globally

2. **Accounts Needed:**
   - Biznet Gio account
   - Supabase account (Database)
   - Cloudinary account (Image storage)
   - Google Cloud Console (OAuth)
   - Google AI Studio (Gemini API)

## 🔧 Server Setup

### 1. Connect to Biznet Gio Server

```bash
ssh root@your-server-ip
# or
ssh username@your-server-ip
```

### 2. Install Node.js & PM2

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 globally
sudo npm install -g pm2

# Verify PM2
pm2 -v
```

### 3. Install Git (if not installed)

```bash
sudo apt-get update
sudo apt-get install git -y
```

## 📦 Deploy Application

### 1. Clone Repository

```bash
# Navigate to web directory
cd /var/www  # or your preferred directory

# Clone your repository
git clone https://github.com/Joshua080324/Dummy-Instagram.git
cd Dummy-Instagram
```

### 2. Install Dependencies

```bash
# Install all production dependencies
npm install --production

# Or install all including dev (if needed)
npm install
```

### 3. Create .env File

```bash
# Copy example env
cp .env.example .env

# Edit with your credentials
nano .env
```

**Paste your credentials:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=supersecret
DATABASE_URL=postgresql://postgres.qwmcsdckdvqjxlstutli:H%2587jz%40TDxZgZzx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
DB_SSL=true
CLOUDINARY_CLOUD_NAME=dlgeccfib
CLOUDINARY_API_KEY=493418276358618
CLOUDINARY_API_SECRET=Jm0DznPX6DFesMHcKI2DPFowSuk
GOOGLE_CLIENT_ID=426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GEMINI_API_KEY=AIzaSyAR-KSEtz-cdfkqE3tN0tS0LK_Xen82FC4
```

Save: `Ctrl + X`, then `Y`, then `Enter`

### 4. Run Database Migrations

```bash
# Run migrations to create tables
npm run migrate

# Optional: Seed data
npm run seed
```

### 5. Create Logs Directory

```bash
mkdir -p logs
```

### 6. Start Application with PM2

```bash
# Start with ecosystem config
pm2 start ecosystem.config.js

# Or start directly
pm2 start app.js --name dummy-instagram
```

### 7. Save PM2 Process & Setup Startup

```bash
# Save current PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Copy and run the command shown (usually starts with sudo)
```

## 🔍 Verify Deployment

### Check PM2 Status

```bash
# View all processes
pm2 list

# View logs
pm2 logs dummy-instagram

# View specific logs
pm2 logs dummy-instagram --lines 100

# Monitor
pm2 monit
```

### Test API Endpoints

```bash
# Test health check
curl http://localhost:3000/

# Test posts endpoint (requires auth)
curl http://localhost:3000/posts
```

## 🌐 Configure Nginx (Reverse Proxy)

### 1. Install Nginx

```bash
sudo apt-get install nginx -y
```

### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/dummy-instagram
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name dariusjoshua.shop www.dariusjoshua.shop;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 3. Enable Site & Restart Nginx

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dummy-instagram /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

### 4. Setup SSL with Certbot (HTTPS)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d dariusjoshua.shop -d www.dariusjoshua.shop

# Follow prompts and select redirect HTTP to HTTPS
```

## 🔄 PM2 Commands Cheat Sheet

```bash
# Start application
pm2 start ecosystem.config.js
pm2 start app.js --name dummy-instagram

# Restart application
pm2 restart dummy-instagram
pm2 restart all

# Stop application
pm2 stop dummy-instagram
pm2 stop all

# Delete from PM2
pm2 delete dummy-instagram

# View logs
pm2 logs                    # All logs
pm2 logs dummy-instagram    # Specific app
pm2 logs --lines 50         # Last 50 lines

# Monitor
pm2 monit                   # Live monitoring
pm2 status                  # Status overview
pm2 list                    # List all processes

# Clear logs
pm2 flush

# Save current process list
pm2 save

# Reload without downtime
pm2 reload dummy-instagram
```

## 🔄 Update Deployment

```bash
# Navigate to project
cd /var/www/Dummy-Instagram

# Pull latest changes
git pull origin main  # or development

# Install new dependencies
npm install --production

# Run new migrations
npm run migrate

# Restart with PM2
pm2 restart dummy-instagram

# Check logs for errors
pm2 logs dummy-instagram --lines 50
```

## 🐛 Troubleshooting

### Check if Port 3000 is in Use

```bash
sudo lsof -i :3000
# or
sudo netstat -tulpn | grep 3000
```

### Kill Process on Port 3000

```bash
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Check Application Logs

```bash
# PM2 logs
pm2 logs dummy-instagram

# Error logs
tail -f logs/pm2-error.log

# Output logs
tail -f logs/pm2-out.log
```

### Database Connection Issues

```bash
# Test database connection
node -e "const { sequelize } = require('./models'); sequelize.authenticate().then(() => console.log('DB OK')).catch(err => console.error(err));"
```

### Reset PM2

```bash
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

## 🔒 Security Best Practices

1. **Firewall Setup:**
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

2. **Change Default SSH Port (Optional):**
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to something else
sudo systemctl restart sshd
```

3. **Regular Updates:**
```bash
sudo apt-get update
sudo apt-get upgrade
```

## 📊 Monitoring

### Setup PM2 Plus (Optional - Monitoring Dashboard)

```bash
# Link to PM2 Plus
pm2 link <secret_key> <public_key>

# Or use free monitoring
pm2 register
```

## 🎯 Performance Optimization

### Enable Cluster Mode

Edit `ecosystem.config.js`:
```javascript
exec_mode: 'cluster',
instances: 'max',  // or specific number like 2
```

Then restart:
```bash
pm2 reload ecosystem.config.js
```

## ✅ Deployment Checklist

- [ ] Server access confirmed
- [ ] Node.js & PM2 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Database migrations run
- [ ] Logs directory created
- [ ] PM2 process started
- [ ] PM2 startup configured
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] API endpoints tested
- [ ] Frontend connected successfully

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs dummy-instagram`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check database connection
4. Verify environment variables

---

**Last Updated:** December 2024
**Deployed by:** Darius Joshua
**Server:** Biznet Gio
