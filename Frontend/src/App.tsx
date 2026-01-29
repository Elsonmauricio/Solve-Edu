import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { setAuthToken } from './services/api';
import { problemsService } from './services/problems.service';
import { solutionsService } from './services/solution.service';
import { userService } from './services/user.service';
import { adminService } from './services/admin.service';
import MoonLoader from './components/common/MoonLoader';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import QuantumBackground from './components/layout/QuantumBackground';
import Home from './pages/Home';
import Problems from './pages/Problems';
import Solutions from './pages/Solutions';
import HowItWorks from './pages/HowItWorks';
import Community from './pages/Community';
import StudentDashboard from './components/dashboard/StudentDashboard';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProblemDetail from './components/problems/ProblemDetail';
import SolutionDetail from './components/solutions/SolutionDetail';
import CreateProblem from './components/problems/CreateProblem';
import SubmitSolution from './components/solutions/SubmitSolution';
import './styles/globals.css';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Confirmação: Este caminho está correto

// Componente para gerir o redirecionamento inicial
const RootRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) return <MoonLoader />;

  if (isAuthenticated && user) {
    // Lê a role do token (namespace deve corresponder à Action do Auth0)
    const role = (user as any)['https://solveedu.com/roles']?.[0] || 'STUDENT';
    
    if (role === 'COMPANY') return <Navigate to="/company-dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Home />;
};

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const { dispatch } = useApp();
  const [isDataLoading, setIsDataLoading] = useState(true);

  // useEffect(() => {
  //   const initializeUser = async () => {
  //     if (isAuthenticated && user) {
  //       try {
  //         // 1. Obter e configurar o token de autenticação
  //         const token = await getAccessTokenSilently();
  //         setAuthToken(token);

  //         // 2. Sincronizar utilizador e obter perfil do backend
  //         // Carregar perfil do utilizador
  //         const profileRes = await userService.getProfile();
  //         if (profileRes.success && profileRes.data) {
  //           const backendUser = profileRes.data;
  //           // Atualizar o contexto com os dados do nosso backend
  //           dispatch({
  //             type: 'SET_USER',
  //             payload: {
  //               id: backendUser.id,
  //               name: backendUser.name,
  //               email: backendUser.email,
  //               avatar: backendUser.avatar,
  //               role: backendUser.role,
  //               isVerified: backendUser.isVerified,
  //               // Adicionar perfis para acesso fácil
  //               studentProfile: backendUser.studentProfile,
  //               companyProfile: backendUser.companyProfile,
  //             }
  //           });

  //           // 3. Carregar dados específicos do papel (se aplicável)
  //           if (backendUser.role === 'ADMIN') {
  //             const statsRes = await adminService.getDashboardStats();
  //             if (statsRes.success && statsRes.data) {
  //               dispatch({ type: 'SET_STATS', payload: statsRes.data });
  //             }
  //           }
  //         } else {
  //           throw new Error(profileRes.message || 'Falha ao carregar perfil do utilizador.');
  //         }
  //       } catch (error) {
  //         console.error("Erro ao inicializar dados do utilizador:", error);
  //         // Opcional: fazer logout ou mostrar uma mensagem de erro
  //       }
  //     } else {
  //       // Limpar token se não estiver autenticado
  //       setAuthToken(null);
  //     }
  //     setIsDataLoading(false);
  //   };

  //   if (!isLoading && isAuthenticated) {
  //     initializeUser();
  //   } else if (!isLoading) {
  //     setIsDataLoading(false);
  //   }
  // }, [isAuthenticated, isLoading, user, getAccessTokenSilently, dispatch]);

  if (isLoading || isDataLoading) {
    return <MoonLoader />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
            success: { style: { background: '#10B981' } },
            error: { style: { background: '#EF4444' } },
          }}
        />
        <QuantumBackground />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:id" element={<SolutionDetail />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/community" element={<Community />} />
            
            {/* Rotas Protegidas */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company-dashboard" 
              element={
                <ProtectedRoute>
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;