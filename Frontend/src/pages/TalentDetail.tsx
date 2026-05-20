import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import MoonLoader from '../components/common/MoonLoader';
import { User, MapPin, GraduationCap, Github, Linkedin } from 'lucide-react';
import SkillsPassport from '../components/ui/SkillsPassport';
import SEOMeta from '../components/common/SEOMeta';

const TalentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        if (res.data.success) setStudent(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <MoonLoader />;
  if (!student) return <div className="p-20 text-center">Talento não encontrado.</div>;

  // Mock de badges baseado nas skills validadas (Camada 3)
  const validatedBadges = (student.skills || []).slice(0, 4).map((s: string) => ({
    name: s,
    category: 'HARD' as const,
    validatedBy: 'Empresa Parceira SolveEdu'
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <SEOMeta 
        title={`${student.name} | Talento SolveEdu`}
        description={`Conheça o portfólio de ${student.name}, especialista em ${student.course}. Projetos validados academicamente.`}
        image={student.avatar}
      />
      
      {/* Perfil Básico */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <img src={student.avatar} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-solve-teal/20" alt="" />
          <h1 className="text-2xl font-black text-gray-900">{student.name}</h1>
          <p className="text-solve-teal font-medium mb-4">{student.course}</p>
          
          <div className="flex flex-col gap-3 text-sm text-gray-500 text-left border-t pt-6">
            <div className="flex items-center gap-2"><MapPin size={16} /> {student.location}</div>
            <div className="flex items-center gap-2"><GraduationCap size={16} /> {student.school}</div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"><Github size={20} /></button>
            <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"><Linkedin size={20} /></button>
          </div>
        </div>

        <div className="bg-solve-blue/5 p-6 rounded-3xl border border-solve-blue/10">
          <h4 className="font-bold text-solve-blue mb-2">Bio Profissional</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{student.bio}</p>
        </div>
      </div>

      {/* Passaporte e Portfólio */}
      <div className="lg:col-span-2 space-y-8">
        <motion.div {...({ initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } } as any)}>
          <SkillsPassport skills={validatedBadges} studentName={student.name} />
        </motion.div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Projetos Validados na SolveEdu</h3>
          {/* Lista de soluções aceites do aluno aqui */}
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;