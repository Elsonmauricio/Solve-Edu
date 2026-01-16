import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useApp } from './context/AppContext';
import { setAuthToken } from './services/api';
import { problemsService } from './services/problems.service';
import { solutionsService } from './services/solutions.service';
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

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const { dispatch } = useApp();
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const syncToken = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
        } else {
          setAuthToken(null);
        }
      } catch (error) {
        console.error("Erro ao obter token de autenticação:", error);
      }
    };

    if (!isLoading) {
      syncToken();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // Carregar Dados Iniciais da API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [problemsRes, solutionsRes] = await Promise.all([
          problemsService.getAll(),
          solutionsService.getAll()
        ]);

        if (problemsRes.success) {
          dispatch({ type: 'SET_PROBLEMS', payload: problemsRes.data.problems || [] });
        }

        if (solutionsRes.success) {
          dispatch({ type: 'SET_SOLUTIONS', payload: solutionsRes.data.solutions || [] });
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  // Sincronizar Utilizador Auth0 com o Contexto
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch({
        type: 'SET_USER',
        payload: {
          name: user.name,
          email: user.email,
          avatar: user.picture,
          role: 'STUDENT', // Podes ajustar isto para vir do Auth0 metadata se configurado
          isVerified: user.email_verified
        }
      });
    }
  }, [isAuthenticated, user, dispatch]);

  if (isLoading || isDataLoading) {
    return <MoonLoader />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <QuantumBackground />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:id" element={<SolutionDetail />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/create-problem" element={<CreateProblem />} />
            <Route path="/submit-solution/:id" element={<SubmitSolution />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;