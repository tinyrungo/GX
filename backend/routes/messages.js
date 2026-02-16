const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { fromId, toId, content, type } = req.body;
  if (!fromId || !toId || !content) return res.status(400).json({ error: 'missing' });
  const ts = Date.now();
  const stmt = db.prepare('INSERT INTO messages (fromId, toId, content, type, timestamp) VALUES (?, ?, ?, ?, ?)');
  stmt.run(fromId, toId, content, type || 'text', ts, function (err) {
    if (err) return res.status(500).json({ error: 'db' });
    res.json({ id: this.lastID, fromId, toId, content, type: type || 'text', timestamp: ts });
  });
});

router.get('/history/:userA/:userB', (req, res) => {
  const { userA, userB } = req.params;
  db.all(
    'SELECT * FROM messages WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?) ORDER BY timestamp ASC',
    [userA, userB, userB, userA],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'db' });
      res.json(rows);
    }
  );
});

module.exports = router;
