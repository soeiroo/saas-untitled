import AuthGuard from '@/utils/authGuard';
import LandingPage from '@/components/landing/LandingPage';

export default function Page() {
    return  <AuthGuard requireAuth={false}><LandingPage /></AuthGuard>;

}