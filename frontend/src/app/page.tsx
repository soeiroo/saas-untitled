import { redirect } from 'next/navigation';

export default function Page() {
    // verificar se o usuário está autenticado
    const token = localStorage.getItem('authToken'); // substituir por verificação real de autenticação
    if (token) {
        redirect('/dashboard');
    } else {
        redirect('/login');
    }
}