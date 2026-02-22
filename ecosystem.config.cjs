/**
 * PM2 Ecosystem Config — City Plus Pet Shop (Production)
 * Ubuntu 24.04 · OpenLiteSpeed reverse proxy · output: "standalone"
 *
 * IMPORTANT: env vars (DATABASE_URL, NEXTAUTH_SECRET, etc.) are loaded
 * from /var/www/cityplus/app/.env.production.local at runtime by Next.js.
 * Do NOT embed secrets here — this file is committed to git.
 *
 * Start:  sudo -u cityplus pm2 start /var/www/cityplus/app/ecosystem.config.cjs --env production
 * Reload: sudo -u cityplus pm2 reload cityplus --update-env
 * Save:   sudo -u cityplus pm2 save
 */
module.exports = {
  apps: [
    {
      name: "cityplus",
      cwd: "/var/www/cityplus/app",

      // Standalone mode: node runs server.js directly — never use "next start"
      script: "node",
      args: ".next/standalone/server.js",

      instances: 1,        // 1 for ≤2 GB RAM; set to 2 + exec_mode:"cluster" on 4 GB+
      exec_mode: "fork",
      max_memory_restart: "768M",
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      kill_timeout: 5000,

      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "127.0.0.1",   // bind to loopback only — never 0.0.0.0 on shared VPS
      },

      error_file: "/var/log/pm2/cityplus-error.log",
      out_file: "/var/log/pm2/cityplus-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
