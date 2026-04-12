export const errorHandler = (err, req, res, next) => {
  // Log colorido para facilitar o debug no terminal
  const errorColor = '\x1b[31m';
  const resetColor = '\x1b[0m';
  console.error(`${errorColor}[API Error] ${req.method} ${req.path}${resetColor}`, err.message);

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Erros de Autenticação do Auth0 (express-oauth2-jwt-bearer)
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado. Token em falta ou inválido.',
      code: 'UNAUTHORIZED'
    });
  }

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