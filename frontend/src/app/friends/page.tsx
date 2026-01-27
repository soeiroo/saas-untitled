import FriendsPage from '@/pages/FriendsPage';
import AuthGuard from '@/utils/authGuard';

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <FriendsPage />
    </AuthGuard>
  );
}