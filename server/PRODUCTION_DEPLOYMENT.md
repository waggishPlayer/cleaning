# Production Deployment Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- PhonePe merchant account

## Environment Setup

1. Create a `.env` file in the server directory with the following variables:

```
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com

# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
# Development/Sandbox URL
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
# Production URL
PHONEPE_PROD_BASE_URL=https://api.phonepe.com/apis/hermes
# Server URL for keep-alive script
SERVER_URL=https://your-backend-domain.com
```

## Backend Deployment

1. Install dependencies:

```bash
npm install
```

2. Start the server with keep-alive functionality:

```bash
npm run prod:with-keep-alive
```

This will start both the main server and the keep-alive script that prevents the server from going into cooldown mode.

## Frontend Build for Production

1. Navigate to the client directory:

```bash
cd ../client
```

2. Create a `.env.production` file with the following content:

```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

3. Build the frontend:

```bash
npm run build
```

4. The build files will be in the `build` directory, which can be uploaded to your hosting provider (e.g., Hostinger).

## PhonePe Integration

The PhonePe integration is now production-ready with the following features:

- Automatic detection of environment (development/production)
- Proper URL configuration for sandbox and production environments
- Secure handling of API keys and secrets
- Comprehensive error handling
- Webhook support for payment notifications

## Keep-Alive Functionality

The server includes a keep-alive script that prevents it from going into cooldown mode after 15 minutes of inactivity. The script:

- Pings the server's health check endpoint every 10 minutes
- Logs the status of each ping
- Automatically starts with the server when using the `prod:with-keep-alive` script

## Troubleshooting

### PhonePe Payment Issues

1. Check the server logs for detailed error messages
2. Verify that the PhonePe credentials are correct
3. Ensure the webhook and callback URLs are accessible from the internet

### Server Cooldown

If the server still goes into cooldown mode:

1. Check that the keep-alive script is running (`ps aux | grep keep-alive.js`)
2. Verify that the `SERVER_URL` environment variable is correct
3. Check the logs for any errors in the keep-alive script

## Monitoring

Consider setting up monitoring for your production server using tools like:

- PM2 for process management
- Sentry or LogRocket for error tracking
- Uptime Robot for uptime monitoring