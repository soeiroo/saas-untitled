'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSubscriptions } from '@/api/subscription';
import type { Subscription } from '@/types/subscription';
import { DollarSign, TrendingUp, Bell, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const subs = await getSubscriptions();
        setSubscriptions(subs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar assinaturas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalMonthly = useMemo(
    () => subscriptions.reduce((sum, sub) => sum + sub.price, 0),
    [subscriptions],
  );

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      const daysUntilRenewal = Math.ceil(
        (new Date(sub.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
    }).length;
  }, [subscriptions]);

  const nearestRenewalDays = useMemo(() => {
    if (!subscriptions.length) return null;
    const now = new Date().getTime();
    const futureDays = subscriptions
      .map((sub) => Math.ceil((new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      .filter((days) => days >= 0);
    if (!futureDays.length) return null;
    return Math.min(...futureDays);
  }, [subscriptions]);

  const upcomingTop5 = useMemo(() => {
    const now = new Date().getTime();
    return subscriptions
      .map((sub) => ({
        sub,
        days: Math.ceil((new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24)),
      }))
      .filter((item) => item.days >= 0)
      .sort((a, b) => new Date(a.sub.renewalDate).getTime() - new Date(b.sub.renewalDate).getTime())
      .slice(0, 5);
  }, [subscriptions]);

  const formatShortDate = (iso: string) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  return (
    <DashboardShell
      active="overview"
      title="Overview"
      subtitle="Um resumo do que está rolando hoje"
      rightBadges={[
        {
          label:
            nearestRenewalDays === null
              ? 'Sem renovações próximas'
              : `Próxima renovação em ${nearestRenewalDays} dias`,
          variant: 'outline',
        },
        { label: `Total: ${subscriptions.length}`, variant: 'outline' },
      ]}
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-zinc-900/70 border-zinc-800 mb-6">
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
          <Button
            variant="ghost"
            className="text-emerald-300 hover:text-emerald-200 hover:bg-zinc-800/40 justify-start md:justify-center"
            onClick={() => router.push('/assinaturas')}
          >
            Ver assinaturas <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <Button
            variant="ghost"
            className="text-emerald-300 hover:text-emerald-200 hover:bg-zinc-800/40"
            onClick={() => router.push('/assinaturas')}
          >
            Ver tudo
          </Button>
        </div>
        <div className="px-5 pb-5">
          {loading && subscriptions.length === 0 ? (
            <div className="text-sm text-zinc-500">Carregando…</div>
          ) : upcomingTop5.length === 0 ? (
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
                {upcomingTop5.map(({ sub, days }) => (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell className="font-medium text-white">{sub.name}</TableCell>
                    <TableCell className="text-zinc-300">R$ {sub.price.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell className="text-zinc-300">{formatShortDate(sub.renewalDate)}</TableCell>
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
    </DashboardShell>
  );
}
