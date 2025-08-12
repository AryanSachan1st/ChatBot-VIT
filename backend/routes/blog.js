const express = require('express');
const slugify = require('slugify');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const { embedding } = require('../utils/openai');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  try {
    const slug = slugify(title, { lower: true, strict: true });
    const embed = await embedding(`${title}\n\n${content}`);
    const blog = await Blog.create({ title, slug, author: req.user._id, content, tags: tags || [], embedding: embed });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const docs = await Blog.find().populate('author', 'name email role').sort({ createdAt: -1 }).limit(50);
  res.json(docs);
});

router.get('/:slug', async (req, res) => {
  const b = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name email role');
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json(b);
});

module.exports = router;