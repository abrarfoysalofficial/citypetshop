/**
 * PM2 config for City Pet Shop BD — Next.js standalone
 * Runtime: systemd -> PM2 -> Next
 * App path: /home/citypetshop/app (override via APP_DIR)
 */
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "citypetshop",
      cwd: process.env.APP_DIR || "/home/citypetshop/app",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        APP_DIR: process.env.APP_DIR || "/home/citypetshop/app",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
    },
  ],
};
