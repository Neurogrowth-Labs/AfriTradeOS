import { createClient } from '@supabase/supabase-js';

// Prioritize Environment Variables for Production/CI/CD, fallback to hardcoded for local demo
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey) as any;