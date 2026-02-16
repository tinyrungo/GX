const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// CORS 设置：可通过环境变量 `ALLOWED_ORIGINS` 指定允许的来源，逗号分隔；默认允许所有来源（*）
const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '3mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/messages', messagesRoutes);
app.use('/upload', uploadRoutes);

const SECRET = process.env.JWT_SECRET || 'secretkey';
const onlineUsers = {}; // userId -> socketId

app.get('/online', (req, res) => {
  res.json(Object.keys(onlineUsers).map((id) => ({ id: Number(id) })));
});

io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next();
  try {
    const user = jwt.verify(token, SECRET);
    socket.user = user;
    next();
  } catch (e) {
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.user && socket.user.id) {
    onlineUsers[socket.user.id] = socket.id;
    io.emit('online_update', Object.keys(onlineUsers));
  }

  socket.on('private_message', (msg) => {
    // msg: { to, content, type, from }
    const ts = Date.now();
    const stmt = db.prepare('INSERT INTO messages (fromId, toId, content, type, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(msg.from, msg.to, msg.content, msg.type || 'text', ts, function (err) {
      const saved = { id: this.lastID, fromId: msg.from, toId: msg.to, content: msg.content, type: msg.type || 'text', timestamp: ts };
      const targetSocket = onlineUsers[msg.to];
      if (targetSocket) io.to(targetSocket).emit('private_message', saved);
      socket.emit('message_saved', saved);
    });
  });

  socket.on('disconnect', () => {
    if (socket.user && socket.user.id) {
      delete onlineUsers[socket.user.id];
      io.emit('online_update', Object.keys(onlineUsers));
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Server running on', PORT));
