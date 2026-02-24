// src/middleware/role.middleware.js
export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};
