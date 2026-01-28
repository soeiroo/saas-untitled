'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus } from 'lucide-react';
import { searchUsers, sendFriendRequest } from '@/api/friend';
import type { UserSearchResult } from '@/types/friend';

interface AddFriendDialogProps {
  onRequestSent?: () => void;
}

export const AddFriendDialog: React.FC<AddFriendDialogProps> = ({ onRequestSent }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const users = await searchUsers(trimmed);
      setResults(users);
      if (!users.length) {
        setError('Nenhum usuário encontrado.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao buscar usuários.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setError('');
    try {
      await sendFriendRequest(userId);
      onRequestSent?.();
      setOpen(false);
      setQuery('');
      setResults([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar pedido de amizade.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Amigo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Novo Amigo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-zinc-300">
              Pesquisar usuários
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome"
                className="bg-zinc-800/60 border-zinc-700 text-white"
              />
              <Button type="submit" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="space-y-2">
            {isSearching && (
              <p className="text-sm text-zinc-400">Buscando usuários...</p>
            )}
            {!isSearching && results.length > 0 && (
              <div className="space-y-2">
                {results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleSendRequest(user.id)}
                    >
                      Enviar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              Fechar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
