'use client';

import { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '@/api/subscription';
import { AddSubscriptionDialog } from '@/components/subscription/AddSubscriptionDialog';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { EditSubscriptionDialog } from '@/components/subscription/EditSubscriptionDialog';
import { Card } from '@/components/ui/card';
import { DollarSign, Bell, TrendingUp } from 'lucide-react';
import type { Subscription } from '@/types/subscription';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/ui/LogoutButton';

export default function HomePage() {
  
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchSubs() {
      setLoading(true);
      setError('');
      try {
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
        setLoading(false);
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleUpdateSubscription = async (updated: Subscription) => {
    setLoading(true);
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
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <LogoutButton />
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Controle de Assinaturas</h1>
          <p className="text-zinc-400">Gerencie suas assinaturas e nunca perca uma cobrança</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Gasto Mensal</p>
                <p className="text-3xl text-white">
                  R$ {totalMonthly.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Gasto Anual</p>
                <p className="text-3xl text-white">
                  R$ {totalYearly.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Cobranças Próximas</p>
                <p className="text-3xl text-white">{upcomingRenewals}</p>
                <p className="text-zinc-500 text-xs mt-1">Próximos 7 dias</p>
              </div>
              <Bell className="h-10 w-10 text-yellow-500" />
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <AddSubscriptionDialog onAdd={handleAddSubscription} />
        </div>

        {subscriptions.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <p className="text-zinc-400 text-lg mb-2">Nenhuma assinatura cadastrada</p>
            <p className="text-zinc-500">Clique em &quot;Nova Assinatura&quot; para começar</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map(subscription => (
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
    </div>
  );
}

