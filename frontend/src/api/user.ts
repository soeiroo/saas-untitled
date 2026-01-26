import type { User, UpdateUserData } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function setAuthToken(nextToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', nextToken);
  }
}

function buildAuthHeaders() {
  const authToken = getAuthToken();
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

function extractTokenFromHeaders(response: Response): string | null {
  const authorization = response.headers.get('authorization');
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  const xAuthToken = response.headers.get('x-auth-token') || response.headers.get('x-access-token');
  if (xAuthToken) return xAuthToken.trim();

  return null;
}

async function parseJsonSafely<T>(response: Response): Promise<T | undefined> {
  // Some backends reply with 204 No Content or an empty body even on success.
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Resposta inválida do servidor');
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    credentials: 'include',
    headers: {
      ...buildAuthHeaders(),
    },
  });
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Erro ao buscar dados do usuário';
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await parseJsonSafely<{ message?: string }>(response);
        errorMessage = errorData?.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }

  const data = await parseJsonSafely<User>(response);
  if (!data) {
    // Success but no JSON body
    throw new Error('Resposta inválida do servidor');
  }
  return data;
}

export async function updateCurrentUser(data: UpdateUserData): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...buildAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Erro ao atualizar dados do usuário';
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await parseJsonSafely<{ message?: string }>(response);
        errorMessage = errorData?.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }

  // If backend returns a refreshed token via headers, store it.
  const headerToken = extractTokenFromHeaders(response);
  if (headerToken) setAuthToken(headerToken);

  // Backend may return updated user JSON OR no content OR { user, token }.
  const body = await parseJsonSafely<any>(response);
  const bodyToken: string | undefined = body?.token || body?.accessToken;
  if (bodyToken) setAuthToken(bodyToken);

  // If email was changed and backend didn't refresh token, re-login to get a new one.
  if (data.email && data.currentPassword && !headerToken && !bodyToken) {
    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: data.email, password: data.currentPassword }),
      });
      if (loginResponse.ok) {
        const loginBody = await parseJsonSafely<any>(loginResponse);
        const nextToken: string | undefined = loginBody?.token || loginBody?.accessToken;
        if (nextToken) setAuthToken(nextToken);
      }
    } catch {
      // If re-login fails, keep the user updated but token might be invalid.
    }
  }

  const updatedUser: User | undefined = body?.user ?? body;
  if (updatedUser && typeof updatedUser === 'object' && 'email' in updatedUser) {
    return updatedUser as User;
  }

  // No body: fetch fresh user (and rely on stored token, if any).
  return getCurrentUser();
}

export async function deleteCurrentUser(): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'DELETE',
    headers: {
      ...buildAuthHeaders(),
    },
    credentials: 'include',
  });
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Erro ao deletar conta do usuário';
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await parseJsonSafely<{ message?: string }>(response);
        errorMessage = errorData?.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }
}
