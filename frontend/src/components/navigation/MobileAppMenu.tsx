'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, Settings, CreditCard, LogOut, Contact } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/components/ui/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

interface MobileAppMenuProps {
  title?: string;
  items?: NavItem[];
}

export default function MobileAppMenu({
  title = 'Assinaturas Pro',
  items,
}: MobileAppMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () =>
      items ?? [
        { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, badge: 'Atual' },
        { href: '/assinaturas', label: 'Assinaturas', icon: CreditCard },
        { href: '/friends', label: 'Amigos', icon: Contact },
        { href: '/profile', label: 'Conta', icon: Settings },
      ],
    [items],
  );

  const handleLogout = () => {
    const confirmLogout = window.confirm('Deseja realmente sair?');
    if (!confirmLogout) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="lg:hidden sticky top-0 z-50 border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-200 hover:bg-zinc-800/60"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Menu</p>
              <p className="text-sm font-semibold text-white">{title}</p>
            </div>
          </div>

          <SheetContent
            side="left"
            className="bg-zinc-950 border-r border-zinc-800/80 p-0"
          >
            <div className="flex h-full flex-col">
              <div className="px-5 pt-6 pb-4 border-b border-zinc-800/70">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{title}</p>
                    <p className="text-sm text-zinc-300">Menu principal</p>
                  </div>
                </div>

              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Navegação</div>
                <div className="mt-3 flex flex-col gap-3">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <SheetClose asChild key={item.href + item.label}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition',
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                              : 'bg-zinc-900/60 text-zinc-300 border-zinc-800/80 hover:bg-zinc-800/70 hover:text-white',
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-300' : 'text-zinc-400')} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Conta</div>
                  <div className="mt-3 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-3">
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition"
                        onClick={handleLogout}
                      >
                        <span className="flex items-center gap-3">
                          <LogOut className="h-4 w-4 text-zinc-400" />
                          Sair da conta
                        </span>
                        <span className="text-xs text-zinc-500">Agora</span>
                      </button>
                    </SheetClose>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-6">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <p className="text-xs text-zinc-500">Dica rápida</p>
                  <p className="text-sm text-zinc-300 mt-1">Use o menu lateral para acessar tudo no celular.</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
