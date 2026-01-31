'use client';

import { useState, useEffect } from 'react';
import { subscriptionIcons } from '@/data/subscriptionIcons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Subscription } from '@/types/subscription';

interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (subscription: Subscription) => void;
}

export function EditSubscriptionDialog({ 
  subscription, 
  open, 
  onClose, 
  onUpdate 
}: EditSubscriptionDialogProps) {

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(subscriptionIcons[0].name);
  const [plan, setPlan] = useState('');
  const [period, setPeriod] = useState('Mensal');

  useEffect(() => {
    setName(subscription?.name || '');
    setPrice(subscription?.price !== undefined ? subscription.price.toString() : '');
    setRenewalDate(subscription?.renewalDate || '');
    setCategory(subscription?.category || '');
    setIcon(subscription?.icon || subscriptionIcons[0].name);
    setPlan(subscription?.plan || '');
    setPeriod(subscription?.period || 'Mensal');
  }, [subscription, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscription && name && price && renewalDate) {
      onUpdate({
        ...subscription,
        name,
        price: parseFloat(price),
        renewalDate,
        category: category || 'Outros',
        icon,
        plan,
        period,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Assinatura</DialogTitle>
          <DialogDescription className="text-zinc-400">Atualize os detalhes da assinatura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-zinc-300">Nome do Serviço</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-zinc-300">Valor Mensal (R$)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-renewalDate" className="text-zinc-300">Data de Renovação</Label>
            <Input
              id="edit-renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-zinc-300">Categoria</Label>
            <Input
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>          
          <div className="space-y-2">
            <Label htmlFor="edit-plan" className="text-zinc-300">Plano (Opcional)</Label>
            <Input
              id="edit-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Premium, Padrão, etc."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-period" className="text-zinc-300">Período</Label>
            <select
              id="edit-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white rounded px-2 py-1 w-full"
              required
            >
              <option value="Mensal">Mensal</option>
              <option value="Anual">Anual</option>
              <option value="Semanal">Semanal</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Ícone</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto overflow-y-hidden">
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
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              Salvar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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

