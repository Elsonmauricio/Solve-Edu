import { supabase } from '../lib/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';

export class SchoolController {
  /**
   * Obtém as métricas agregadas para a dashboard da instituição.
   * GET /api/school/dashboard
   */
  static getSchoolDashboard = asyncHandler(async (req, res) => {
    const schoolId = req.schoolId; // Definido pelo middleware syncUser

    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identificador da instituição não encontrado no perfil.' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Obter total de alunos e novos alunos hoje
    const { data: studentData, error: studentError } = await supabase
      .from('StudentProfile')
      .select('id, created_at')
      .eq('schoolProfileId', schoolId);

    if (studentError) {
      console.error('[SchoolDashboard] Student lookup error:', studentError);
      throw studentError;
    }

    const totalStudents = studentData.length;
    const newStudentsToday = studentData.filter(s => new Date(s.created_at) >= today).length;

    // 2. Obter todas as soluções de alunos desta escola para calcular projetos e notas
    // Fazemos um inner join com StudentProfile para garantir a pertença à escola
    const { data: solutions, error: solutionsError } = await supabase
      .from('Solution')
      .select('status, schoolGrade, isPAP, studentProfile:StudentProfile!inner(id)')
      .eq('studentProfile.schoolProfileId', schoolId);

    if (solutionsError) {
      console.error('[SchoolDashboard] Solutions lookup error:', solutionsError);
      throw solutionsError;
    }

    // Cálculos de Métricas
    const totalSolutions = solutions.length;
    const acceptedSolutions = solutions.filter(s => s.status === 'ACCEPTED').length;
    
    // Média de Notas: Convertemos o campo TEXT 'schoolGrade' para número
    const grades = solutions
      .map(s => parseFloat(s.schoolGrade))
      .filter(g => !isNaN(g));
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((acc, curr) => acc + curr, 0) / grades.length 
      : 0;

    const acceptanceRate = totalSolutions > 0 
      ? (acceptedSolutions / totalSolutions) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        newStudentsToday,
        totalSolutions, // Mapeado no frontend como "PAPs em Curso"
        acceptedSolutions, // Mapeado no frontend como "Projetos Concluídos"
        averageGrade,
        acceptanceRate
      }
    });
  });

  /**
   * Lista os alunos vinculados à escola com dados normalizados.
   * GET /api/school/students
   */
  static getSchoolStudents = asyncHandler(async (req, res) => {
    const schoolId = req.schoolId;

    const { data, error } = await supabase
      .from('User')
      .select(`
        id, name, email, avatar, level,
        studentProfile:StudentProfile!inner(school, course, year, location)
      `)
      .eq('studentProfile.schoolProfileId', schoolId)
      .order('name');

    if (error) throw error;

    // Normalização para o frontend (achatar o array do join)
    const students = data.map(user => {
      const profile = Array.isArray(user.studentProfile) ? user.studentProfile[0] : user.studentProfile;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        course: profile?.course,
        year: profile?.year
      };
    });

    res.json({ success: true, data: students });
  });

  /**
   * "Regista" (associa ou cria) um aluno à instituição.
   * POST /api/school/students
   */
  static registerStudent = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const schoolId = req.schoolId;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nome e email são obrigatórios.' });
    }

    // 1. Verificar se o utilizador já existe na plataforma
    const { data: existingUser } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      // Se já existe, apenas garantimos que o StudentProfile está ligado a esta escola
      const { error: updateError } = await supabase
        .from('StudentProfile')
        .update({ schoolProfileId: schoolId })
        .eq('userId', existingUser.id);
      
      if (updateError) throw updateError;
      
      return res.json({ 
        success: true, 
        message: 'Utilizador já registado na plataforma. Foi agora associado à sua instituição.' 
      });
    }

    // 2. Se não existe, criamos um registo placeholder
    // O aluno completará o acesso quando fizer login via Auth0 com este email
    const { data: newUser, error: userError } = await supabase
      .from('User')
      .insert({ email, name, role: 'STUDENT', level: 'Iniciante' })
      .select().single();

    if (userError) throw userError;

    // 3. Criar o perfil de estudante vinculado à escola
    const { error: profileError } = await supabase
      .from('StudentProfile')
      .insert({ userId: newUser.id, schoolProfileId: schoolId, school: req.user?.schoolProfile?.schoolName || 'Escola' });

    if (profileError) throw profileError;

    res.status(201).json({ 
      success: true, 
      message: 'Aluno pré-registado com sucesso! Instrua o aluno a entrar com este email.' 
    });
  });
}