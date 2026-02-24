import { supabase } from '../lib/supabase.js';

// Cache para evitar queries à base de dados em todas as requisições
const maintenanceCache = {
  isEnabled: false,
  lastChecked: 0,
  cacheDuration: 30000, // 30 segundos
};

export const checkMaintenanceMode = async (req, res, next) => {
  const now = Date.now();

  // Atualiza o cache se estiver expirado
  if (now - maintenanceCache.lastChecked > maintenanceCache.cacheDuration) {
    try {
      const { data, error } = await supabase
        .from('PlatformSettings')
        .select('maintenanceMode')
        .eq('id', true)
        .single();

      if (error) throw error;

      maintenanceCache.isEnabled = data.maintenanceMode;
      maintenanceCache.lastChecked = now;
    } catch (e) {
      console.error("Falha ao verificar modo de manutenção, assumindo como desligado:", e.message);
      maintenanceCache.isEnabled = false; // Medida de segurança
    }
  }

  // Se o modo de manutenção não estiver ativo, permite a passagem de todos.
  if (!maintenanceCache.isEnabled) {
    return next();
  }

  // Se estiver ativo, apenas administradores podem passar.
  // req.userRole é preenchido pelo middleware `optionalAuth`.
  if (req.userRole === 'ADMIN') {
    return next();
  }

  // Bloqueia todos os outros utilizadores.
  res.status(503).json({
    success: false,
    message: 'A plataforma está temporariamente em manutenção. Por favor, tente novamente mais tarde.',
    code: 'MAINTENANCE_MODE',
  });
};