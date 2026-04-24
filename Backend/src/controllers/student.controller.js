import { supabase } from '../lib/supabase.js';

export class StudentController {
  /**
   * Lista todos os estudantes com os seus perfis detalhados
   */
  static async getAllStudents(req, res) {
    try {
      const { search, skill, location, ranking } = req.query;

      // Se houver filtros na tabela StudentProfile, precisamos de usar !inner para que o PostgREST filtre corretamente
      // Nota: O nome da relação deve coincidir exatamente com a tabela
      const profileRelation = (location || skill) ? 'StudentProfile!inner' : 'StudentProfile';

      let query = supabase
        .from('User')
        .select(`
          id,
          name,
          avatar,
          level,
          studentProfile:StudentProfile (
            school,
            course,
            year,
            bio,
            skills,
            location,
            rating,
            solutionsCount,
            Solution(rating, status)
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
        query = query.contains('StudentProfile.skills', [skill]);
      }

      // Lógica de Ordenação: Ranking (por soluções) ou Alfabética
      if (ranking === 'true') {
        query = query.order('solutionsCount', { foreignTable: 'StudentProfile', ascending: false });
      } else {
        query = query.order('name');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Normalização dos dados para o Frontend
      const students = data.map(user => {
        // Garantir que extraímos o perfil corretamente (lidando com array ou objeto)
        const profile = Array.isArray(user.studentProfile) ? user.studentProfile[0] : (user.studentProfile || user.StudentProfile);
        
        const solutions = profile?.Solution || [];
        const realSolutionsCount = solutions.length;
        const ratedSolutions = solutions.filter(s => s.status === 'ACCEPTED' && s.rating != null && s.rating > 0);
        const avgRating = ratedSolutions.length 
          ? (ratedSolutions.reduce((acc, curr) => acc + curr.rating, 0) / ratedSolutions.length).toFixed(1)
          : "0.0";
        
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          role: 'Estudante',
          level: user.level || 'Iniciante',
          school: profile?.school || 'Ensino Profissional',
          course: profile?.course || 'Programação de Informática',
          year: profile?.year || 'N/A',
          skills: profile?.skills || [],
          rating: avgRating,
          solutionsCount: profile?.solutionsCount || realSolutionsCount,
          location: profile?.location || 'Localização não definida'
        };
      });

      res.json({ success: true, data: students });
    } catch (error) {
      console.error('[StudentController] Error:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar lista de talentos.' });
    }
  }

  /**
   * Atalho para obter o ranking de estudantes
   */
  static async getRanking(req, res) {
    req.query.ranking = 'true';
    return StudentController.getAllStudents(req, res);
  }

  /**
   * Obtém os detalhes completos de um estudante pelo ID, incluindo as suas soluções.
   * GET /api/students/:id
   */
  static async getStudentById(req, res) {
    try {
      const { id } = req.params;

      const { data: user, error } = await supabase
        .from('User')
        .select(`
          id,
          name,
          avatar,
          level,
          email,
          studentProfile:StudentProfile (
            school,
            course,
            year,
            bio,
            skills,
            location,
            rating,
            solutionsCount,
            Solution (
              id,
              title,
              rating,
              description,
              status,
              submittedAt,
              technologies,
              problem:Problem(title)
            )
          )
        `)
        .eq('id', id)
        .eq('role', 'STUDENT')
        .single();

      if (error) {
        console.error('[StudentController] Database Error:', error.message);
        return res.status(404).json({ success: false, message: 'Estudante não encontrado.' });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Estudante não encontrado.' });
      }

      // Normalização dos dados para o Frontend
      // O uso de alias no select ('studentProfile:StudentProfile') ajuda a manter a consistência
      const rawProfile = user.studentProfile || user.StudentProfile;
      const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

      // Extração das soluções (que estão dentro do perfil no select atual)
      const rawSolutions = profile?.Solution || profile?.solutions || user.Solution || [];
      
      const ratedSolutions = (Array.isArray(rawSolutions) ? rawSolutions : []).filter(s => s.status === 'ACCEPTED' && s.rating != null && s.rating > 0);
      const avgRating = ratedSolutions.length 
        ? (ratedSolutions.reduce((acc, curr) => acc + curr.rating, 0) / ratedSolutions.length).toFixed(1)
        : "0.0";

      const student = {
        id: user.id,
        name: user.name,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        level: user.level || 'Iniciante',
        school: profile?.school || 'Ensino Profissional',
        course: profile?.course || 'Programação de Informática',
        year: profile?.year || 'N/A',
        bio: profile?.bio || 'Este talento ainda não adicionou uma biografia.',
        skills: profile?.skills || [],
        location: profile?.location || 'Localização não definida',
        rating: avgRating,
        solutionsCount: profile?.solutionsCount || rawSolutions.length || 0,
        solutions: (Array.isArray(rawSolutions) ? rawSolutions : []).map((sol) => ({
          ...sol,
          problemTitle: sol.problem?.title || 'Desafio Desconhecido'
        }))
      };

      res.json({ success: true, data: student });
    } catch (error) {
      console.error('[StudentController] Error fetching student profile:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar perfil do talento.' });
    }
  }
}