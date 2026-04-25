import { createClient } from '@supabase/supabase-js';

// Direct Integration: Hard-linking to your specific Supabase instance
// to bypass Vercel environment variable injection issues.
const SUPABASE_URL = 'https://bcnbbhrokdudidbfijdu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xq0lJYjULDWvYB1Lfi6Vbw_UNoyxYT6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
