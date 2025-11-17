module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'quantum-flow': 'quantumFlow 15s ease infinite',
        'neural-pulse': 'neuralPulse 10s ease-in-out infinite',
        'morphic-shimmer': 'morphicShimmer 2s ease-in-out infinite',
        'quantum-text-flow': 'quantumTextFlow 6s ease-in-out infinite',
        'orb-float': 'orbFloat 25s linear infinite',
        'data-stream': 'dataStream 4s linear infinite',
        'holographic-scan': 'holographicScan 4s linear infinite',
        'quantum-motion': 'quantumMotion 18s linear infinite',
        'energy-pulsation': 'energyPulsation 8s ease-in-out infinite',
        'neural-flow': 'neuralFlow 5s ease-in-out infinite',
        'grid-quantum-shift': 'gridQuantumShift 20s linear infinite',
        'logo-morph': 'logoMorph 8s ease-in-out infinite',
        'liquid-flow': 'liquidFlow 12s ease infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
      keyframes: {
        quantumFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.1)' },
        },
        morphicShimmer: {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)' },
          '100%': { transform: 'translateX(200%) rotate(-45deg)' },
        },
        quantumTextFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        orbFloat: {
          '0%': {
            transform: 'translateY(100vh) translateX(0) rotate(0deg) scale(0)',
            opacity: 0,
          },
          '10%': {
            opacity: 1,
            transform: 'scale(1)',
          },
          '90%': {
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(-100px) translateX(200px) rotate(360deg) scale(0)',
            opacity: 0,
          },
        },
        dataStream: {
          '0%': { width: 0, opacity: 0 },
          '50%': { width: '200px', opacity: 1 },
          '100%': { width: 0, opacity: 0, transform: 'translateX(300px)' },
        },
        holographicScan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        quantumMotion: {
          '0%': {
            transform: 'translateY(100vh) translateX(0) scale(0) rotate(0deg)',
            opacity: 0,
          },
          '10%': {
            opacity: 1,
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'translateY(50vh) translateX(50px) scale(1.5) rotate(180deg)',
          },
          '90%': {
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(-50px) translateX(100px) scale(0) rotate(360deg)',
            opacity: 0,
          },
        },
        energyPulsation: {
          '0%, 100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: 0.3,
          },
          '33%': {
            transform: 'scale(1.3) rotate(120deg)',
            opacity: 0.6,
          },
          '66%': {
            transform: 'scale(0.8) rotate(240deg)',
            opacity: 0.4,
          },
        },
        neuralFlow: {
          '0%': { height: 0, opacity: 0 },
          '50%': { height: '150px', opacity: 1 },
          '100%': { height: 0, opacity: 0, transform: 'translateY(150px)' },
        },
        gridQuantumShift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(30px, 30px) rotate(90deg)' },
          '50%': { transform: 'translate(60px, 0) rotate(180deg)' },
          '75%': { transform: 'translate(30px, -30px) rotate(270deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        },
        logoMorph: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', filter: 'hue-rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(90deg)', filter: 'hue-rotate(90deg)' },
          '50%': { transform: 'scale(0.9) rotate(180deg)', filter: 'hue-rotate(180deg)' },
          '75%': { transform: 'scale(1.05) rotate(270deg)', filter: 'hue-rotate(270deg)' },
        },
        liquidFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: `
              0 0 25px rgba(59, 130, 246, 0.4),
              0 0 50px rgba(96, 165, 250, 0.3),
              0 0 75px rgba(147, 197, 253, 0.2)
            `,
          },
          '50%': {
            boxShadow: `
              0 0 40px rgba(59, 130, 246, 0.6),
              0 0 80px rgba(96, 165, 250, 0.5),
              0 0 120px rgba(147, 197, 253, 0.4)
            `,
          },
        },
      },
    },
  },
  plugins: [],
}