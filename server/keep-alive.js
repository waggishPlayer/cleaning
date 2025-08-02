/**
 * This script prevents the backend from going into cooldown mode by making a request
 * to the server every 10 minutes.
 */

const http = require('http');
const https = require('https');
require('dotenv').config();

// Get the server URL from environment variables or use default
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Make a request to the server's health check endpoint
 */
const pingServer = () => {
  console.log(`[${new Date().toISOString()}] Pinging server to prevent cooldown...`);
  
  // Determine if we need to use http or https
  const httpModule = SERVER_URL.startsWith('https') ? https : http;
  
  // Parse the URL to get hostname, port, and path
  const url = new URL(SERVER_URL);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: '/api/health',
    method: 'GET',
    timeout: 10000, // 10 second timeout
  };

  const req = httpModule.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`[${new Date().toISOString()}] Server is alive: ${data}`);
      } else {
        console.error(`[${new Date().toISOString()}] Unexpected response: ${res.statusCode} ${data}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Error pinging server:`, error.message);
  });

  req.on('timeout', () => {
    console.error(`[${new Date().toISOString()}] Request timed out`);
    req.destroy();
  });

  req.end();
};

// Initial ping
pingServer();

// Set up interval to ping the server every 10 minutes
const intervalId = setInterval(pingServer, PING_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping keep-alive script...');
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nStopping keep-alive script...');
  clearInterval(intervalId);
  process.exit(0);
});

console.log(`Keep-alive script started. Pinging ${SERVER_URL} every ${PING_INTERVAL / 60000} minutes.`);