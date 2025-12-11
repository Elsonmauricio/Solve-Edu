import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'SolveEdu <no-reply@solveedu.pt>',
  },

  // File Upload
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || '10MB',
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
    ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // WebSocket
  websocket: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  },

  // Features
  features: {
    emailVerification: process.env.EMAIL_VERIFICATION === 'true',
    fileUpload: process.env.FILE_UPLOAD === 'true',
    realTimeNotifications: process.env.REAL_TIME_NOTIFICATIONS === 'true',
  },
};

// Validate required configuration
const requiredConfig = ['DATABASE_URL', 'JWT_SECRET'];

requiredConfig.forEach(key => {
  if (!process.env[key] && config.nodeEnv === 'production') {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

export default config;