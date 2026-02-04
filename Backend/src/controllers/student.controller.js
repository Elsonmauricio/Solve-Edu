import { supabase } from '../lib/supabase.js';

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
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).then(r => r.count),
        // Total aceites
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).eq('status', 'ACCEPTED').then(r => r.count),
        // Em análise (Ongoing)
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).in('status', ['PENDING_REVIEW', 'NEEDS_REVISION']).then(r => r.count),
        // Média de Rating
        supabase.from('Solution').select('rating').eq('studentId', studentId).not('rating', 'is', null)
      ]);

      // Calcular média manualmente
      let averageRating = 0;
      if (ratingStats.data && ratingStats.data.length > 0) {
        const sum = ratingStats.data.reduce((a, b) => a + (b.rating || 0), 0);
        averageRating = parseFloat((sum / ratingStats.data.length).toFixed(1));
      }

      res.json({
        success: true,
        data: {
          submittedCount,
          acceptedCount,
          ongoingCount,
          averageRating
        }
      });

    } catch (error) {
      console.error('Get student dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas.' });
    }
  }
}