import { UserData } from '@/types/user';

export async function updateProfile(data: UserData) {
  const response = await fetch('http://localhost:3000/user/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', //PARA MANDAR OS COOKIES
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile data.');
  }
  return response.json();
}
