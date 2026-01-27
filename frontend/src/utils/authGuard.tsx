'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectAuthenticatedTo?: string;
  redirectUnauthenticatedTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = false,
  redirectAuthenticatedTo = '/dashboard',
  redirectUnauthenticatedTo = '/login',
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!requireAuth && pathname === '/') {
      if (token) {
        router.replace(redirectAuthenticatedTo);
      } else {
        router.replace(redirectUnauthenticatedTo);
      }
      return;
    }
    if (requireAuth && !token) {
      router.replace(redirectUnauthenticatedTo);
      return;
    }
    if (!requireAuth && token && pathname === '/login') {
      router.replace(redirectAuthenticatedTo);
      return;
    }
    setIsChecking(false);
  }, [router, pathname, requireAuth, redirectAuthenticatedTo, redirectUnauthenticatedTo]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border border-purple-500/30 animate-[pulse_2.5s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 animate-[ping_1.8s_ease-in-out_infinite]" />
            </div>
          </div>
          <p className="text-sm text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
