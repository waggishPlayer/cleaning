const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin registration endpoint (public)
router.post('/register-admin', async (req, res) => {
  try {
    let { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    // If phone is not provided, generate a unique dummy phone
    if (!phone) {
      // Generate a random 10-digit phone number starting with 99
      let unique = false;
      while (!unique) {
        phone = '99' + Math.floor(10000000 + Math.random() * 90000000).toString();
        const phoneExists = await User.findOne({ phone });
        if (!phoneExists) unique = true;
      }
    }
    const user = await User.create({
      name,
      email,
      password: password, // Let the pre-save hook handle hashing
      phone,
      role: 'admin',
      isActive: true,
      address: address || undefined
    });
    console.log('Admin registered:', { email: user.email, phone: user.phone });
    res.json({ success: true, message: 'Admin registered', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin can register a worker
router.post('/register-worker', async (req, res) => {
  try {
    let { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    // If phone is not provided, generate a unique dummy phone
    if (!phone) {
      let unique = false;
      while (!unique) {
        phone = '98' + Math.floor(10000000 + Math.random() * 90000000).toString();
        const phoneExists = await User.findOne({ phone });
        if (!phoneExists) unique = true;
      }
    }
    const user = await User.create({
      name,
      email,
      password: password, // Let the pre-save hook handle hashing
      phone,
      role: 'worker',
      isActive: true,
      address: address || undefined
    });
    res.json({ success: true, message: 'Worker registered', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// All routes require admin role
router.use(protect, authorize('admin'));

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('worker', 'name phone')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings
    });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// @desc    Get all workers
// @route   GET /api/admin/workers
// @access  Private/Admin
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error('Admin get workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workers',
      error: error.message
    });
  }
});

// @desc    Assign booking to worker
// @route   PUT /api/admin/bookings/:id/assign
// @access  Private/Admin
router.put('/bookings/:id/assign', async (req, res) => {
  try {
    const { workerId } = req.body;

    // Verify worker exists and is available
    const worker = await User.findOne({
      _id: workerId,
      role: 'worker',
      isActive: true,
      'workerDetails.isAvailable': true
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found or not available'
      });
    }

    // Verify booking exists and is pending
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    // Assign worker to booking
    booking.worker = workerId;
    booking.status = 'assigned';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('worker', 'name phone');

    res.json({
      success: true,
      message: 'Booking assigned successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Assign booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning booking',
      error: error.message
    });
  }
});

// @desc    Mark booking as completed (admin or worker)
// @route   PUT /api/admin/bookings/:id/complete
// @access  Private/Admin
router.put('/bookings/:id/complete', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    if (booking.status !== 'assigned' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in a state that can be completed'
      });
    }
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();
    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('worker', 'name phone');
    res.json({
      success: true,
      message: 'Booking marked as completed',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Mark booking complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking booking as completed',
      error: error.message
    });
  }
});

// @desc    Update booking status (admin only)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    booking.status = status;
    if (notes) {
      booking.notes = booking.notes || {};
      booking.notes.admin = notes;
    }
    if (status === 'completed') {
      booking.completedAt = new Date();
    } else if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = 'admin';
    } else {
      booking.completedAt = undefined;
      booking.cancelledAt = undefined;
      booking.cancelledBy = undefined;
    }
    await booking.save();
    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('worker', 'name phone');
    res.json({
      success: true,
      message: 'Booking status updated',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Admin update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

// @desc    Update user (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, role, isActive, address } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (address !== undefined) user.address = address;
    await user.save();
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// @desc    Update worker availability
// @route   PUT /api/admin/workers/:id/availability
// @access  Private/Admin
router.put('/workers/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { 'workerDetails.isAvailable': isAvailable },
      { new: true }
    ).select('-password');

    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.json({
      success: true,
      message: `Worker ${isAvailable ? 'marked as available' : 'marked as unavailable'}`,
      data: worker
    });
  } catch (error) {
    console.error('Update worker availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating worker availability',
      error: error.message
    });
  }
});

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Total bookings in period
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Completed bookings
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate }
    });

    // Total revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Average rating
    const ratingData = await Booking.aggregate([
      {
        $match: {
          rating: { $exists: true, $ne: null },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = ratingData.length > 0 ? ratingData[0].averageRating : 0;

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });

    // Status distribution
    const statusDistribution = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalUsers,
        totalWorkers,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router; 