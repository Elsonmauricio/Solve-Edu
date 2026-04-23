import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  GraduationCap, 
  Star, 
  Briefcase, 
  ExternalLink,
  Loader2,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useApiFetch } from '../hooks/useApiFetch';
import StartChatButton from '../components/chat/StartChatButton';

const TalentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useApiFetch();

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await authenticatedFetch(`/api/students/${id}`);
        if (response.success) {
          setStudent(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do estudante:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadStudent();
  }, [id, authenticatedFetch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-solve-blue animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Talento não encontrado</h2>
        <button onClick={() => navigate('/talent')} className="text-solve-blue font-semibold hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar aos Talentos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              {...({className: "bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center"})}
            >
              <img 
                src={student.avatar} 
                alt={student.name} 
                className="w-32 h-32 rounded-3xl mx-auto mb-6 bg-gray-50 object-cover shadow-inner"
              />
              <h1 className="text-2xl font-black text-gray-900 mb-2">{student.name}</h1>
              <p className="text-solve-blue font-bold text-sm mb-6">Talento Solve Edu</p>
              
              <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-8">
                <Star size={20} fill="currentColor" />
                <span className="text-lg font-black text-gray-800">{student.rating}</span>
                <span className="text-gray-400 font-medium ml-1">Rating</span>
              </div>

              <div className="space-y-4 text-left border-t border-gray-50 pt-8">
                <div className="flex items-center text-gray-600">
                  <GraduationCap size={18} className="mr-3 text-gray-400" />
                  <span className="text-sm font-medium">{student.school}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-3 text-gray-400" />
                  <span className="text-sm font-medium">{student.location}</span>
                </div>
              </div>

              <div className="mt-10">
                <StartChatButton 
                  targetUserId={student.id} 
                  className="w-full flex items-center justify-center space-x-2 bg-solve-blue text-white py-4 rounded-2xl font-bold hover:bg-solve-purple transition-all shadow-lg shadow-solve-blue/20"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              {...({className: "bg-gray-900 rounded-3xl p-8 text-white"})}
            >
              <h3 className="font-bold text-lg mb-6">Impacto</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle2 size={18} className="mr-3 text-solve-teal" />
                    <span className="text-gray-400 text-sm">Soluções Aceites</span>
                  </div>
                  <span className="font-black text-xl">{student.solutionsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Award size={18} className="mr-3 text-solve-purple" />
                    <span className="text-gray-400 text-sm">Projetos Ativos</span>
                  </div>
                  <span className="font-black text-xl">{student.solutions?.length || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              {...({className: "bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100"})}
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">Sobre o Talento</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {student.bio}
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">Competências Técnicas</h3>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-solve-blue/5 text-solve-blue rounded-xl text-sm font-bold border border-solve-blue/10">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 px-2">Portfólio de Soluções</h2>
              <div className="space-y-4">
                {student.solutions && student.solutions.length > 0 ? (
                  student.solutions.map((sol: any) => (
                    <Link 
                      key={sol.id} 
                      to={`/solutions/${sol.id}`}
                      className="block bg-white p-6 rounded-3xl border border-gray-100 hover:border-solve-blue hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-solve-blue transition-colors">
                          {sol.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${sol.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {sol.status === 'ACCEPTED' ? 'ACEITE' : 'EM ANÁLISE'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{sol.description}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 bg-white rounded-3xl border border-dashed border-gray-200">Este estudante ainda não tem soluções publicadas.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;