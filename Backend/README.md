# 🚀 SolveEdu Backend API

Este é o motor do ecossistema **SolveEdu**, uma API REST robusta construída com Node.js e Express, projetada para gerir a interação entre estudantes, empresas e instituições de ensino. A API lida com fluxos complexos de identidade, submissão de projetos (PAP), avaliações académicas e pagamentos automatizados.

## 🏗️ Arquitetura e Design Patterns

-   **Controller-Service Pattern:** Lógica de negócio isolada em controladores estáticos para escalabilidade.
-   **JIT (Just-In-Time) Provisioning:** Sincronização automática de utilizadores Auth0 com a base de dados local via middleware.
-   **State Machine:** Fluxos de transição de estados para Desafios (Aberto -> Concluído) e Soluções (Pendente -> Aceite).
-   **Unified Error Handling:** Middleware centralizado para tratamento de exceções e respostas consistentes.

## 🛠️ Stack Tecnológica Principais

| Categoria | Tecnologia |
|-----------|------------|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js |
| **Base de Dados** | PostgreSQL (via Supabase) |
| **Identidade** | Auth0 (JWT & OAuth2) |
| **Financeiro** | PayPal Payouts SDK |
| **ORM/Migrations** | Prisma |
| **Ficheiros** | Multer + Supabase Storage |
| **Relatórios** | ExcelJS |

## 🔐 Fluxo de Autenticação e Identidade

O backend utiliza um sistema de autenticação de dupla camada no ficheiro `auth0.middleware.js`:
1.  **`validateAccessToken`**: Valida o JWT enviado pelo Frontend.
2.  **`syncUser`**: Extrai o `sub` do Auth0, verifica se o utilizador existe na base de dados local e, se necessário, cria o utilizador e o seu perfil específico (`StudentProfile`, `CompanyProfile` ou `SchoolProfile`) em tempo real.
3.  **RBAC (Role-Based Access Control)**: Middlewares que garantem que apenas utilizadores com as roles certas (ex: `SCHOOL`) acedam a rotas sensíveis (ex: atribuir notas).

## 🗝️ Endpoints Principais (API Reference)

### 🎓 Estudantes e Talentos
-   `GET /api/students`: Listagem de talentos com filtros inteligentes de competências e localização.
-   `GET /api/students/:id`: Perfil detalhado com portfólio de soluções integradas.
-   `GET /api/students/ranking`: Ranking de alunos baseado em soluções aceites.

### 💼 Empresas e Desafios
-   `POST /api/problems`: Publicação de novos desafios tecnológicos.
-   `POST /api/solutions/:id/accept`: Aceitação de solução. Dispara automaticamente um **PayPal Payout** se houver recompensa e encerra o desafio.
-   `GET /api/company/featured`: Lista empresas com maior volume de desafios ativos.

### 🏫 Instituições de Ensino (Escola)
-   `GET /api/school/dashboard`: Estatísticas em tempo real (Taxa de conclusão, média de notas).
-   `PUT /api/solutions/:id/grade`: Atribuição de nota oficial e feedback para validade de PAP.
-   `GET /api/solutions/export/grades`: Exportação da pauta de avaliações em formato `.xlsx`.

### 💬 Comunicação e Notificações
-   `GET /api/chat/conversations`: Gestão de conversas em tempo real.
-   `GET /api/notifications`: Centro de notificações para eventos do sistema (Nova solução, Pagamento recebido, etc).

## ⚙️ Configuração do Ambiente

O ficheiro `.env` deve conter as seguintes chaves:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Supabase (PostgreSQL)
SUPABASE_URL=<https://your-project.supabase.co>
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=<https://solveedu.com>

# PayPal (Sandbox para Testes)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret

# URLs
FRONTEND_URL=http://localhost:3000
```

## 🚀 Instalação e Execução

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Executar Migrations (Prisma):**
    ```bash
    npx prisma migrate dev
    ```

3.  **Modo Desenvolvimento (com Nodemon):**
    ```bash
    npm run dev
    ```

4.  **Executar Testes:**
    ```bash
    npm test
    ```

## ⚠️ Observações de Engenharia

-   **Path Duplication Fix:** O servidor inclui um middleware que corrige automaticamente pedidos duplicados de `/api/api` enviados por versões antigas do frontend.
-   **PayPal Webhooks:** O `CompanyController` está preparado para receber notificações do PayPal para confirmar a conclusão de pagamentos em background.
-   **Performance:** Consultas ao Supabase utilizam `!inner` joins para filtragem eficiente no lado do servidor, reduzindo o tráfego de rede.

---
© 2025 SolveEdu - Documentação Técnica do Backend.
