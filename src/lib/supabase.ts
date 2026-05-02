import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iirrdgohvwnkpflnxvny.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnJkZ29odndua3BmbG54dm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTU0ODcsImV4cCI6MjA5MzIzMTQ4N30.ozuzley4uHObAajdjc3qLDRtJ8nQXE-xPlw-TiCycho';

export const supabase = createClient(supabaseUrl, supabaseKey);
