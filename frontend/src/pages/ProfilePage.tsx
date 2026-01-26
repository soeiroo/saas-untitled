'use client';

import { useEffect, useState } from 'react';
import { User, UpdateUserData } from '@/types/user';
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-sidebar border-r border-sidebar-border px-5 py-6" />
          <main className="flex-1">
            <MobileAppMenu title="Account Settings" />
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg mb-2">Carregando perfil...</p>
                <p className="text-muted-foreground">Buscando dados atualizados</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-lg text-destructive">Erro ao carregar dados do usuário</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-sidebar border-r border-sidebar-border px-5 py-6">
            <Link href="/overview" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            
            <nav className="space-y-2 text-sm">
              <div className="px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Account</span>
              </div>
              <button className="w-full text-left px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition">
                <span className="flex items-center gap-2">
                  <span>Plan & Billing</span>
                </span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <MobileAppMenu title="Account Settings" />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              {/* Page Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold">Account Settings</h1>
                    <p className="text-sm text-muted-foreground">Here you can update information about your account</p>
                  </div>
                </div>
              </div>

              {/* Profile Picture Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 min-w-0">
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-2xl bg-muted text-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-2">Upload a profile picture</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          to personalize your workspace and help collaborators identify you.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          The recommended size is 400x400px and less than 1 MB.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditProfileOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Change Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Section */}
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                      <Input
                        type="text"
                        value={user.name.split(' ')[0]}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                      <Input
                        type="text"
                        value={user.name.split(' ').slice(1).join(' ')}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={user.email}
                      disabled
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => setEditProfileOpen(true)}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Input
                        type="password"
                        value="••••••••"
                        disabled
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setChangePasswordOpen(true)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-destructive/10 rounded-lg mt-0.5">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold">Delete Account</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Delete your account and all of your data in SaaS.
                        </p>
                        <p className="text-xs text-destructive mt-1">
                          This action is permanent and irreversible.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="w-full sm:w-auto sm:shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

      {/* Dialogs */}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all of your data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
