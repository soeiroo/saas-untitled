'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSubscriptions, getSharedSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '@/api/subscription';
import { AddSubscriptionDialog } from '@/components/subscription/AddSubscriptionDialog';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Bell, TrendingUp, Search, Sparkles, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Subscription } from '@/types/subscription';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { StatCounter } from '@/components/common/StatCounter';

type HomePageProps = {
  activePage?: 'overview' | 'subscriptions' | 'friends' | 'reports' | 'settings';
};

export default function HomePage({ activePage = 'overview' }: HomePageProps) {
  
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);
  const [sharedSubscriptions, setSharedSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(true);
  const [isMutatingSubscriptions, setIsMutatingSubscriptions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'renewal-asc' | 'price-desc' | 'price-asc' | 'name-asc'>('renewal-asc');

  useEffect(() => {
    async function fetchSubs() {
      setIsFetchingSubscriptions(true);
      setError('');
      try {
        const [subs, sharedSubs] = await Promise.all([
          getSubscriptions(),
          getSharedSubscriptions(),
        ]);
        setMySubscriptions(subs);
        setSharedSubscriptions(sharedSubs);
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

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handle);
  }, [searchQuery]);


  const handleAddSubscription = async (newSub: Omit<Subscription, 'id' | 'userId' >) => {
    setIsMutatingSubscriptions(true);
    setError('');
    try {
      const created = await addSubscription(newSub);
      setMySubscriptions(prev => [...prev, created]);
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
      setMySubscriptions(prev => prev.filter(sub => sub.id !== id));
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
      setMySubscriptions(prev => prev.map(sub => sub.id === result.id ? result : sub));
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

  const allSubscriptions = useMemo(
    () => [...mySubscriptions, ...sharedSubscriptions],
    [mySubscriptions, sharedSubscriptions],
  );
  const sharedIds = useMemo(
    () => new Set(sharedSubscriptions.map(sub => sub.id)),
    [sharedSubscriptions],
  );

  const totalMonthly = mySubscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalYearly = totalMonthly * 12;

  const baseSubscriptions = useMemo(() => {
    if (activeTab === 'mine') return mySubscriptions;
    if (activeTab === 'shared') return sharedSubscriptions;
    return allSubscriptions;
  }, [activeTab, mySubscriptions, sharedSubscriptions, allSubscriptions]);

  const upcomingRenewals = baseSubscriptions.filter(sub => {
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

  const categories = useMemo(
    () => Array.from(new Set(allSubscriptions.map(sub => sub.category).filter(Boolean))).sort(),
    [allSubscriptions],
  );

  const filteredSubscriptions = baseSubscriptions
    .filter(sub => {
      if (categoryFilter !== 'all' && sub.category !== categoryFilter) return false;
      if (!debouncedSearch) return true;
      return (
        sub.name.toLowerCase().includes(debouncedSearch) ||
        sub.category.toLowerCase().includes(debouncedSearch) ||
        sub.plan.toLowerCase().includes(debouncedSearch)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'renewal-asc':
        default:
          return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex">
          
          <Sidebar activePage={activePage} />

          <main className="flex-1 lg:pl-6">
            <MobileAppMenu title="Assinaturas Pro" />
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 sm:py-10 relative">
              <header className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">
                    Assinaturas
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* <Badge className="bg-zinc-900/70 text-zinc-300 border border-zinc-800">Total: {subscriptions.length}</Badge> */}
                  <div className="hidden lg:block">
                    <LogoutButton floating={false} className="relative" />
                  </div>
                </div>
              </header>

              <Card className="relative overflow-hidden mb-6 sm:mb-8 bg-zinc-900/70 border-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%),radial-gradient(circle_at_85%_10%,_rgba(139,92,246,0.14),_transparent_40%)]" />
                <div className="relative px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Assinaturas</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white">Gerencie tudo em um só lugar</h2>
                    <p className="text-sm text-zinc-400 max-w-lg">
                      Organize seus planos, acompanhe gastos e compartilhe serviços com facilidade.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <AddSubscriptionDialog onAdd={handleAddSubscription} />
                  </div>
                </div>
              </Card>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <section className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                        R$ <StatCounter target={totalYearly} start={!isFetchingSubscriptions} formatter={(value) => value.toFixed(2).replace('.', ',')} />
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
                      <p className="text-3xl text-white">
                        <StatCounter target={upcomingRenewals} start={!isFetchingSubscriptions} />
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">Na aba atual</p>
                    </div>
                    <Bell className="h-10 w-10 text-yellow-500" />
                  </div>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800 p-6 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Compartilhadas</p>
                      <p className="text-3xl text-white">
                        <StatCounter target={sharedSubscriptions.length} start={!isFetchingSubscriptions} />
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">Recebidas de amigos</p>
                    </div>
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                </Card>
              </section>

              <div className="flex flex-col items-center mb-6 sm:mb-8 gap-4 sm:gap-5 w-full">
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as 'all' | 'mine' | 'shared')}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="bg-zinc-900/80 border border-zinc-800 w-full flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
                      <TabsTrigger
                        value="all"
                        className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[120px]"
                      >
                        Todas
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          <StatCounter target={allSubscriptions.length} start={!isFetchingSubscriptions} />
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="mine"
                        className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[120px]"
                      >
                        Minhas
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          <StatCounter target={mySubscriptions.length} start={!isFetchingSubscriptions} />
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="shared"
                        className="text-zinc-200 data-[state=active]:bg-white data-[state=active]:text-zinc-900 flex-1 min-w-[140px]"
                      >
                        Compartilhadas
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          <StatCounter target={sharedSubscriptions.length} start={!isFetchingSubscriptions} />
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <div className="rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-300 bg-zinc-900/70 border border-zinc-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Insights atualizados hoje
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col lg:flex-row items-center gap-4 sm:gap-5">
                  <div className="relative w-full">
                    <Search className="h-5 w-5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por nome, categoria ou plano"
                      className="pl-14 py-5 text-lg bg-zinc-900/80 border-zinc-800 text-zinc-100 rounded-2xl w-full shadow-md"
                    />
                  </div>
                  <div className="flex w-full lg:w-auto gap-3 sm:gap-4">
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="w-full lg:w-56 bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-2xl px-4 py-3 shadow-md"
                    >
                      <option value="all">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                      className="w-full lg:w-48 bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-2xl px-4 py-3 shadow-md"
                    >
                      <option value="renewal-asc">Próxima cobrança</option>
                      <option value="price-desc">Maior preço</option>
                      <option value="price-asc">Menor preço</option>
                      <option value="name-asc">Nome A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  {/* <p className="text-sm text-zinc-500">Ações rápidas</p> */}
                  {/* <p className="text-base">Gerencie suas assinaturas</p> */}
                </div>
              </section>

              {(isFetchingSubscriptions || isMutatingSubscriptions) && allSubscriptions.length > 0 && (
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

              {isFetchingSubscriptions && allSubscriptions.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Card
                      key={`skeleton-${idx}`}
                      className="bg-zinc-900/60 border-zinc-800 p-5 shadow-lg shadow-black/20 animate-pulse"
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-800 mb-4" />
                      <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-zinc-800 rounded mb-4" />
                      <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                    </Card>
                  ))}
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                  <p className="text-zinc-400 text-lg mb-2">
                    {baseSubscriptions.length === 0 ? 'Nenhuma assinatura encontrada' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-zinc-500">
                    {baseSubscriptions.length === 0
                      ? activeTab === 'shared'
                        ? 'Assim que alguém compartilhar, elas aparecem aqui.'
                        : 'Clique em "Nova Assinatura" para começar'
                      : 'Tente outro termo de busca'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      isShared={sharedIds.has(subscription.id)}
                      onDelete={sharedIds.has(subscription.id) ? undefined : handleDeleteSubscription}
                      onEdit={sharedIds.has(subscription.id) ? undefined : handleEditSubscription}
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

