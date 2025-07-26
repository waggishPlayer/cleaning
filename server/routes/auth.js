const express = require('express');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const OTP = require('../models/OTP');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// MSG91 configuration
const msg91ApiKey = process.env.MSG91_API_KEY;
const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
const msg91SenderId = process.env.MSG91_SENDER_ID;

// Function to send SMS via MSG91
const sendSMSViaMSG91 = async (phone, otp) => {
  try {
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      mobile: phone.replace('+91', ''), // Remove +91 prefix for MSG91
      authkey: msg91ApiKey,
      otp: otp
    };
    
    // Only add template_id if it's provided
    if (msg91TemplateId) {
      payload.template_id = msg91TemplateId;
    }
    
    console.log('📱 Sending SMS via MSG91 to:', phone);
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ MSG91 SMS Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ MSG91 SMS Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Function to verify MSG91 OTP access token
const verifyMSG91AccessToken = async (accessToken) => {
  try {
    const url = 'https://control.msg91.com/api/v5/otp/verify';
    const payload = {
      authkey: msg91ApiKey,
      token: accessToken
    };
    
    console.log('🔐 Verifying MSG91 access token:', accessToken.substring(0, 10) + '...');
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ MSG91 Token Verification Response:', response.data);
    
    // MSG91 returns success response with verified mobile number
    if (response.data && response.data.type === 'success') {
      return { 
        success: true, 
        verified: true,
        mobile: response.data.mobile,
        data: response.data 
      };
    } else {
      return { 
        success: false, 
        verified: false,
        error: 'Token verification failed'
      };
    }
  } catch (error) {
    console.error('❌ MSG91 Token Verification Error:', error.response?.data || error.message);
    return { 
      success: false, 
      verified: false,
      error: error.response?.data || error.message 
    };
  }
};

// Initialize SMS service
if (msg91ApiKey) {
  console.log('✅ MSG91 SMS service initialized');
} else {
  console.log('⚠️ MSG91 API Key missing - SMS functionality disabled');
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
    
    const canSend = await OTP.canSendOTP(phone);
    if (!canSend) return res.status(429).json({ success: false, message: 'OTP already sent recently. Please wait before requesting again.' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ phone, otp });
    
    // Try to send SMS via MSG91
    if (msg91ApiKey) {
      const smsResult = await sendSMSViaMSG91(phone, otp);
      
      if (smsResult.success) {
        console.log('✅ OTP sent via MSG91 to:', phone);
        return res.json({ success: true, message: 'OTP sent successfully via SMS' });
      } else {
        console.error('❌ MSG91 failed, falling back to console mode');
      }
    }
    
    // Fallback: Development mode (show OTP in console)
    console.log('\n🔥 DEVELOPMENT/FALLBACK OTP 🔥');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log('📋 Copy this OTP to your registration form');
    console.log('='.repeat(50));
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully (Check console for OTP)',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP and login/register with optional MSG91 access token verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, accessToken } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    // If access token is provided, verify it with MSG91
    if (accessToken && msg91ApiKey) {
      console.log('🔐 Verifying access token with MSG91...');
      const tokenVerification = await verifyMSG91AccessToken(accessToken);
      
      if (!tokenVerification.success || !tokenVerification.verified) {
        console.error('❌ MSG91 access token verification failed:', tokenVerification.error);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid access token verification',
          error: tokenVerification.error
        });
      }
      
      console.log('✅ MSG91 access token verified successfully');
      
      // Optionally check if verified mobile matches the provided phone
      if (tokenVerification.mobile && tokenVerification.mobile !== phone.replace('+91', '')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number mismatch with verified token'
        });
      }
    }

    // Check OTP in database (fallback or additional verification)
    const otpDoc = await OTP.findOne({ phone, otp, verified: false }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Find or create user by phone
    const user = await User.findOrCreateByPhone(phone, { role: 'user' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({ success: true, message: 'Authentication successful', data: { user, token } });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
});

// Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }
    // Generate token
    const token = require('jsonwebtoken').sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Phone/OTP login
router.post('/login-phone', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }
    
    // Find and verify OTP
    const otpDoc = await OTP.findOne({ phone, otp, verified: false }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();
    
    // Find or create user by phone
    const user = await User.findOrCreateByPhone(phone, { role: 'user' });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

// @desc    Register new user with password (after OTP verification)
// @route   POST /api/auth/register-user
// @access  Public
router.post('/register-user', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create new user with password
    const user = await User.create({
      name: name.trim(),
      phone,
      password,
      role: 'user'
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({
      success: true,
      message: 'User registered successfully',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @desc    Login user with phone and password
// @route   POST /api/auth/login-password
// @access  Public
router.post('/login-password', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
