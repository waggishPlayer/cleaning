const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number starting with +91']
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
