module.exports = {
  apps: [
    {
      name: "dummy-instagram-backend",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
