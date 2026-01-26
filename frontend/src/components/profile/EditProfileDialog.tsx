'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, UpdateUserData } from '@/types/user';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateUserData) => Promise<void>;
}

export function EditProfileDialog({ user, open, onOpenChange, onSave }: EditProfileDialogProps) {
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      // Error já tratado no componente pai
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
