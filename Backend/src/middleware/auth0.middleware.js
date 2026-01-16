import { auth } from 'express-oauth2-jwt-bearer';
import prisma from '../lib/prisma.js';

/**
 * Middleware 1: Validar o Access Token do Auth0.
 * Verifica a assinatura, expiração, issuer e audience do token.
 * Se o token for inválido, ele rejeita a requisição com um erro 401.
 */
export const validateAccessToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
});

/**
 * Middleware 2: Sincronizar o utilizador do Auth0 com a base de dados local.
 * Este middleware corre *depois* do validateAccessToken.
 * Ele usa o 'sub' (subject) do token para encontrar ou criar um utilizador na tua tabela `User`.
 * Este processo é conhecido como "Just-In-Time (JIT) Provisioning".
 */
export const syncUser = async (req, res, next) => {
  const auth0Id = req.auth.payload.sub;

  try {
    let user = await prisma.user.findUnique({
      where: { auth0Id },
      include: { studentProfile: true, companyProfile: true }
    });

    // Se o utilizador não existir na base de dados, cria-o.
    if (!user) {
      // O papel (role) pode ser extraído de custom claims no token do Auth0.
      // Isto requer a criação de uma "Action" ou "Rule" no painel do Auth0.
      const role = req.auth.payload['https://solveedu.com/roles']?.[0] || 'STUDENT';

      user = await prisma.user.create({
        data: {
          auth0Id,
          email: req.auth.payload.email,
          name: req.auth.payload.name || req.auth.payload.nickname,
          avatar: req.auth.payload.picture,
          role: role.toUpperCase(),
          isVerified: req.auth.payload.email_verified || false,
          // Cria automaticamente o perfil correspondente
          ...(role.toUpperCase() === 'STUDENT' && { studentProfile: { create: {} } }),
          ...(role.toUpperCase() === 'COMPANY' && { companyProfile: { create: {} } }),
        },
        include: { studentProfile: true, companyProfile: true }
      });
    }

    // Anexa a informação do utilizador da TUA base de dados ao objeto `req`.
    req.userId = user.id;
    req.userRole = user.role;
    if (user.role === 'STUDENT' && user.studentProfile) {
      req.studentId = user.studentProfile.id;
    }
    if (user.role === 'COMPANY' && user.companyProfile) {
      req.companyId = user.companyProfile.id;
    }

    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Error processing user information.' });
  }
};

/**
 * Middleware 3: Verificar se o utilizador sincronizado tem o papel (role) necessário.
 */
const checkRole = (requiredRoles) => (req, res, next) => {
  if (!req.userRole || !requiredRoles.includes(req.userRole)) {
    return res.status(403).json({ message: `Access Denied: Requires one of these roles: ${requiredRoles.join(', ')}` });
  }
  next();
};

/**
 * Função de autenticação principal que combina os middlewares.
 * É um substituto direto para o teu `authenticate` antigo.
 */
export const authenticate = (roles) => 
  roles ? [validateAccessToken, syncUser, checkRole(roles)] : [validateAccessToken, syncUser];

/**
 * Middleware para autenticação opcional (para rotas públicas que podem ter dados extra se o utilizador estiver logado).
 */
export const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next(); // Sem token, continua como anónimo
  // Se houver token, tenta validar e sincronizar, mas não falha se o token for inválido.
  validateAccessToken(req, res, (err) => {
    if (err) return next(); // Token inválido, continua como anónimo
    syncUser(req, res, next); // Token válido, sincroniza o utilizador
  });
};