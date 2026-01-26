'use client';

import ProfilePage from '@/pages/ProfilePage';
import AuthGuard from '@/utils/authGuard';
import { useRouter } from 'next/navigation';
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
      <ProfilePage />
    </AuthGuard>
  );
}
