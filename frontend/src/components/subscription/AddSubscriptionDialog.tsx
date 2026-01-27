'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { subscriptionIcons } from '@/data/subscriptionIcons';
import type { Subscription } from '@/types/subscription';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AddSubscriptionDialogProps {
  onAdd: (subscription: Omit<Subscription, 'id' | 'userId'>) => void;
}

export function AddSubscriptionDialog({ onAdd }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(subscriptionIcons[0].name);
  const [plan, setPlan] = useState('');
  const [period, setPeriod] = useState('Mensal');

  const resetForm = () => {
    setName('');
    setPrice('');
    setRenewalDate('');
    setCategory('');
    setIcon(subscriptionIcons[0].name);
    setPlan('');
    setPeriod('Mensal');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !renewalDate) return;

    onAdd({
      name,
      price: parseFloat(price),
      renewalDate,
      category: category || 'Outros',
      icon,
      plan,
      period,
      createdAt: new Date().toISOString(),
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Assinatura
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Assinatura</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para adicionar uma nova assinatura.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Valor Mensal (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              inputMode="decimal"
              pattern="[0-9]*"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.90"
              className="appearance-none"
              required
              style={{ MozAppearance: 'textfield' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalDate">Data de Renovação</Label>
            <Input
              id="renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plano (Opcional)</Label>
            <Input
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Premium, Standard, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm"
              required
            >
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {subscriptionIcons.map((i) => (
                <button
                  type="button"
                  key={i.name}
                  className="border rounded p-1 bg-input-background"
                  style={{
                    borderColor: icon === i.name ? i.color : 'var(--color-border)',
                    boxShadow: icon === i.name ? `0 0 0 2px ${i.color}55` : 'none',
                  }}
                  onClick={() => setIcon(i.name)}
                  aria-label={i.name}
                >
                  <span
                    style={{
                      background: i.color + '22',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={i.url} alt={i.name} className="w-7 h-7 object-contain" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (Opcional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Streaming, Música, etc."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Adicionar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

