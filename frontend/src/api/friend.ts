import type { Friend, FriendRequest, UserSearchResult } from '@/types/friend';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function buildAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await fetch(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }

  return response.json();
}

export async function getFriends(): Promise<Friend[]> {
  const response = await fetch(`${API_URL}/api/friends`, {
    method: 'GET',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar amigos');
  }

  return response.json();
}

export async function sendFriendRequest(friendId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/${friendId}`, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao enviar pedido de amizade');
  }
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/accept/${requestId}`, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao aceitar pedido de amizade');
  }
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  const response = await fetch(`${API_URL}/api/friends/requests`, {
    method: 'GET',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar solicitações');
  }

  return response.json();
}

export async function deleteFriend(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/${id}`, {
    method: 'DELETE',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao remover amigo');
  }
}
