const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  price: { type: Number, required: true },
  genre: { 
    type: String, 
    enum: ['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Horror', 'Thriller', 'Adventure', 'Biography', 'Self-Help', 'History', 'Drama', 'Other'],

    
    required: true 
  },
  coverImage: { type: String, required: true },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  writerName: { type: String, required: true },
  status: { type: String, enum: ['published', 'unpublished'], default: 'unpublished' },
  totalSales: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Ebook', ebookSchema);