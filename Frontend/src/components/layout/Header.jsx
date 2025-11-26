import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Briefcase, GraduationCap } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Problemas', href: '/problems', icon: Search },
    { name: 'Soluções', href: '/solutions', icon: Briefcase },
    { name: 'Como Funciona', href: '/how-it-works', icon: GraduationCap },
    { name: 'Comunidade', href: '/community', icon: User },
  ];

  return (
    <motion.header 
      className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-solve-blue to-solve-purple rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <span className="text-white font-bold text-lg">S4E</span>
            </motion.div>
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
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/student-dashboard"
              className="px-4 py-2 text-sm font-medium text-solve-blue hover:text-solve-purple transition-colors"
            >
              Sou Estudante
            </Link>
            <Link
              to="/company-dashboard"
              className="px-6 py-2 bg-gradient-to-r from-solve-blue to-solve-purple text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Sou Empresa
            </Link>
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
              className="md:hidden border-t border-gray-200"
            >
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
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/student-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-solve-blue hover:bg-blue-50 rounded-lg"
                  >
                    Sou Estudante
                  </Link>
                  <Link
                    to="/company-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium bg-gradient-to-r from-solve-blue to-solve-purple text-white rounded-lg"
                  >
                    Sou Empresa
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;