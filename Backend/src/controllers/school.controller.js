import { supabase } from '../lib/supabase.js';

export class SchoolController {
  /**
   * Regista um novo aluno associado à escola.
   * POST /api/school/students
   */
  static async registerStudent(req, res) {
    try {
      const schoolName = req.user.schoolProfile?.schoolName;
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Nome e Email são obrigatórios.' });
      }

      if (!schoolName) {
        return res.status(400).json({ success: false, message: 'Perfil de escola incompleto. Atualize o nome da escola primeiro.' });
      }

      // 1. Verificar se o utilizador já existe
      const { data: existingUser } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        // Se já existe e é estudante, associamos à escola
        if (existingUser.role === 'STUDENT') {
           await supabase
            .from('StudentProfile')
            .update({ school: schoolName })
            .eq('userId', existingUser.id);
            
           return res.json({ success: true, message: 'Aluno existente associado à sua escola com sucesso.' });
        } else {
           return res.status(400).json({ success: false, message: `Este email já está registado como ${existingUser.role}.` });
        }
      }

      // 2. Criar novo utilizador (Pré-registo)
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert({
          email,
          name,
          role: 'STUDENT',
          isVerified: false,
          auth0Id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Criar Perfil de Estudante vinculado à Escola
      const { error: profileError } = await supabase
        .from('StudentProfile')
        .insert({
          userId: newUser.id,
          school: schoolName
        });

      if (profileError) throw profileError;

      res.json({ 
        success: true, 
        message: 'Aluno registado! Quando ele entrar na plataforma com este email, a conta será ativada automaticamente.' 
      });

    } catch (error) {
      console.error('Register student error:', error);
      res.status(500).json({ success: false, message: 'Erro ao registar aluno.' });
    }
  }

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