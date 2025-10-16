# 🚀 Deployment Guide - Biznet Gio

## ✅ Database Sudah Di-Seed dari Local!
**Data production sudah siap**, tinggal pull dan restart PM2.

## Langkah-Langkah Deploy Backend (Super Simple!)

### 1️⃣ SSH ke Server Biznet Gio
```bash
ssh user@dariusjoshua.shop
# Atau gunakan IP server Anda
```

### 2️⃣ Masuk ke Direktori Aplikasi
```bash
cd /var/www/Dummy-Instagram
# Atau path ke direktori aplikasi Anda
```

### 3️⃣ Pull Kode Terbaru dari GitHub
```bash
git pull origin development
```

### 4️⃣ Install Dependencies (jika ada yang baru)
```bash
npm install --production
```

### 5️⃣ Start/Restart PM2
```bash
# Jika pertama kali deploy
pm2 start ecosystem.config.js

# Jika sudah pernah deploy (restart)
pm2 restart dummy

# Atau restart semua apps
pm2 restart all
```

### 8️⃣ Cek Status & Logs
```bash
# Lihat status PM2
pm2 list

# Lihat logs aplikasi
pm2 logs dummy

# Atau lihat logs tertentu
pm2 logs dummy --lines 100
```

---

## 🔍 Troubleshooting

### Error: Module not found
```bash
npm install
pm2 restart dummy
```

### Error: Database connection failed
- Cek apakah DATABASE_URL di ecosystem.config.js sudah benar
- Pastikan database Supabase/PostgreSQL bisa diakses
- Test koneksi: `npm run migrate`

### Error: Port already in use
```bash
# Cek proses yang pakai port 80
sudo lsof -i :80

# Kill proses jika perlu
sudo kill -9 <PID>

# Atau ubah PORT di ecosystem.config.js
```

### Data Posts Tidak Muncul
```bash
# Re-seed database
npm run seed:undo
npm run seed
pm2 restart dummy
```

---

## ✅ Verifikasi Deployment

### Test API Endpoints:
```bash
# Test posts endpoint
curl https://dariusjoshua.shop/posts

# Test login endpoint
curl -X POST https://dariusjoshua.shop/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Test chats endpoint (need token)
curl https://dariusjoshua.shop/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Akun Login Default (Setelah Seeding):
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`
- Email: `mike@example.com` / Password: `password123`
- Email: `sarah@example.com` / Password: `password123`
- Email: `alex@example.com` / Password: `password123`

---

## 📦 File Penting yang Sudah Dikonfigurasi

✅ **ecosystem.config.js** - PM2 configuration dengan semua environment variables
✅ **seeders/** - Data sample untuk users, posts, categories, chats, messages
✅ **data/posts.json** - Posts dengan field `isPrivate: false` untuk public feed
✅ **.env.example** - Template environment variables
✅ **package.json** - Scripts untuk migrate dan seed

---

## 🎯 Quick Deploy Commands (Copy-Paste)

```bash
# Full deployment in one go (SUPER SIMPLE!)
cd /var/www/Dummy-Instagram && \
git pull origin development && \
npm install --production && \
pm2 restart dummy && \
pm2 logs dummy --lines 20
```

**Note**: Database sudah di-seed dari local, tidak perlu seeding lagi!

---

## 🔐 Security Checklist

- ✅ Environment variables tidak di-commit ke git
- ✅ Database credentials ada di ecosystem.config.js (sudah dikonfigurasi)
- ✅ CORS sudah disetup di backend
- ✅ JWT secret sudah dikonfigurasi
- ⚠️ **PENTING**: Ganti semua credentials di ecosystem.config.js dengan yang real di production!

---

## 📞 Support

Jika ada masalah:
1. Cek PM2 logs: `pm2 logs dummy`
2. Cek error logs: `pm2 logs dummy --err`
3. Restart PM2: `pm2 restart dummy`
4. Check process: `pm2 list`

**Happy Deploying! 🚀**
