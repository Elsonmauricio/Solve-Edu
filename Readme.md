# 🚀 SolveEdu Platform

O **SolveEdu** é uma plataforma de inovação aberta que conecta estudantes talentosos em busca de afirmação profissional (através de suas Provas de Aptidão Profissional - PAP) a empresas que enfrentam desafios técnicos reais. A plataforma automatiza o ciclo de vida desde a publicação do desafio até a avaliação acadêmica e o pagamento de recompensas financeiras.

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Front-end** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios |
| **Back-end** | Node.js, Express, Auth0 (Identity), PayPal Payouts SDK, Morgan |
| **Banco de Dados** | PostgreSQL (Supabase), Realtime Channels |
| **Infraestrutura** | Vercel (Deploy Monorepo), Docker |
| **Utilitários** | ExcelJS, @react-pdf/renderer, Lucide Icons |

## 🏗️ Arquitetura do Projeto
O projeto segue o modelo de **Monorepo** onde:
1.  **Frontend**: Uma Single Page Application (SPA) que consome a API REST.
2.  **Backend**: Um servidor Express rodando como Serverless Functions no ambiente Vercel.
3.  **Comunicação**: O Frontend utiliza o `useApiFetch` (custom hook) para chamadas autenticadas via JWT do Auth0 e o Supabase Client para escuta de eventos (Notificações/Chat) em tempo real.

## 📊 Esquema do Banco de Dados
-   **User**: Identidade base e nível de gamificação.
-   **Profiles**: `StudentProfile`, `CompanyProfile`, `SchoolProfile` (ligação 1:1 com User).
-   **Problem**: Desafios publicados pelas empresas.
-   **Solution**: Submissões dos alunos, status de aceitação e notas acadêmicas.
-   **Transaction**: Registro de pagamentos via PayPal.
-   **Communication**: `Notification`, `Comment`, `Message`, `Conversation`.

## 🚦 Guia de Iniciação

### Pré-requisitos
-   Node.js 20.x
-   Conta no Supabase e Auth0
-   PayPal Developer Sandbox

### Configuração Local
1.  **Clonar o Projeto:**
    ```bash
    git clone https://github.com/Elsonmauricio/Solve-Edu.git
    ```
2.  **Instalar Dependências:**
    ```bash
    npm install # Na raiz
    cd Backend && npm install
    cd ../Frontend && npm install
    ```
3.  **Configurar Variáveis de Ambiente:**
    Crie arquivos `.env` em ambas as pastas seguindo os exemplos abaixo.
4.  **Iniciar Desenvolvimento:**
    -   Backend: `npm run dev` (Porta 5000)
    -   Frontend: `npm run dev` (Porta 3000)

## 🌍 Deploy
O projeto está configurado para deploy contínuo via **Vercel** através do ficheiro `vercel.json` na raiz, que gerencia os builds de ambas as pastas e configura os `rewrites` para roteamento de API e SPA.

## 📝 Melhorias Futuras
-   [ ] Implementação de sistema de Badges automáticos por nível.
-   [ ] Integração de IA para Smart Matching entre Skills e Desafios.
-   [ ] App Mobile dedicada para o chat em tempo real.

---
© 2025 SolveEdu Platform - Desenvolvido por Elson Mauricio.
