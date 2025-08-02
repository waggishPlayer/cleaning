const axios = require('axios');

// External ping script to keep the server active
// This can be run on a separate service or cron job

const PING_URL = 'https://caarvo.onrender.com/api/health';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function pingServer() {
  try {
    const response = await axios.get(PING_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ExternalPingService/1.0'
      }
    });
    
    console.log(`✅ External ping successful: ${response.status} - ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error(`❌ External ping failed: ${error.message}`);
    return false;
  }
}

// Run ping immediately
pingServer();

// Set up interval for continuous pinging
setInterval(pingServer, PING_INTERVAL);

console.log(`🚀 External ping service started. Pinging ${PING_URL} every ${PING_INTERVAL / 1000 / 60} minutes`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 External ping service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 External ping service stopped');
  process.exit(0);
}); 