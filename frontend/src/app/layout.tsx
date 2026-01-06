import type { Metadata } from 'next';
import '../styles/index.css';

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
      <body>{children}</body>
    </html>
  );
}
