import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';
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
import { useUserInitialization } from './hooks/useUserInitialization';
import { useApp } from './context/AppContext';

// Componente para gerir o redirecionamento inicial
const RootRedirect = () => {
  const { isAuthenticated } = useAuth0();
  const { user } = useApp();

  if (isAuthenticated && user) {
    // Lê a role diretamente do perfil do utilizador na base de dados (mais fiável)
    const role = user.role;
    
    if (role === 'COMPANY') return <Navigate to="/company-dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Home />;
};

function App() {
  const { isLoading, error } = useAuth0();
  // Hook personalizado para inicializar os dados do utilizador
  const { isDataLoading } = useUserInitialization();

  if (error) {
    const isServiceNotFound = error.message.includes("Service not found");
    const isUnauthorizedResource = error.message.includes("is not authorized to access resource server");
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