const express = require('express');
const Address = require('../models/Address');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all addresses for current user
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ owner: req.user._id, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses',
      error: error.message
    });
  }
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching address',
      error: error.message
    });
  }
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      street,
      city,
      state,
      zipCode,
      country,
      coordinates,
      isDefault,
      nickname,
      notes
    } = req.body;

    const address = await Address.create({
      owner: req.user._id,
      street,
      city,
      state,
      zipCode,
      country,
      coordinates,
      isDefault,
      nickname,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating address',
      error: error.message
    });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const {
      street,
      city,
      state,
      zipCode,
      country,
      coordinates,
      isDefault,
      nickname,
      notes
    } = req.body;

    let address = await Address.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      {
        street,
        city,
        state,
        zipCode,
        country,
        coordinates,
        isDefault,
        nickname,
        notes
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
});

// @desc    Delete address (soft delete)
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Don't allow deleting the default address if it's the only one
    if (address.isDefault) {
      const addressCount = await Address.countDocuments({
        owner: req.user._id,
        isActive: true
      });
      
      if (addressCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only address. Please add another address first.'
        });
      }
    }

    // Soft delete - set isActive to false
    address.isActive = false;
    await address.save();

    // If this was the default address, make the most recent one default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        owner: req.user._id,
        isActive: true
      }).sort({ createdAt: -1 });
      
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
      error: error.message
    });
  }
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
router.put('/:id/default', protect, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Set this address as default (the pre-save hook will handle removing default from others)
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default address',
      error: error.message
    });
  }
});

// @desc    Get user's default address
// @route   GET /api/addresses/default
// @access  Private
router.get('/default', protect, async (req, res) => {
  try {
    const address = await Address.findOne({
      owner: req.user._id,
      isDefault: true,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching default address',
      error: error.message
    });
  }
});

module.exports = router;
