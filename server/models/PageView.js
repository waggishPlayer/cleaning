const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    enum: ['landing', 'register']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String
});

// Add indexes for faster queries
pageViewSchema.index({ pageName: 1 });
pageViewSchema.index({ timestamp: 1 });

module.exports = mongoose.model('PageView', pageViewSchema);