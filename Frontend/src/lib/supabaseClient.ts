// c:\Users\maels\Documents\Solve Edu\Frontend\src\lib\supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Anon Key em falta. As funcionalidades Realtime podem não funcionar.');
}

// Cria uma instância única do cliente Supabase para o Frontend
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
