// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'Dummy-Instagrams', // Ganti dengan nama aplikasi Anda
      script: 'app.js', // Ganti dengan file entri utama aplikasi Anda (misal: app.js, server.js)
      env: {
        // --- General Configuration ---
        NODE_ENV: 'production',
        PORT: 3000,

        // --- JWT & Database ---
        JWT_SECRET: 'supersecret',
        DATABASE_URL: 'postgresql://postgres.qwmcsdckdvqjxlstutli:H%2587jz%40TDxZgZzx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
        DB_SSL: true,

        // --- Cloudinary Credentials ---
        CLOUDINARY_CLOUD_NAME: 'dlgeccfib',
        CLOUDINARY_API_KEY: '493418276358618',
        CLOUDINARY_API_SECRET: 'Jm0DznPX6DFesMHcKI2DPFowSuk',

        // --- Google OAuth Credentials ---
        GOOGLE_CLIENT_ID: '426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',

        // --- Gemini API Key ---
        GEMINI_API_KEY: 'AIzaSyAR-KSEtz-cdfkqE3tN0tS0LK_Xen82FC4',
      },
    },
  ],
};