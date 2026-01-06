'use client';

import { useState, useEffect } from 'react';
import { AddSubscriptionDialog } from './components/AddSubscriptionDialog';
import { SubscriptionCard } from './components/SubscriptionCard';
import { EditSubscriptionDialog } from './components/EditSubscriptionDialog';
import { Card } from './components/ui/card';
import { DollarSign, Bell, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  category: string;
}

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load subscriptions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('subscriptions');
    if (stored) {
      setSubscriptions(JSON.parse(stored));
    } else {
      // Add some example data
      const exampleData: Subscription[] = [
        {
          id: '1',
          name: 'Netflix',
          price: 55.90,
          renewalDate: '2026-01-15',
          category: 'Streaming'
        },
        {
          id: '2',
          name: 'Spotify',
          price: 21.90,
          renewalDate: '2026-01-08',
          category: 'Música'
        }
      ];
      setSubscriptions(exampleData);
      localStorage.setItem('subscriptions', JSON.stringify(exampleData));
    }
  }, []);

  // Save to localStorage whenever subscriptions change
  useEffect(() => {
    if (subscriptions.length > 0) {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const subscription: Subscription = {
      ...newSub,
      id: Date.now().toString()
    };
    setSubscriptions([...subscriptions, subscription]);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleUpdateSubscription = (updated: Subscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === updated.id ? updated : sub
    ));
  };

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalYearly = totalMonthly * 12;

  // Count upcoming renewals (next 7 days)
  const upcomingRenewals = subscriptions.filter(sub => {
    const daysUntilRenewal = Math.ceil(
      (new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Controle de Assinaturas</h1>
          <p className="text-zinc-400">Gerencie suas assinaturas e nunca perca uma cobrança</p>
        </div>

        {/* Stats Cards */}
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

        {/* Add Button */}
        <div className="mb-6">
          <AddSubscriptionDialog onAdd={handleAddSubscription} />
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <p className="text-zinc-400 text-lg mb-2">Nenhuma assinatura cadastrada</p>
            <p className="text-zinc-500">Clique em "Nova Assinatura" para começar</p>
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

        {/* Edit Dialog */}
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

export default App;