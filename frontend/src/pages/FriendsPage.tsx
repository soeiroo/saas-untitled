'use client';

import { useState, useEffect } from 'react';
import { getFriends, getFriendRequests, getSentFriendRequests, acceptFriendRequest, deleteFriend } from '@/api/friend';
import { getSubscriptions, shareSubscriptionWithFriend } from '@/api/subscription';
import { AddFriendDialog } from '@/components/friend/AddFriendDialog';
import { FriendCard } from '@/components/friend/FriendCard';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Friend, FriendRequest } from '@/types/friend';
import type { Subscription } from '@/types/subscription';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingFriends, setIsFetchingFriends] = useState(false);
  //   const [isMutatingFriends, setIsMutatingFriends] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [actionFriend, setActionFriend] = useState<Friend | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [sharePrice, setSharePrice] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    async function fetchFriends() {
      setIsFetchingFriends(true);
      setError('');
      try {
        try {
          const me = await getCurrentUser();
          setCurrentUser(me);
        } catch {
        }
        const [friendsList, pendingRequests, mySentRequests, mySubscriptions] = await Promise.all([
          getFriends(),
          getFriendRequests(),
          getSentFriendRequests(),
          getSubscriptions(),
        ]);
        setFriends(friendsList);
        setRequests(pendingRequests);
        setSentRequests(mySentRequests);
        setSubscriptions(mySubscriptions);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Erro ao buscar amigos');
        }
      } finally {
        setIsFetchingFriends(false);
      }
    }
    fetchFriends();
  }, []);

  useEffect(() => {
    if (actionFriend && !selectedSubscriptionId && subscriptions.length > 0) {
      setSelectedSubscriptionId(subscriptions[0].id);
    }
  }, [actionFriend, selectedSubscriptionId, subscriptions]);

  const refreshFriends = async () => {
    try {
      const [friendsList, pendingRequests, mySentRequests, mySubscriptions] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getSentFriendRequests(),
        getSubscriptions(),
      ]);
      setFriends(friendsList);
      setRequests(pendingRequests);
      setSentRequests(mySentRequests);
      setSubscriptions(mySubscriptions);
    } catch {
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setError('');
    try {
      await acceptFriendRequest(requestId);
      const [friendsList, pendingRequests] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsList);
      setRequests(pendingRequests);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao aceitar pedido');
      }
    }
  };

  const handleDeleteFriend = async (id: string) => {
    // setIsMutatingFriends(true);
    setDeletingId(id);
    setError('');
    try {
      await deleteFriend(id);
      setFriends(prev => prev.filter(friend => friend.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao remover amigo');
      }
    } finally {
      setDeletingId(null);
      //   setIsMutatingFriends(false);
    }
  };

  const handleSecondaryAction = (friend: Friend) => {
    setActionFriend(friend);
    setActionError('');
    setActionSuccess('');
    if (!selectedSubscriptionId && subscriptions.length > 0) {
      setSelectedSubscriptionId(subscriptions[0].id);
    }
  };

  const handleShareSubscription = async () => {
    if (!actionFriend) return;
    if (!selectedSubscriptionId) {
      setActionError('Selecione uma assinatura para compartilhar.');
      return;
    }

    const trimmed = sharePrice.trim();
    const parsedPrice = trimmed ? Number(trimmed.replace(',', '.')) : undefined;
    if (trimmed && (parsedPrice === undefined || Number.isNaN(parsedPrice))) {
      setActionError('Informe um valor válido para a mensalidade compartilhada.');
      return;
    }

    setIsSharing(true);
    setActionError('');
    try {
      await shareSubscriptionWithFriend(selectedSubscriptionId, actionFriend.id, parsedPrice);
      toast.success('Assinatura compartilhada com sucesso.');
      setActionSuccess('Assinatura compartilhada com sucesso.');
      setActionFriend(null);
      setSharePrice('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Erro ao compartilhar assinatura.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const pendingFriendIds = new Set(requests.map(request => request.userId));
  const visibleFriends = friends.filter(friend => !pendingFriendIds.has(friend.id));

  const filteredFriends = visibleFriends.filter(friend => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      friend.name.toLowerCase().includes(query) ||
      friend.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex">

          <Sidebar activePage="friends" />

          <main className="flex-1 lg:pl-6">
            <MobileAppMenu title="Meus Amigos" />
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 relative">
              <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">
                    Amigos
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="hidden lg:block">
                    <LogoutButton floating={false} className="relative" />
                  </div>
                </div>
              </header>

              <Card className="relative overflow-hidden mb-8 bg-zinc-900/70 border-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%),radial-gradient(circle_at_85%_10%,_rgba(139,92,246,0.14),_transparent_40%)]" />
                <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Rede</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white">Gerencie suas conexões</h2>
                    <p className="text-sm text-zinc-400 max-w-lg">
                      Aceite convites, organize contatos e compartilhe serviços com segurança.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <AddFriendDialog onRequestSent={refreshFriends} />
                  </div>
                </div>
              </Card>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Total de amigos</p>
                      <p className="text-3xl text-white">{visibleFriends.length}</p>
                      <p className="text-xs text-zinc-500 mt-2">Conexões ativas</p>
                    </div>
                    <Users className="h-10 w-10 text-emerald-400" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Solicitações</p>
                      <p className="text-3xl text-white">{requests.length}</p>
                      <p className="text-xs text-zinc-500 mt-2">Pendentes</p>
                    </div>
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Assinaturas</p>
                      <p className="text-3xl text-white">{subscriptions.length}</p>
                      <p className="text-xs text-zinc-500 mt-2">Disponíveis para compartilhar</p>
                    </div>
                    <Sparkles className="h-10 w-10 text-yellow-400" />
                  </div>
                </Card>
              </section>

              {requests.length > 0 && (
                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">Pedidos de amizade recebidos</h2>
                  </div>
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <div
                        key={request.requestId}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{request.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{request.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(request.requestId)}
                          className="text-xs px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          Aceitar
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {sentRequests.length > 0 && (
                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">Solicitações enviadas</h2>
                  </div>
                  <div className="space-y-2">
                    {sentRequests.map((request) => (
                      <div
                        key={request.requestId}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{request.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{request.email}</p>
                        </div>
                        <span className="text-xs px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 cursor-default">
                          Pendente
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Total de Amigos</p>
                      <p className="text-3xl text-white">{friends.length}</p>
                      <p className="text-xs text-zinc-500 mt-2">Atualizado hoje</p>
                    </div>
                    <Users className="h-10 w-10 text-emerald-400" />
                  </div>
                </Card> 

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Adicionados Hoje</p>
                      <p className="text-3xl text-white">0</p>
                      <p className="text-xs text-zinc-500 mt-2">Últimas 24 horas</p>
                    </div>
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Esta Semana</p>
                      <p className="text-3xl text-white">0</p>
                      <p className="text-xs text-zinc-500 mt-2">Últimos 7 dias</p>
                    </div>
                    <Users className="h-10 w-10 text-yellow-500" />
                  </div>
                </Card>
            </section> */}

              <Card className="bg-zinc-900/70 border-zinc-800 p-5 shadow-lg shadow-black/20 mb-8">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="relative w-full">
                    <Search className="h-5 w-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por nome ou email"
                      className="pl-14 py-5 text-lg bg-zinc-900/80 border-zinc-800 text-zinc-100 rounded-2xl w-full shadow-md"
                    />
                  </div>
                </div>
              </Card>

              {(isFetchingFriends) && friends.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {deletingId
                      ? 'Removendo amigo…'
                      : isFetchingFriends
                        ? 'Atualizando lista…'
                        : 'Salvando alterações…'}
                  </span>
                </div>
              )}

              {isFetchingFriends && friends.length === 0 ? (
                <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Carregando amigos…</span>
                </div>
              ) : filteredFriends.length === 0 ? (
                <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                  <p className="text-zinc-400 text-lg mb-2">
                    {visibleFriends.length === 0 ? 'Nenhum amigo adicionado' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-zinc-500">
                    {visibleFriends.length === 0
                      ? 'Clique em "Novo Amigo" para começar'
                      : 'Tente outro termo de busca'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map(friend => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      onDelete={handleDeleteFriend}
                      onSecondaryAction={handleSecondaryAction}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog
        open={!!actionFriend}
        onOpenChange={(open) => {
          if (!open) {
            setActionFriend(null);
            setActionError('');
            setActionSuccess('');
            setSharePrice('');
            setSelectedSubscriptionId('');
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Ações com amigo</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Compartilhe uma assinatura com {actionFriend?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Assinatura</label>
              <select
                value={selectedSubscriptionId}
                onChange={(e) => setSelectedSubscriptionId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2"
              >
                <option value="" disabled>
                  {subscriptions.length === 0 ? 'Nenhuma assinatura disponível' : 'Selecione uma assinatura'}
                </option>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Valor (opcional)</label>
              <Input
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                placeholder="Ex: 19,90"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {actionError && (
              <p className="text-sm text-red-400">{actionError}</p>
            )}
            {actionSuccess && (
              <p className="text-sm text-emerald-400">{actionSuccess}</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setActionFriend(null)}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-md px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleShareSubscription}
              disabled={isSharing || subscriptions.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 disabled:opacity-60"
            >
              {isSharing ? 'Compartilhando...' : 'Compartilhar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}