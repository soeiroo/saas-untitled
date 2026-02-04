'use client';

import { useEffect, useState } from 'react';
import { User, UpdateUserData } from '@/types/user';
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { toast } from 'sonner';
import MobileAppMenu from '@/components/navigation/MobileAppMenu';
import { Pencil, Trash2, Key, ArrowLeft, User as UserIcon, Shield, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao carregar dados do usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserData) => {
    try {
      const updatedUser = await updateCurrentUser(data);
      setUser(updatedUser);
      toast.success('Dados atualizados com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao atualizar dados');
      }
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteCurrentUser();
      toast.success('Conta deletada com sucesso');
      localStorage.removeItem('authToken');
      router.push('/login');
    } catch (err) {
      console.error('Erro ao deletar conta:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao deletar conta');
      }
    }
  };

  const getInitials = () => {
    const nameParts = user?.name.split(' ') || [];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user?.name[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
          <div className="relative flex">
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-zinc-900/80 border-r border-zinc-800 px-5 py-6 backdrop-blur" />
            <main className="flex-1">
              <MobileAppMenu title="Configurações da conta" />
              <div className="max-w-6xl mx-auto px-4 py-8">
                <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full bg-zinc-800" />
                    <Skeleton className="h-4 w-40 bg-zinc-800" />
                    <Skeleton className="h-3 w-56 bg-zinc-800" />
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-lg text-red-400">Erro ao carregar dados do usuário</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex">
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-zinc-900/80 border-r border-zinc-800 px-5 py-6 backdrop-blur">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>

            <nav className="space-y-2 text-sm">
              <div className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Conta</span>
              </div>
              <button className="w-full text-left px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-white transition">
                <span className="flex items-center gap-2">
                  <span>Plano e cobrança</span>
                </span>
              </button>
            </nav>
          </aside>

          <main className="flex-1">
            <MobileAppMenu title="Configurações da conta" />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <UserIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-white">Configurações da conta</h1>
                    <p className="text-sm text-zinc-400">Aqui você pode atualizar as informações da sua conta.</p>
                  </div>
                </div>
              </div>

              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 min-w-0">
                      <Avatar className="w-24 h-24 border-2 border-emerald-500/20">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-purple-500 text-white">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-2">Envie uma foto de perfil</h3>
                        <p className="text-sm text-zinc-400 mb-4">
                          para personalizar seu espaço de trabalho e facilitar a identificação pelos colaboradores.
                        </p>
                        <p className="text-xs text-zinc-500">
                          O tamanho recomendado é 400x400px e menos de 1 MB.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditProfileOpen(true)}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 w-full sm:w-auto"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Alterar perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Nome</label>
                      <input
                        type="text"
                        value={user.name.split(' ')[0]}
                        disabled
                        className="w-full min-w-0 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Sobrenome</label>
                      <input
                        type="text"
                        value={user.name.split(' ').slice(1).join(' ')}
                        disabled
                        className="w-full min-w-0 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Endereço de e-mail</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full min-w-0 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                      onClick={() => setEditProfileOpen(true)}
                    >
                      Salvar alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-white">Segurança</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Senha</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="password"
                        value="••••••••"
                        disabled
                        className="w-full sm:flex-1 sm:min-w-0 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 w-full sm:w-auto"
                        onClick={() => setChangePasswordOpen(true)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Alterar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/80 border-red-900/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 p-4 border border-red-900/30 rounded-lg bg-red-900/10">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-red-900/30 rounded-lg mt-0.5">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white">Excluir conta</h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          Exclua sua conta e todos os seus dados no SaaS.
                        </p>
                        <p className="text-xs text-red-400 mt-1">
                          Esta ação é permanente e irreversível.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto sm:shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <EditProfileDialog
        user={user}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSave={handleUpdateUser}
      />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSave={handleUpdateUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Excluir sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Isso excluirá permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
