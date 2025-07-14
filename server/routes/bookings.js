const express = require('express');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    
    if (req.user.role === 'worker') {
      // Workers see their assigned bookings
      bookings = await Booking.find({ worker: req.user._id })
        .populate('customer', 'name email phone')
        .populate('vehicle', 'make model year licensePlate color')
        .sort({ scheduledDate: -1 });
    } else {
      // Customers see their own bookings
      bookings = await Booking.find({ customer: req.user._id })
        .populate('vehicle', 'make model year licensePlate color')
        .populate('worker', 'name phone')
        .sort({ scheduledDate: -1 });
    }

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let booking;
    
    if (req.user.role === 'worker') {
      booking = await Booking.findOne({
        _id: req.params.id,
        worker: req.user._id
      }).populate('customer', 'name email phone address')
        .populate('vehicle', 'make model year licensePlate color vehicleType size');
    } else {
      booking = await Booking.findOne({
        _id: req.params.id,
        customer: req.user._id
      }).populate('vehicle', 'make model year licensePlate color vehicleType size')
        .populate('worker', 'name phone');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const {
      vehicleId,
      serviceType,
      scheduledDate,
      scheduledTime,
      location,
      notes,
      price
    } = req.body;

    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      owner: req.user._id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if date is in the future
    const bookingDate = new Date(scheduledDate);
    if (bookingDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      vehicle: vehicleId,
      serviceType,
      scheduledDate,
      scheduledTime,
      location,
      notes: { customer: notes },
      price
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicle', 'make model year licensePlate color');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// @desc    Update booking status (Worker only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Worker
router.put('/:id/status', protect, authorize('worker'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      worker: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status and worker notes
    booking.status = status;
    if (notes) {
      booking.notes.worker = notes;
    }

    // Set completedAt if status is completed
    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate color');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    let booking;
    
    if (req.user.role === 'worker') {
      booking = await Booking.findOne({
        _id: req.params.id,
        worker: req.user._id
      });
    } else {
      booking = await Booking.findOne({
        _id: req.params.id,
        customer: req.user._id
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled (less than 2 hours before scheduled time)'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.role;
    booking.cancellationReason = reason;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// @desc    Add rating and review
// @route   PUT /api/bookings/:id/review
// @access  Private/User
router.put('/:id/review', protect, authorize('user'), async (req, res) => {
  try {
    const { rating, review } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Completed booking not found'
      });
    }

    if (booking.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    res.json({
      success: true,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
});

module.exports = router; 