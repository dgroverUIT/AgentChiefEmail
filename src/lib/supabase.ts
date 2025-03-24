import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client with standard auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Initialize authentication
export async function initializeAuth() {
  try {
    // First check if we're already signed in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return;
    }

    if (session?.user) {
      console.log('Already signed in as:', session.user.email);
      return;
    }

    // If not signed in, try to sign in with test credentials
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456',
      });

      if (signInError) {
        // If sign in fails because user doesn't exist, create the user
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'test@example.com',
            password: 'test123456',
          });

          if (signUpError) {
            console.error('Error creating user:', signUpError);
            return;
          }

          if (signUpData.user) {
            console.log('Created and signed in as:', signUpData.user.email);
            return;
          }
        }

        console.error('Error signing in:', signInError);
        return;
      }

      if (signInData.user) {
        console.log('Signed in as:', signInData.user.email);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    throw error;
  }
}

// Initialize auth when the module loads
initializeAuth().catch(console.error);