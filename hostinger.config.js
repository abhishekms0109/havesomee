/**
 * Hostinger Node.js Configuration
 *
 * This file contains configuration settings for deploying
 * the Sweet Delights application on Hostinger.
 */

module.exports = {
  // Entry point for the application
  entry: "server.js",

  // Node.js version
  engine: {
    node: "18.x",
  },

  // Environment variables (these will be overridden by Hostinger's environment)
  env: {
    NODE_ENV: "production",
  },

  // Build commands
  build: {
    command: "npm run build",
  },

  // Deployment hooks
  hooks: {
    // Run before deployment
    predeploy: "npm run migrate",

    // Run after deployment
    postdeploy: 'echo "Deployment completed successfully!"',
  },
}
