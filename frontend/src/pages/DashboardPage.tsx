'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Bell, Users, CreditCard, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/navigation/Sidebar';
import LogoutButton from '@/components/ui/LogoutButton';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { getSubscriptions } from '@/api/subscription';
import { getFriends } from '@/api/friend';
import { getCurrentUser } from '@/api/user';
import type { Subscription } from '@/types/subscription';
import type { Friend } from '@/types/friend';
import type { User } from '@/types/user';

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        try {
          const me = await getCurrentUser();
          setCurrentUser(me);
        } catch {
        }

        const [subs, friendsList] = await Promise.all([
          getSubscriptions(),
          getFriends(),
        ]);

        setSubscriptions(subs);
        setFriends(friendsList);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Erro ao carregar o resumo.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalMonthly = useMemo(
    () => subscriptions.reduce((sum, sub) => sum + sub.price, 0),
    [subscriptions],
  );
  const totalYearly = totalMonthly * 12;

  const upcomingRenewals = useMemo(
    () =>
      subscriptions.filter((sub) => {
        const daysUntilRenewal = Math.ceil(
          (new Date(sub.renewalDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
      }).length,
    [subscriptions],
  );

  const recentRenewals = useMemo(() => {
    return [...subscriptions]
      .sort(
        (a, b) =>
          new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime(),
      )
      .slice(0, 3);
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex">
          <Sidebar activePage="overview" />

          <main className="flex-1 lg:pl-6">
            <MobileAppMenu title="Visão geral" />
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 relative">
              <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                    Bem-vindo
                  </div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">
                    Olá{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!
                    <span className="block text-base font-normal text-emerald-300/80 mt-1">Tudo pronto para hoje</span>
                  </h1>
                </div>
                <div className="hidden lg:block">
                  <LogoutButton floating={false} className="relative" />
                </div>
              </header>

              <Card className="relative overflow-hidden mb-8 bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_48%),radial-gradient(circle_at_90%_10%,_rgba(255,255,255,0.05),_transparent_40%)]" />
                <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Visão geral</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-white">Seu painel está em dia</h2>
                    <p className="text-sm text-zinc-400 max-w-lg">
                      Acompanhe gastos, renovações e relações em um layout limpo e com foco no essencial.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:shadow-[0_14px_30px_rgba(16,185,129,0.16)]">
                      <Link href="/assinaturas">Gerenciar assinaturas</Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Link href="/friends">Conectar amigos</Link>
                    </Button>
                  </div>
                </div>
              </Card>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <section className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Indicadores rápidos</h2>
                  <p className="text-sm text-zinc-500">Resumo do que importa agora</p>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`kpi-skeleton-${index}`} className="relative overflow-hidden bg-white/5 border-white/10 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
                      <div className="relative space-y-3">
                        <Skeleton className="h-4 w-28 bg-white/10" />
                        <Skeleton className="h-8 w-24 bg-white/10" />
                        <Skeleton className="h-3 w-32 bg-white/10" />
                      </div>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="relative overflow-hidden bg-white/5 border-white/10 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-400 text-sm mb-1">Assinaturas ativas</p>
                          <p className="text-3xl text-white">{subscriptions.length}</p>
                          <p className="text-xs text-zinc-500 mt-2">Total cadastradas</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl border border-white/10 bg-emerald-500/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-emerald-200" />
                        </div>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden bg-white/5 border-white/10 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-400 text-sm mb-1">Gasto mensal</p>
                          <p className="text-3xl text-white">
                            R$ {totalMonthly.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">Última atualização</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-zinc-200" />
                        </div>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden bg-white/5 border-white/10 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-400 text-sm mb-1">Gasto anual</p>
                          <p className="text-3xl text-white">
                            R$ {totalYearly.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">Projeção 12 meses</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-zinc-200" />
                        </div>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden bg-white/5 border-white/10 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-400 text-sm mb-1">Cobranças próximas</p>
                          <p className="text-3xl text-white">{upcomingRenewals}</p>
                          <p className="text-xs text-zinc-500 mt-2">Próximos 7 dias</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-zinc-200" />
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Próximas renovações</h2>
                      <p className="text-sm text-zinc-500">As 3 mais próximas</p>
                    </div>
                    <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Link href="/assinaturas" className="inline-flex items-center gap-2">
                        Ver todas
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={`renewal-skeleton-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <Skeleton className="h-4 w-40 bg-white/10" />
                          <Skeleton className="mt-2 h-3 w-28 bg-white/10" />
                        </div>
                      ))}
                    </div>
                  ) : recentRenewals.length === 0 ? (
                    <p className="text-sm text-zinc-500">Nenhuma assinatura cadastrada ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentRenewals.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{sub.name}</p>
                            <p className="text-xs text-zinc-500">
                              Renovação em{' '}
                              {new Date(sub.renewalDate).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </p>
                          </div>
                          <div className="text-sm text-zinc-300">
                            R$ {sub.price.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-white">Amigos</h2>
                  </div>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 bg-white/10" />
                      <Skeleton className="h-8 w-20 bg-white/10" />
                      <Skeleton className="h-3 w-32 bg-white/10" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-400">Você tem</p>
                      <p className="text-3xl font-semibold text-white mt-1">{friends.length}</p>
                      <p className="text-xs text-zinc-500 mt-2">contatos cadastrados</p>
                    </>
                  )}

                  <div className="mt-6 flex flex-col gap-2">
                    <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Link href="/assinaturas">Ver assinaturas</Link>
                    </Button>
                  </div>
                </Card>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
