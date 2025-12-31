module.exports = {
  apps: [
    {
      // Development server
      name: 'trolyphaply-dev',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 3456',
      cwd: 'D:\\DTL\\trolyphaply',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 3456,
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      // Production server
      name: 'trolyphaply-prod',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8686',
      cwd: 'D:\\DTL\\trolyphaply-prod-release',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 8686,
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
