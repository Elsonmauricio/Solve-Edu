import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, GraduationCap, MapPin, Star, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { useApiFetch } from '../hooks/useApiFetch';
import StartChatButton from '../components/chat/StartChatButton';

const Talent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('Todas as áreas');
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useApiFetch();

  useEffect(() => {
    const loadTalents = async () => {
      try {
        // Construir query string para filtros reais
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedSkill !== 'Todas as áreas') params.append('skill', selectedSkill);

        const response = await authenticatedFetch(`/api/students?${params.toString()}`);
        if (response.success) {
          setTalents(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar talentos:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    const debounce = setTimeout(loadTalents, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedSkill, authenticatedFetch]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gray-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            {...({ className:"text-4xl md:text-5xl font-black text-white mb-6" } as any)}
          >
            Descobre o Próximo Grande <span className="text-transparent bg-clip-text bg-gradient-to-r from-solve-blue to-solve-purple">Talento</span>
          </motion.h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
            Conecta-te com estudantes brilhantes que já estão a resolver problemas do mundo real através das suas PAPs.
          </p>

          {/* Barra de Pesquisa */}
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-gray-500 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Procura por competências, nome ou instituição..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-solve-blue transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Filter size={18} className="text-solve-blue" />
              <h3 className="font-bold text-gray-900">Filtros</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Área de Especialização</label>
                <select 
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-solve-blue transition-colors"
                >
                  <option>Todas as áreas</option>
                  <optgroup label="Desenvolvimento">
                    <option>Frontend Development</option>
                    <option>Backend Development</option>
                    <option>Fullstack Development</option>
                    <option>Mobile Development (iOS/Android)</option>
                    <option>Game Development</option>
                    <option>Software Architecture</option>
                  </optgroup>
                  <optgroup label="Dados e IA">
                    <option>Inteligência Artificial</option>
                    <option>Machine Learning</option>
                    <option>Data Science & Analytics</option>
                    <option>Big Data</option>
                  </optgroup>
                  <optgroup label="Design e Multimédia">
                    <option>Design UI/UX</option>
                    <option>Design Gráfico</option>
                    <option>Produção de Vídeo & Motion</option>
                    <option>Modelação 3D</option>
                  </optgroup>
                  <optgroup label="Infraestrutura e Segurança">
                    <option>Cibersegurança</option>
                    <option>Cloud Computing (AWS/Azure/GCP)</option>
                    <option>DevOps</option>
                    <option>Redes e Administração de Sistemas</option>
                    <option>Blockchain & Web3</option>
                  </optgroup>
                  <optgroup label="Hardware e Outros">
                    <option>Robótica e Automação</option>
                    <option>Sistemas Embarcados (IoT)</option>
                    <option>Eletrónica</option>
                    <option>Marketing Digital</option>
                    <option>Gestão de Projetos (Agile/Scrum)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Grelha de Talentos */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
              <Loader2 className="w-12 h-12 text-solve-blue animate-spin mb-4" />
              <p className="text-gray-500 font-medium">A carregar talentos...</p>
            </div>
          ) : talents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {talents.map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  {...({ className: "bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group" } as any)} 

                >
                  <div className="flex items-start space-x-4">
                    <img 
                      src={talent.avatar} 
                      alt={talent.name} 
                      className="w-20 h-20 rounded-2xl bg-gray-100 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-solve-blue transition-colors">
                            {talent.name}
                          </h2>
                          <p className="text-solve-blue font-medium text-sm mb-1">{talent.role}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-bold text-gray-700">{talent.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-500 text-sm mb-4">
                        <div className="flex items-center">
                          <GraduationCap size={14} className="mr-1" />
                          <span className="truncate max-w-[150px]">{talent.school}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {talent.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 mb-6 flex flex-wrap gap-2">
                    {talent.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-sm text-gray-500">
                      <span className="font-bold text-gray-900">{talent.solutionsCount}</span> Projetos submetidos
                    </div>
                    <div className="flex space-x-2">
                      <StartChatButton targetUserId={talent.id} label="" className="p-2 text-gray-400 hover:text-solve-blue hover:bg-solve-blue/5 rounded-xl transition-colors" />
                      <Link 
                        to={`/talent/${talent.id}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-solve-blue transition-all font-semibold text-sm"
                      >
                        <span>Perfil</span>
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-gray-200">
              <p className="text-gray-500">Nenhum talento encontrado com os critérios atuais.</p>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:border-solve-blue hover:text-solve-blue transition-all">
              Carregar Mais Resultados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Talent;