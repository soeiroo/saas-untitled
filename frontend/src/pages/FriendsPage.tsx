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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Friend, FriendRequest } from '@/types/friend';
import type { Subscription } from '@/types/subscription';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingFriends, setIsFetchingFriends] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFriend, setActionFriend] = useState<Friend | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [sharePrice, setSharePrice] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent'>('friends');

  useEffect(() => {
    async function fetchFriends() {
      setIsFetchingFriends(true);
      setError('');
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
      // ignore
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
      toast.success('Pedido de amizade aceito!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao aceitar pedido');
      }
    }
  };

  const handleDeleteFriend = async (id: string) => {
    setError('');
    try {
      await deleteFriend(id);
      setFriends(prev => prev.filter(friend => friend.id !== id));
      toast.success('Amigo removido com sucesso');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao remover amigo');
      }
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
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 sm:py-10 relative">
              <header className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
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

              <Card className="relative overflow-hidden mb-6 sm:mb-8 bg-zinc-900/70 border-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%),radial-gradient(circle_at_85%_10%,_rgba(139,92,246,0.14),_transparent_40%)]" />
                <div className="relative px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Rede</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white">Gerencie suas conexões</h2>
                    <p className="text-sm text-zinc-400 max-w-lg">
                      Adicione amigos e compartilhe assinaturas com facilidade.
                    </p>
                  </div>
                </div>
              </Card>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center mb-6 sm:mb-8 gap-4 sm:gap-5 w-full">
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as 'friends' | 'requests' | 'sent')}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="bg-zinc-900/80 border border-zinc-800 w-full flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
                      <TabsTrigger value="friends" className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[120px]">
                        Amigos
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          {visibleFriends.length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="requests" className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[120px]">
                        Solicitações
                        {requests.length > 0 && (
                          <span className="ml-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px]">
                            {requests.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="sent" className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[120px]">
                        Enviadas
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          {sentRequests.length}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full lg:w-auto">
                    <AddFriendDialog onRequestSent={refreshFriends} />
                  </div>
                </div>

                {activeTab === 'friends' && (
                  <div className="w-full flex flex-col lg:flex-row items-center gap-4 sm:gap-5 animate-in fade-in duration-300">
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
                )}
              </div>

              {(isFetchingFriends) && friends.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Atualizando lista…</span>
                </div>
              )}

              {/* TAB CONTENT: Meus Amigos */}
              {activeTab === 'friends' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 delay-100">
                  {isFetchingFriends && friends.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <Card key={idx} className="bg-zinc-900/60 border-zinc-800 p-6 h-32 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                      <p className="text-zinc-400 text-lg mb-2">
                        {visibleFriends.length === 0 ? 'Nenhum amigo adicionado' : 'Nenhum resultado encontrado'}
                      </p>
                      <p className="text-zinc-500">
                        {visibleFriends.length === 0
                          ? 'Clique em "Novo Amigo" para começar a adicionar conexões.'
                          : 'Tente outro termo de busca.'}
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
              )}

              {/* TAB CONTENT: Solicitações */}
              {activeTab === 'requests' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 delay-100">
                  {requests.length === 0 ? (
                    <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                      <p className="text-zinc-400 text-lg">Nenhuma solicitação pendente</p>
                      <p className="text-zinc-500 text-sm mt-1">Você não tem novos pedidos de amizade no momento.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {requests.map((request) => (
                        <Card key={request.requestId} className="bg-zinc-900/80 border-zinc-800 p-3 flex flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center border border-zinc-700/50 overflow-hidden">
                              {request.profilePicture ? (
                                <ImageWithFallback src={request.profilePicture} alt={request.name} className="h-full w-full object-cover" />
                              ) : (
                                <Users className="h-4 w-4 text-zinc-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{request.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{request.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(request.requestId)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium text-xs whitespace-nowrap"
                          >
                            Aceitar
                          </button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: Enviadas */}
              {activeTab === 'sent' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 delay-100">
                  {sentRequests.length === 0 ? (
                    <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                      <p className="text-zinc-400 text-lg">Nenhuma solicitação enviada</p>
                      <p className="text-zinc-500 text-sm mt-1">Seus pedidos de amizade pendentes aparecerão aqui.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sentRequests.map((request) => (
                        <Card key={request.requestId} className="bg-zinc-900/80 border-zinc-800 p-3 flex flex-row items-center justify-between gap-4 opacity-75 hover:opacity-100 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50 overflow-hidden">
                              {request.profilePicture ? (
                                <ImageWithFallback src={request.profilePicture} alt={request.name} className="h-full w-full object-cover" />
                              ) : (
                                <ArrowRight className="h-4 w-4 text-zinc-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-300 truncate">{request.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{request.email}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-default font-medium whitespace-nowrap">
                            Pendente
                          </span>
                        </Card>
                      ))}
                    </div>
                  )}
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