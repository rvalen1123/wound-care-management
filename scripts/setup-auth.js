import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Initializing Supabase client...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    email: 'admin@mscwoundcare.com',
    password: 'Admin123!',
    data: {
      role: 'admin',
      name: 'System Admin'
    }
  },
  {
    email: 'john.master@mscwoundcare.com',
    password: 'Master123!',
    data: {
      role: 'rep',
      rep_type: 'master',
      name: 'John Master'
    }
  },
  {
    email: 'dr.smith@example.com',
    password: 'Doctor123!',
    data: {
      role: 'doctor',
      doctor_id: '44444444-4444-4444-4444-444444444444',
      name: 'Dr. Jane Smith'
    }
  }
];

async function signUpUser(email, password, userData) {
  try {
    console.log(`Setting up user ${email}...`);

    // First try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (signUpError) {
      // If user exists, try to sign in and update
      if (signUpError.message.includes('already registered')) {
        console.log(`User ${email} exists, updating...`);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error(`Error signing in ${email}:`, signInError.message);
          return;
        }

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: userData
        });

        if (updateError) {
          console.error(`Error updating ${email}:`, updateError.message);
          return;
        }

        console.log(`Successfully updated ${email}`);
        return;
      }

      console.error(`Error creating ${email}:`, signUpError.message);
      return;
    }

    console.log(`Successfully created ${email}`);
    
    // Confirm email immediately using service role
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      signUpData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error(`Error confirming ${email}:`, confirmError.message);
      return;
    }

    console.log(`Successfully confirmed ${email}`);
  } catch (err) {
    console.error(`Error processing ${email}:`, err.message);
  }
}

async function setupUsers() {
  console.log('Starting user setup...');

  for (const user of users) {
    await signUpUser(user.email, user.password, user.data);
  }

  console.log('Setup complete');
}

setupUsers().catch(console.error);
