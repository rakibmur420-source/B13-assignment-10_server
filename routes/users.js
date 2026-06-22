const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

// Get all users (admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single user
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user role (admin)
router.patch('/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Ban/Unban user (admin)
router.patch('/:id/ban', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Toggle bookmark
router.patch('/:id/bookmark', verifyToken, async (req, res) => {
  try {
    const { ebookId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.bookmarks.indexOf(ebookId);
    if (index === -1) {
      user.bookmarks.push(ebookId);
    } else {
      user.bookmarks.splice(index, 1);
    }
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user bookmarks
router.get('/:id/bookmarks', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get purchased ebooks
router.get('/:id/purchased', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('purchasedEbooks');
    res.json(user.purchasedEbooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;