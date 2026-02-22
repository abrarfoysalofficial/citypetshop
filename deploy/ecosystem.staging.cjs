/**
 * PM2 Ecosystem Config — City Plus Pet Shop STAGING
 * Port 3002 — independent from production (3001)
 * User: cityplus_staging
 * App path: /var/www/cityplus-staging/app
 */
module.exports = {
  apps: [
    {
      name: "cityplus-staging",
      cwd: "/var/www/cityplus-staging/app",
      script: "node",
      args: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 5,

      env_staging: {
        NODE_ENV: "production",
        PORT: 3002,
        HOSTNAME: "127.0.0.1",
      },

      error_file: "/var/log/cityplus-staging/error.log",
      out_file: "/var/log/cityplus-staging/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
