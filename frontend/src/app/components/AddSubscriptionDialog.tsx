'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  category: string;
}

interface AddSubscriptionDialogProps {
  onAdd: (subscription: Omit<Subscription, 'id'>) => void;
}

export function AddSubscriptionDialog({ onAdd }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price && renewalDate) {
      onAdd({
        name,
        price: parseFloat(price),
        renewalDate,
        category: category || 'Outros'
      });
      setName('');
      setPrice('');
      setRenewalDate('');
      setCategory('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.90"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              required
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