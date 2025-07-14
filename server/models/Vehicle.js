const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required'],
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'van', 'luxury', 'sports', 'other'],
    required: [true, 'Vehicle type is required']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
    required: [true, 'Vehicle size is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index for owner and license plate
vehicleSchema.index({ owner: 1, licensePlate: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema); 