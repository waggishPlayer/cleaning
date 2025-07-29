const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(phone) {
        // Accept +919876543210, 919876543210, or 9876543210 formats
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return /^(91)?[6-9]\d{9}$/.test(cleanPhone);
      },
      message: 'Please enter a valid Indian phone number'
    }
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires after 5 minutes (300 seconds)
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Create compound index for efficient queries
otpSchema.index({ phone: 1, createdAt: -1 });

// Prevent duplicate OTPs for the same phone within 1 minute
otpSchema.statics.canSendOTP = async function(phone) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recent = await this.findOne({ phone, createdAt: { $gt: oneMinuteAgo } });
  return !recent;
};

module.exports = mongoose.model('OTP', otpSchema);
