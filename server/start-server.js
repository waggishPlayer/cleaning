/**
 * This script starts both the server and the keep-alive process
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the main server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

console.log('Started main server process with PID:', server.pid);

// Start the keep-alive script
const keepAlive = spawn('node', ['keep-alive.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  detached: true // Run in the background
});

console.log('Started keep-alive process with PID:', keepAlive.pid);

// Handle server process exit
server.on('exit', (code, signal) => {
  console.log(`Main server process exited with code ${code} and signal ${signal}`);
  // Kill the keep-alive process when the server exits
  if (keepAlive.pid) {
    console.log('Terminating keep-alive process...');
    process.kill(-keepAlive.pid); // Negative PID kills the process group
  }
  process.exit(code || 0);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down...');
  if (server.pid) {
    console.log('Terminating server process...');
    server.kill('SIGINT');
  }
  if (keepAlive.pid) {
    console.log('Terminating keep-alive process...');
    process.kill(-keepAlive.pid);
  }
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down...');
  if (server.pid) {
    console.log('Terminating server process...');
    server.kill('SIGTERM');
  }
  if (keepAlive.pid) {
    console.log('Terminating keep-alive process...');
    process.kill(-keepAlive.pid);
  }
});