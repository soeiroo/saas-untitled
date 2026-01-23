'use client';

import { Calendar, DollarSign, Trash, Pencil, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { subscriptionIcons } from '@/data/subscriptionIcons';
import type { Subscription } from '@/types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onDelete, onEdit }: SubscriptionCardProps) {
  const daysUntilRenewal = differenceInDays(new Date(subscription.renewalDate), new Date());
  const isUpcoming = daysUntilRenewal >= 0 && daysUntilRenewal <= 7;

  const icon = subscriptionIcons.find(i => i.name === subscription.icon) || subscriptionIcons[0];

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{ background: icon.color + '80', minWidth: 40, minHeight: 40, width: 40, height: 40 }}
          >
            <img
              src={icon.url}
              alt={icon.name}
              className="w-7 h-7 object-contain bg-transparent"
              style={{ display: 'block' }}
            />
          </span>
          <div>
            <h3 className="text-white text-lg mb-1">{subscription.name}</h3>
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {subscription.category}
              </Badge>
              {subscription.plan && (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {subscription.plan}
                </Badge>
              )}
              {subscription.period && (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {subscription.period}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subscription)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(subscription.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <DollarSign className="h-4 w-4" />
          <span className="text-2xl text-white">
            R$ {subscription.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-sm">/mês</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            Próxima cobrança: {format(new Date(subscription.renewalDate), "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        {isUpcoming && (
          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-950/30 p-2 rounded-md mt-3">
            <Bell className="h-4 w-4" />
            <span className="text-sm">
              {daysUntilRenewal === 0 
                ? 'Cobrança hoje!' 
                : `Cobrança em ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dia' : 'dias'}`}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

