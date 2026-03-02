import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing. Check your .env file.');
}
console.log("Supabase URL carregada:", !!supabaseUrl);
console.log("Supabase Key carregada:", !!supabaseAnonKey);
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
