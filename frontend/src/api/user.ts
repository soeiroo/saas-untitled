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
  if (!response.ok) throw new Error('Erro ao buscar dados do usuário');
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
  if (!response.ok) throw new Error('Erro ao atualizar dados do usuário');
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
  if (!response.ok) throw new Error('Erro ao deletar conta do usuário');
}
