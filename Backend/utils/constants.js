const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const errorMessages = {
  ALL_FIELDS_REQUIRED: 'Todos os campos são obrigatórios',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  EMAIL_IN_USE: 'Já existe uma conta com este email',
  PASSWORD_TOO_SHORT: 'A palavra-passe deve ter pelo menos 6 caracteres',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  UNAUTHORIZED: 'Acesso não autorizado',
  INVALID_TOKEN: 'Token inválido',
  NOT_FOUND: 'Não encontrado',
  INVALID_DATA: 'Dados inválidos',
};

const successMessages = {
  ACCOUNT_CREATED: 'Conta criada com sucesso!',
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  PASSWORD_CHANGED: 'Palavra-passe alterada com sucesso',
  ITEM_DELETED: 'Item eliminado com sucesso',
};

module.exports = {
  httpStatus,
  errorMessages,
  successMessages,
};