/**
 * Handles the sign-up process by sending a POST request to the server with user registration details.
 *
 * This function constructs a request to the server's sign-up endpoint using the provided email, password, username, and name.
 * It includes error handling for specific HTTP status codes (e.g., 409 for email conflicts, 422 for username conflicts) and
 * wraps errors in a structured format for consistent error handling in the calling function. If the request fails, it throws
 * an error with a JSON string containing the error code and message. Network errors are also caught and wrapped in a structured format.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} username - The user's desired username.
 * @param {string} name - The user's full name.
 * @returns {Promise<void>} - A promise that resolves if the sign-up is successful, or rejects with an error if it fails.
 *
 * @throws {Error} - Throws an error with a JSON string containing the error code and message if the sign-up fails.
 *
 * @example
 * signupUser('user@example.com', 'password123', 'user123', 'User Name');
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  name: string,
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const response: Response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, username, name }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();

    // Throw structured error with code
    const errorPayload = {
      code: 'GENERIC_ERROR',
      message: 'An error occurred during sign-up.',
      ...errorData.error, // Merge any backend-provided error details
    };

    switch (response.status) {
      case 409:
        errorPayload.code = 'EMAIL_EXISTS';
        errorPayload.message = 'A user already exists with this email account.';
        break;
      case 422:
        errorPayload.code = 'USERNAME_EXISTS';
        errorPayload.message =
          'This username is already taken. Please choose another.';
        break;
    }

    throw new Error(JSON.stringify(errorPayload));
  }
}
