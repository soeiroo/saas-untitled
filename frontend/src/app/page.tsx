import AuthGuard from '@/utils/authGuard';

export default function Page() {
    return  <AuthGuard requireAuth={false}>{null}</AuthGuard>;

}