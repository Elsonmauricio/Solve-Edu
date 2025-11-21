const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solveedu')
.then(() => {
  console.log('✅ Conectado à base de dados MongoDB');
  console.log(`📊 Base de dados: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.error('❌ Erro de conexão à BD:', err);
  console.log('💡 Dica: Verifica se o MongoDB está a correr');
});

// Models
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Solution = require('./models/Solution');
const Message = require('./models/Message');

// Socket.io
io.on('connection', (socket) => {
  console.log('👤 Utilizador conectado:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`Utilizador ${userId} juntou-se à sala`);
  });

  socket.on('new_message', (data) => {
    socket.to(data.receiverId).emit('message_received', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 Utilizador desconectado:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/solutions', require('./routes/solutions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SolveEdu API está a funcionar!',
    database: 'MongoDB',
    version: '1.0.0',
    database: mongoose.connection.db?.databaseName || 'A conectar...'
  });
});

// Health check route
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(500).json({ message: 'Algo correu mal no servidor!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});