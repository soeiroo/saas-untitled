'use client';

import { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '@/api/subscription';
import { AddSubscriptionDialog } from '@/components/subscription/AddSubscriptionDialog';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { DollarSign, Bell, TrendingUp, Search, Sparkles, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Subscription } from '@/types/subscription';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';

export default function HomePage() {
  
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(false);
  const [isMutatingSubscriptions, setIsMutatingSubscriptions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchSubs() {
      setIsFetchingSubscriptions(true);
      setError('');
      try {
        try {
          const me = await getCurrentUser();
          setCurrentUser(me);
        } catch {
        }
        const subs = await getSubscriptions();
        setSubscriptions(subs);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Erro ao buscar assinaturas');
        }
      } finally {
        setIsFetchingSubscriptions(false);
      }
    }
    fetchSubs();
  }, []);


  const handleAddSubscription = async (newSub: Omit<Subscription, 'id' | 'userId' >) => {
    setIsMutatingSubscriptions(true);
    setError('');
    try {
      const created = await addSubscription(newSub);
      setSubscriptions(prev => [...prev, created]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao adicionar assinatura');
      }
    } finally {
      setIsMutatingSubscriptions(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    setIsMutatingSubscriptions(true);
    setDeletingId(id);
    setError('');
    try {
      await deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao deletar assinatura');
      }
    } finally {
      setDeletingId(null);
      setIsMutatingSubscriptions(false);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleUpdateSubscription = async (updated: Subscription) => {
    setIsMutatingSubscriptions(true);
    setError('');
    try {
      const result = await updateSubscription(updated.id, updated);
      setSubscriptions(prev => prev.map(sub => sub.id === result.id ? result : sub));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erro ao atualizar assinatura');
      }
    } finally {
      setIsMutatingSubscriptions(false);
    }
  };

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalYearly = totalMonthly * 12;

  const upcomingRenewals = subscriptions.filter(sub => {
    const daysUntilRenewal = Math.ceil(
      (new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
  }).length;

  // const nearestRenewalDays = (() => {
  //   if (!subscriptions.length) return null;
  //   const futureDays = subscriptions
  //     .map(sub => Math.ceil((new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  //     .filter(days => days >= 0);
  //   if (!futureDays.length) return null;
  //   return Math.min(...futureDays);
  // })();

  const filteredSubscriptions = subscriptions.filter(sub => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      sub.name.toLowerCase().includes(query) ||
      sub.category.toLowerCase().includes(query) ||
      sub.plan.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex">
          
          <Sidebar activePage="overview" />

          <main className="flex-1 lg:pl-6">
            <MobileAppMenu title="Assinaturas Pro" />
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 relative">
              <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold">
                    Oi{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="text-zinc-500">Aqui estão suas assinaturas</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* <Badge className="bg-zinc-900/70 text-zinc-300 border border-zinc-800">Total: {subscriptions.length}</Badge> */}
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

              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Gasto Mensal</p>
                      <p className="text-3xl text-white">
                        R$ {totalMonthly.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">Atualizado hoje</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-purple-500" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Gasto Anual</p>
                      <p className="text-3xl text-white">
                        R$ {totalYearly.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">Projeção de 12 meses</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-emerald-400" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Cobranças Próximas</p>
                      <p className="text-3xl text-white">{upcomingRenewals}</p>
                      <p className="text-zinc-500 text-xs mt-1">Próximos 7 dias</p>
                    </div>
                    <Bell className="h-10 w-10 text-yellow-500" />
                  </div>
                </Card>
              </section>

              <div className="flex flex-col items-center mb-8 gap-4 w-full">
                <div className="relative w-full max-w-2xl flex justify-center">
                  <Search className="h-5 w-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar por nome, categoria ou plano"
                    className="pl-14 py-5 text-lg bg-zinc-900/80 border-zinc-800 text-zinc-100 rounded-2xl w-full shadow-md"
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="rounded-xl px-3 py-2 text-xs text-zinc-300 bg-zinc-900/70 border border-zinc-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Insights atualizados hoje
                  </div>
                  <div>
                    <AddSubscriptionDialog onAdd={handleAddSubscription} />
                  </div>
                </div>
              </div>

              <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  {/* <p className="text-sm text-zinc-500">Ações rápidas</p> */}
                  {/* <p className="text-base">Gerencie suas assinaturas</p> */}
                </div>
              </section>

              {(isFetchingSubscriptions || isMutatingSubscriptions) && subscriptions.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {deletingId
                      ? 'Removendo assinatura…'
                      : isFetchingSubscriptions
                        ? 'Atualizando assinaturas…'
                        : 'Salvando alterações…'}
                  </span>
                </div>
              )}

              {isFetchingSubscriptions && subscriptions.length === 0 ? (
                <Card className="bg-zinc-900/80 border-zinc-800 p-10 text-center shadow-lg shadow-black/20">
                  <p className="text-zinc-400 text-base mb-1">Carregando assinaturas…</p>
                  <p className="text-zinc-500 text-sm">Só um instante</p>
                </Card>
              ) : filteredSubscriptions.length === 0 ? (
                <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                  <p className="text-zinc-400 text-lg mb-2">
                    {subscriptions.length === 0 ? 'Nenhuma assinatura cadastrada' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-zinc-500">
                    {subscriptions.length === 0
                      ? 'Clique em "Nova Assinatura" para começar'
                      : 'Tente outro termo de busca'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onDelete={handleDeleteSubscription}
                      onEdit={handleEditSubscription}
                    />
                  ))}
                </div>
              )}

              <EditSubscriptionDialog
                subscription={editingSubscription}
                open={editDialogOpen}
                onClose={() => {
                  setEditDialogOpen(false);
                  setEditingSubscription(null);
                }}
                onUpdate={handleUpdateSubscription}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

