export async function getMeFE() {
  const response = await fetch('http://localhost:3000/user/id', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', //PARA MANDAR OS COOKIES
  });

  if (!response.ok) {
    throw new Error('Failed to fetch account data');
  } else {
    return response.json();
  }
}
