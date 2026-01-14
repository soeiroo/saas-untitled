import HomePage from '@/pages/HomePage';
import { useRouter } from 'next/dist/client/components/navigation';
import { useEffect } from 'react';


export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
      // verificar se o usuário está autenticado
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.replace('/login');
      }
  }, [router]);
        
  return <HomePage />;
}
