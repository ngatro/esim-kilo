module.exports = {
  apps: [{
    name: "owsim-prod",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
