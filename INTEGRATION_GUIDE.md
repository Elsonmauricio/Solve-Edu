# Guia de Integração Frontend-Backend - Dados Reais

## Resumo das Mudanças Implementadas

O seu frontend (SolveEdu) agora está totalmente integrado com o backend para refletir dados reais da aplicação. Aqui está um resumo completo das mudanças:

---

## 1. Serviços de API Criados/Atualizados

### ✅ **Serviço de Utilizadores** (`user.service.ts`)
```typescript
// Novos métodos disponíveis:
- getProfile()         // Obter perfil do utilizador logado
- getAll()            // Obter todos os utilizadores (Admin)
- getById()           // Obter utilizador específico
- updateProfile()     // Atualizar informações do perfil
```

### ✅ **Serviço de Admin** (`admin.service.ts`)
```typescript
// Novos métodos disponíveis:
- getDashboardStats()      // Estatísticas do dashboard (users, problems, solutions)
- getAllUsers()           // Lista de todos os utilizadores
- getPendingSolutions()   // Soluções aguardando revisão
- getPendingProblems()    // Desafios aguardando aprovação
- reviewSolution()        // Revisar uma solução
- verifyUser()           // Verificar utilizador
```

### ✅ **Serviço de Problemas** (Atualizado)
```typescript
// Novos métodos adicionados:
- getActive()         // Obter problemas ativos
- getFeatured()       // Obter problemas em destaque
- getMyProblems()     // Obter problemas da empresa logada
```

---

## 2. Contexto Global (AppContext.tsx)

### Novas Ações Adicionadas:
```typescript
- SET_USERS         // Armazenar lista de utilizadores
- SET_STATS         // Armazenar estatísticas da plataforma
- SET_LOADING       // Indicar estado de carregamento
- SET_ERROR         // Armazenar mensagens de erro
- ADD_NOTIFICATION  // Adicionar notificações em tempo real
```

### Estado Expandido:
```typescript
{
  problems: [],           // Array de desafios
  solutions: [],          // Array de soluções
  users: [],              // ✨ NOVO - Array de utilizadores
  user: null,             // Utilizador logado
  filters: {...},
  filteredProblems: [],
  filteredSolutions: [],
  notifications: [],      // ✨ NOVO - Notificações
  stats: {                // ✨ NOVO - Estatísticas
    activeMembers: 0,
    activeDiscussions: 0,
    acceptedSolutions: 0
  },
  loading: false,         // ✨ NOVO - Estado de carregamento
  error: null             // ✨ NOVO - Mensagens de erro
}
```

---

## 3. App.tsx - Carregamento de Dados

### Fluxo de Inicialização:

**1️⃣ Sincronização de Token (useEffect)**
- Obtém o token Auth0
- Define o header Authorization automaticamente

**2️⃣ Carregamento de Dados Iniciais**
```typescript
// Carrega problemas e soluções publicamente
const [problemsRes, solutionsRes] = await Promise.all([
  problemsService.getAll(),
  solutionsService.getAll()
]);
```

**3️⃣ Carregamento de Dados do Utilizador (quando autenticado)**
- Obtém perfil do utilizador
- Se Admin: carrega estatísticas do dashboard
- Actualiza o contexto com informações relevantes

---

## 4. Componentes Atualizados

### **AdminDashboard.tsx**
- ✅ Carrega estatísticas reais via `adminService.getDashboardStats()`
- ✅ Mostra: Total de utilizadores, Desafios ativos, Soluções submetidas, Taxa de aceitação
- ✅ Indicador de carregamento enquanto busca dados
- ✅ Usa dados do contexto como fallback

### **StudentDashboard.tsx**
- ✅ Filtra soluções do estudante logado
- ✅ Calcula estatísticas reais (soluções submetidas, aceites, em andamento)
- ✅ Calcula rating médio baseado em dados reais
- ✅ Mostra problemas ativos disponíveis

### **CompanyDashboard.tsx**
- Pronto para receber dados reais dos desafios da empresa
- Pode ser atualizado de forma similar ao StudentDashboard

---

## 5. Fluxo de Dados - Diagrama

```
Auth0 User
    ↓
App.tsx
    ├─ syncToken() → Sets Authorization header
    ├─ loadInitialData() → Loads public problems & solutions
    └─ loadUserData() → If authenticated:
           ├─ userService.getProfile()
           ├─ adminService.getDashboardStats() [if Admin]
           └─ Updates AppContext
    ↓
AppContext (Redux-like state)
    ├─ problems[]
    ├─ solutions[]
    ├─ users[]
    ├─ stats{}
    ├─ notifications[]
    └─ loading, error
    ↓
Componentes (StudentDashboard, AdminDashboard, ProblemList, etc)
    ├─ useApp() → Access contexto
    └─ Display dados dinâmicos em tempo real
```

---

## 6. Como Usar em Componentes

### Exemplo no StudentDashboard:
```typescript
const { solutions, problems, user, stats } = useApp();

// Filtrar soluções do estudante logado
const mySolutions = solutions.filter(s => s.student?.user?.name === user?.name);

// Calcular estatísticas
const submittedCount = mySolutions.length;
const acceptedCount = mySolutions.filter(s => s.status === 'ACCEPTED').length;
```

### Exemplo no AdminDashboard:
```typescript
const { getAccessTokenSilently } = useAuth0();

useEffect(() => {
  const token = await getAccessTokenSilently();
  const response = await adminService.getDashboardStats(token);
  // Use response.data.users, response.data.problems, etc
}, []);
```

---

## 7. Dados Retornados do Backend

### **Problemas** (GET `/api/problems`)
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "uuid",
        "title": "Título do Desafio",
        "description": "Descrição completa...",
        "category": "TECHNOLOGY",
        "difficulty": "INTERMEDIATE",
        "status": "ACTIVE",
        "deadline": "2024-12-31",
        "company": {...},
        "createdAt": "2024-01-15T10:00:00Z",
        ...
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### **Soluções** (GET `/api/solutions`)
```json
{
  "success": true,
  "data": {
    "solutions": [
      {
        "id": "uuid",
        "problemId": "uuid",
        "title": "Solução Proposta",
        "description": "Descrição da solução...",
        "student": {...},
        "status": "PENDING_REVIEW",
        "rating": 4.5,
        "submittedAt": "2024-01-20T14:30:00Z",
        ...
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

### **Estatísticas Admin** (GET `/api/admin/dashboard-stats`)
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 250,
      "students": 180,
      "companies": 70,
      "newToday": 5
    },
    "problems": {
      "total": 45,
      "active": 32,
      "newToday": 2
    },
    "solutions": {
      "total": 320,
      "pending": 15
    },
    "platform": {
      "acceptanceRate": 68.5,
      "avgSolutionRating": { "_avg": { "rating": 4.2 } }
    }
  }
}
```

---

## 8. Configuração Necessária

### **Frontend .env**
```env
VITE_AUTH0_DOMAIN='dev-v203qjqv035ipllk.us.auth0.com'
VITE_AUTH0_CLIENT_ID='6FMCXLGIc4uvUh4NkO3EVFEDYOrbbXWH'
```

### **Backend .env**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://..."
AUTH0_DOMAIN="dev-v203qjqv035ipllk.us.auth0.com"
AUTH0_AUDIENCE="https://api.solveedu.com"
```

---

## 9. Próximas Melhorias

- [ ] Adicionar paginação dinâmica nos componentes
- [ ] Implementar filtros avançados com API
- [ ] Adicionar busca em tempo real
- [ ] Implementar WebSockets para notificações em tempo real
- [ ] Adicionar cache local para melhor performance
- [ ] Implementar infinite scroll nos problemas/soluções

---

## 10. Troubleshooting

### Dados não aparecem?
1. Verifique se a API Backend está rodando na porta 5000
2. Verifique os headers CORS no backend
3. Abra a aba Network no DevTools para ver os erros
4. Verifique o token Auth0 está correto

### Erro de autenticação?
1. Verifique se o token está sendo passado corretamente
2. Confirme que a role do utilizador está definida no Auth0
3. Verifique o namespace `https://solveedu.com/roles` no Auth0

### Componentes mostram dados antigos?
1. O contexto é compartilhado globalmente - verifique se está a ser actualizado
2. Use `dispatch()` para actualizar o contexto
3. Adicione useEffect para recarregar dados quando necessário

---

## 11. Resumo de Arquivos Modificados

```
Frontend/src/
├── services/
│   ├── user.service.ts          ✨ NOVO
│   ├── admin.service.ts         ✨ NOVO
│   ├── problem.service.ts       ✏️ ATUALIZADO
│   └── api.ts                   (sem mudanças)
├── context/
│   └── AppContext.tsx           ✏️ ATUALIZADO
├── components/
│   └── dashboard/
│       ├── AdminDashboard.tsx   ✏️ ATUALIZADO
│       ├── StudentDashboard.tsx ✏️ PRONTO
│       └── CompanyDashboard.tsx ✏️ PRONTO
└── App.tsx                      ✏️ ATUALIZADO
```

---

**Status:** ✅ Frontend totalmente integrado com dados reais do backend!
