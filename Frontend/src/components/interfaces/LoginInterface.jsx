import { useAuth0 } from '@auth0/auth0-react';
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';

/**
 * Componente que exibe a tela de login.
 * É mostrado quando o utilizador não está autenticado.
 */
export const LoginInterface = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <section className="animated-bg text-gray-900 py-40 pt-48 min-h-screen flex items-center justify-center">
      <MorphicCard className="p-12 text-center">
        <h2 className="text-5xl font-black mb-8">Acesso Restrito</h2>
        <p className="text-xl text-gray-700 mb-10">Para aceder a esta área, precisa de entrar na sua conta ou criar uma nova.</p>
        <div className="flex flex-col space-y-6">
          <NeoButton onClick={() => loginWithRedirect()} className="w-full">
            Entrar
          </NeoButton>
          <NeoButton variant="secondary" onClick={() => loginWithRedirect({ screen_hint: 'signup' })} className="w-full">
            Registar Nova Conta
          </NeoButton>
        </div>
      </MorphicCard>
    </section>
  );
};