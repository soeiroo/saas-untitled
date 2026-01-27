'use client';

import DashboardOverviewPage from '@/pages/DashboardOverviewPage';
import AuthGuard from '@/utils/authGuard';
import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/components/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) router.replace('/login');
  }, [router]);

  return (
    <AuthGuard requireAuth>
      <DashboardOverviewPage />
    </AuthGuard>
  );
}
