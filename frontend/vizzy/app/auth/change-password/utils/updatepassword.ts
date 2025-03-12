// app/api/authentication/signup/route.ts
import { createClient } from '@/utils/supabase/client'; ///Make sure to check whether it's client or server

/**
 * Updates the authenticated user's password.
 * @param {string} newPassword - The new password for the user.
 * @returns {Promise<void>} - Throws an error if the update fails.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createClient(); // Creates a Supabase client instance
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword }); // Updates the user's password

  if (error) {
    throw new Error('Failed to update password in Supabase');
  }
}
