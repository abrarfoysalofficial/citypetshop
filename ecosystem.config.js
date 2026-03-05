/**
 * PM2 config for City Pet Shop BD — Next.js standalone
 * Runtime: systemd -> pm2-cityplus.service -> PM2 -> Next
 * App path: /var/www/cityplus/app (or repo root when developing)
 */
module.exports = {
  apps: [
    {
      name: "cityplus",
      cwd: process.env.APP_DIR || "/var/www/cityplus/app",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        APP_DIR: process.env.APP_DIR || "/home/citypetshop/htdocs/citypetshop.bd",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
    },
  ],
};
