const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a base schema without email
const baseUserSchema = {
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
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
    required: [true, 'Phone number is required'], // Make phone required
    unique: true, // Enforce unique phone for all users
    trim: true,
    index: true // Add index here instead of at the bottom
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
  dateOfBirth: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
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
};

// Create the schema
const userSchema = new mongoose.Schema(baseUserSchema, {
  timestamps: true
});

// Add email field as optional for all roles
userSchema.add({
  email: {
    type: String,
    required: false, // Make email optional for all users
    unique: false, // Remove unique constraint
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: undefined // Use undefined instead of null to avoid duplicate key issues
  }
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

// Pre-save middleware to remove email field for regular users
userSchema.pre('save', function(next) {
  if (this.role === 'user') {
    // Remove email field completely for regular users
    this.email = undefined;
    // Also remove from the document to prevent any issues
    this.$unset = this.$unset || {};
    this.$unset.email = 1;
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
    // Generate a default name from phone number if not provided
    const defaultName = defaults.name || `User_${phone.replace(/[^0-9]/g, '').slice(-4)}`;
    user = await this.create({ 
      phone, 
      name: defaultName,
      ...defaults 
    });
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);