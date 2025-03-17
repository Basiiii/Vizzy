/**
 * This function sends a login request to the /api/auth/login endpoint using a POST request.
 * It includes the user's email and password in the request body. If the response is successful, it returns the login data.
 * If the login fails, it throws an error with an appropriate message.
 * @param email - The user's email address
 * @param password - The user's password
 * @returns {Promise<void>} - A promise that resolves when the user is successfully logged in.
 * @throws {Error} - Throws an error if the log in failed.
 */
export async function LogInUser(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    const errorMessage = errorData.error || 'Error Logging in';
    throw new Error(errorMessage);
  }
}
