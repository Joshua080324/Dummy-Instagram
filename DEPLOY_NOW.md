# 🚀 DEPLOY SEKARANG!

## ✅ Yang Sudah Selesai:
- ✅ Database production sudah di-seed dengan 5 posts, 5 users, categories, dll
- ✅ Semua fix sudah di-push ke GitHub
- ✅ Code siap production

## 📋 Copy-Paste Command Ini di Server Biznet Gio:

```bash
cd /var/www/Dummy-Instagram && \
git pull origin development && \
npm install --production && \
sudo pm2 start ecosystem.config.js && \
sudo pm2 logs
```

## 🎯 Atau Step by Step:

```bash
# 1. SSH ke server
ssh user@dariusjoshua.shop

# 2. Masuk ke folder app
cd /var/www/Dummy-Instagram

# 3. Pull kode terbaru
git pull origin development

# 4. Install dependencies
npm install --production

# 5. Start PM2 dengan ecosystem config
sudo pm2 start ecosystem.config.js

# 6. Lihat logs (pastikan tidak ada error)
sudo pm2 logs

# 7. Save PM2 process list
sudo pm2 save

# 8. Setup PM2 startup
sudo pm2 startup
```

## ✅ Setelah Deploy:

Buka browser dan test:
- https://dariusjoshua.shop/posts (should return 5 posts)
- Login dengan: john@example.com / password123

## 🔧 Useful PM2 Commands:

```bash
# Lihat status semua apps
sudo pm2 list

# Restart app tertentu
sudo pm2 restart Dummy-Instagrams

# Stop app
sudo pm2 stop Dummy-Instagrams

# Lihat logs real-time
sudo pm2 logs Dummy-Instagrams

# Lihat logs dengan filter lines
sudo pm2 logs Dummy-Instagrams --lines 50

# Delete app dari PM2
sudo pm2 delete Dummy-Instagrams

# Monitor resources
sudo pm2 monit
```

## 🎉 DONE!

Frontend akan otomatis ambil data dari backend production.

**Total waktu: ~2 menit!** ⚡
