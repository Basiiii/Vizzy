import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';

// Define a interface se ainda não tiver exportado em outro lugar
export interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  addedAt: string;
}

export async function fetchUserFavorites(): Promise<FavoriteItem[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
    const token = getClientCookie('auth-token');

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/favorites`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error('Failed to fetch favorites');
  }
}
