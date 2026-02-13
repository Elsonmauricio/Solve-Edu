import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { Menu, X, Search, User, Briefcase, GraduationCap, LogOut, LayoutDashboard } from 'lucide-react';
import logo from '../../assets/Logo.png';

const Header = () => {
  const { register, logout, isAuthenticated } = useAuth();
  const { user } = useApp(); // Usar o utilizador do contexto global (com a role correta da DB)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Problemas', href: '/problems', icon: Search },
    { name: 'Soluções', href: '/solutions', icon: Briefcase },
    { name: 'Como Funciona', href: '/how-it-works', icon: GraduationCap },
    { name: 'Comunidade', href: '/community', icon: User },
  ];

  // Determinar o link do dashboard com base na role
  const getDashboardLink = () => {
    // Garante que temos sempre um destino válido, assumindo STUDENT como fallback se a role não estiver definida
    const role = (user?.role || 'STUDENT').toUpperCase();
    if (role === 'ADMIN') return '/admin-dashboard';
    if (role === 'COMPANY') return '/company-dashboard';
    return '/student-dashboard';
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-r from-solve-blue to-solve-purple rounded-xl flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <img src={logo} alt="SolveEdu Logo" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-solve-blue to-solve-purple bg-clip-text text-transparent">
                  SolveEdu
                </h1>
                <p className="text-xs text-gray-500">Conectando Talentos & Desafios</p>
              </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-solve-blue bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-solve-blue hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Link para Dashboard (Visível apenas se logado) */}
            {isAuthenticated && user && (
              <Link
                to={getDashboardLink()}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.includes('dashboard')
                    ? 'text-solve-blue bg-blue-50 border border-blue-200'
                    : 'text-gray-600 hover:text-solve-blue hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    localStorage.setItem('intended_role', 'STUDENT');
                    register('STUDENT');
                  }}
                  className="px-4 py-2 text-sm font-medium text-solve-blue hover:text-solve-purple transition-colors"
                >
                  Sou Estudante
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('intended_role', 'COMPANY');
                    register('COMPANY');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-solve-blue to-solve-purple text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Sou Empresa
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="md:hidden border-t border-gray-200 overflow-y-auto max-h-[calc(100vh-4rem)] bg-white">
                <div className="py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-solve-blue bg-blue-50 border border-blue-200'
                          : 'text-gray-600 hover:text-solve-blue hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {isAuthenticated && user && (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-solve-blue hover:bg-gray-50 transition-all duration-200"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                    >
                      <LogOut size={18} />
                      <span>Sair</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { 
                          setIsMenuOpen(false); 
                          localStorage.setItem('intended_role', 'STUDENT');
                          register('STUDENT'); 
                        }}
                        className="block w-full text-left px-3 py-3 text-base font-medium text-solve-blue hover:bg-blue-50 rounded-lg"
                      >
                        Sou Estudante
                      </button>
                      <button
                        onClick={() => { 
                          setIsMenuOpen(false); 
                          localStorage.setItem('intended_role', 'COMPANY');
                          register('COMPANY'); 
                        }}
                        className="block w-full text-left px-3 py-3 text-base font-medium bg-gradient-to-r from-solve-blue to-solve-purple text-white rounded-lg"
                      >
                        Sou Empresa
                      </button>
                    </>
                  )}
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </motion.header>
  );
};

export default Header;