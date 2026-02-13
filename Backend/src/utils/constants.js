// User roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  SCHOOL: 'SCHOOL',
};

// Problem categories
export const PROBLEM_CATEGORIES = {
  TECHNOLOGY: 'TECHNOLOGY',
  SUSTAINABILITY: 'SUSTAINABILITY',
  HEALTH: 'HEALTH',
  EDUCATION: 'EDUCATION',
  BUSINESS: 'BUSINESS',
  DESIGN: 'DESIGN',
  SCIENCE: 'SCIENCE',
  ENGINEERING: 'ENGINEERING',
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
};

// Problem statuses
export const PROBLEM_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  ARCHIVED: 'ARCHIVED',
};

// Solution statuses
export const SOLUTION_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEEDS_REVISION: 'NEEDS_REVISION',
  AWARDED: 'AWARDED',
};

// Reward types
export const REWARD_TYPES = {
  MONEY: 'MONEY',
  INTERNSHIP: 'INTERNSHIP',
  PRIZE: 'PRIZE',
  CERTIFICATE: 'CERTIFICATE',
  JOB_OFFER: 'JOB_OFFER',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SOLUTION_SUBMITTED: 'SOLUTION_SUBMITTED',
  SOLUTION_REVIEWED: 'SOLUTION_REVIEWED',
  PROBLEM_EXPIRING: 'PROBLEM_EXPIRING',
  NEW_MESSAGE: 'NEW_MESSAGE',
  SYSTEM_UPDATE: 'SYSTEM_UPDATE',
  AWARD_RECEIVED: 'AWARD_RECEIVED',
};

// User levels (for gamification)
export const USER_LEVELS = [
  'Iniciante',
  'Intermediário',
  'Avançado',
  'Expert',
  'Mestre',
  'Lenda',
];

// Achievement types
export const ACHIEVEMENT_TYPES = {
  FIRST_SOLUTION: 'FIRST_SOLUTION',
  ACCEPTED_SOLUTION: 'ACCEPTED_SOLUTION',
  TOP_RATED_SOLUTION: 'TOP_RATED_SOLUTION',
  PROBLEM_SOLVED: 'PROBLEM_SOLVED',
  COMMUNITY_HELPER: 'COMMUNITY_HELPER',
};

// Validation constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  PROBLEM: {
    TITLE_MIN: 5,
    TITLE_MAX: 200,
    DESCRIPTION_MIN: 50,
    DESCRIPTION_MAX: 5000,
  },
  SOLUTION: {
    TITLE_MIN: 5,
    TITLE_MAX: 200,
    DESCRIPTION_MIN: 50,
    DESCRIPTION_MAX: 5000,
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Time constants (in milliseconds)
export const TIME = {
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  ALLOWED_ARCHIVE_TYPES: ['application/zip', 'application/x-rar-compressed'],
};

// API Response messages
export const MESSAGES = {
  // Success messages
  SUCCESS: {
    REGISTER: 'Registo realizado com sucesso!',
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
    PROBLEM_CREATED: 'Desafio criado com sucesso!',
    PROBLEM_UPDATED: 'Desafio atualizado com sucesso!',
    PROBLEM_DELETED: 'Desafio eliminado com sucesso!',
    SOLUTION_SUBMITTED: 'Solução submetida com sucesso!',
    SOLUTION_UPDATED: 'Solução atualizada com sucesso!',
    SOLUTION_DELETED: 'Solução eliminada com sucesso!',
    FILE_UPLOADED: 'Ficheiro carregado com sucesso!',
    NOTIFICATION_READ: 'Notificação marcada como lida!',
  },

  // Error messages
  ERROR: {
    UNAUTHORIZED: 'Acesso não autorizado.',
    FORBIDDEN: 'Acesso proibido.',
    NOT_FOUND: 'Recurso não encontrado.',
    VALIDATION_ERROR: 'Erro de validação.',
    SERVER_ERROR: 'Erro interno do servidor.',
    INVALID_CREDENTIALS: 'Credenciais inválidas.',
    USER_EXISTS: 'Este email já está registado.',
    EMAIL_NOT_VERIFIED: 'Email não verificado.',
    ACCOUNT_DISABLED: 'A sua conta foi desativada.',
    INVALID_TOKEN: 'Token inválido ou expirado.',
    FILE_TOO_LARGE: 'Ficheiro demasiado grande.',
    INVALID_FILE_TYPE: 'Tipo de ficheiro não suportado.',
    RATE_LIMIT_EXCEEDED: 'Muitas requisições. Tente novamente mais tarde.',
  },

  // Validation messages
  VALIDATION: {
    REQUIRED: 'Este campo é obrigatório.',
    EMAIL: 'Por favor, introduza um email válido.',
    PASSWORD_LENGTH: 'A palavra-passe deve ter pelo menos 6 caracteres.',
    PASSWORD_MATCH: 'As palavras-passe não coincidem.',
    MIN_LENGTH: 'Deve ter pelo menos {min} caracteres.',
    MAX_LENGTH: 'Não pode exceder {max} caracteres.',
    INVALID_TYPE: 'Tipo inválido.',
    INVALID_FORMAT: 'Formato inválido.',
  },
};

// API Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Default values
export const DEFAULTS = {
  USER: {
    AVATAR: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff',
    LEVEL: 'Iniciante',
  },
  PROBLEM: {
    DIFFICULTY: 'INTERMEDIATE',
    STATUS: 'DRAFT',
  },
  SOLUTION: {
    STATUS: 'PENDING_REVIEW',
  },
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
};

// Feature flags
export const FEATURES = {
  EMAIL_VERIFICATION: true,
  FILE_UPLOAD: true,
  REAL_TIME_NOTIFICATIONS: true,
  GAMIFICATION: true,
  SOCIAL_SHARING: false,
  TWO_FACTOR_AUTH: false,
  PREMIUM_FEATURES: false,
};