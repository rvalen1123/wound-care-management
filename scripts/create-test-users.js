import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avgcjnlimelldnspvrcp.supabase.co';
const supabaseServiceKey = 'sbp_9f1bc979ab96157b95590a29017f11013dfa55f2';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createTestUsers = async () => {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@mscwoundcare.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'System Admin'
      }
    });

    if (adminError) throw adminError;
    console.log('Admin user created:', adminData);

    // Create master rep user
    const { data: repData, error: repError } = await supabase.auth.admin.createUser({
      email: 'john.master@mscwoundcare.com',
      password: 'Master123!',
      email_confirm: true,
      user_metadata: {
        role: 'rep',
        rep_type: 'master',
        name: 'John Master'
      }
    });

    if (repError) throw repError;
    console.log('Master rep user created:', repData);

    // Create doctor user
    const { data: doctorData, error: doctorError } = await supabase.auth.admin.createUser({
      email: 'dr.smith@example.com',
      password: 'Doctor123!',
      email_confirm: true,
      user_metadata: {
        role: 'doctor',
        doctor_id: '44444444-4444-4444-4444-444444444444',
        name: 'Dr. Jane Smith'
      }
    });

    if (doctorError) throw doctorError;
    console.log('Doctor user created:', doctorData);

  } catch (error) {
    console.error('Error creating test users:', error);
  }
};

createTestUsers();
