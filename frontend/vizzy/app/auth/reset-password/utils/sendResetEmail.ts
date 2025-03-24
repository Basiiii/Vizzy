import { createClient } from '@/lib/utils/supabase/client';

/**
 * Sends the reset password email via Supabase, using the sendResetEmail method.
 *
 * @param {string} email - The email address of the user.
 * @throws {Error} - Throws an error if the user creation fails, either due to a network issue or a response error from Supabase Auth.
 */
export async function sendResetEmail(email: string) {
  const supabase = await createClient();

  // Send Reset Password email via Supabase Auth
  const { error: authError } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      // TODO: create this page
      redirectTo: '/auth/update-password',
    },
  );

  // Handle errors from Supabase Auth
  if (authError) {
    // Log the error for debugging purposes
    console.error('Supabase Auth error:', authError.message);

    const errorMessage = authError.message || 'Error signing up';
    throw new Error(errorMessage);
  }
}
