import { isTokenExpired, readAccessToken } from "../lib/auth/helpers";
import refreshAccessToken from "../lib/auth/refreshAccessToken";

const endpoint = 'https://api.lens.dev';

export const fetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers']
): (() => Promise<TData>) => {
  async function getAccessToken() { // Authentication headers
    // Check local storage for access token
    const token = readAccessToken();
    if (!token) return null;
    let accessToken = token?.accessToken;

    // Check expiration of token
    if (isTokenExpired( token.exp )) {
      // Update token (using refresh) IF expired
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      accessToken = newToken;
    }

    return accessToken; // Return the access token
  };

  return async () => {
    const token = typeof window !=='undefined' ? await getAccessToken() : null; // Either a string or null (depending on auth/localStorage state)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options,
        'x-access-token': token ? token : '', // Lens auth token here (auth header
        'Access-Control-Allow-Origin': "*",
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  const json = await res.json()

  if (json.errors) {
    const { message } = json.errors[0] || {}
    throw new Error(message || 'Error…')
  }

  return json.data
  }
} 