import React from 'react';

const MoonLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B15] overflow-hidden">
      {/* Fundo Estrelado Animado */}
      <div className="absolute inset-0 w-full h-full">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Lua */}
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 rounded-full bg-gray-200 shadow-[0_0_60px_rgba(255,255,255,0.2)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 opacity-90"></div>
            {/* Crateras */}
            <div className="absolute top-8 left-10 w-8 h-8 rounded-full bg-gray-400 opacity-40 shadow-inner"></div>
            <div className="absolute bottom-12 right-10 w-12 h-12 rounded-full bg-gray-400 opacity-30 shadow-inner"></div>
            <div className="absolute top-20 right-8 w-6 h-6 rounded-full bg-gray-400 opacity-40 shadow-inner"></div>
            <div className="absolute bottom-8 left-16 w-5 h-5 rounded-full bg-gray-400 opacity-30 shadow-inner"></div>
          </div>

          {/* Astronauta Flutuando (SVG) */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-float w-32 h-32">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
               {/* Mochila */}
               <rect x="25" y="35" width="50" height="40" rx="5" fill="#CBD5E1"/>
               {/* Corpo */}
               <rect x="30" y="30" width="40" height="50" rx="10" fill="white"/>
               {/* Capacete */}
               <circle cx="50" cy="25" r="18" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
               <circle cx="50" cy="25" r="14" fill="#1E293B"/>
               {/* Reflexo Capacete */}
               <path d="M45 18 Q 50 16 55 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
               {/* Braços */}
               <path d="M30 40 L 15 50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
               <path d="M70 40 L 85 30" stroke="white" strokeWidth="8" strokeLinecap="round"/>
               {/* Pernas */}
               <path d="M40 80 L 35 95" stroke="white" strokeWidth="8" strokeLinecap="round"/>
               <path d="M60 80 L 65 90" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Texto de Carregamento */}
        <div className="z-10 text-center">
          <h2 className="text-2xl font-bold text-white tracking-[0.3em] animate-pulse">
            CARREGANDO
          </h2>
          <p className="text-blue-200 mt-3 text-sm font-light tracking-wider">
            Explorando o universo do conhecimento...
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoonLoader;