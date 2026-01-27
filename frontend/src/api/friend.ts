import type { Friend } from '@/types/friend';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export const token = getAuthToken();

export async function getFriends(): Promise<Friend[]> {
  const response = await fetch(`${API_URL}/friends`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar amigos');
  }

  return response.json();
}

export async function addFriend(friend: Omit<Friend, 'id' | 'userId' | 'addedAt'>): Promise<Friend> {
  const response = await fetch(`${API_URL}/friends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(friend),
  });

  if (!response.ok) {
    throw new Error('Erro ao adicionar amigo');
  }

  return response.json();
}

export async function deleteFriend(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/friends/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao remover amigo');
  }
}
