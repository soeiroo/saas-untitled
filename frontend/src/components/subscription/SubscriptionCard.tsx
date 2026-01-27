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
    <Card className="p-4 transition-colors">
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
            <h3 className="text-lg mb-1">{subscription.name}</h3>
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge variant="outline">{subscription.category}</Badge>
              {subscription.plan && (
                <Badge variant="outline">{subscription.plan}</Badge>
              )}
              {subscription.period && (
                <Badge variant="outline">{subscription.period}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subscription)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(subscription.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span className="text-2xl font-semibold text-foreground">R$ {subscription.price.toFixed(2).replace('.', ',')}</span>
          <span className="text-sm">/mês</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            Próxima cobrança: {format(new Date(subscription.renewalDate), "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        {isUpcoming && (
          <div className="flex items-center gap-2 rounded-md border bg-muted p-2 mt-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
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

