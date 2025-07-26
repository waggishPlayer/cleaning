const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: function() { return this.role === 'worker' || this.role === 'admin'; },
    unique: false, // We'll enforce unique phone for customers
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: false, // Make password optional for OTP-based users
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    // required: [true, 'Phone number is required'], // Make phone optional
    unique: true, // Enforce unique phone for all users
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  // Worker specific fields
  workerDetails: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalJobs: {
      type: Number,
      default: 0
    },
    specialties: [{
      type: String,
      enum: ['exterior', 'interior', 'full-service', 'premium']
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validation: customers cannot have email (unless they're being upgraded to workers/admins)
userSchema.pre('validate', function(next) {
  if (this.role === 'user' && this.email) {
    this.invalidate('email', 'Regular users cannot have email addresses');
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method for OTP-based find or create
userSchema.statics.findOrCreateByPhone = async function(phone, defaults = {}) {
  let user = await this.findOne({ phone });
  if (!user) {
    user = await this.create({ phone, ...defaults });
  }
  return user;
};

userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 