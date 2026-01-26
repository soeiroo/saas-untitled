import type { Subscription } from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function buildAuthHeaders() {
  const authToken = getAuthToken();
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await fetch(`${API_URL}/api/subscriptions`, {
    credentials: 'include',
    headers: {
      ...buildAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Erro ao buscar assinaturas');
  return response.json();
}

export async function addSubscription(data: Omit<Subscription, 'id' | 'userId'>): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...buildAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao adicionar assinatura');
  return response.json();
}

export async function updateSubscription(id: string, data: Partial<Omit<Subscription, 'userId'>>): Promise<Subscription> {
  const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...buildAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar assinatura');
  return response.json();
}

export async function deleteSubscription(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...buildAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error('Erro ao deletar assinatura');
}
