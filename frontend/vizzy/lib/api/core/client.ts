/** API base URL from environment variables */
const API_URL = process.env.NEXT_PUBLIC_API_URL;
/** API version from environment variables */
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

/**
 * Constructs a complete API URL by combining the base URL, version, and endpoint
 * @param {string} endpoint - The API endpoint to append to the base URL
 * @returns {string} The complete API URL
 * @throws {Error} If API_URL or API_VERSION environment variables are not defined
 */
export const getApiUrl = (endpoint: string): string => {
  if (!API_URL || !API_VERSION) {
    throw new Error('API_URL or API_VERSION is not defined');
  }
  return `${API_URL}/${API_VERSION}/${endpoint}`;
};

/**
 * Creates headers for API requests with optional authentication token and extra headers
 * @param {string} [token] - Optional authentication token
 * @param {Record<string, string>} [extra] - Optional additional headers
 * @returns {HeadersInit} Headers object for fetch requests
 */
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

/**
 * HTTP request methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Options for API requests
 */
export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  endpoint: string;
  token?: string;
  body?: TBody;
  headers?: Record<string, string>;
  includeCredentials?: boolean;
}

/**
 * Generic API request function with proper typing
 * @param options - Request options including endpoint, method, body, etc.
 * @returns Promise resolving to the response data of type TResponse
 * @throws Error if the request fails
 */
export async function apiRequest<TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>
): Promise<TResponse> {
  const {
    method = 'GET',
    endpoint,
    token,
    body,
    headers = {},
    includeCredentials = true,
  } = options;

  const url = getApiUrl(endpoint);
  const requestHeaders = createAuthHeaders(token, headers);
  
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: includeCredentials ? 'include' : 'same-origin',
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      
      // For structured errors
      if (typeof errorData === 'object' && errorData !== null) {
        throw new Error(JSON.stringify(errorData));
      }
    } catch (e) {
      // If parsing fails, just use the status text
      if (!(e instanceof Error && e.message.startsWith('{'))) {
        errorMessage = response.statusText || errorMessage;
      } else {
        throw e;
      }
    }
    
    throw new Error(errorMessage);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as TResponse;
  }

  return await response.json() as TResponse;
}
