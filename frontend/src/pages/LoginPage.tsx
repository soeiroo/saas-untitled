'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const result = await response.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.token);
        }
        router.push('/overview');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Credenciais inválidas');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Tempo limite excedido. Tente novamente.');
      } else {
        setError('Erro ao conectar ao servidor');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const result = await response.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.token);
        }
        router.push('/overview');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Erro ao registrar');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Tempo limite excedido. Tente novamente.');
      } else {
        console.error('Erro no registro:', err);
        setError('Erro ao registrar.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-2xl border bg-card" />
                </div>
                <CardTitle className="text-center">Criar Conta</CardTitle>
                <p className="text-center text-muted-foreground text-sm mt-2">Registre-se para começar</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      {...registerForm.register('name')}
                      className="mt-1"
                      placeholder="Seu nome"
                    />
                    {registerForm.formState.errors.name && <p className="text-destructive text-sm mt-1">{registerForm.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="regEmail">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      {...registerForm.register('email')}
                      className="mt-1"
                      placeholder="seu@email.com"
                    />
                    {registerForm.formState.errors.email && <p className="text-destructive text-sm mt-1">{registerForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="regPassword">Senha</Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...registerForm.register('password')}
                        className="mt-1 pr-10"
                        placeholder="Sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && <p className="text-destructive text-sm mt-1">{registerForm.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerForm.register('confirmPassword')}
                        className="mt-1 pr-10"
                        placeholder="Confirme sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && <p className="text-destructive text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">ou</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsRegistered(true)} className="w-full">
                  Já tem conta? Faça login
                </Button>
              </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl border bg-card" />
              </div>
              <CardTitle className="text-center">Bem-vindo</CardTitle>
              <p className="text-center text-muted-foreground text-sm mt-2">Acesse sua conta</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    className="mt-1"
                    placeholder="seu@email.com"
                  />
                  {loginForm.formState.errors.email && <p className="text-destructive text-sm mt-1">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      className="mt-1 pr-10"
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <p className="text-destructive text-sm mt-1">{loginForm.formState.errors.password.message}</p>}
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">ou</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsRegistered(false)} className="w-full">
                Não tem conta? Registre-se
              </Button>
            </CardFooter>
      </Card>
    </div>
  );
}

