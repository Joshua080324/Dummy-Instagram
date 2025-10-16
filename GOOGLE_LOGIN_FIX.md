# Google OAuth Login - Troubleshooting Guide

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Menambahkan File .env**
File `.env` dibuat di folder `client/` dengan konfigurasi:
```env
VITE_GOOGLE_CLIENT_ID=426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com
VITE_API_URL=https://dariusjoshua.shop
```

### 2. **Update .gitignore**
Menambahkan `.env` ke `.gitignore` agar credential tidak ter-commit:
```
.env
.env.local
.env.production
```

### 3. **Improve Error Handling**
- Menambahkan console.log untuk debugging
- Better error messages dengan Swal styling
- Error parameter di handleGoogleError

### 4. **File .env.example**
Template untuk developer lain:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
```

## 🔍 Debugging Steps

Jika Google Login masih error, ikuti langkah berikut:

### Step 1: Cek Console Browser
1. Buka browser DevTools (F12)
2. Pergi ke tab Console
3. Klik tombol "Sign in with Google"
4. Lihat error message yang muncul

### Step 2: Verifikasi Google OAuth Setup

#### Di Google Cloud Console:
1. Buka: https://console.cloud.google.com/apis/credentials
2. Pilih project: "ch2ph2-project" atau yang sesuai
3. Klik Client ID yang digunakan
4. Verifikasi **Authorized JavaScript origins**:
   ```
   https://ch2ph2-project.web.app
   http://localhost:5173
   http://localhost:3000
   ```
5. Verifikasi **Authorized redirect URIs**:
   ```
   https://ch2ph2-project.web.app
   https://ch2ph2-project.web.app/login
   http://localhost:5173
   ```

### Step 3: Cek Backend Environment

Di server Biznet Gio, pastikan `.env` memiliki:
```env
GOOGLE_CLIENT_ID=426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com
```

Atau di `ecosystem.config.js`:
```javascript
env: {
  GOOGLE_CLIENT_ID: '426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com',
  // ... env lainnya
}
```

### Step 4: Test Backend Endpoint

Test endpoint Google Auth di backend:
```bash
curl -X POST https://dariusjoshua.shop/users/auth/google \
  -H "Content-Type: application/json" \
  -d '{"google_token":"SAMPLE_TOKEN"}'
```

Expected response (jika token invalid):
```json
{
  "message": "Invalid token"
}
```

## 🚨 Common Errors

### Error 1: "Popup closed by user"
**Cause:** User menutup popup Google OAuth
**Solution:** Normal behavior, user harus klik lagi

### Error 2: "Invalid Google token"
**Cause:** Client ID tidak match antara frontend dan backend
**Solution:** 
- Pastikan `VITE_GOOGLE_CLIENT_ID` di frontend sama dengan `GOOGLE_CLIENT_ID` di backend
- Restart backend setelah update .env

### Error 3: "Origin not allowed"
**Cause:** Domain tidak terdaftar di Google Cloud Console
**Solution:**
1. Pergi ke Google Cloud Console
2. Tambahkan domain ke "Authorized JavaScript origins"
3. Tunggu beberapa menit untuk propagasi

### Error 4: "Network error"
**Cause:** Backend tidak bisa diakses
**Solution:**
- Cek apakah backend running: `pm2 status`
- Cek logs: `pm2 logs Dummy-Instagrams`
- Test API: `curl https://dariusjoshua.shop/posts`

## 🧪 Testing

### Local Testing (Development)
```bash
cd client
npm run dev
```
Akses: http://localhost:5173/login

### Production Testing
Akses: https://ch2ph2-project.web.app/login

### Test Accounts
Gunakan Google account pribadi Anda untuk test.

## 📝 Console Logs

Setelah perbaikan, di browser console akan muncul:
```
Google Login Success: {credential: "eyJhbG...", clientId: "426382311425..."}
Sending Google token to backend...
Backend response: {access_token: "eyJhbGciOi..."}
```

Jika error:
```
Google Login Error: Error: Request failed with status code 500
Error response: {message: "Invalid token"}
```

## 🔄 Rebuild & Deploy

Setiap kali update kode:
```bash
cd client
npm run build
firebase deploy
```

## ✨ What's Fixed

✅ Environment variables (.env file)  
✅ Better error handling with console.log  
✅ Improved error messages  
✅ .gitignore updated  
✅ .env.example for documentation  
✅ Styled Swal alerts  

## 📞 Next Steps

Jika masih ada masalah:
1. Share screenshot console error
2. Share screenshot Network tab (XHR request)
3. Cek backend logs: `pm2 logs Dummy-Instagrams --lines 100`
