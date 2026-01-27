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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Assinatura</DialogTitle>
          <DialogDescription>Atualize os detalhes da assinatura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Serviço</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Valor Mensal (R$)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-renewalDate">Data de Renovação</Label>
            <Input
              id="edit-renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <Input
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>          
          <div className="space-y-2">
            <Label htmlFor="edit-plan">Plano (Opcional)</Label>
            <Input
              id="edit-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Premium, Standard, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-period">Período</Label>
            <select
              id="edit-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm"
              required
            >
              <option value="Mensal">Mensal</option>
              <option value="Anual">Anual</option>
              <option value="Semanal">Semanal</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto overflow-y-hidden">
              {subscriptionIcons.map((i) => (
                <button
                  type="button"
                  key={i.name}
                  className={`border rounded p-1 bg-input-background ${icon === i.name ? '' : ''}`}
                  style={{ borderColor: icon === i.name ? i.color : 'var(--color-border)', boxShadow: icon === i.name ? `0 0 0 2px ${i.color}55` : 'none' }}
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
            <Button type="submit" className="flex-1">Salvar</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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

