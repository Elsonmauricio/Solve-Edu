import jwt from 'jsonwebtoken';

export const authenticate = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Acesso não autorizado.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token has expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado.' 
        });
      }

      // Check role authorization
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso proibido.' 
        });
      }

      // Attach user info to request
      req.userId = decoded.userId;
      req.userRole = decoded.role;

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido.' 
        });
      }
      
      console.error('Auth middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro no servidor.' 
      });
    }
  };
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.exp > Date.now() / 1000) {
        req.userId = decoded.userId;
        req.userRole = decoded.role;
      }
    }

    next();
  } catch (error) {
    // Token is optional, so we just continue without auth
    next();
  }
};