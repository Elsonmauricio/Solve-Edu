# 🎨 SolveEdu Frontend - Interface Reativa

Este diretório contém o código-fonte da interface web da plataforma **SolveEdu**. Construída com foco em performance, acessibilidade e experiência do utilizador, a aplicação é uma Single Page Application (SPA) moderna que orquestra a interação entre três tipos de perfis distintos.

## 🚀 Stack Tecnológica

| Tecnologia | Finalidade |
|------------|------------|
| **React 18** | Biblioteca base para UI baseada em componentes. |
| **TypeScript** | Tipagem estática para robustez e redução de bugs. |
| **Vite** | Bundler ultra-rápido para desenvolvimento e build. |
| **Tailwind CSS** | Estilização via utilitários para design responsivo. |
| **Framer Motion** | Animações fluidas de transição e feedback visual. |
| **Auth0 SDK** | Gestão de identidade e autenticação segura. |
| **Axios** | Cliente HTTP para comunicação com a API REST. |
| **Lucide React** | Conjunto de ícones consistentes e leves. |

## 🏗️ Arquitetura de Software

### 1. Gestão de Estado (Context API)
A aplicação utiliza o **React Context** para evitar o *prop drilling* e gerir estados globais:
-   **`AppContext`**: Armazena os dados do utilizador sincronizados com a DB e configurações gerais.
-   **`RealtimeContext`**: Gere canais do Supabase para escuta de eventos globais.
-   **`ChatContext`**: Controla o estado das conversas e visibilidade do widget de mensagens.

### 2. Segurança e Rotas (RBAC)
O roteamento é gerido pelo `react-router-dom` com uma camada de segurança personalizada:
-   **`ProtectedRoute`**: Garante que o utilizador está autenticado via Auth0.
-   **`RoleGuard`**: Valida se o papel do utilizador (STUDENT, COMPANY, SCHOOL, ADMIN) tem permissão para aceder àquela funcionalidade.
-   **Onboarding Flow**: Deteta perfis incompletos e redireciona automaticamente para as definições.

### 3. Custom Hooks de Core
-   **`useApiFetch`**: Abstrai a lógica de tokens JWT, inserindo automaticamente o header de autorização e tratando erros de rede.
-   **`useUserInitialization`**: O "batimento cardíaco" da app; sincroniza o utilizador Auth0 com a base de dados PostgreSQL no primeiro carregamento.

## 📦 Estrutura de Pastas Chave

```text
src/
├── assets/         # Imagens, logos e recursos estáticos.
├── components/     # Componentes modulares (UI, Layout, Dashboard).
│   ├── dashboard/  # Dashboards específicos por Role.
│   ├── solutions/  # Lógica de submissão e visualização de projetos.
│   └── pdf/        # Geração de certificados via @react-pdf/renderer.
├── context/        # Provedores de estado global.
├── hooks/          # Lógica de negócio reutilizável.
├── pages/          # Componentes de página (Talent Marketplace, Community).
├── services/       # Instâncias de API e definições de chamadas.
└── styles/         # Configurações globais de Tailwind e CSS.
```

## 🛠️ Funcionalidades de Destaque

1.  **Marketplace de Talentos**: Filtragem dinâmica por competências (*Server-side debounced*).
2.  **Validação de PAP**: Dashboard de escola que permite a mentores atribuir notas e validar projetos oficialmente.
3.  **Sistema de Chat**: Comunicação em tempo real integrada entre empresas e alunos.
4.  **Certificação Automática**: Geração de documentos PDF dinâmicos para alunos com projetos validados.

## ⚙️ Configuração de Desenvolvimento

### Variáveis de Ambiente (.env)
Crie um ficheiro `.env` na raiz da pasta `Frontend`:
```env
VITE_AUTH0_DOMAIN=seu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=seu-client-id
VITE_AUTH0_AUDIENCE=https://solveedu.com
VITE_SUPABASE_URL=seu-url-supabase
VITE_SUPABASE_ANON_KEY=sua-key-anon
VITE_API_URL=http://localhost:5000
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala todas as dependências do projeto. |
| `npm run dev` | Inicia o servidor de desenvolvimento (Porta 3000). |
| `npm run build` | Gera os ficheiros otimizados para produção em `/dist`. |
| `npm run preview` | Testa o build de produção localmente. |

## 🚀 Build e Deploy

O build é otimizado via **Vite**, utilizando `manualChunks` para separar bibliotecas pesadas (como PDF e Motion) do bundle principal, garantindo um carregamento inicial rápido. O deploy é feito via **Vercel**, configurado pelo ficheiro `vercel.json` na raiz do monorepo para servir os ficheiros estáticos e lidar com o roteamento de SPA (redirecionando rotas desconhecidas para o `index.html`).

---
© 2025 SolveEdu - Desenvolvido por Elson Mauricio.