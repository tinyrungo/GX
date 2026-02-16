const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT id, username, displayName FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db' });
    res.json(rows);
  });
});

router.post('/add-friend', (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2) return res.status(400).json({ error: 'missing' });
  const stmt = db.prepare('INSERT INTO friends (user1, user2) VALUES (?, ?)');
  stmt.run(user1, user2, function (err) {
    if (err) return res.status(500).json({ error: 'db' });
    res.json({ ok: true });
  });
});

module.exports = router;
