import type { Metadata } from 'next';
import '../styles/index.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Controle de Assinaturas',
  description: 'Gerencie suas assinaturas pessoais e nunca perca uma cobrança',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
