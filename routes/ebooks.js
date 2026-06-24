const express = require('express');
const router = express.Router();
const Ebook = require('../models/Ebook');
const User = require('../models/User');
const { verifyToken, verifyAdmin, verifyWriter } = require('../middleware/verifyToken');

// Get all published ebooks (public)
router.get('/', async (req, res) => {
  try {
    const { search, genre, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    let query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { writerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) query.genre = genre;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const total = await Ebook.countDocuments(query);
    const ebooks = await Ebook.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ ebooks, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get featured ebooks (latest 6)
router.get('/featured', async (req, res) => {
  try {
    const ebooks = await Ebook.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get top writers
router.get('/top-writers', async (req, res) => {
  try {
    const topWriters = await Ebook.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$writer', writerName: { $first: '$writerName' }, totalSales: { $sum: '$totalSales' } } },
      { $sort: { totalSales: -1 } },
      { $limit: 3 }
    ]);
    res.json(topWriters);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get writer's ebooks
router.get('/writer/:writerId', verifyToken, async (req, res) => {
  try {
    const ebooks = await Ebook.find({ writer: req.params.writerId });
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all ebooks (admin)
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ebooks = await Ebook.find().sort({ createdAt: -1 });
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single ebook
router.get('/:id', async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });
    res.json(ebook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create ebook (writer) — FIX: fetch writerName from DB so it's always accurate
router.post('/', verifyToken, verifyWriter, async (req, res) => {
  try {
    const { title, description, content, price, genre, coverImage } = req.body;

    // Fetch writer's actual name from DB (don't trust JWT or body for name)
    const writer = await User.findById(req.user.id).select('name');
    if (!writer) return res.status(404).json({ message: 'Writer not found' });

    const ebook = new Ebook({
      title,
      description,
      content,
      price,
      genre,
      coverImage,
      writer: req.user.id,
      writerName: writer.name,
    });
    await ebook.save();
    res.status(201).json(ebook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update ebook (writer)
router.put('/:id', verifyToken, verifyWriter, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });

    if (ebook.writer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Ebook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Toggle status (writer/admin)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });

    ebook.status = ebook.status === 'published' ? 'unpublished' : 'published';
    await ebook.save();
    res.json(ebook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete ebook (writer/admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });

    if (ebook.writer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Ebook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ebook deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
