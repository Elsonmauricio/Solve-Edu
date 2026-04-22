import { supabase } from '../lib/supabase.js';

export class StudentController {
  /**
   * Lista todos os estudantes com os seus perfis detalhados
   */
  static async getAllStudents(req, res) {
    try {
      const { search, skill, location } = req.query;

      let query = supabase
        .from('User')
        .select(`
          id,
          name,
          avatar,
          StudentProfile (
            school,
            bio,
            skills,
            location,
            rating,
            solutionsCount
          )
        `);

      // Filtro base: apenas estudantes
      query = query.eq('role', 'STUDENT');

      // Melhoria de Engenharia: Apenas mostrar estudantes que já preencheram competências
      // Isso garante que o recrutador não veja perfis "vazios".
      // Opcional: query = query.eq('StudentProfile.isPublic', true); 
      query = query.not('StudentProfile.skills', 'is', null);

      // Filtros Dinâmicos
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (location) {
        query = query.filter('StudentProfile.location', 'ilike', `%${location}%`);
      }

      if (skill && skill !== 'Todas as áreas') {
        // Assume que skills é um array no Postgres
        query = query.contains('StudentProfile->skills', [skill]);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      // Normalização dos dados para o Frontend
      const students = data.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        role: 'Estudante',
        school: user.StudentProfile?.school || 'Ensino Profissional',
        skills: user.StudentProfile?.skills || [],
        rating: user.StudentProfile?.rating || 0,
        solutionsCount: user.StudentProfile?.solutionsCount || 0,
        location: user.StudentProfile?.location || 'Localização não definida'
      }));

      res.json({ success: true, data: students });
    } catch (error) {
      console.error('[StudentController] Error:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar lista de talentos.' });
    }
  }
}