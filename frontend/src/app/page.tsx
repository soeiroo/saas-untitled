//temporário para redirecionar para o dashboard
import { redirect } from 'next/navigation';

export default function Page() {
    redirect('/login');
}