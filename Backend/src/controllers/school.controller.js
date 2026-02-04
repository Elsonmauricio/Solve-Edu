import { supabase } from '../lib/supabase.js';

export class SchoolController {
  /**
   * Obtém estatísticas para o dashboard da escola.
   */
  static async getSchoolDashboard(req, res) {
    try {
      const schoolProfileId = req.schoolId;

      const [totalStudents, totalSolutions, acceptedSolutions] = await Promise.all([
        supabase.from('StudentProfile').select('*', { count: 'exact', head: true }).eq('schoolProfileId', schoolProfileId).then(r => r.count),
        // Join implícito para filtrar soluções de estudantes desta escola
        supabase.from('Solution').select('student!inner(schoolProfileId)', { count: 'exact', head: true }).eq('student.schoolProfileId', schoolProfileId).then(r => r.count),
        supabase.from('Solution').select('student!inner(schoolProfileId)', { count: 'exact', head: true })
          .eq('student.schoolProfileId', schoolProfileId)
          .eq('status', 'ACCEPTED')
          .then(r => r.count),
      ]);

      res.json({
        success: true,
        data: {
          totalStudents,
          totalSolutions,
          acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
        },
      });
    } catch (error) {
      console.error('Get school dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas da escola.',
      });
    }
  }

  /**
   * Lista os alunos associados a uma escola.
   */
  static async getSchoolStudents(req, res) {
    try {
      const schoolProfileId = req.schoolId;

      const { data: students } = await supabase
        .from('User')
        .select('id, name, email, avatar, level, studentProfile:StudentProfile!inner(course, year)')
        .eq('studentProfile.schoolProfileId', schoolProfileId);

      res.json({ success: true, data: students });
    } catch (error) {
      console.error('Get school students error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar alunos da escola.',
      });
    }
  }
}