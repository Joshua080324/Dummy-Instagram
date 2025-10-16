// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "dummy-instagram-backend",
            script: "app.js",
            // instances: "max",  // Comment atau hapus baris ini untuk sementara
            exec_mode: "fork",   // Ganti ke 'fork'
            error_file: "logs/app-error.log",
            out_file: "logs/app-output.log",
            env: {
                // ... sisa konfigurasi env Anda tetap sama
                NODE_ENV: "production",
                PORT: 80, 
                // ...
            }
        }
    ]
}
