import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Toaster, toast } from 'react-hot-toast';
import MoonLoader from './components/common/MoonLoader';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { GraduationCap, Building, School } from 'lucide-react';
import api from './services/api';
import QuantumBackground from './components/layout/QuantumBackground';
import Help from './components/layout/Help';
import Contact from './components/layout/Contact';
import ComingSoon from './pages/ComingSoon'; // Importar componente genérico
import './styles/globals.css';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Confirmação: Este caminho está correto
import { useUserInitialization } from './hooks/useUserInitialization';
import { useApp } from './context/AppContext';
import { Role } from './types';
import ChatWidget from './components/chat/ChatWidget';
import AdminSecurityLogs from './components/Admin/SecurityLogs';

// Lazy Loading de Páginas e Componentes Pesados
const Home = lazy(() => import('./pages/Home'));
const Problems = lazy(() => import('./pages/Desafios'));
const Talent = lazy(() => import('./pages/Talent'));
const TalentDetail = lazy(() => import('./pages/TalentDetail'));
const Solutions = lazy(() => import('./pages/Solutions'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Community = lazy(() => import('./pages/Community'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Security = lazy(() => import('./pages/Security'));
const ChildProtection = lazy(() => import('./pages/ChildProtection'));
const StudentDashboard = lazy(() => import('./components/dashboard/StudentDashboard'));
const CompanyDashboard = lazy(() => import('./components/dashboard/CompanyDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('./components/Admin/AdminUsers'));
const AdminContent = lazy(() => import('./components/Admin/AdminContent'));
const AdminReports = lazy(() => import('./components/Admin/AdminReports'));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings'));
const SchoolDashboard = lazy(() => import('./components/dashboard/SchoolDashboard'));
const ProblemDetail = lazy(() => import('./components/desafios/DesafioDetail'));
const SolutionDetail = lazy(() => import('./components/solutions/SolutionDetail'));
const CreateProblem = lazy(() => import('./components/desafios/CreateDesafio'));
const SubmitSolution = lazy(() => import('./components/solutions/SubmitSolution'));
const ProfileSettings = lazy(() => import('./components/profile/ProfileSettings'));

// Componente para proteger rotas por Role (Permissão)
const RoleGuard = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user } = useApp();
  const { logout } = useAuth0();
  const location = useLocation();
  const { dispatch } = useApp();
  const [step, setStep] = useState<'ROLE_SELECTION' | 'PROFILE_COMPLETION'>('ROLE_SELECTION');

  if (!user) {
    return null; // ou um spinner
  }

  const userRole = (user.role || "").toUpperCase() as Role;
  
  // Verificação de Integridade: O perfil está minimamente preenchido?
  // Melhoria: Lidar com o facto de o perfil poder vir como objeto ou array do backend
  const sProfile = Array.isArray(user.studentProfile) ? user.studentProfile[0] : user.studentProfile;
  const cProfile = Array.isArray(user.companyProfile) ? user.companyProfile[0] : user.companyProfile;
  const scProfile = Array.isArray(user.schoolProfile) ? user.schoolProfile[0] : user.schoolProfile;

  const isProfileIncomplete = 
    (userRole === 'STUDENT' && (!sProfile?.skills || sProfile?.skills?.length === 0)) ||
    (userRole === 'COMPANY' && !cProfile?.companyName) ||
    (userRole === 'SCHOOL' && !scProfile?.schoolName);

  // Ecrã de seleção de perfil OU conclusão de perfil
  if (!userRole || (isProfileIncomplete && location.pathname !== '/settings')) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSelection = async (role: Role) => {
      setIsSubmitting(true);
      try {
        const response = await api.put('/users/me/role', { role });
        
        if (response.data.success && response.data.data) {
          dispatch({ type: 'SET_USER', payload: response.data.data });
          setStep('PROFILE_COMPLETION');
          toast.success('Tipo de conta definido! Vamos configurar os detalhes do seu perfil.');
        } else {
          toast.error(response.data.message || 'Não foi possível definir o perfil.');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Ocorreu um erro de comunicação.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (step === 'PROFILE_COMPLETION' || isProfileIncomplete) {
      return (
        <Navigate to="/settings" state={{ from: 'onboarding', message: 'Por favor, complete os dados obrigatórios do seu perfil para continuar.' }} replace />
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete o seu Perfil</h2>
          <p className="text-gray-600 mb-6">
            Para começar, diga-nos que tipo de conta pretende criar.
          </p>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handleRoleSelection('STUDENT')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-solve-blue text-white rounded-xl hover:bg-solve-purple transition-colors font-semibold disabled:opacity-50"
            >
              <GraduationCap size={20} />
              <span>Sou Estudante</span>
            </button>
            <button
              onClick={() => handleRoleSelection('COMPANY')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold disabled:opacity-50"
            >
              <Building size={20} />
              <span>Sou uma Empresa</span>
            </button>
            <button
              onClick={() => handleRoleSelection('SCHOOL')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
            >
              <School size={20} />
              <span>Sou uma Instituição</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase()) as Role[];

  if (!normalizedAllowedRoles.includes(userRole)) {
    // Se a role não corresponder, redireciona para o dashboard correto
    let target = '/student-dashboard';
    if (userRole === 'ADMIN') target = '/admin-dashboard';
    if (userRole === 'COMPANY') target = '/company-dashboard';
    if (userRole === 'SCHOOL') target = '/school-dashboard';

    // Prevenir loop infinito: Se já estamos na página alvo mas não temos permissão,
    // NÃO redirecionar para "/" (pois o RootRedirect mandaria de volta para cá).
    // Em vez disso, mostrar erro de acesso.
    if (location.pathname === target) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acesso Não Autorizado</h2>
          <p className="text-gray-600 mb-4">O seu perfil ({userRole}) não tem permissão para aceder a esta página.</p>
          <div className="flex space-x-4">
            <a href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Voltar ao Início</a>
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="px-4 py-2 bg-solve-blue text-white rounded-lg hover:bg-solve-purple transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

// Layout principal para controlar a visibilidade do Footer
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Lista de caminhos onde o footer deve ser escondido
  const hideFooterPaths = ['/student-dashboard', '/company-dashboard', '/admin-dashboard', '/school-dashboard', '/create-problem', '/submit-solution'];
  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <QuantumBackground />
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <ChatWidget />
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

function App() {
  const { isLoading, error, isAuthenticated, logout } = useAuth0();
  // Hook personalizado para inicializar os dados do utilizador
  const { isDataLoading } = useUserInitialization();
  const { user } = useApp();

  if (error) {
    const isServiceNotFound = error.message?.includes("Service not found");
    const isUnauthorizedResource = error.message?.includes("is not authorized to access resource server");
    const requestedAudience = import.meta.env.VITE_AUTH0_AUDIENCE;

    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro de Autenticação</h2>
          <p className="text-gray-700 mb-6 font-mono text-sm bg-gray-100 p-3 rounded">{error.message}</p>
          
          {isServiceNotFound && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg text-left border border-blue-100">
              <p className="font-bold mb-2 flex items-center">
                ℹ️ Configuração em Falta no Auth0
              </p>
              <p className="mb-2">
                O Auth0 não encontrou a API que o código está a pedir: <br/>
                <code className="font-mono font-bold bg-blue-100 px-1 rounded">{requestedAudience}</code>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Vá ao <strong>Auth0 Dashboard</strong> {'>'} <strong>Applications</strong> {'>'} <strong>APIs</strong>.</li>
                <li>Clique em <strong>Create API</strong>.</li>
                <li>No campo <strong>Identifier</strong>, cole exatamente:<br/><code className="bg-white px-1 border border-blue-200 rounded">{requestedAudience}</code></li>
                <li>Clique em <strong>Create</strong> e tente novamente.</li>
              </ol>
            </div>
          )}

          {isUnauthorizedResource && (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg text-left border border-yellow-100">
              <p className="font-bold mb-2 flex items-center">
                ⚠️ Aplicação não autorizada na API
              </p>
              <p className="mb-2">A sua aplicação (Client) não tem permissão para falar com a API (Resource Server).</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Vá ao <strong>Auth0 Dashboard</strong> {'>'} <strong>Applications</strong> {'>'} <strong>Applications</strong>.</li>
                <li>Clique na sua aplicação (ex: <em>Solve Edu Frontend</em>).</li>
                <li>Clique na aba <strong>APIs</strong>.</li>
                <li>Encontre a API <code>https://solveedu.com</code> e ative o interruptor (toggle) para <strong>Authorized</strong>.</li>
                <li>Tente fazer login novamente.</li>
              </ol>
            </div>
          )}

          <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Tentar Novamente
          </a>
        </div>
      </div>
    );
  }

  if (isLoading || isDataLoading) {
    return <MoonLoader />;
  }

  // Verificação de segurança: Autenticado mas sem perfil carregado (Erro de Backend)
  // Isto previne o "Login Zumbi" onde o utilizador está logado mas não tem dados
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Falha ao Carregar Perfil</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível conectar à sua conta. Isto geralmente acontece quando o servidor backend está desligado ou houve um erro na criação do perfil.
          </p>
          <button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sair e Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
            success: { style: { background: '#10B981' } },
            error: { style: { background: '#EF4444' } },
          }}
        />
      <MainLayout>
        <Suspense fallback={<MoonLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:id" element={<SolutionDetail />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            <Route path="/child-protection" element={<ChildProtection />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Rotas "Em Breve" para links do Futuros */}
            <Route path="/resources" element={<ComingSoon title="Recursos Educativos" />} />
            <Route path="/mentorship" element={<ComingSoon title="Programa de Mentoria" />} />
            <Route path="/talent" element={<Talent />} />
            <Route path="/talent/:id" element={<TalentDetail />} />
            <Route path="/success-stories" element={<ComingSoon title="Casos de Sucesso" />} />
            <Route path="/partnerships" element={<ComingSoon title="Parcerias" />} />
            <Route path="/company/team" element={<ComingSoon title="Gestão de Equipa" />} />
            
            {/* Rotas Protegidas */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['COMPANY']}>
                    <CompanyDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}><AdminUsers /></RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}><AdminContent /></RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}><AdminReports /></RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}><AdminSettings /></RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/security-logs" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}><AdminSecurityLogs /></RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/school-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['SCHOOL']}>
                    <SchoolDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-problem" 
              element={<ProtectedRoute><CreateProblem /></ProtectedRoute>} 
            />
            <Route 
              path="/submit-solution/:id" 
              element={<ProtectedRoute><SubmitSolution /></ProtectedRoute>} 
            />
            <Route 
              path="/settings" 
              element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} 
            />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;