import type { User, UpdateUserData } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export const token = getAuthToken();

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
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Resposta inválida do servidor');
  }
  
  return response.json();
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
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Resposta inválida do servidor');
  }
  
  return response.json();
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
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    throw new Error(errorMessage);
  }
}
