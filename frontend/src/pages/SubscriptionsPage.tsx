'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '@/api/subscription';
import type { Subscription } from '@/types/subscription';
import { AddSubscriptionDialog } from '@/components/subscription/AddSubscriptionDialog';
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export default function SubscriptionsPage() {
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(false);
  const [isMutatingSubscriptions, setIsMutatingSubscriptions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setIsFetchingSubscriptions(true);
      setError('');
      try {
        const subs = await getSubscriptions();
        setSubscriptions(subs);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar assinaturas');
      } finally {
        setIsFetchingSubscriptions(false);
      }
    })();
  }, []);

  const nearestRenewalDays = useMemo(() => {
    if (!subscriptions.length) return null;
    const now = new Date().getTime();
    const futureDays = subscriptions
      .map((sub) => Math.ceil((new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      .filter((days) => days >= 0);
    if (!futureDays.length) return null;
    return Math.min(...futureDays);
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscriptions;
    return subscriptions.filter((sub) =>
      sub.name.toLowerCase().includes(query) ||
      sub.category.toLowerCase().includes(query) ||
      sub.plan.toLowerCase().includes(query),
    );
  }, [subscriptions, searchQuery]);

  const handleAddSubscription = async (newSub: Omit<Subscription, 'id' | 'userId'>) => {
    setIsMutatingSubscriptions(true);
    setError('');
    try {
      const created = await addSubscription(newSub);
      setSubscriptions((prev) => [...prev, created]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar assinatura');
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
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar assinatura');
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
      setSubscriptions((prev) => prev.map((sub) => (sub.id === result.id ? result : sub)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar assinatura');
    } finally {
      setIsMutatingSubscriptions(false);
    }
  };

  return (
    <DashboardShell
      active="subscriptions"
      title="Assinaturas"
      subtitle="Gerencie suas assinaturas e acompanhe renovações"
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por nome, categoria ou plano"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Badge variant="outline">Total: {subscriptions.length}</Badge>
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
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
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

      <div className="mt-6">
        {isFetchingSubscriptions && subscriptions.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground text-base mb-1">Carregando assinaturas…</p>
            <p className="text-muted-foreground text-sm">Só um instante</p>
          </Card>
        ) : filteredSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-2">
              {subscriptions.length === 0 ? 'Nenhuma assinatura cadastrada' : 'Nenhum resultado encontrado'}
            </p>
            <p className="text-muted-foreground">
              {subscriptions.length === 0
                ? 'Clique em "Nova Assinatura" para começar'
                : 'Tente outro termo de busca'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onDelete={handleDeleteSubscription}
                onEdit={handleEditSubscription}
              />
            ))}
          </div>
        )}
      </div>

      <EditSubscriptionDialog
        subscription={editingSubscription}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingSubscription(null);
        }}
        onUpdate={handleUpdateSubscription}
      />
    </DashboardShell>
  );
}
