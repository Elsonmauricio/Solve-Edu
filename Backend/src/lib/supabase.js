// c:\Users\maels\Documents\Solve Edu\Backend\src\lib\supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use a Service Key no backend para ignorar RLS

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('⚠️ Faltam variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
