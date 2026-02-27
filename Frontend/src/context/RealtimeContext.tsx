// c:\Users\maels\Documents\Solve Edu\Frontend\src\context\RealtimeContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useApp } from './AppContext';

const RealtimeContext = createContext({});

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp(); // Obtém o utilizador atual do contexto global
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    // Só subscreve se o utilizador estiver autenticado e tiver um ID
    if (!isAuthenticated || !user?.id) return;

    let channel: any;

    const setupRealtime = async () => {
      try {
        // Autentica o cliente Supabase com o token do Auth0 para que as políticas de RLS (Row Level Security) funcionem
        const token = await getAccessTokenSilently();
        supabase.realtime.setAuth(token);

        // Cria o canal de subscrição
        channel = supabase
          .channel('db-notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT', // Escutar apenas novas inserções
              schema: 'public',
              table: 'Notification',
              filter: `userId=eq.${user.id}`, // FILTRO CRÍTICO: Apenas notificações deste user
            },
            (payload) => {
              const newNotification = payload.new;
              
              // Dispara o alerta visual
              toast(
                (t) => (
                  <div className="flex flex-col">
                    <span className="font-bold">{newNotification.title}</span>
                    <span className="text-sm">{newNotification.message}</span>
                  </div>
                ),
                {
                  icon: '🔔',
                  duration: 5000,
                  position: 'top-right',
                  style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                }
              );

              // Dica: Se tiveres um estado global de notificações no AppContext, 
              // podes fazer dispatch aqui para atualizar o contador sem refresh:
              // dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`[Realtime] Conectado para notificações do utilizador ${user.id}`);
            }
          });

      } catch (error) {
        console.error('[Realtime] Erro ao configurar subscrição:', error);
      }
    };

    setupRealtime();

    // Cleanup: Remove a subscrição quando o componente desmonta ou o user muda
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, isAuthenticated, getAccessTokenSilently]);

  return (
    <RealtimeContext.Provider value={{}}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
