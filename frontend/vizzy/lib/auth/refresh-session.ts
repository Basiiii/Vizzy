// TODO: Receber como param: refreshToken: string
export async function refreshSession(refreshToken: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  if (!API_URL || !API_VERSION)
    throw new Error('API_URL or API_VERSION is not defined');

  try {
    const res = await fetch(`${API_URL}/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      throw new Error(`Session refresh failed with status: ${res.status}`);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Session refresh failed: ${error.message}`);
    }

    throw new Error('Unknown session refresh error');
  }
}
