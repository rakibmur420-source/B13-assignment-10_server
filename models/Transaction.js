const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['purchase'], required: true },
  ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' },
  ebookTitle: { type: String },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerEmail: { type: String },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  writerEmail: { type: String },
  amount: { type: Number, required: true },
  stripeSessionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);