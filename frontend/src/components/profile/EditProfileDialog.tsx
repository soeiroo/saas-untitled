'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, UpdateUserData } from '@/types/user';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().optional(),
  profilePicture: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateUserData) => Promise<void>;
}

export function EditProfileDialog({ user, open, onOpenChange, onSave }: EditProfileDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      currentPassword: '',
      profilePicture: user.profilePicture || '',
    },
  });

  const watchedEmail = useWatch({ control: form.control, name: 'email' });
  const watchedProfilePicture = useWatch({ control: form.control, name: 'profilePicture' });
  const isEmailChanged = useMemo(() => watchedEmail !== user.email, [watchedEmail, user.email]);

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        currentPassword: '',
        profilePicture: user.profilePicture || '',
      });
      setShowPassword(false);
    }
  }, [open, user, form]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      if (data.email !== user.email && !data.currentPassword) {
        form.setError('currentPassword', { type: 'manual', message: 'Informe sua senha atual para alterar o email' });
        toast.error('Informe sua senha atual para alterar o email');
        return;
      }

      const payload: UpdateUserData = {
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
        ...(data.email !== user.email ? { currentPassword: data.currentPassword } : {}),
      };

      await onSave(payload);
      onOpenChange(false);
    } catch {
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('profilePicture', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Perfil</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Atualize suas informações de perfil.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4 mb-2">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800">
                {watchedProfilePicture ? (
                  <ImageWithFallback src={watchedProfilePicture} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-500 bg-gradient-to-br from-emerald-500/10 to-purple-500/10">
                    <span className="text-2xl font-bold opacity-50">{user.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <Label htmlFor="picture-upload" className="cursor-pointer py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-sm text-zinc-300 transition-colors">
                  Alterar foto
                </Label>
                <Input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {watchedProfilePicture && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.setValue('profilePicture', '')}
                    className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Nome</Label>
              <Input
                id="name"
                {...form.register('name')}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            {isEmailChanged && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-zinc-300">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...form.register('currentPassword')}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-400">Obrigatória para manter sua sessão ao trocar o email.</p>
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-red-400">{form.formState.errors.currentPassword.message}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
