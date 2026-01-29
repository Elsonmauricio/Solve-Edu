import prisma from '../lib/prisma.js';

export class StudentController {
  static async getDashboardStats(req, res) {
    try {
      const studentId = req.studentId;

      if (!studentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Perfil de estudante não encontrado.' 
        });
      }

      // Executa todas as queries em paralelo para performance
      const [
        submittedCount,
        acceptedCount,
        ongoingCount,
        ratingStats
      ] = await Promise.all([
        // Total submetido
        prisma.solution.count({
          where: { studentId }
        }),
        // Total aceites
        prisma.solution.count({
          where: { 
            studentId,
            status: 'ACCEPTED'
          }
        }),
        // Em análise (Ongoing)
        prisma.solution.count({
          where: { 
            studentId,
            status: { in: ['PENDING_REVIEW', 'NEEDS_REVISION'] }
          }
        }),
        // Média de Rating
        prisma.solution.aggregate({
          _avg: { rating: true },
          where: { 
            studentId,
            rating: { not: null }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          submittedCount,
          acceptedCount,
          ongoingCount,
          averageRating: ratingStats._avg.rating ? parseFloat(ratingStats._avg.rating.toFixed(1)) : 0
        }
      });

    } catch (error) {
      console.error('Get student dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas.' });
    }
  }
}