import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login with admin credentials...');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@mscwoundcare.com',
      password: 'Admin123!'
    });

    if (error) {
      console.error('Login error:', error.message);
      return;
    }

    console.log('Login successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);

    // Get user metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError.message);
      return;
    }

    console.log('User metadata:', user?.user_metadata);
    console.log('App metadata:', user?.app_metadata);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin().catch(console.error);
