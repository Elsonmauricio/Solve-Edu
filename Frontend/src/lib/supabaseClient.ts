import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltam variáveis de ambiente do Supabase.');
}

// Cliente para interações diretas (Storage, Realtime, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);