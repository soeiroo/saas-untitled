// src/utils/authGuard.tsx
'use client';
import { useEffect } from 'react';
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

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!requireAuth && pathname === '/') {
      // Redireciona sempre do / para o destino correto
      if (token) {
        router.replace(redirectAuthenticatedTo);
      } else {
        router.replace(redirectUnauthenticatedTo);
      }
      return;
    }
    if (requireAuth && !token) {
      router.replace(redirectUnauthenticatedTo);
    } else if (!requireAuth && token && pathname === '/login') {
      router.replace(redirectAuthenticatedTo);
    }
  }, [router, pathname, requireAuth, redirectAuthenticatedTo, redirectUnauthenticatedTo]);

  return <>{children}</>;
}
