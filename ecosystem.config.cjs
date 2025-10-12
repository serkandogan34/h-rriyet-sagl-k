module.exports = {
  apps: [
    {
      name: 'hurriyet-health-server',
      script: 'server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
