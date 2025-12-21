
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttkslmgvorvlczowrbdh.supabase.co';
const supabaseKey = 'sb_publishable_AgJGXL1OnT2ArQG6WEOBDw_Nz7rJie1';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
