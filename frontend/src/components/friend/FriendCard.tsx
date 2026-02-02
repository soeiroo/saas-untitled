import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMinus, MoreHorizontal, User } from 'lucide-react';
import type { Friend } from '@/types/friend';

interface FriendCardProps {
  friend: Friend;
  onDelete: (id: string) => void;
  onSecondaryAction: (friend: Friend) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onDelete, onSecondaryAction }) => {
  const timeAgo = () => {
    if (!friend.addedAt) return 'Amizade confirmada';

    const now = new Date();
    const added = new Date(friend.addedAt);
    const diffMs = now.getTime() - added.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  };

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 p-5 shadow-lg shadow-black/20 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          {friend.avatarUrl ? (
            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">{friend.name}</h3>
          <p className="text-sm text-zinc-400 truncate mb-2">{friend.email}</p>
          <p className="text-xs text-zinc-500">{timeAgo()}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800/50">
        <Button
          onClick={() => onSecondaryAction(friend)}
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <div className="flex-1"></div>
        <Button
          onClick={() => onDelete(friend.id)}
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl"
        >
          <UserMinus className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};
