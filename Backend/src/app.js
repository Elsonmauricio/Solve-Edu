import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes.js';
import problemsRoutes from './routes/problems.routes.js';
import solutionsRoutes from './routes/solutions.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminRoutes from './routes/admin.routes.js';
import schoolRoutes from './routes/school.routes.js';
import studentRoutes from './routes/student.routes.js';
import companyRoutes from './routes/company.routes.js';
import contactRoutes from './routes/contact.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Import middleware
import { errorHandler } from './middleware/error.middleware.js';
import { optionalAuth } from './middleware/auth0.middleware.js';
import { checkMaintenanceMode } from './middleware/maintenance.middleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configuração dinâmica de CORS para aceitar subdomínios do Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 500, 
  message: 'Muitas requisições deste IP. Tente novamente mais tarde.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Aplica middlewares globais para a API
// 1. `optionalAuth`: Tenta autenticar o utilizador se um token for fornecido, mas não falha se não for. Popula `req.user`.
// 2. `checkMaintenanceMode`: Usa a informação do `req.user` para verificar se o acesso deve ser bloqueado.
app.use('/api', optionalAuth);
app.use('/api', checkMaintenanceMode);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/school', schoolRoutes); // Usar as rotas da escola
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// WebSocket for real-time notifications
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle solution submission notifications
  socket.on('solutionSubmitted', (data) => {
    const { companyId, solutionId, problemTitle } = data;
    io.to(`user:${companyId}`).emit('newSolution', {
      solutionId,
      problemTitle,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle solution review notifications
  socket.on('solutionReviewed', (data) => {
    const { studentId, solutionId, status } = data;
    io.to(`user:${studentId}`).emit('solutionStatusUpdate', {
      solutionId,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Apenas inicia o servidor se não estivermos no Vercel (Serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket server running on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

export { io };
export default app;