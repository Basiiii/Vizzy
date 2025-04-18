const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const getApiUrl = (endpoint: string): string => {
  if (!API_URL || !API_VERSION) {
    throw new Error('API_URL or API_VERSION is not defined');
  }
  return `${API_URL}/${API_VERSION}/${endpoint}`;
};

export const createAuthHeaders = (
  token?: string,
  extra?: Record<string, string>,
): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { ...headers, ...extra };
};
