import type { User, UpdateUserData } from '@/types/user';
import { clearSessionUserId, getSessionCache, invalidateSessionCache, setSessionCache, setSessionUserId } from '@/utils/sessionCache';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringField(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const maybe = value[key];
  return typeof maybe === 'string' ? maybe : undefined;
}

function isUser(value: unknown): value is User {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string'
  );
}

async function parseJsonSafely<T>(response: Response): Promise<T | undefined> {
  // Às vezes vem 204 ou body vazio mesmo dando certo.
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
  const cached = getSessionCache<User>('user:me');
  if (cached) {
    void (async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          credentials: 'include',
          headers: {
            ...buildAuthHeaders(),
          },
        });
        if (!response.ok) return;
        const data = await parseJsonSafely<User>(response);
        if (!data) return;
        setSessionUserId(data.id);
        setSessionCache('user:me', data, 5 * 60 * 1000);
      } catch {
        // ignore background refresh errors
      }
    })();
    return cached;
  }

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
      } catch {
      }
    }
    throw new Error(errorMessage);
  }

  const data = await parseJsonSafely<User>(response);
  if (!data) {
    throw new Error('Resposta inválida do servidor');
  }

  setSessionUserId(data.id);
  setSessionCache('user:me', data, 5 * 60 * 1000);
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
      } catch {
      }
    }
    throw new Error(errorMessage);
  }

  const headerToken = extractTokenFromHeaders(response);
  if (headerToken) setAuthToken(headerToken);

  const body = await parseJsonSafely<unknown>(response);
  const bodyToken: string | undefined = getStringField(body, 'token') || getStringField(body, 'accessToken');
  if (bodyToken) setAuthToken(bodyToken);

  // Se trocou o email e não veio token novo, tenta logar de novo.
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
        const loginBody = await parseJsonSafely<unknown>(loginResponse);
        const nextToken: string | undefined = getStringField(loginBody, 'token') || getStringField(loginBody, 'accessToken');
        if (nextToken) setAuthToken(nextToken);
      }
    } catch {
      // se falhar, paciência: user atualiza, mas o token pode ficar velho.
    }
  }

  const updatedUser: unknown = isRecord(body) && 'user' in body ? body.user : body;
  if (isUser(updatedUser)) {
    setSessionUserId(updatedUser.id);
    setSessionCache('user:me', updatedUser, 5 * 60 * 1000);
    return updatedUser;
  }

  invalidateSessionCache(['user:me']);
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
      } catch {
      }
    }
    throw new Error(errorMessage);
  }

  invalidateSessionCache(['user:me']);
  clearSessionUserId();
}
