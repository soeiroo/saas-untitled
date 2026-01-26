import type { User, UpdateUserData } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export const token = getAuthToken();

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Backend may return updated user JSON OR no content. Handle both.
  const updated = await parseJsonSafely<User>(response);
  if (updated) return updated;
  return getCurrentUser();
}

export async function deleteCurrentUser(): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
