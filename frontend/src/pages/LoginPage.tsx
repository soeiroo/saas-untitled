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
        router.push('/dashboard');
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
        router.push('/dashboard');
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
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                  </div>
                </div>
                <CardTitle className="text-center text-white">Criar Conta</CardTitle>
                <p className="text-center text-zinc-400 text-sm mt-2">Registre-se para começar</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-zinc-300">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      {...registerForm.register('name')}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      placeholder="Seu nome"
                    />
                    {registerForm.formState.errors.name && <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="regEmail" className="text-zinc-300">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      {...registerForm.register('email')}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      placeholder="seu@email.com"
                    />
                    {registerForm.formState.errors.email && <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="regPassword" className="text-zinc-300">Senha</Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...registerForm.register('password')}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                        placeholder="Sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerForm.register('confirmPassword')}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                        placeholder="Confirme sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                      <AlertDescription className="text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-zinc-900/80 text-zinc-400">ou</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsRegistered(true)} className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                  Já tem conta? Faça login
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                </div>
              </div>
              <CardTitle className="text-center text-white">Bem-vindo</CardTitle>
              <p className="text-center text-zinc-400 text-sm mt-2">Acesse sua conta</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="seu@email.com"
                  />
                  {loginForm.formState.errors.email && <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.password.message}</p>}
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900/80 text-zinc-400">ou</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsRegistered(false)} className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                Não tem conta? Registre-se
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

