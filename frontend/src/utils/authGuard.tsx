'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/common/LoadingScreen';

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
      setIsChecking(false);
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
    return <LoadingScreen label="Carregando..." />;
  }

  return <>{children}</>;
}
