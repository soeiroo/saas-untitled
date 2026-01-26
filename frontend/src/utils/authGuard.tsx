// src/utils/authGuard.tsx
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
  redirectAuthenticatedTo = '/overview',
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl border bg-card animate-pulse" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
