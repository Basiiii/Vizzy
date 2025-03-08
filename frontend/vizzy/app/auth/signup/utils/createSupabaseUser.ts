/**
 * Function to create a user in supabase.
 * It calls the Next.js API (POST /api/auth/signup) with the email and password.
 * @param {string} email  - The email of the user.
 * @param {string} password  - The password of the user.
 * @returns {Promise<void>}
 */
export async function createSupabaseUser(email: string, password: string) {
  try {
    const response = await fetch('api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Error signing up');
    }

    // const data = await response.json();
  } catch (error) {
    console.error('Supabase create user error:', error);
    throw new Error('Error creating user in Supabase');
  }
}
