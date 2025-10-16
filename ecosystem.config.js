module.exports = {
    apps: [
        {
            name: "dummy-instagram-backend", // Nama unik untuk aplikasi Anda di PM2
            script: "app.js",               // File utama yang menjalankan aplikasi Express Anda
            instances: "max",               // Gunakan semua core CPU yang tersedia di server Anda
            exec_mode: "cluster",           // Penting untuk menjalankan banyak instance (memanfaatkan "max" instances)
            // watch: false,                // JANGAN AKTIFKAN DI PRODUKSI, defaultnya false
            // restart_delay: 3000,         // Opsi: Beri jeda 3 detik sebelum restart otomatis setelah crash
            // log_file: "logs/combined.log", // Opsi: gabungkan stdout dan stderr ke satu file log
            // error_file: "logs/error.log",  // Opsi: log error saja ke file terpisah
            // out_file: "logs/out.log",      // Opsi: log output saja ke file terpisa
            
            env: {
                NODE_ENV: "production",
                PORT: 80, // Port standar untuk HTTP di lingkungan produksi
                JWT_SECRET: "supersecret", // Ganti dengan secret yang sangat kuat
                DATABASE_URL: "postgresql://postgres.qwmcsdckdvqjxlstutli:H%2587jz%40TDxZgZzx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
                DB_SSL: "true",
                CLOUDINARY_CLOUD_NAME: "dlgeccfib",
                CLOUDINARY_API_KEY: "493418276358618",
                CLOUDINARY_API_SECRET: "Jm0DznPX6DFesMHcKI2DPFowSuk",
                GOOGLE_CLIENT_ID: "426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com",
                GOOGLE_CLIENT_SECRET: "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",
                GEMINI_API_KEY: "AIzaSyAZj9Jq4lt2usqMCVYrP_rxaX96ZOGl7j4" // Pastikan kunci ini benar
            }
        }
    ]
}
