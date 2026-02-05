import type { Friend, FriendRequest, UserSearchResult } from '@/types/friend';
import { getSessionCacheWithSWR, invalidateSessionCache } from '@/utils/sessionCache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function buildAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await fetch(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }

  return response.json();
}

export async function getFriends(): Promise<Friend[]> {
  return getSessionCacheWithSWR('friends:list', 2 * 60 * 1000, async () => {
    const response = await fetch(`${API_URL}/api/friends`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar amigos');
    }

    return response.json();
  });
}

export async function sendFriendRequest(friendId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/${friendId}`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao enviar pedido de amizade');
  }

  invalidateSessionCache(['friends:requests:sent', 'friends:requests']);
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/accept/${requestId}`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao aceitar pedido de amizade');
  }

  invalidateSessionCache(['friends:requests', 'friends:list']);
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return getSessionCacheWithSWR('friends:requests', 2 * 60 * 1000, async () => {
    const response = await fetch(`${API_URL}/api/friends/requests`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar solicitações');
    }

    return response.json();
  });
}

export async function getSentFriendRequests(): Promise<FriendRequest[]> {
  return getSessionCacheWithSWR('friends:requests:sent', 2 * 60 * 1000, async () => {
    const response = await fetch(`${API_URL}/api/friends/requests/sent`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar solicitações enviadas');
    }

    return response.json();
  });
}

export async function deleteFriend(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/${id}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao remover amigo');
  }

  invalidateSessionCache(['friends:list']);
}
