
import { createClient } from '@supabase/supabase-js';

// Credenciais do projeto do usuário
const supabaseUrl = 'https://ttkslmgvorvlczowrbdh.supabase.co';
const supabaseKey = 'sb_publishable_AgJGXL1OnT2ArQG6WEOBDw_Nz7rJie1';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
