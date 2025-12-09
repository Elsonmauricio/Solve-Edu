import { body, param, query } from 'express-validator';

export const problemValidators = {
  create: [
    body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
    body('description').notEmpty().trim().isLength({ min: 50, max: 5000 }),
    body('category').isIn(['TECHNOLOGY', 'SUSTAINABILITY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'DESIGN', 'SCIENCE', 'ENGINEERING']),
    body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    body('deadline').isISO8601(),
    body('tags').isArray(),
    body('requirements').isArray(),
    body('reward').optional().isString(),
    body('rewardType').optional().isIn(['MONEY', 'INTERNSHIP', 'PRIZE', 'CERTIFICATE', 'JOB_OFFER']),
  ],
  
  update: [
    param('id').notEmpty(),
    body('title').optional().trim().isLength({ min: 5, max: 200 }),
    body('description').optional().trim().isLength({ min: 50, max: 5000 }),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ARCHIVED']),
  ],
};

export const solutionValidators = {
  create: [
    body('problemId').notEmpty(),
    body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
    body('description').notEmpty().trim().isLength({ min: 50, max: 5000 }),
    body('technologies').isArray(),
    body('githubUrl').optional().isURL(),
    body('demoUrl').optional().isURL(),
    body('documentation').optional().isString(),
  ],
  
  update: [
    param('id').notEmpty(),
    body('status').optional().isIn(['DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'NEEDS_REVISION', 'AWARDED']),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('feedback').optional().isString(),
  ],
};

export const userValidators = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
    body('role').isIn(['student', 'company']),
  ],
  
  update: [
    body('name').optional().trim(),
    body('avatar').optional().isURL(),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('phone').optional().isMobilePhone(),
  ],
};

export const queryValidators = {
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sortBy').optional().isString(),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  
  filter: [
    query('category').optional().isString(),
    query('difficulty').optional().isString(),
    query('status').optional().isString(),
    query('search').optional().isString(),
  ],
};