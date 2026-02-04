import { supabase } from '../lib/supabase.js';

export class CompanyController {
  static async getDashboardStats(req, res) {
    try {
      const companyId = req.companyId;

      if (!companyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Perfil de empresa não encontrado.' 
        });
      }

      const [
        activeProblems,
        totalSolutionsReceived,
        pendingReviews
      ] = await Promise.all([
        // Problemas Ativos
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'ACTIVE').then(r => r.count || 0),
        
        // Total de Soluções Recebidas em todos os problemas da empresa
        // Supabase: Join para filtrar por companyId do problema
        supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).then(r => r.count || 0),

        // Soluções pendentes de revisão
        supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true })
          .eq('problem.companyId', companyId)
          .eq('status', 'PENDING_REVIEW')
          .then(r => r.count || 0)
      ]);

      res.json({
        success: true,
        data: {
          activeProblems,
          totalSolutionsReceived,
          pendingReviews
        }
      });

    } catch (error) {
      console.error('Get company dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas.' });
    }
  }
}