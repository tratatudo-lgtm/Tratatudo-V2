module.exports = {
  apps: [{
    name: "dashboard",
    script: "dist/server.cjs",
    env: {
      NODE_ENV: "production",
      PORT: 3005,
      SUPABASE_URL: "https://lghsbjgjrogkadczikou.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4NjY0MiwiZXhwIjoyMDg3ODYyNjQyfQ.lQ-zhvDHpY0P7r6bL127fmpRY7uUZlZ3un-rPKiWIh4"
    }
  }]
}
