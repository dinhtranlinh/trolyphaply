module.exports = {
  apps: [
    {
      // Development server
      name: 'trolyphaply-dev',
      script: 'npm',
      args: 'run dev',
      cwd: 'D:\\DTL\\trolyphaply',
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
      script: 'npm',
      args: 'run start:prod',
      cwd: 'D:\\DTL\\trolyphaply',
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
