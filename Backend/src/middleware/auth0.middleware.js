import { auth } from 'express-oauth2-jwt-bearer';
import { supabase } from '../lib/supabase.js';

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
  
  // Tentar obter dados do payload do token
  let email = req.auth.payload.email;
  let name = req.auth.payload.name;
  let picture = req.auth.payload.picture;
  let email_verified = req.auth.payload.email_verified;

  // Se o email não estiver no token (comum em Access Tokens), tentar buscar do endpoint /userinfo
  if (!email) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      if (accessToken) {
        const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const userInfo = await response.json();
          email = userInfo.email;
          name = userInfo.name || name;
          picture = userInfo.picture || picture;
          email_verified = userInfo.email_verified;
        }
      }
    } catch (error) {
      console.warn('Warning: Could not fetch userinfo from Auth0:', error.message);
    }
  }

  try {
    // 1. Tentar encontrar o utilizador pelo auth0Id
    let { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('auth0Id', auth0Id)
      .maybeSingle(); // Usa maybeSingle para evitar erro PGRST116 se não existir


    // Se o utilizador não existir na base de dados, cria-o.
    if (!user) {
      // Tenta encontrar pelo email para evitar duplicados (Link Account)
      let existingUser = null;
      if (email) {
        const { data } = await supabase
          .from('User')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        existingUser = data;
      }

      if (existingUser) {
        // Se o email já existe, atualizamos o auth0Id para vincular a conta
        const { data: updatedUser } = await supabase
          .from('User')
          .update({ auth0Id })
          .eq('id', existingUser.id)
          .select('*')
          .single();
        
        user = updatedUser;
      } else {
        // Se não existe nem por ID nem por Email, cria um novo
        const role = req.auth.payload['https://solveedu.com/roles']?.[0] || 'STUDENT';
        console.log(`[Auth0] Creating new user: ${email || 'unknown'} with role: ${role}`);

        // Garante um nome mesmo sem email
        const displayName = name || req.auth.payload.nickname || (email ? email.split('@')[0] : 'Novo Utilizador');

        // Criar utilizador base
        const { data: newUser, error: createError } = await supabase
          .from('User')
          .insert({
            auth0Id,
            email: email || `missing-email-${auth0Id}@placeholder.solveedu.com`, // Fallback para evitar erro de constraint
            name: displayName,
            avatar: picture,
            role: role.toUpperCase(),
            isVerified: email_verified || false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        user = newUser;

        // Criar perfil específico
        if (role.toUpperCase() === 'STUDENT') {
           const { data: profile } = await supabase.from('StudentProfile').insert({ userId: user.id }).select().single();
           user.studentProfile = profile;
        } else if (role.toUpperCase() === 'COMPANY') {
           const { data: profile } = await supabase.from('CompanyProfile').insert({ userId: user.id }).select().single();
           user.companyProfile = profile;
        }
      }
    }

    if (!user) {
      throw new Error('Falha crítica: Utilizador não encontrado nem criado.');
    }

    // Buscar perfis separadamente para evitar erros de relação
    let sProfile = null;
    let cProfile = null;

    if (user.role === 'STUDENT') {
      const { data } = await supabase.from('StudentProfile').select('*').eq('userId', user.id).maybeSingle();
      sProfile = data;
      user.studentProfile = sProfile;
    } else if (user.role === 'COMPANY') {
      const { data } = await supabase.from('CompanyProfile').select('*').eq('userId', user.id).maybeSingle();
      cProfile = data;
      user.companyProfile = cProfile;
    }

    // Anexa a informação do utilizador da TUA base de dados ao objeto `req`.
    req.userId = user.id;
    req.userName = user.name; // Adicionado para estar disponível nos controllers
    req.userRole = user.role;
    
    if (user.role === 'STUDENT' && sProfile) {
      req.studentId = sProfile.id;
    }
    if (user.role === 'COMPANY' && cProfile) {
      req.companyId = cProfile.id;
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