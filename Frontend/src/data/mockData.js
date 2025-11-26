export const mockProblems = [
  {
    id: 1,
    title: "Sistema de Gestão de Inventário Inteligente",
    description: "Desenvolver um sistema de gestão de inventário que utilize machine learning para prever stocks e otimizar encomendas automáticas. O sistema deve integrar-se com plataformas de e-commerce existentes.",
    company: "TechRetail Lda",
    category: "Tecnologia",
    difficulty: "Avançado",
    tags: ["Machine Learning", "Python", "API", "E-commerce"],
    deadline: "30 dias",
    reward: "€2,500",
    solutionsCount: 8,
    requirements: [
      "Conhecimentos em Python e frameworks de ML",
      "Experiência com APIs REST",
      "Conhecimento de sistemas de inventory"
    ],
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "App Mobile para Sustentabilidade Doméstica",
    description: "Criar uma aplicação mobile que ajude utilizadores a monitorizar e reduzir o seu consumo energético e produção de resíduos. Deve incluir gamificação e metas personalizadas.",
    company: "EcoSolutions SA",
    category: "Sustentabilidade",
    difficulty: "Intermediário",
    tags: ["React Native", "Firebase", "Gamificação", "IoT"],
    deadline: "45 dias",
    reward: "Estágio Remunerado",
    solutionsCount: 12,
    requirements: [
      "Desenvolvimento mobile (React Native/Flutter)",
      "Conhecimento de bases de dados",
      "Interesse em sustentabilidade"
    ],
    createdAt: "2024-01-10"
  },
  {
    id: 3,
    title: "Plataforma de Aprendizagem Adaptativa",
    description: "Desenvolver uma plataforma de e-learning que se adapte ao estilo de aprendizagem de cada aluno usando algoritmos de recomendação e analytics.",
    company: "EduTech Portugal",
    category: "Educação",
    difficulty: "Avançado",
    tags: ["JavaScript", "Node.js", "MongoDB", "AI"],
    deadline: "60 dias",
    reward: "€1,800",
    solutionsCount: 5,
    requirements: [
      "Full-stack development",
      "Conhecimento de algoritmos de recomendação",
      "Experiência com sistemas de aprendizagem"
    ],
    createdAt: "2024-01-08"
  },
  {
    id: 4,
    title: "Sistema de Monitorização de Saúde Remota",
    description: "Criar um sistema que permita a monitorização remota de pacientes crónicos, integrando dados de dispositivos IoT e gerando alertas para profissionais de saúde.",
    company: "HealthInnovate",
    category: "Saúde",
    difficulty: "Avançado",
    tags: ["IoT", "Python", "Django", "React"],
    deadline: "90 dias",
    reward: "€3,000",
    solutionsCount: 3,
    requirements: [
      "Conhecimentos em IoT e APIs",
      "Segurança de dados de saúde",
      "Experiência em desenvolvimento web"
    ],
    createdAt: "2024-01-05"
  }
];

export const mockSolutions = [
  {
    id: 1,
    problemId: 1,
    title: "SmartInventory AI",
    description: "Solução completa de gestão de inventário usando TensorFlow para previsões e integração com Shopify API.",
    student: "João Silva",
    school: "Universidade do Porto",
    status: "Em Análise",
    submittedAt: "2024-01-20",
    technologies: ["Python", "TensorFlow", "FastAPI", "PostgreSQL"],
    githubUrl: "https://github.com/joaosilva/smart-inventory"
  }
];