'use client';

import { useEffect, useState } from 'react';
import { User, UpdateUserData } from '@/types/user';
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Key, ArrowLeft, User as UserIcon, Shield } from 'lucide-react';
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
          <div className="relative max-w-5xl mx-auto px-4 py-8">
            <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center shadow-lg shadow-black/20">
              <p className="text-zinc-400 text-lg mb-2">Carregando perfil...</p>
              <p className="text-zinc-500">Buscando dados atualizados</p>
            </Card>
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
        <div className="relative max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Header com navegação */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>

          {/* Header com foto do perfil */}
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-2 border-emerald-500/20">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-purple-500 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">
                    {user.name}
                  </h1>
                  <p className="text-zinc-400 mt-1">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Perfil */}
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-white">Informações do Perfil</CardTitle>
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setEditProfileOpen(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Nome</p>
                  <p className="font-medium text-white">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Email</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-white">Segurança</CardTitle>
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setChangePasswordOpen(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Senha</p>
                <p className="font-medium text-white">••••••••</p>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="bg-zinc-900/80 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-500">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Deletar Conta</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Uma vez deletada, sua conta não poderá ser recuperada. Por favor, tenha certeza.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogos */}
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
            <AlertDialogTitle className="text-white">Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação não pode ser desfeita. Isso irá permanentemente deletar sua conta
              e remover todos os seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, deletar minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
