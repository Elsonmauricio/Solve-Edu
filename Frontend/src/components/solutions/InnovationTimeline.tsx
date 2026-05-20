import React from 'react';
import { CheckCircle2, Circle, Mic, PlayCircle, Clock } from 'lucide-react';

interface Iteration {
  id: string;
  feedbackType: 'AUDIO' | 'VIDEO' | 'TEXT';
  contentUrl?: string;
  comment: string;
  skillsValidated: string[];
  createdAt: string;
}

interface InnovationTimelineProps {
  iterations: Iteration[];
}

const InnovationTimeline: React.FC<InnovationTimelineProps> = ({ iterations }) => {
  return (
    <div className="space-y-8 py-4">
      {iterations.map((iteration, index) => (
        <div key={iteration.id} className="relative flex gap-x-4">
          {/* Connector Line */}
          {index !== iterations.length - 1 && (
            <div className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
          )}
          
          <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
            <CheckCircle2 className="h-6 w-6 text-solve-teal" aria-hidden="true" />
          </div>
          
          <div className="flex-auto rounded-xl p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(iteration.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-solve-teal/10 text-solve-teal text-[10px] font-bold">
                  ITERAÇÃO #{iterations.length - index}
                </span>
              </div>
              <div className="flex gap-2 text-gray-400">
                {iteration.feedbackType === 'AUDIO' && <Mic size={14} />}
                {iteration.feedbackType === 'VIDEO' && <PlayCircle size={14} />}
              </div>
            </div>
            
            <div className="text-sm text-gray-700 prose prose-sm max-w-none mb-3" dangerouslySetInnerHTML={{ __html: iteration.comment }} />
            
            {iteration.skillsValidated.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {iteration.skillsValidated.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-bold border border-gray-100 uppercase">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div className="relative flex gap-x-4">
        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
          <Circle className="h-6 w-6 text-gray-300" />
        </div>
        <div className="py-0.5 text-xs text-gray-500 italic">
          Projeto iniciado • Alinhamento concluído
        </div>
      </div>
    </div>
  );
};

export default InnovationTimeline;