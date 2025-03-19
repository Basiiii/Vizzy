/**
 *
 */
export async function deleteUser() {
  const response = await fetch('http://localhost:3000/user/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
  console.log('User deleted with success');
}
