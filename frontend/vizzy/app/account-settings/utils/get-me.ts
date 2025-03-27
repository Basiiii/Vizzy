import { UserData } from '@/types/user';
export async function getMeFE(): Promise<UserData> {
  const response = await fetch('http://localhost:3000/users/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', //PARA MANDAR OS COOKIES
  });

  if (!response.ok) {
    throw new Error('Failed to fetch account data');
  } else {
    const data = response.json();
    console.log(data);
    return data;
  }
}
