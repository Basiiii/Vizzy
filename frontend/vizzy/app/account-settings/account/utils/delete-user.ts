/**
 *
 */
export async function deleteUser() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/user/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', //PARA MANDAR OS COOKIES
  });

  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
  console.log('User deleted with success');
}
