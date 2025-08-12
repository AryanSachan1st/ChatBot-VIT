const express = require('express');
const Blog = require('../models/Blog');
const { embedding, chat } = require('../utils/openai');
const router = express.Router();

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

router.post('/rag', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });
  try {
    const qEmbed = await embedding(question);
    const docs = await Blog.find().limit(200).select('title content embedding slug');
    const scored = docs
      .map(d => ({ doc: d, score: d.embedding.length ? cosine(qEmbed, d.embedding) : -1 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const context = scored.map((s, i) => `Source ${i + 1} (${s.doc.slug}): ${s.doc.title}\n\n${s.doc.content.slice(0, 1500)}`).join('\n\n---\n\n');
    const messages = [
      { role: 'system', content: 'You are a helpful assistant. Use the provided sources to answer the question and cite sources.' },
      { role: 'user', content: `Question: ${question}\n\nSources:\n${context}\n\nProvide an answer and list which sources you used (e.g. Source 1).` }
    ];
    const reply = await chat(messages, { max_tokens: 600 });
    res.json({ answer: reply.content, sources: scored.map((s, i) => ({ idx: i + 1, slug: s.doc.slug, score: s.score })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;