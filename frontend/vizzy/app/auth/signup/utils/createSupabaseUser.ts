/**
 * Creates a new user in Supabase by sending a sign-up request to the API.
 * This function interacts with the server-side API (`/api/auth/signup`) to handle user creation in Supabase.
 *
 * @param {string} email - The email address of the user.
 * @param {string} password - The password chosen by the user.
 * @param {string} username - The username of the user.
 * @param {string} name - The full name of the user.
 * @returns {Promise<void>} - A promise that resolves when the user is successfully created in Supabase.
 * @throws {Error} - Throws an error if the user creation fails, either due to a network issue or a response error from the API.
 */
export async function createSupabaseUser(
  email: string,
  password: string,
  username: string,
  name: string,
) {
  try {
    // Send POST request to the sign-up API
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username, name }),
    });

    // Check if the response was successful
    if (!response.ok) {
      // Attempt to parse error message from response
      const errorData = await response.json();

      // Throw error with specific message from the API if available, else generic message
      const errorMessage = errorData.error || 'Error signing up';
      console.error('Error response from API:', errorMessage);
      throw new Error(errorMessage);
    }

    // Log success when the user is successfully created
    console.log('User signed up and added to Supabase successfully.');
  } catch (error) {
    // Log any network or unexpected errors for debugging
    if (error instanceof Error) {
      console.error('Supabase create user error:', error.message);
    } else {
      console.error('Unexpected error during user creation:', error);
    }

    // Re-throw a more general error for the calling function to handle
    throw new Error('Error creating user in Supabase');
  }
}
