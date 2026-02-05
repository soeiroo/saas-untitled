'use client';

import { Calendar, DollarSign, Trash, Pencil, Bell, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { subscriptionIcons } from '@/data/subscriptionIcons';
import type { Subscription } from '@/types/subscription';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import type { SubscriptionFriend } from '@/types/subscriptionFriend';

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete?: (id: string) => void;
  onEdit?: (subscription: Subscription) => void;
  onMarkPaid?: (subscription: Subscription) => void;
  sharedFriends?: SubscriptionFriend[];
  isShared?: boolean;
}

export function SubscriptionCard({ subscription, onDelete, onEdit, onMarkPaid, sharedFriends = [], isShared = false }: SubscriptionCardProps) {
  const daysUntilRenewal = differenceInDays(new Date(subscription.renewalDate), new Date());
  const isUpcoming = daysUntilRenewal >= 0 && daysUntilRenewal <= 7;

  const icon = subscriptionIcons.find(i => i.name === subscription.icon) || subscriptionIcons[0];

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{ background: icon.color + '80', minWidth: 40, minHeight: 40, width: 40, height: 40 }}
          >
            <ImageWithFallback
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
              {isShared && (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
                  Compartilhada
                </Badge>
              )}
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
              {(isShared || sharedFriends.length > 0) && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {sharedFriends.slice(0, 3).map((friend) => (
                      <div
                        key={friend.id}
                        className="h-7 w-7 rounded-full border border-zinc-800 bg-zinc-900/80 overflow-hidden"
                        title={friend.name}
                      >
                        {friend.profilePicture ? (
                          <ImageWithFallback
                            src={friend.profilePicture}
                            alt={friend.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                            {friend.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {sharedFriends.length > 3 && (
                      <div className="h-7 w-7 rounded-full border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-[10px] text-zinc-400">
                        +{sharedFriends.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">Compartilhada</span>
                </div>
              )}
          </div>
        </div>
        {(onMarkPaid || onEdit || onDelete) && (
          <div className="flex gap-1">
            {!isShared && onMarkPaid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkPaid(subscription)}
                className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/30"
                aria-label="Marcar como pago"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(subscription)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(subscription.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isShared ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total:</span>
              <span className="text-lg text-white font-semibold">
                R$ {subscription.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs">/mês</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="text-sm">Você paga:</span>
              <span className="text-xl text-white font-semibold">
                {subscription.sharedPrice != null
                  ? `R$ ${Number(subscription.sharedPrice).toFixed(2).replace('.', ',')}`
                  : '—'}
              </span>
              <span className="text-xs">/mês</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-2xl text-white">
              R$ {subscription.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm">/mês</span>
          </div>
        )}

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
        {isShared && (
          <p className="text-xs text-zinc-500 mt-3">Somente leitura</p>
        )}
      </div>
    </Card>
  );
}

