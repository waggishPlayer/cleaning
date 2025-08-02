const axios = require('axios');

class PingService {
  constructor() {
    this.isRunning = false;
    this.pingInterval = null;
    this.externalPingInterval = null;
  }

  // Start the ping service
  start() {
    if (this.isRunning) {
      console.log('Ping service is already running');
      return;
    }

    console.log('🚀 Starting ping service to prevent server cooldown...');
    this.isRunning = true;

    // Self-ping every 10 minutes
    this.pingInterval = setInterval(() => {
      this.pingSelf();
    }, 10 * 60 * 1000); // 10 minutes

    // External ping every 15 minutes as backup
    this.externalPingInterval = setInterval(() => {
      this.pingExternal();
    }, 15 * 60 * 1000); // 15 minutes

    // Initial ping
    this.pingSelf();
    this.pingExternal();
  }

  // Stop the ping service
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping ping service...');
    this.isRunning = false;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.externalPingInterval) {
      clearInterval(this.externalPingInterval);
      this.externalPingInterval = null;
    }
  }

  // Ping the server's own health endpoint
  async pingSelf() {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://caarvo.onrender.com' 
        : `http://localhost:${process.env.PORT || 5000}`;
      
      const response = await axios.get(`${baseUrl}/api/health`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'PingService/1.0'
        }
      });

      console.log(`✅ Self-ping successful: ${response.status} - ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`❌ Self-ping failed: ${error.message}`);
    }
  }

  // Ping external service to keep the server active
  async pingExternal() {
    try {
      // Use a free external ping service
      const pingUrl = 'https://httpbin.org/get';
      const response = await axios.get(pingUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Caarvo-PingService/1.0'
        }
      });

      console.log(`✅ External ping successful: ${response.status} - ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`❌ External ping failed: ${error.message}`);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastPing: new Date().toISOString(),
      nextSelfPing: this.isRunning ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null,
      nextExternalPing: this.isRunning ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
    };
  }
}

module.exports = PingService; 