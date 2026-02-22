/** PM2 config for City Plus Pet Shop - CyberPanel/VPS deployment */
module.exports = {
  apps: [
    {
      name: 'city-plus-pet-shop',
      cwd: '/var/www/city-plus-pet-shop',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
    },
  ],
};
