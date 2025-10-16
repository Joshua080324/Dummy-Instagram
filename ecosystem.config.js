module.exports = {
    apps: [
        {
            name: "dummy-instagram-backend",
            script: "app.js",
            instances: "max",
            exec_mode: "cluster",
            error_file: "logs/app-error.log", // Pastikan ini ada dan tidak di-comment
            out_file: "logs/app-output.log",   // Pastikan ini ada dan tidak di-comment
            // log_date_format: "YYYY-MM-DD HH:mm:ss", // Opsional, untuk format tanggal di log

            env: {
                NODE_ENV: "production",
                PORT: 80,
                JWT_SECRET: "supersecret",
                DATABASE_URL: "postgresql://postgres.qwmcsdckdvqjxlstutli:H%2587jz%40TDxZgZzx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
                DB_SSL: "true",
                CLOUDINARY_CLOUD_NAME: "dlgeccfib",
                CLOUDINARY_API_KEY: "493418276358618",
                CLOUDINARY_API_SECRET: "Jm0DznPX6DFesMHcKI2DPFowSuk",
                GOOGLE_CLIENT_ID: "426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com",
                GOOGLE_CLIENT_SECRET: "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",
                GEMINI_API_KEY: "AIzaSyAZj9Jq4lt2usqMCVYrP_rxaX96ZOGl7j4"
            }
        }
    ]
}
