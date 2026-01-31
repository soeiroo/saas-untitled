import type { Metadata } from 'next';
import '../styles/index.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    default: 'Assinaturas Pro',
    template: '%s · Assinaturas Pro',
  },
  description: 'Painel inteligente para acompanhar assinaturas, renovações e compartilhamentos com clareza.',
  applicationName: 'Assinaturas Pro',
  authors: [{ name: 'Assinaturas Pro' }],
  generator: 'Next.js',
  keywords: ['assinaturas', 'finanças', 'SaaS', 'renovações', 'compartilhamento', 'controle'],
  metadataBase: new URL('https://assinaturaspro.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://assinaturaspro.com',
    siteName: 'Assinaturas Pro',
    title: 'Assinaturas Pro',
    description: 'Painel inteligente para acompanhar assinaturas, renovações e compartilhamentos com clareza.',
    images: [{ url: '/icon.svg', width: 512, height: 512, alt: 'Assinaturas Pro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assinaturas Pro',
    description: 'Painel inteligente para acompanhar assinaturas, renovações e compartilhamentos com clareza.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: '#0B0B0F',
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
