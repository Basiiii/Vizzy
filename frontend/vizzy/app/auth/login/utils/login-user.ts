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
