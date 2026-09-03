module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'server.js',
      cwd: './edtech-backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
