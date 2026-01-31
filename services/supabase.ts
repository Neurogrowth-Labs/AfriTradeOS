import { createClient } from '@supabase/supabase-js';

// Prioritize Environment Variables for Production/CI/CD, fallback to hardcoded for local demo
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://adviwkfttjqxyvfexqbu.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TEbgZuwIY8fQddIZ47BR7Q_R0TUZngz';

export const supabase = createClient(supabaseUrl, supabaseKey) as any;