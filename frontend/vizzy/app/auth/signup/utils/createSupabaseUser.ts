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

    // Check if the error is related to email already being in use
    if (
      errorData.error.message == 'Supabase Auth error: User already registered'
    ) {
      // Throw a custom error message for email already in use
      throw new Error('A user already exists with this email account.');
    }

    // If the error is not related to duplicate email, throw a generic error
    const errorMessage = errorData.error || 'Error signing up';
    throw new Error(errorMessage);
  }
}
