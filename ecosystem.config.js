/**
 * ecosystem.config.js
 * PM2 process manager config for production. Cluster mode runs one worker
 * per CPU core (round-robin load balanced by PM2's built-in port sharing),
 * so the site keeps serving traffic from the other cores if one worker
 * crashes, and restarts the failed worker automatically in milliseconds.
 *
 * Usage:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js --env production
 *   pm2 status / pm2 logs / pm2 monit
 *   pm2 reload rollcall-kitchen   # zero-downtime reload on deploy
 */
module.exports = {
  apps: [
    {
      name: "rollcall-kitchen",
      script: "server.js",
      instances: "max", // one worker per CPU core; use a number to cap it
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "300M", // recycle a worker if it leaks past this
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: "10s", // guards against a fast crash-restart loop
      kill_timeout: 16000, // must exceed the app's own shutdown timeout
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        TRUST_PROXY: "true",
      },
    },
  ],
};
