'use client';

import DashboardPage from '@/pages/DashboardPage';
import AuthGuard from '@/utils/authGuard';
import { useRouter } from 'next/dist/client/components/navigation';
import { useEffect } from 'react';


export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/login');
      }
  }, [router]);
        
    return (
      <AuthGuard requireAuth>
        <DashboardPage />
      </AuthGuard>
    );
}
