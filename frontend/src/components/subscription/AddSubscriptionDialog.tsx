'use client';

import { useState } from 'react';
import { subscriptionIcons } from '@/data/subscriptionIcons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus } from 'lucide-react';
import type { Subscription } from '@/types/subscription';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price && renewalDate) {
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
      setName('');
      setPrice('');
      setRenewalDate('');
      setCategory('');
      setIcon(subscriptionIcons[0].name);
      setPlan('');
      setPeriod('Mensal');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Nova Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Assinatura</DialogTitle>
          <DialogDescription className="text-zinc-400">Preencha os campos abaixo para adicionar uma nova assinatura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Nome do Serviço</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Spotify, etc."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-zinc-300">Valor Mensal (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              inputMode="decimal"
              pattern="[0-9]*"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.90"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 appearance-none"
              required
              style={{ MozAppearance: 'textfield' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="renewalDate" className="text-zinc-300">Data de Renovação</Label>
            <Input
              id="renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
                    <div className="space-y-2">
            <Label htmlFor="plan" className="text-zinc-300">Plano (Opcional)</Label>
            <Input
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Premium, Padrão, etc."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period" className="text-zinc-300">Período</Label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white rounded px-2 py-1"
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
                      <Label className="text-zinc-300">Ícone</Label>
                      <div
                        className="flex flex-wrap gap-2 max-h-32 overflow-y-auto"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <style>
                          {`
                            .hide-scrollbar::-webkit-scrollbar {
                              display: none;
                            }
                          `}
                        </style>
                        {subscriptionIcons.map((i) => (
                          <button
                            type="button"
                            key={i.name}
                            className={`border rounded p-1 bg-zinc-800 ${icon === i.name ? '' : ''}`}
                            style={{ borderColor: icon === i.name ? i.color : '#27272a', boxShadow: icon === i.name ? `0 0 0 2px ${i.color}55` : 'none' }}
                            onClick={() => setIcon(i.name)}
                            aria-label={i.name}
                          >
                            <span style={{ background: i.color + '22', borderRadius: '50%', display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                              <img src={i.url} alt={i.name} className="w-7 h-7 object-contain" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-zinc-300">Categoria (Opcional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Streaming, Música, etc."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              Adicionar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

