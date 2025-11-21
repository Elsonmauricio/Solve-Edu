// // Importa a biblioteca 'framer-motion' para animações.
// import { motion } from 'framer-motion';
// // Importa componentes de UI personalizados.
// import { MorphicCard } from '../ui/MorphicCard';
// import { QuantumText } from '../ui/QuantumText';

// // Define o componente InitialInterface, que recebe uma função 'onInterfaceChange' como propriedade.
// export const InitialInterface = ({ onInterfaceChange }) => {
//   // TODO: Fetch data from an API
//   const interfaceCards = [];

//   // Retorna o JSX que define a estrutura e o conteúdo da tela de seleção de interface.
//   return (
//     <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 bg-gradient-to-b from-white to-gray-50">
//       <motion.div 
//         className="text-center"
//         initial={{ opacity: 0 }} // Animação inicial: invisível.
//         animate={{ opacity: 1 }} // Anima para: visível.
//         transition={{ duration: 0.8 }} // Duração da animação.
//       >
//         <motion.h3 
//           className="text-5xl font-black quantum-text mb-8"
//           initial={{ opacity: 0, y: 30 }} // Animação inicial: invisível e abaixo.
//           animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
//           transition={{ duration: 0.6 }}
//         >
//           Escolha a sua Interface 
//         </motion.h3>
        
//         <motion.p 
//           className="text-gray-600 text-2xl font-medium mb-16"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.2 }} // Animação com atraso.
//         >
//           Clique num dos cartões acima para aceder à interface específica do seu tipo de utilizador
//         </motion.p>

//         <motion.div 
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.8, delay: 0.4 }}
//         >
//           {interfaceCards.map((card, index) => (
//             <motion.div
//               key={card.title}
//               initial={{ opacity: 0, y: 50 }} // Animação inicial: invisível e abaixo.
//               animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
//               transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }} // Atraso escalonado para cada card.
//             >
//               <MorphicCard 
//                 className="p-8 text-center glow-effect cursor-pointer"
//                 // Ao clicar, chama a função 'onInterfaceChange' com o nome da interface formatado.
//                 onClick={() => onInterfaceChange(card.title.toLowerCase().replace(' ', '-'))}
//               >
//                 <div className="text-6xl mb-6 quantum-text">
//                   {card.emoji}
//                 </div>
                
//                 <h4 className={`text-2xl font-bold text-${card.color}-600 mb-4`}>
//                   {card.title}
//                 </h4>
                
//                 <p className="text-gray-600 text-lg leading-relaxed">
//                   {card.description}
//                 </p>
//               </MorphicCard>
//             </motion.div>
//           ))}
//         </motion.div>
//       </motion.div>
//     </main>
//   );
// };