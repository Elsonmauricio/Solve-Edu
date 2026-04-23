import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';

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

// Configuração dinâmica de CORS para aceitar subdomínios do Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        origin.includes('solve-edu')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

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
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para corrigir o prefixo /api/api enviado pelo Frontend
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api')) {
    req.url = req.url.replace('/api/api', '/api');
    console.log(`[Path Fix] Redirected duplicated prefix: ${req.url}`);
  }
  next();
});

// Logging middleware
if (process.env.NODE_ENV === 'development' || process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Aplica middlewares globais para a API
// 1. `optionalAuth`: Tenta autenticar o utilizador se um token for fornecido, mas não falha se não for. Popula `req.user`.
// 2. `checkMaintenanceMode`: Usa a informação do `req.user` para verificar se o acesso deve ser bloqueado.
app.use('/api', optionalAuth);
app.use('/api', checkMaintenanceMode);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/school', schoolRoutes); // Usar as rotas da escola
app.use('/api/students', studentRoutes); // Mantemos o plural
app.use('/api/student', studentRoutes);  // Adicionamos o singular como alias para evitar 404 do frontend
app.use('/api/company', companyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

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
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;