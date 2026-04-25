import { createClient } from '@supabase/supabase-js';

// Final Production Connection: Hard-linked with verified credentials.
const SUPABASE_URL = 'https://bcnbbhrokdudidbfijdu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbmJiaHJva2R1ZGlkYmZpamR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjQzNTYsImV4cCI6MjA5MjU0MDM1Nn0.jpBSoFCMCrd7Y_RCPysbbFsXue5zbVBz8HpiCYdeHFE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
