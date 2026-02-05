import type { Subscription } from '@/types/subscription';
import type { SubscriptionFriend } from '@/types/subscriptionFriend';
import { getSessionCacheWithSWR, invalidateSessionCache } from '@/utils/sessionCache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return getSessionCacheWithSWR('subscriptions:list', 2 * 60 * 1000, async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error('Erro ao buscar assinaturas');
    return response.json();
  });
}

export async function getSharedSubscriptions(): Promise<Subscription[]> {
  return getSessionCacheWithSWR('subscriptions:shared', 2 * 60 * 1000, async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/subscriptions/shared`, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error('Erro ao buscar assinaturas compartilhadas');
    return response.json();
  });
}

export async function addSubscription(data: Omit<Subscription, 'id' | 'userId'>): Promise<Subscription> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao adicionar assinatura');
  const created = await response.json();
  invalidateSessionCache(['subscriptions:list', 'subscriptions:shared']);
  return created;
}

export async function updateSubscription(id: string, data: Partial<Omit<Subscription, 'userId'>>): Promise<Subscription> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar assinatura');
  const updated = await response.json();
  invalidateSessionCache(['subscriptions:list', 'subscriptions:shared', `subscription:friends:${id}`]);
  return updated;
}

export async function deleteSubscription(id: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Erro ao deletar assinatura');
  invalidateSessionCache(['subscriptions:list', 'subscriptions:shared', `subscription:friends:${id}`]);
}

export async function shareSubscriptionWithFriend(
  subscriptionId: string,
  friendId: string,
  price?: number,
): Promise<void> {
  const token = getAuthToken();
  const hasPrice = typeof price === 'number' && !Number.isNaN(price);
  const response = await fetch(`${API_URL}/api/subscriptions/${subscriptionId}/friends/${friendId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(hasPrice ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(hasPrice ? { body: JSON.stringify({ price }) } : {}),
  });
  if (!response.ok) throw new Error('Erro ao compartilhar assinatura');
  invalidateSessionCache([`subscription:friends:${subscriptionId}`]);
}

export async function getSubscriptionFriends(subscriptionId: string): Promise<SubscriptionFriend[]> {
  return getSessionCacheWithSWR(`subscription:friends:${subscriptionId}`, 2 * 60 * 1000, async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/subscriptions/${subscriptionId}/friends`, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error('Erro ao buscar amigos da assinatura');
    return response.json();
  });
}
