const express = require('express');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const OTP = require('../models/OTP');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// MSG91 WhatsApp configuration
const msg91ApiKey = process.env.MSG91_API_KEY;
const msg91WhatsappTemplateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;
const msg91WhatsappNumber = process.env.MSG91_WHATSAPP_NUMBER;

// Validate MSG91 configuration
if (msg91ApiKey) {
  console.log('✅ MSG91 WhatsApp service initialized');
  console.log('📱 WhatsApp Business Number:', msg91WhatsappNumber || '919203240991 (default)');
  if (msg91WhatsappTemplateId) {
    console.log('📋 WhatsApp Template ID:', msg91WhatsappTemplateId);
  } else {
    console.log('⚠️  WhatsApp Template ID not set - using text messages');
  }
} else {
  console.log('⚠️ MSG91 API Key missing - WhatsApp functionality disabled');
}

// Function to send WhatsApp OTP via MSG91 - Using the WORKING method
const sendWhatsAppOTPViaMSG91 = async (phone, otp) => {
  try {
    // Clean and format phone number for MSG91 WhatsApp (must be in international format with 91 prefix)
    let cleanPhone = phone.replace(/[^0-9]/g, ''); // Remove all non-digits
    
    console.log('📞 Original phone input:', phone);
    console.log('📞 Cleaned digits only:', cleanPhone);
    
    // Ensure phone number always has 91 prefix for Indian numbers
    if (cleanPhone.startsWith('91')) {
      // Remove any extra 91 prefixes and keep only one
      cleanPhone = cleanPhone.replace(/^(91)+/, '91');
      // Ensure it's exactly 12 digits (91 + 10 digit number)
      if (cleanPhone.length > 12) {
        cleanPhone = cleanPhone.substring(0, 12);
      } else if (cleanPhone.length < 12) {
        throw new Error('Invalid phone number: too short after 91 prefix');
      }
    } else if (cleanPhone.length === 10) {
      // 10 digit Indian mobile number - add 91 prefix
      cleanPhone = '91' + cleanPhone;
    } else {
      // Try to extract 10 digit number and add 91
      const match = cleanPhone.match(/(\d{10})/);
      if (match) {
        cleanPhone = '91' + match[1];
      } else {
        throw new Error('Invalid phone number format - must be 10 digits');
      }
    }
    
    console.log('📱 Sending WhatsApp OTP via MSG91 to:', phone);
    console.log('📋 Clean phone:', cleanPhone);
    console.log('🔐 OTP:', otp);
    
    // Use ONLY WhatsApp OTP method - NO SMS fallback
    try {
      console.log('📱 Sending WhatsApp OTP ONLY...');
      console.log('📤 Request payload:', {
        authkey: msg91ApiKey.substring(0, 10) + '...',
        mobile: cleanPhone,
        otp: otp,
        sender: 'MSG91',
        channel: 'whatsapp'
      });
      
      // Use MSG91 provided template format
      const response = await axios.post('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
        "integrated_number": msg91WhatsappNumber || "919203240991",
        "content_type": "template",
        "payload": {
          "messaging_product": "whatsapp",
          "type": "template",
          "template": {
            "name": "otp",
            "language": {
              "code": "en",
              "policy": "deterministic"
            },
            "namespace": "b870bc3c_9fa6_4bf8_b4b2_82078187366a",
            "to_and_components": [
              {
                "to": [cleanPhone],
                "components": {
                  "body_1": {
                    "type": "text",
                    "value": otp
                  },
                  "button_1": {
                    "subtype": "url",
                    "type": "text",
                    "value": otp
                  }
                }
              }
            ]
          }
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'authkey': msg91ApiKey
        },
        timeout: 15000
      });
      
      console.log('✅ WhatsApp OTP API SUCCESS:', response.data);
      console.log('📋 Request ID:', response.data.request_id);
      
      // Even if API returns success, WhatsApp delivery may still fail
      // This is a known issue with MSG91 WhatsApp service
      if (response.data.type === 'success') {
        return { 
          success: true, 
          data: response.data, 
          method: 'WhatsApp OTP',
          message: 'WhatsApp OTP sent successfully. If you don\'t receive it within 2-3 minutes, please contact support.'
        };
      } else {
        throw new Error(`MSG91 API error: ${JSON.stringify(response.data)}`);
      }
      
    } catch (error) {
      console.log('❌ WhatsApp OTP API failed:', error.response?.data || error.message);
      
      // Return detailed error for WhatsApp issues
      const errorMessage = error.response?.data || error.message;
      return { 
        success: false, 
        error: errorMessage,
        message: 'WhatsApp OTP delivery failed. Please check your WhatsApp settings or contact MSG91 support.' 
      };
    }
    
  } catch (error) {
    console.error('❌ All OTP methods failed:', error.response?.data || error.message);
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
      },
      timeout: 15000 // 15 second timeout
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

// Send OTP - Fixed version
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
    
    console.log('📞 OTP request for phone:', phone);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated OTP:', otp);
    
    // Try database operations with timeout
    let dbOperationSuccess = false;
    try {
      console.log('💾 Starting DB operations...');
      const canSend = await Promise.race([
        OTP.canSendOTP(phone),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
      
      if (!canSend) {
        return res.status(429).json({ success: false, message: 'OTP already sent recently. Please wait before requesting again.' });
      }
      
      await Promise.race([
        OTP.create({ phone, otp }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
      
      dbOperationSuccess = true;
      console.log('✅ DB operations completed');
    } catch (dbError) {
      console.warn('⚠️ DB operation failed:', dbError.message, '- continuing without DB storage');
    }
    
    // Try to send WhatsApp OTP via MSG91
    if (msg91ApiKey) {
      console.log('📱 Attempting MSG91 WhatsApp OTP...');
      const whatsappResult = await sendWhatsAppOTPViaMSG91(phone, otp);
      
      if (whatsappResult.success) {
        console.log('✅ WhatsApp OTP sent via MSG91 to:', phone);
        return res.json({ 
          success: true, 
          message: 'OTP sent successfully via WhatsApp',
          dbStored: dbOperationSuccess,
          method: whatsappResult.method,
          data: whatsappResult.data
        });
      } else {
        console.error('❌ MSG91 WhatsApp OTP failed:', whatsappResult.error);
      }
    }
    
    // Fallback: Development mode (show OTP in console)
    console.log('\n🔥 DEVELOPMENT/FALLBACK OTP 🔥');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log('📋 Copy this OTP to your registration form');
    console.log('='.repeat(50));
    
    // Store OTP in memory for development verification (if DB failed)
    if (!dbOperationSuccess && process.env.NODE_ENV === 'development') {
      // Store in a simple in-memory cache for development
      if (!global.devOtpCache) global.devOtpCache = new Map();
      global.devOtpCache.set(phone, {
        otp,
        timestamp: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      });
      console.log('💾 OTP stored in memory cache for development');
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully (Check console for OTP)',
      dbStored: dbOperationSuccess,
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
    });
    
  } catch (error) {
    console.error('❌ Send OTP error:', error);
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

    console.log('🔐 Verifying OTP for phone:', phone);

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

    // Check OTP in database (with fallback for development)
    let otpDoc = null;
    let otpVerified = false;
    
    try {
      // Try to find OTP in database
      otpDoc = await Promise.race([
        OTP.findOne({ phone, otp, verified: false }).sort({ createdAt: -1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
      
      if (otpDoc) {
        // Mark OTP as verified
        otpDoc.verified = true;
        await otpDoc.save();
        console.log('✅ OTP verified from database');
        otpVerified = true;
      }
    } catch (dbError) {
      console.warn('⚠️ DB verification failed:', dbError.message);
    }
    
    // In development mode, allow OTP verification without DB if it matches the development OTP pattern
    if (!otpVerified && process.env.NODE_ENV === 'development' && /^\d{6}$/.test(otp)) {
      console.log('🔧 Development mode: allowing OTP verification without DB');
      otpVerified = true;
    }
    
    // Check in-memory cache for development mode
    if (!otpVerified && process.env.NODE_ENV === 'development' && global.devOtpCache) {
      const cachedOtp = global.devOtpCache.get(phone);
      if (cachedOtp && cachedOtp.otp === otp && Date.now() < cachedOtp.expiresAt) {
        console.log('🔧 Development mode: OTP verified from memory cache');
        global.devOtpCache.delete(phone); // Remove from cache after use
        otpVerified = true;
      }
    }
    
    if (!otpVerified) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // OTP is verified - don't create user here, let registration form handle it
    console.log('✅ Phone number verified successfully');
    
    res.json({ 
      success: true, 
      message: 'Phone number verified successfully. Please complete registration.',
      phoneVerified: true,
      phone: phone
    });
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
    const { name, phone, address, dateOfBirth, gender, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, dateOfBirth, gender, profileImage },
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

    console.log('📝 Registration request for:', phone, 'with name:', name);

    // Check if user already exists (from previous OTP verification)
    const existingUser = await User.findOne({ phone });
    
    let user;
    if (existingUser) {
      // Update existing user with proper name and password
      console.log('👤 Updating existing user with new details');
      existingUser.name = name.trim();
      existingUser.password = password;
      // Ensure email is undefined for regular users
      existingUser.email = undefined;
      user = await existingUser.save();
      console.log('✅ User updated successfully');
    } else {
      // Create new user without email field
      console.log('👤 Creating new user');
      const userData = {
        name: name.trim(),
        phone,
        password,
        role: 'user'
        // Explicitly NOT including email field
      };
      user = await User.create(userData);
      console.log('✅ User created successfully');
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({
      success: true,
      message: 'User registered successfully',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('User registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({
          success: false,
          message: 'A user with this phone number already exists'
        });
      } else if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use'
        });
      }
    }
    
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
    console.log('🔐 Login request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });
    
    const { phone, password } = req.body;

    if (!phone || !password) {
      console.log('❌ Missing phone or password');
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Clean the phone number to ensure consistent format
    let cleanPhone = phone.replace(/\D/g, '');
    // If it starts with 91, keep it as is, otherwise add 91 prefix for Indian numbers
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    console.log('📱 Cleaned phone number for login:', cleanPhone);

    // Find user by phone - try both formats (with and without 91 prefix)
    let user = await User.findOne({ phone: cleanPhone }).select('+password');
    
    // If not found, try without the 91 prefix
    if (!user && cleanPhone.startsWith('91')) {
      const alternativePhone = cleanPhone.substring(2);
      user = await User.findOne({ phone: alternativePhone }).select('+password');
      console.log('🔍 Trying alternative phone format:', alternativePhone);
    }
    
    // If still not found, try with +91 prefix
    if (!user) {
      const alternativePhone = '+' + cleanPhone;
      user = await User.findOne({ phone: alternativePhone }).select('+password');
      console.log('🔍 Trying alternative phone format with +:', alternativePhone);
    }
    
    console.log('🔍 Database lookup result:', {
      phone,
      cleanPhone,
      userFound: !!user,
      userName: user?.name,
      userRole: user?.role,
      hasPassword: !!user?.password
    });
    
    if (!user) {
      console.log('❌ User not found with phone:', phone);
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password check result:', {
      providedPassword: password,
      passwordMatch: isMatch
    });
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', user.name);
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
