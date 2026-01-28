'use client';

import { useState, useEffect } from 'react';
import { getFriends, addFriend, deleteFriend } from '@/api/friend';
import { AddFriendDialog } from '@/components/friend/AddFriendDialog';
import { FriendCard } from '@/components/friend/FriendCard';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Users, Search, Sparkles, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Friend } from '@/types/friend';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFetchingFriends, setIsFetchingFriends] = useState(false);
//   const [isMutatingFriends, setIsMutatingFriends] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
        const friendsList = await getFriends();
        setFriends(friendsList);
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

  const handleAddFriend = async (newFriend: Omit<Friend, 'id' | 'userId' | 'addedAt'>) => {
    // setIsMutatingFriends(true);
    setError('');
    try {
      const created = await addFriend(newFriend);
      setFriends(prev => [...prev, created]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao adicionar amigo');
      }
    } finally {
    //   setIsMutatingFriends(false);
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
    console.log('Ação secundária para:', friend);
  };

  const filteredFriends = friends.filter(friend => {
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
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 relative">
              <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold">
                    Oi{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="text-zinc-500">Gerencie seus amigos</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="hidden lg:block">
                    <LogoutButton floating={false} className="relative" />
                  </div>
                </div>
              </header>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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

              <div className="flex flex-col items-center mb-8 gap-4 w-full">
                <div className="relative w-full max-w-2xl flex justify-center">
                  <Search className="h-5 w-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar por nome ou email"
                    className="pl-14 py-5 text-lg bg-zinc-900/80 border-zinc-800 text-zinc-100 rounded-2xl w-full shadow-md"
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="cursor-pointer">
                    <AddFriendDialog onAdd={handleAddFriend} />
                  </div>
                </div>
              </div>

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
                    {friends.length === 0 ? 'Nenhum amigo adicionado' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-zinc-500">
                    {friends.length === 0
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
    </div>
  );
}