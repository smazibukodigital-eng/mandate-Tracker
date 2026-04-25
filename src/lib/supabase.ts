import { createClient } from '@supabase/supabase-js';

// Singleton Sentinel: Only initializes when actually needed in the browser
let supabaseInstance: any = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client during build to prevent crashes
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

// Legacy export for compatibility, using the sentinel
export const supabase = getSupabase();
