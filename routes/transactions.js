const express = require('express');
const router = express.Router();
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}
const Transaction = require('../models/Transaction');
const Ebook = require('../models/Ebook');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

// Create Stripe checkout session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { ebookId } = req.body;
    const ebook = await Ebook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: ebook.title, images: [ebook.coverImage] },
          unit_amount: Math.round(ebook.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&ebook_id=${ebookId}`,
      cancel_url: `${process.env.CLIENT_URL}/ebooks/${ebookId}`,
      metadata: { ebookId: ebookId.toString(), buyerId: req.user.id.toString() }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify payment
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { sessionId, ebookId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const ebook = await Ebook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });

    const user = await User.findById(req.user.id);
    if (user.purchasedEbooks.includes(ebookId)) {
      return res.json({ message: 'Already purchased' });
    }

    const writerUser = await User.findById(ebook.writer).select('email');
    ebook.totalSales += 1;
    await ebook.save();

    user.purchasedEbooks.push(ebookId);
    await user.save();

    const transaction = new Transaction({
      type: 'purchase',
      ebook: ebookId,
      ebookTitle: ebook.title,
      buyer: req.user.id,
      buyerEmail: req.user.email,
      writer: ebook.writer,
      writerEmail: writerUser?.email || '',
      amount: ebook.price,
      stripeSessionId: sessionId,
      status: 'completed',
    });
    await transaction.save();

    res.json({ message: 'Payment verified', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's purchase history
router.get('/my-purchases', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user.id })
      .populate('ebook')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove a purchase (delete transaction + remove from purchasedEbooks)
router.delete('/my-purchases/:ebookId', verifyToken, async (req, res) => {
  try {
    const { ebookId } = req.params;
    const buyerId = req.user.id;

    // Delete the transaction record
    await Transaction.deleteOne({ buyer: buyerId, ebook: ebookId });

    // Remove from user's purchasedEbooks array AND bookmarks
    await User.findByIdAndUpdate(buyerId, {
      $pull: { purchasedEbooks: ebookId, bookmarks: ebookId }
    });

    res.json({ message: 'Purchase removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get writer's sales
router.get('/my-sales', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ writer: req.user.id })
      .populate('ebook')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all transactions (admin)
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('ebook')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Analytics (admin)
router.get('/analytics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalWriters = await User.countDocuments({ role: 'writer' });
    const totalReaders = await User.countDocuments({ role: 'user' });
    const totalEbooks = await Ebook.countDocuments({ status: 'published' });

    const revenueData = await Transaction.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const monthlySales = await Transaction.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const genreData = await Ebook.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$genre', count: { $sum: 1 } } }
    ]);

    res.json({ totalUsers, totalWriters, totalReaders, totalEbooks, totalRevenue, monthlySales, genreData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
