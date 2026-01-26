'use client';

import { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '@/api/subscription';
import { AddSubscriptionDialog } from '@/components/subscription/AddSubscriptionDialog';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Bell,
  TrendingUp,
  Search,
  Sparkles,
  Loader2,
  LayoutDashboard,
  CreditCard,
  Settings,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import type { Subscription } from '@/types/subscription';
import LogoutButton from '@/components/ui/LogoutButton';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomePage() {
  const router = useRouter();
  
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(false);
  const [isMutatingSubscriptions, setIsMutatingSubscriptions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions'>('overview');

  useEffect(() => {
    async function fetchSubs() {
      setIsFetchingSubscriptions(true);
      setError('');
      try {
        // Best-effort: show greeting even if subscriptions load fails.
        try {
          const me = await getCurrentUser();
          setCurrentUser(me);
        } catch {
          // ignore
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

  // useEffect(() => {
  //   if (subscriptions.length > 0) {
  //     localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  //   }
  // }, [subscriptions]);


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

  const nearestRenewalDays = (() => {
    if (!subscriptions.length) return null;
    const futureDays = subscriptions
      .map(sub => Math.ceil((new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      .filter(days => days >= 0);
    if (!futureDays.length) return null;
    return Math.min(...futureDays);
  })();

  const filteredSubscriptions = subscriptions.filter(sub => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      sub.name.toLowerCase().includes(query) ||
      sub.category.toLowerCase().includes(query) ||
      sub.plan.toLowerCase().includes(query)
    );
  });

  const upcomingSubscriptions = (() => {
    const now = new Date();
    return subscriptions
      .map((sub) => ({
        sub,
        days: Math.ceil((new Date(sub.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .filter((item) => item.days >= 0)
      .sort((a, b) => new Date(a.sub.renewalDate).getTime() - new Date(b.sub.renewalDate).getTime())
      .slice(0, 5);
  })();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative">
          <SidebarProvider defaultOpen>
            <Sidebar
              variant="inset"
              className="border-zinc-800 bg-zinc-900/70 backdrop-blur"
            >
              <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">SaaS</p>
                    <p className="text-base font-semibold text-white truncate">Assinaturas Pro</p>
                  </div>
                </div>

                {currentUser && (
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </SidebarHeader>

              <SidebarSeparator className="bg-zinc-800/80" />

              <SidebarContent className="px-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'overview'}
                      onClick={() => setActiveTab('overview')}
                    >
                      <LayoutDashboard />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'subscriptions'}
                      onClick={() => setActiveTab('subscriptions')}
                    >
                      <CreditCard />
                      <span>Assinaturas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => router.push('/profile')}>
                      <Settings />
                      <span>Configurações</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter className="p-3">
                <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/70 to-zinc-900/30 p-4">
                  <p className="text-xs text-zinc-500">Plano atual</p>
                  <p className="text-sm font-semibold text-white">Starter</p>
                  <p className="text-xs text-emerald-400 mt-1">Upgrade disponível</p>
                </div>
                <div className="mt-2">
                  <LogoutButton floating={false} className="w-full" />
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="bg-transparent">
              <div className="px-4 md:px-6 py-6">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden text-zinc-200 hover:bg-zinc-800/60" />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-semibold">
                        Oi{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!
                      </h1>
                      <p className="text-sm text-zinc-500">Um resumo do que está rolando hoje</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 text-emerald-200 border border-emerald-500/30">
                      {nearestRenewalDays === null
                        ? 'Sem renovações próximas'
                        : `Próxima renovação em ${nearestRenewalDays} dias`}
                    </Badge>
                    <Badge className="bg-zinc-900/70 text-zinc-300 border border-zinc-800">Total: {subscriptions.length}</Badge>
                  </div>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v === 'subscriptions' ? 'subscriptions' : 'overview')}
                  className="gap-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <TabsList className="bg-zinc-900/70 border border-zinc-800">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800/70">Overview</TabsTrigger>
                      <TabsTrigger value="subscriptions" className="data-[state=active]:bg-zinc-800/70">Assinaturas</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl px-3 py-2 text-xs text-zinc-300 bg-zinc-900/70 border border-zinc-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        Insights atualizados hoje
                      </div>
                      <AddSubscriptionDialog onAdd={handleAddSubscription} />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {(isFetchingSubscriptions || isMutatingSubscriptions) && subscriptions.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
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

                  <TabsContent value="overview" className="mt-4 space-y-6">
                    <Card className="bg-zinc-900/70 border-zinc-800">
                      <div className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Tudo pronto para organizar suas assinaturas</p>
                            <p className="text-sm text-zinc-500">Adicione novas assinaturas e acompanhe renovações.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('subscriptions')}
                            className="text-sm text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-2"
                          >
                            Ver assinaturas <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-zinc-900/70 border-zinc-800 p-6 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Gasto Mensal</p>
                            <p className="text-3xl text-white">R$ {totalMonthly.toFixed(2).replace('.', ',')}</p>
                            <p className="text-xs text-zinc-500 mt-2">Atualizado hoje</p>
                          </div>
                          <DollarSign className="h-10 w-10 text-purple-500" />
                        </div>
                      </Card>

                      <Card className="bg-zinc-900/70 border-zinc-800 p-6 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Gasto Anual</p>
                            <p className="text-3xl text-white">R$ {totalYearly.toFixed(2).replace('.', ',')}</p>
                            <p className="text-xs text-zinc-500 mt-2">Projeção de 12 meses</p>
                          </div>
                          <TrendingUp className="h-10 w-10 text-emerald-400" />
                        </div>
                      </Card>

                      <Card className="bg-zinc-900/70 border-zinc-800 p-6 shadow-lg shadow-black/20">
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

                    <Card className="bg-zinc-900/70 border-zinc-800">
                      <div className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">Próximas renovações</p>
                          <p className="text-sm text-zinc-500">As 5 mais próximas a partir de hoje</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('subscriptions')}
                          className="text-sm text-emerald-300 hover:text-emerald-200"
                        >
                          Ver tudo
                        </button>
                      </div>
                      <div className="px-5 pb-5">
                        {isFetchingSubscriptions && subscriptions.length === 0 ? (
                          <div className="text-sm text-zinc-500">Carregando…</div>
                        ) : upcomingSubscriptions.length === 0 ? (
                          <div className="text-sm text-zinc-500">Sem renovações futuras cadastradas.</div>
                        ) : (
                          <Table className="text-zinc-200">
                            <TableHeader>
                              <TableRow className="border-zinc-800">
                                <TableHead className="text-zinc-400">Assinatura</TableHead>
                                <TableHead className="text-zinc-400">Preço</TableHead>
                                <TableHead className="text-zinc-400">Renovação</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {upcomingSubscriptions.map(({ sub, days }) => (
                                <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                  <TableCell className="font-medium text-white">{sub.name}</TableCell>
                                  <TableCell className="text-zinc-300">R$ {sub.price.toFixed(2).replace('.', ',')}</TableCell>
                                  <TableCell className="text-zinc-300">
                                    {format(new Date(sub.renewalDate), "dd 'de' MMM", { locale: ptBR })}
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-300">
                                      {days === 0 ? 'Hoje' : `${days}d`}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="subscriptions" className="mt-4 space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="relative w-full md:max-w-sm">
                        <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Buscar por nome, categoria ou plano"
                          className="pl-9 bg-zinc-900/70 border-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div className="md:hidden flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 text-emerald-200 border border-emerald-500/30">
                          {nearestRenewalDays === null
                            ? 'Sem renovações próximas'
                            : `Próxima renovação em ${nearestRenewalDays} dias`}
                        </Badge>
                      </div>
                    </div>

                    {isFetchingSubscriptions && subscriptions.length === 0 ? (
                      <Card className="bg-zinc-900/70 border-zinc-800 p-10 text-center shadow-lg shadow-black/20">
                        <p className="text-zinc-400 text-base mb-1">Carregando assinaturas…</p>
                        <p className="text-zinc-500 text-sm">Só um instante</p>
                      </Card>
                    ) : filteredSubscriptions.length === 0 ? (
                      <Card className="bg-zinc-900/70 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  </TabsContent>
                </Tabs>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}

