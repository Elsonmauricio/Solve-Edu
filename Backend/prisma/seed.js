import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.schoolProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create admin user
  // const adminPassword = await bcrypt.hash('admin123', 10); // Senha não é necessária com Auth0
  const admin = await prisma.user.create({
    data: {
      email: 'admin@solveedu.pt',
      // password: adminPassword, // O login será via Auth0, o password local não é usado.
      name: 'Administrador',
      role: 'ADMIN',
      isVerified: true,
      level: 'Admin',
    },
  });

  // Create company users
  const companies = [
    {
      email: 'techretail@solveedu.pt',
      password: 'company123',
      name: 'TechRetail Lda',
      companyName: 'TechRetail Lda',
      industry: 'Tecnologia',
      description: 'Empresa líder em soluções de retail technology',
    },
    {
      email: 'ecosolutions@solveedu.pt',
      password: 'company123',
      name: 'EcoSolutions SA',
      companyName: 'EcoSolutions SA',
      industry: 'Sustentabilidade',
      description: 'Especialistas em soluções sustentáveis',
    },
  ];

  const createdCompanies = [];

  for (const companyData of companies) {
    // const hashedPassword = await bcrypt.hash(companyData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: companyData.email,
        // password: hashedPassword,
        name: companyData.name,
        role: 'COMPANY',
        isVerified: true,
        level: 'Parceiro',
      },
    });

    const companyProfile = await prisma.companyProfile.create({
      data: {
        userId: user.id,
        companyName: companyData.companyName,
        industry: companyData.industry,
        description: companyData.description,
        companySize: 'Média Empresa (51-200)',
        website: 'https://example.com',
      },
    });

    createdCompanies.push({ user, profile: companyProfile });
  }

  // Create school user
  const schoolUser = await prisma.user.create({
    data: {
      email: 'epfundao@solveedu.pt',
      name: 'Escola Profissional do Fundão',
      role: 'SCHOOL',
      isVerified: true,
      level: 'Parceiro Educacional',
    },
  });

  const schoolProfile = await prisma.schoolProfile.create({
    data: {
      userId: schoolUser.id,
      schoolName: 'Escola Profissional do Fundão',
      city: 'Fundão',
      country: 'Portugal',
    },
  });

  console.log('🏫 Created school user and profile');

  // Create student users
  const students = [
    {
      email: 'joao.silva@solveedu.pt',
      password: 'student123',
      name: 'João Silva',
      school: 'Universidade do Porto',
      course: 'Engenharia Informática',
      year: 3,
      schoolProfileId: null, // Not associated with a seeded school
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    },
    {
      email: 'maria.santos@solveedu.pt',
      password: 'student123',
      name: 'Maria Santos',
      school: 'Instituto Superior Técnico',
      course: 'Ciência de Computadores',
      year: 2,
      schoolProfileId: schoolProfile.id, // Associated with EPF
      skills: ['Python', 'Machine Learning', 'Data Science'],
    },
  ];

  const createdStudents = [];

  for (const studentData of students) {
    // const hashedPassword = await bcrypt.hash(studentData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: studentData.email,
        // password: hashedPassword,
        name: studentData.name,
        role: 'STUDENT',
        isVerified: true,
        level: 'Avançado',
      },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        school: studentData.school,
        course: studentData.course,
        year: studentData.year,
        schoolProfileId: studentData.schoolProfileId,
        skills: studentData.skills,
        githubUrl: 'https://github.com/' + studentData.name.toLowerCase().replace(' ', ''),
        linkedinUrl: 'https://linkedin.com/in/' + studentData.name.toLowerCase().replace(' ', ''),
      },
    });

    createdStudents.push({ user, profile: studentProfile });
  }

  console.log('👥 Created users and profiles');

  // Create problems
  const problems = [
    {
      title: 'Sistema de Gestão de Inventário Inteligente',
      description: 'Desenvolver um sistema de gestão de inventário que utilize machine learning para prever stocks e otimizar encomendas automáticas. O sistema deve integrar-se com plataformas de e-commerce existentes.',
      category: 'TECHNOLOGY',
      difficulty: 'ADVANCED',
      tags: ['Machine Learning', 'Python', 'API', 'E-commerce'],
      requirements: [
        'Conhecimentos em Python e frameworks de ML',
        'Experiência com APIs REST',
        'Conhecimento de sistemas de inventory'
      ],
      reward: '2500',
      rewardType: 'MONEY',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      title: 'App Mobile para Sustentabilidade Doméstica',
      description: 'Criar uma aplicação mobile que ajude utilizadores a monitorizar e reduzir o seu consumo energético e produção de resíduos. Deve incluir gamificação e metas personalizadas.',
      category: 'SUSTAINABILITY',
      difficulty: 'INTERMEDIATE',
      tags: ['React Native', 'Firebase', 'Gamificação', 'IoT'],
      requirements: [
        'Desenvolvimento mobile (React Native/Flutter)',
        'Conhecimento de bases de dados',
        'Interesse em sustentabilidade'
      ],
      reward: 'Estágio Remunerado',
      rewardType: 'INTERNSHIP',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    },
  ];

  const createdProblems = [];

  for (let i = 0; i < problems.length; i++) {
    const problemData = problems[i];
    const company = createdCompanies[i % createdCompanies.length];

    const problem = await prisma.problem.create({
      data: {
        title: problemData.title,
        description: problemData.description,
        companyId: company.profile.id,
        category: problemData.category,
        difficulty: problemData.difficulty,
        tags: problemData.tags,
        requirements: problemData.requirements,
        reward: problemData.reward,
        rewardType: problemData.rewardType,
        deadline: problemData.deadline,
        status: 'ACTIVE',
        isFeatured: i === 0, // First problem is featured
      },
    });

    createdProblems.push(problem);
  }

  console.log('🎯 Created problems');

  // Create solutions
  const solutions = [
    {
      title: 'SmartInventory AI',
      description: 'Solução completa de gestão de inventário usando TensorFlow para previsões e integração com Shopify API.',
      technologies: ['Python', 'TensorFlow', 'FastAPI', 'PostgreSQL'],
      githubUrl: 'https://github.com/joaosilva/smart-inventory',
    },
  ];

  for (let i = 0; i < solutions.length; i++) {
    const solutionData = solutions[i];
    const student = createdStudents[i % createdStudents.length];
    const problem = createdProblems[i % createdProblems.length];

    await prisma.solution.create({
      data: {
        title: solutionData.title,
        description: solutionData.description,
        problemId: problem.id,
        studentId: student.profile.id,
        technologies: solutionData.technologies,
        githubUrl: solutionData.githubUrl,
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
      },
    });
  }

  console.log('💡 Created solutions');
  console.log('✅ Database seeding completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });