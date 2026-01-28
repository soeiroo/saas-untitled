import type { Subscription } from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/subscriptions`, {
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Erro ao buscar assinaturas');
  return response.json();
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
  return response.json();
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
  return response.json();
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
}
