'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        // verificar se o usuário está autenticado
        const token = localStorage.getItem('authToken');
        
        if (token) {
            router.replace('/dashboard');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return null;
}