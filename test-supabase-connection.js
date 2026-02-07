// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adviwkfttjqxyvfexqbu.supabase.co';
const supabaseKey = 'sb_publishable_TEbgZuwIY8fQddIZ47BR7Q_R0TUZngz';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Check if client is created
console.log('\n✓ Supabase client created');

// Test 2: Try to query profiles table
console.log('\nTesting database access...');
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ Database error:', error.message);
} else {
  console.log('✓ Database connection successful');
  console.log('Profiles table accessible:', data !== null);
}

// Test 3: Check auth
console.log('\nTesting auth...');
const { data: { session }, error: authError } = await supabase.auth.getSession();

if (authError) {
  console.error('❌ Auth error:', authError.message);
} else {
  console.log('✓ Auth service accessible');
  console.log('Current session:', session ? 'Active' : 'None');
}

console.log('\n--- Connection test complete ---');
