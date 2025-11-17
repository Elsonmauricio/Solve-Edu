const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../models/User');
const Challenge = require('../models/Challenge');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solveedu');
    console.log('✅ Conectado à base de dados');

    // Limpar collections existentes
    await User.deleteMany({});
    await Challenge.deleteMany({});
    console.log('🗑️  Collections limpas');

    // Criar empresas de exemplo
    const companies = [
      {
        name: 'TechCorp Lda',
        email: 'techcorp@example.com',
        password: await bcrypt.hash('password123', 12),
        userType: 'company',
        companyProfile: {
          companyName: 'TechCorp Lda',
          industry: 'Tecnologia',
          size: '50-100',
          website: 'https://techcorp.pt',
          description: 'Líder em soluções tecnológicas inovadoras',
          location: 'Lisboa, Portugal'
        }
      },
      {
        name: 'GreenTech Solutions',
        email: 'greentech@example.com',
        password: await bcrypt.hash('password123', 12),
        userType: 'company',
        companyProfile: {
          companyName: 'GreenTech Solutions',
          industry: 'Sustentabilidade',
          size: '20-50',
          website: 'https://greentech.pt',
          description: 'Especialistas em soluções sustentáveis',
          location: 'Porto, Portugal'
        }
      }
    ];

    const createdCompanies = await User.insertMany(companies);
    console.log('🏢 Empresas criadas:', createdCompanies.length);

    // Criar estudantes de exemplo
    const students = [
      {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        password: await bcrypt.hash('password123', 12),
        userType: 'student',
        studentProfile: {
          school: 'Escola Secundária de Lisboa',
          course: 'Informática',
          year: 12,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          bio: 'Estudante apaixonado por programação e inovação'
        }
      },
      {
        name: 'Maria Rodrigues',
        email: 'maria.rodrigues@example.com',
        password: await bcrypt.hash('password123', 12),
        userType: 'student',
        studentProfile: {
          school: 'Escola Profissional do Porto',
          course: 'Design Gráfico',
          year: 11,
          skills: ['Photoshop', 'Illustrator', 'UI/UX Design', 'Figma'],
          bio: 'Designer criativa com interesse em identidade visual'
        }
      }
    ];

    const createdStudents = await User.insertMany(students);
    console.log('🎓 Estudantes criados:', createdStudents.length);

    // Criar desafios de exemplo
    const challenges = [
      {
        title: 'Sistema de Gestão de Inventário',
        description: 'Desenvolver uma aplicação web completa para gestão automática de stock e fornecedores. A solução deve incluir dashboard em tempo real, alertas de stock baixo, integração com fornecedores e relatórios detalhados.',
        company: createdCompanies[0]._id,
        area: 'technology',
        difficulty: 'intermediate',
        reward: {
          type: 'monetary',
          value: '€500',
          amount: 500
        },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        requirements: [
          'Interface web responsiva',
          'Base de dados para produtos e fornecedores',
          'Sistema de alertas automáticos',
          'Relatórios em PDF',
          'Autenticação de utilizadores'
        ],
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        tags: ['web development', 'inventory', 'management']
      },
      {
        title: 'Redesign de Identidade Visual',
        description: 'Criar nova identidade visual completa para startup de tecnologia sustentável. Incluir logótipo, paleta de cores, tipografia, aplicações em diferentes suportes e manual de marca.',
        company: createdCompanies[1]._id,
        area: 'design',
        difficulty: 'beginner',
        reward: {
          type: 'internship',
          value: 'Estágio de 3 meses'
        },
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        requirements: [
          'Logótipo principal e variações',
          'Paleta de cores sustentável',
          'Tipografia corporativa',
          'Aplicações (cartões, website, etc.)',
          'Manual de identidade visual'
        ],
        skillsRequired: ['Adobe Illustrator', 'Photoshop', 'Branding', 'UI Design'],
        tags: ['design', 'branding', 'sustainability']
      }
    ];

  const createdChallenges = await Challenge.insertMany(challenges);
  console.log('🎯 Desafios criados:', createdChallenges.length);

  console.log('✅ Base de dados populada com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao popular base de dados:', error);
    process.exit(1);
  }
};

seedDatabase();