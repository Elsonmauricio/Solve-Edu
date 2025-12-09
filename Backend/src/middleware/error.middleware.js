export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
  }

  // Database errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Já existe um registo com estes dados',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registo não encontrado',
    });
  }

  // Custom error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};