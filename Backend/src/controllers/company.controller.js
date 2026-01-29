import prisma from '../lib/prisma.js';

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
        prisma.problem.count({
          where: { 
            companyId,
            status: 'ACTIVE'
          }
        }),
        // Total de Soluções Recebidas em todos os problemas da empresa
        prisma.solution.count({
          where: {
            problem: {
              companyId
            }
          }
        }),
        // Soluções pendentes de revisão
        prisma.solution.count({
          where: {
            problem: {
              companyId
            },
            status: 'PENDING_REVIEW'
          }
        })
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