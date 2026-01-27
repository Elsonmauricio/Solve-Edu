import prisma from '../lib/prisma.js';

export class SchoolController {
  /**
   * Obtém estatísticas para o dashboard da escola.
   */
  static async getSchoolDashboard(req, res) {
    try {
      const schoolProfileId = req.schoolId;

      const [totalStudents, totalSolutions, acceptedSolutions] = await Promise.all([
        prisma.studentProfile.count({
          where: { schoolProfileId },
        }),
        prisma.solution.count({
          where: { student: { schoolProfileId } },
        }),
        prisma.solution.count({
          where: {
            student: { schoolProfileId },
            status: 'ACCEPTED',
          },
        }),
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

      const students = await prisma.user.findMany({
        where: {
          studentProfile: {
            schoolProfileId,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          level: true,
          studentProfile: {
            select: { course: true, year: true },
          },
        },
      });

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