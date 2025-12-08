// Supabase client singleton
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create a single supabase client for interacting with your database
// Use service key if available (server-side), otherwise use anon key (client-side)
export const supabase = createSupabaseClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export createClient function for compatibility
export const createClient = () => supabase;

// Export for client-side usage (with anon key)
export const createClientComponentClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
