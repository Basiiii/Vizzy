import { createClient } from '@/utils/supabase/client';

/**
 * Updates the authenticated user's password.
 * @param {string} newPassword - The new password for the user.
 * @returns {Promise<void>} - Throws an error if the update fails.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error('Failed to update password in Supabase');
  }
}
