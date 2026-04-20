import { supabase } from '../lib/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';

export class StudentController {
  /**
   * Obtém o ranking dos top estudantes baseados em soluções aceites e rating.
   * GET /api/student/ranking
   */
  static getRanking = asyncHandler(async (req, res) => {
    // 1. Buscar estudantes e as suas soluções aceites
    const { data, error } = await supabase
      .from('StudentProfile')
      .select(`
        id,
        school,
        year,
        user:User(id, name, avatar),
        solutions:Solution(rating, status)
      `)
      .eq('Solution.status', 'ACCEPTED');

    if (error) throw error;

    // 2. Processar agregação (contagem e média)
    const ranking = (data || []).map(student => {
      const acceptedSolutions = student.solutions || [];
      const totalRating = acceptedSolutions.reduce((sum, sol) => sum + (Number(sol.rating) || 0), 0);
      
      return {
        id: student.user?.id || student.id,
        name: student.user?.name || "Estudante",
        avatar: student.user?.avatar,
        school: student.school || "Instituição não definida",
        level: `Nível ${student.year || 1}`,
        solutionsCount: acceptedSolutions.length,
        rating: acceptedSolutions.length > 0 ? totalRating / acceptedSolutions.length : 0
      };
    })
    .sort((a, b) => b.solutionsCount - a.solutionsCount || b.rating - a.rating)
    .slice(0, 5);

    res.json({ success: true, data: ranking });
  });
}

export default StudentController;