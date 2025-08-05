const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const PingService = require('./pingService');

// Load environment variables
// Set NODE_ENV explicitly if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const configFile = process.env.NODE_ENV === 'production' ? './config.prod.env' : './.env.development';
dotenv.config({ path: configFile });
console.log(`Loading config from: ${configFile}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`API running on port: ${process.env.PORT || 5000}`);

// Log PhonePe configuration
console.log(`PhonePe Merchant ID: ${process.env.PHONEPE_MERCHANT_ID}`);
console.log(`PhonePe Client ID: ${process.env.PHONEPE_CLIENT_ID}`);
console.log(`PhonePe Base URL: ${process.env.PHONEPE_BASE_URL}`);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const vehicleRoutes = require('./routes/vehicles');
const addressRoutes = require('./routes/addresses');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const phonepeRoutes = require('./routes/phonepe');
const phonepeSdkRoutes = require('./routes/phonepeSdk');

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://caarvo.com', 
        'https://www.caarvo.com',
        'https://caarvo.onrender.com',
        'https://api.phonepe.com'
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-VERIFY', 'X-MERCHANT-ID', 'Accept']
};

// Domain configured for caarvo.com

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/phonepe', phonepeRoutes);
app.use('/api/phonepe-sdk', phonepeSdkRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vehicle Cleaning Service API is running' });
});

// Ping service status endpoint
app.get('/api/ping-status', (req, res) => {
  res.json({
    status: 'OK',
    pingService: pingService.getStatus(),
    message: 'Ping service status retrieved successfully'
  });
});

// Manual ping service control (for debugging)
app.post('/api/ping-control', (req, res) => {
  const { action } = req.body;
  
  if (action === 'start') {
    pingService.start();
    res.json({ success: true, message: 'Ping service started' });
  } else if (action === 'stop') {
    pingService.stop();
    res.json({ success: true, message: 'Ping service stopped' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid action. Use "start" or "stop"' });
  }
});

// Root endpoint for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vehicle Cleaning Service API',
    status: 'running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if build directory exists
  if (require('fs').existsSync(buildPath)) {
    console.log('✅ React build found, serving static files');
    app.use(express.static(buildPath));
    
    // Handle React Router - send all non-API requests to React app
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.log('⚠️  React build not found, serving API only');
    // If no build files, just serve API endpoints
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Vehicle Cleaning Service API is running',
        status: 'API only mode - frontend build not found'
      });
    });
  }
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize ping service
const pingService = new PingService();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start ping service in production to prevent cooldown
  if (process.env.NODE_ENV === 'production') {
    pingService.start();
  } else {
    console.log('🔄 Ping service disabled in development mode');
  }
});