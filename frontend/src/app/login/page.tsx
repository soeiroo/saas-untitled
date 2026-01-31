import LoginPage from '@/pages/LoginPage';
import AuthGuard from '@/utils/authGuard';

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginPage />
    </AuthGuard>
  );
}

