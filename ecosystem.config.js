module.exports = {
  apps: [
    {
      name: 'kreyolopal',
      script: 'server/index.js',
      instances: 'max',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
