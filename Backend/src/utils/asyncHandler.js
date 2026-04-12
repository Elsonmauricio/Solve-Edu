/**
 * Wrapper para capturar erros em funções assíncronas (middlewares/controllers Express)
 * e encaminhá-los automaticamente para o middleware de tratamento de erros global.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

export default asyncHandler;