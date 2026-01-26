'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, UpdateUserData } from '@/types/user';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().optional(),
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
    },
  });

  const watchedEmail = form.watch('email');
  const isEmailChanged = useMemo(() => watchedEmail !== user.email, [watchedEmail, user.email]);

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        currentPassword: '',
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
        ...(data.email !== user.email ? { currentPassword: data.currentPassword } : {}),
      };

      await onSave(payload);
      onOpenChange(false);
    } catch (error) {
      // Error já tratado no componente pai
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>Atualize suas informações de perfil.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {isEmailChanged && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...form.register('currentPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Obrigatória para manter sua sessão ao trocar o email.</p>
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
