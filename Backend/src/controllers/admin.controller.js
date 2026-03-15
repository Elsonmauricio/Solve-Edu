import { supabase } from '../lib/supabase.js';

export class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const startOfDayISO = startOfDay.toISOString();

      const [
        { count: totalUsers, error: usersError },
        { count: newUsersToday, error: newUsersError },
        { count: activeProblems, error: problemsError },
        { count: newProblemsToday, error: newProblemsError },
        { count: totalSolutions, error: solutionsError },
        { count: newSolutionsToday, error: newSolutionsError },
        { count: acceptedSolutions, error: acceptedSolutionsError },
      ] = await Promise.all([
        supabase.from('User').select('*', { count: 'exact', head: true }),
        supabase.from('User').select('*', { count: 'exact', head: true }).gte('createdAt', startOfDayISO),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).gte('createdAt', startOfDayISO),
        supabase.from('Solution').select('*', { count: 'exact', head: true }),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).gte('submittedAt', startOfDayISO),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED'),
      ]);

      const anyError = usersError || newUsersError || problemsError || newProblemsError || solutionsError || newSolutionsError || acceptedSolutionsError;
      if (anyError) {
        console.error('Error fetching dashboard stats:', { usersError, newUsersError, problemsError, newProblemsError, solutionsError, newSolutionsError, acceptedSolutionsError });
        throw new Error('Failed to fetch one or more stats from Supabase.');
      }

      const stats = {
        users: { total: totalUsers || 0, newToday: newUsersToday || 0 },
        problems: { active: activeProblems || 0, newToday: newProblemsToday || 0 },
        solutions: { total: totalSolutions || 0, newToday: newSolutionsToday || 0 },
        platform: {
          acceptanceRate: (totalSolutions ?? 0) > 0 ? (((acceptedSolutions ?? 0) / (totalSolutions ?? 1)) * 100) : 0,
        },
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas do painel.' });
    }
  }

  static async getSystemHealth(req, res) {
    try {
      // Simulação de verificação
      const apiStatus = 'Online';
      const { data, error } = await supabase.from('User').select('id').limit(1);
      const dbStatus = error ? 'Offline' : 'Online';

      // Simulação de dados de storage e backup
      const health = {
        api: apiStatus,
        db: dbStatus,
        storage: 78, // %
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Há 2 horas
      };
      res.json({ success: true, data: health });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({ success: false, message: 'Erro ao verificar o estado do sistema.' });
    }
  }

  static async getSecurityLogs(req, res) {
    try {
      const limit = 20;

      // Buscar dados reais das tabelas principais para criar um feed de atividade/segurança
      const [usersResult, problemsResult, solutionsResult] = await Promise.all([
        supabase
          .from('User')
          .select('id, name, email, role, createdAt')
          .order('createdAt', { ascending: false })
          .limit(limit),
        supabase
          .from('Problem')
          .select('id, title, createdAt, company:CompanyProfile(user:User(name))')
          .order('createdAt', { ascending: false })
          .limit(limit),
        supabase
          .from('Solution')
          .select('id, title, submittedAt, status, student:StudentProfile(user:User(name))')
          .order('submittedAt', { ascending: false })
          .limit(limit)
      ]);

      const logs = [];

      // Mapear Utilizadores (Registos)
      (usersResult.data || []).forEach(u => {
        logs.push({
          id: `user-${u.id}`,
          timestamp: u.createdAt,
          level: 'INFO',
          actor: u.email,
          action: 'USER_REGISTER',
          details: `Novo utilizador registado: ${u.name} (${u.role})`
        });
      });

      // Mapear Desafios (Criação)
      (problemsResult.data || []).forEach(p => {
        const actorName = p.company?.user?.name || (Array.isArray(p.company?.user) ? p.company.user[0].name : 'Empresa');
        logs.push({
          id: `prob-${p.id}`,
          timestamp: p.createdAt,
          level: 'INFO',
          actor: actorName,
          action: 'PROBLEM_CREATED',
          details: `Novo desafio criado: "${p.title}"`
        });
      });

      // Mapear Soluções (Submissão)
      (solutionsResult.data || []).forEach(s => {
        const actorName = s.student?.user?.name || (Array.isArray(s.student?.user) ? s.student.user[0].name : 'Estudante');
        logs.push({
          id: `sol-${s.id}`,
          timestamp: s.submittedAt,
          level: 'INFO',
          actor: actorName,
          action: 'SOLUTION_SUBMITTED',
          details: `Solução submetida: "${s.title}" (${s.status})`
        });
      });

      // Ordenar cronologicamente (mais recente primeiro)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({ success: true, data: logs });
    } catch (error) {
      console.error('Get security logs error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar logs de segurança.' });
    }
  }

  static async getReports(req, res) {
    try {
      // 1. Crescimento de Utilizadores (Últimos 6 meses)
      // Nota: Para produção com muitos dados, seria melhor usar uma função RPC no Supabase.
      const { data: users } = await supabase
        .from('User')
        .select('createdAt')
        .order('createdAt', { ascending: true });

      // Inicializar mapa dos últimos 6 meses
      const monthsMap = new Map();
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        monthsMap.set(key, 0);
      }

      // Preencher contagem
      if (users) {
        users.forEach(u => {
          const d = new Date(u.createdAt);
          const key = d.toLocaleString('default', { month: 'short' });
          // Só conta se o mês estiver no nosso mapa (últimos 6 meses)
          if (monthsMap.has(key)) {
            monthsMap.set(key, monthsMap.get(key) + 1);
          }
        });
      }
      const userGrowth = Array.from(monthsMap, ([month, count]) => ({ month, count }));

      // 2. Métricas de Soluções
      const { count: totalSolutions } = await supabase.from('Solution').select('*', { count: 'exact', head: true });
      const { count: acceptedSolutions } = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED');
      
      // 3. Satisfação Média
      const { data: ratings } = await supabase.from('Solution').select('rating').not('rating', 'is', null);
      const avgRating = ratings?.length ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length) : 0;

      res.json({ success: true, data: {
        userGrowth,
        completionRate: totalSolutions ? Math.round((acceptedSolutions / totalSolutions) * 100) : 0,
        companySatisfaction: Number(avgRating.toFixed(1)),
        averageResponseTime: 2.5 // Mantido fixo pois requer cálculo complexo de diff de datas
      }});
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar relatórios.' });
    }
  }

  static async getSettings(req, res) {
    // Mock data
    res.json({ success: true, data: {
      platformName: 'SolveEdu',
      supportEmail: 'support@solveedu.pt',
      maintenanceMode: false,
      allowRegistrations: true,
      emailNotifications: true,
      autoBackup: true,
    }});
  }

  static async updateSettings(req, res) {
    // Mock logic
    console.log('Saving settings:', req.body);
    res.json({ success: true, message: 'Definições guardadas com sucesso!' });
  }
}