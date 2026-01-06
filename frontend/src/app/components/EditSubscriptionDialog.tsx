'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  category: string;
}

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

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setPrice(subscription.price.toString());
      setRenewalDate(subscription.renewalDate);
      setCategory(subscription.category);
    }
  }, [subscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscription && name && price && renewalDate) {
      onUpdate({
        ...subscription,
        name,
        price: parseFloat(price),
        renewalDate,
        category: category || 'Outros'
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