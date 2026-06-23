const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'writer', 'admin'], default: 'user' },
  photoURL: { type: String, default: '' },
  isBanned: { type: Boolean, default: false },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' }],
  purchasedEbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);