import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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
  return (
    <AppProvider>
      <Router>
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
    </AppProvider>
  );
}

export default App;