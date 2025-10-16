module.exports = {
  apps: [
    {
      name: 'dummy-instagram',
      script: 'app.js',
      instances: 1, // atau 'max' untuk cluster mode
      exec_mode: 'fork', // atau 'cluster' untuk load balancing
      watch: false, // set true untuk auto-restart saat file berubah
      max_memory_restart: '500M', // restart jika memory exceed
      
      // Environment variables
      env: {
        // --- General Configuration ---
        NODE_ENV: 'production',
        PORT: 3000, // Biznet Gio biasanya pakai port 3000, bukan 80
        
        // --- JWT & Database ---
        JWT_SECRET: 'supersecret',
        DATABASE_URL: 'postgresql://postgres.qwmcsdckdvqjxlstutli:H%2587jz%40TDxZgZzx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
        DB_SSL: 'true',
        
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
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};