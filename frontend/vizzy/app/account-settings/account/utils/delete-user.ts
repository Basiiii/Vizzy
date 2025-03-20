/**
 *
 */
export async function deleteUser() {
  const response = await fetch('http://localhost:3000/users/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
}
