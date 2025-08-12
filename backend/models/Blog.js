const mongoose = require('mongoose');
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  tags: { type: [String], default: [] }
}, { timestamps: true });
module.exports = mongoose.model('Blog', BlogSchema);