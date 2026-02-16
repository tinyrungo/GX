const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'secretkey';

router.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const hash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (username, password, displayName) VALUES (?, ?, ?)');
  stmt.run(username, hash, displayName || username, function (err) {
    if (err) return res.status(400).json({ error: 'user_exists' });
    const user = { id: this.lastID, username, displayName: displayName || username };
    const token = jwt.sign(user, SECRET);
    res.json({ token, user });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  db.get('SELECT id, username, password, displayName FROM users WHERE username = ?', [username], async (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'invalid' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'invalid' });
    const user = { id: row.id, username: row.username, displayName: row.displayName };
    const token = jwt.sign(user, SECRET);
    res.json({ token, user });
  });
});

module.exports = router;
