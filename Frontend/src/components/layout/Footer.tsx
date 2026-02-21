import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import logo from '../../assets/Logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Plataforma',
      links: [
        { name: 'Problemas', href: '/problems' },
        { name: 'Soluções', href: '/solutions' },
        { name: 'Como Funciona', href: '/how-it-works' },
        { name: 'Comunidade', href: '/community' },
      ],
    },
    {
      title: 'Para Estudantes',
      links: [
        { name: 'Encontrar Desafios', href: '/problems' },
        { name: 'Submeter PAP', href: '/student-dashboard' },
        { name: 'Recursos', href: '/resources' },
        { name: 'Mentoria', href: '/mentorship' },
      ],
    },
    {
      title: 'Para Empresas',
      links: [
        { name: 'Publicar Desafio', href: '/company-dashboard' },
        { name: 'Encontrar Talentos', href: '/talent' },
        { name: 'Casos de Sucesso', href: '/success-stories' },
        { name: 'Parcerias', href: '/partnerships' },
      ],
    },
    {
      title: 'Suporte',
      links: [
        { name: 'Centro de Ajuda', href: '/help' },
        { name: 'Contactos', href: '/contact' },
        { name: 'Política de Privacidade', href: '/privacy' },
        { name: 'Termos de Uso', href: '/terms' },
        { name: 'Proteção de Menores', href: '/child-protection' },
        { name: 'Segurança', href: '/security' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@solveedu.pt', label: 'Email' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
            <Link to="/" className="flex items-center space-x-3 mb-4">
             {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-r from-solve-blue to-solve-purple rounded-xl flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <img src={logo} alt="SolveEdu Logo" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">SolveEdu</h3>
                <p className="text-gray-400 text-sm">Conectando Talentos & Desafios</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Transformamos projetos académicos em soluções inovadoras para empresas. 
              Conectamos o talento estudantil aos desafios do mercado real.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.div
                    key={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-solve-blue transition-all duration-200"
                    >
                      <Icon size={18} />
                    </a>
                  </motion.div>
                );
              })}
            </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4 text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} SolveEdu. Todos os direitos reservados.
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Feito com</span>
            <Heart size={16} className="text-red-500" />
            <span>para a educação portuguesa</span>
          </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;