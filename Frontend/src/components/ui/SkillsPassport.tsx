import React from 'react';
import { Award, ShieldCheck, Zap, Heart, Download } from 'lucide-react';

interface SkillBadge {
  name: string;
  category: 'SOFT' | 'HARD';
  validatedBy: string;
}

interface SkillsPassportProps {
  skills: SkillBadge[];
  studentName: string;
}

/**
 * Passaporte de Competências (Camada 3):
 * Componente visual de alto impacto que serve como o "Cartão de Cidadão" do talento.
 * Exibe apenas competências que foram validadas por empresas reais através de projetos concluídos.
 */
const SkillsPassport: React.FC<SkillsPassportProps> = ({ skills, studentName }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
      {/* Efeito de Vidro/Brilho */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-solve-teal/10 rounded-full blur-[100px]"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight tracking-tighter">Passaporte de Competências</h3>
            <p className="text-solve-teal text-sm font-medium">Ativo Pedagógico Validado SolveEdu</p>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono text-gray-400">
            ID: #SE-{Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4 group hover:bg-white/10 transition-all cursor-default">
              <div className="mt-1">
                {skill.category === 'SOFT' ? <Heart className="w-5 h-5 text-pink-400" /> : <Zap className="w-5 h-5 text-solve-teal" />}
              </div>
              <div>
                <p className="font-bold text-sm group-hover:text-solve-teal transition-colors">{skill.name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                  <ShieldCheck size={12} className="text-solve-teal" />
                  <span>Validado por {skill.validatedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Titular: <span className="text-white">{studentName}</span></span>
          <button className="flex items-center gap-2 text-xs font-bold text-solve-teal bg-solve-teal/10 px-4 py-2 rounded-xl hover:bg-solve-teal hover:text-white transition-all">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsPassport;