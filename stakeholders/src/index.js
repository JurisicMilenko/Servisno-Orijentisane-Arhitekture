const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory sample data
let stakeholders = [
  { id: 1, username: 'guide1', role: 'guide', first_name: 'Marko', last_name: 'Markovic', bio: 'Planinski vodič' },
  { id: 2, username: 'tourist1', role: 'tourist', first_name: 'Ana', last_name: 'Petrovic', bio: 'Ljubitelj putovanja' }
];

app.get('/api/stakeholders', (req, res) => res.json(stakeholders));

app.get('/api/stakeholders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const s = stakeholders.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: 'not found' });
  res.json(s);
});

app.post('/api/stakeholders', (req, res) => {
  const { username, role, first_name, last_name, bio } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });
  const id = stakeholders.length ? Math.max(...stakeholders.map(s => s.id)) + 1 : 1;
  const s = { id, username, role: role || 'tourist', first_name: first_name || null, last_name: last_name || null, bio: bio || null };
  stakeholders.push(s);
  res.status(201).json(s);
});

app.put('/api/stakeholders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = stakeholders.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const updated = Object.assign(stakeholders[idx], req.body);
  stakeholders[idx] = updated;
  res.json(updated);
});

app.delete('/api/stakeholders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = stakeholders.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  stakeholders.splice(idx, 1);
  res.status(204).end();
});

app.get('/health', (req, res) => res.json({ status: 'stakeholders ok' }));

app.listen(PORT, () => console.log(`Stakeholders service running on http://localhost:${PORT}`));
