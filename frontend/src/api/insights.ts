const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export async function getAIInsights(): Promise<string> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const response = await fetch(`${API_URL}/api/subscriptions/advice`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 403) {
      throw new Error('Acesso negado. Esta funcionalidade é exclusiva para usuários Premium.');
    }
    if (response.status === 500) {
      throw new Error('Erro ao processar insights. Tente novamente em alguns instantes.');
    }
    throw new Error('Erro ao obter insights da IA');
  }

  const text = await response.text();
  
  // Valida se retornou conteúdo válido
  if (!text || text.trim() === '') {
    throw new Error('Nenhum insight foi gerado. Tente novamente mais tarde.');
  }

  return text;
}
