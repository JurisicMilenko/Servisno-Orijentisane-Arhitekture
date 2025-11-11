const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Simple in-memory posts
let posts = [
  { id: 1, title: 'Welcome', author: 'Admin', content: 'This is the blog.' }
];

app.get('/api/blog', (req, res) => res.json(posts));
app.get('/api/blog/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const p = posts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
});

app.post('/api/blog', (req, res) => {
  const { title, author, content } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const id = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  const post = { id, title, author: author || 'anonymous', content: content || '' };
  posts.push(post);
  res.status(201).json(post);
});

app.get('/health', (req, res) => res.json({ status: 'blog ok' }));

app.listen(PORT, () => console.log(`Blog service running on http://localhost:${PORT}`));
