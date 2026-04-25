import { createClient } from '@supabase/supabase-js';

// Access environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize the client. If URL/Key are missing, the client will exist but 
// auth methods will return clear error messages instead of a system crash.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
