import { supabase } from '../lib/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';

export class SchoolController {
  /**
   * Regista um novo aluno associado à escola.
   * POST /api/school/students
   */
  static registerStudent = asyncHandler(async (req, res) => {
      const schoolName = req.user.schoolProfile?.schoolName;
      const schoolProfileId = req.schoolId; // Obtido do middleware
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
            .update({ school: schoolName, schoolProfileId: schoolProfileId })
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
          school: schoolName,
          schoolProfileId: schoolProfileId
        });

      if (profileError) throw profileError;

      res.json({ 
        success: true, 
        message: 'Aluno registado! Quando ele entrar na plataforma com este email, a conta será ativada automaticamente.' 
      });
  });

  /**
   * Obtém estatísticas para o dashboard da escola.
   */
  static getSchoolDashboard = asyncHandler(async (req, res) => {
      const schoolProfileId = req.schoolId;

      const [totalStudents, totalSolutions, acceptedSolutions] = await Promise.all([
        supabase.from('StudentProfile').select('*', { count: 'exact', head: true }).eq('schoolProfileId', schoolProfileId).then(r => r.count),
        supabase.from('Solution').select('id, student!inner(schoolProfileId)', { count: 'exact', head: true }).eq('student.schoolProfileId', schoolProfileId).then(r => r.count),
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
  }); // Removido o try/catch manual pois o asyncHandler já trata o erro

  /**
   * Lista os alunos associados a uma escola.
   */
  static getSchoolStudents = asyncHandler(async (req, res) => {
      const schoolProfileId = req.schoolId;

      const { data: students, error } = await supabase
        .from('User')
        .select('id, name, email, avatar, level, studentProfile:StudentProfile!inner(course, year)')
        .eq('studentProfile.schoolProfileId', schoolProfileId);

      if (error) throw error;

      res.json({ success: true, data: students });
  });

  /**
   * Lista as soluções dos alunos de uma escola.
   */
  static getSchoolSolutions = asyncHandler(async (req, res) => {
      const schoolProfileId = req.schoolId;

      const { data: solutions, error } = await supabase
        .from('Solution')
        .select('id, title, status, isPAP, submittedAt, student:StudentProfile!inner(id, user:User(id, name)), problem:Problem(id, title)')
        .eq('student.schoolProfileId', schoolProfileId)
        .order('submittedAt', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: solutions });
  });
}