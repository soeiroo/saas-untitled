'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, Settings, CreditCard, LogOut } from 'lucide-react';

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
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Current' },
        { href: '/profile', label: 'Account', icon: Settings },
        { href: '/dashboard', label: 'Plan & Billing', icon: CreditCard, badge: 'Soon' },
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
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Menu</p>
              <p className="text-sm font-semibold text-white">{title}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-200 hover:bg-zinc-800/60"
            aria-label="Sair"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <SheetContent
            side="top"
            className="bg-zinc-950 border-b border-zinc-800 p-4"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{title}</p>
                    <p className="text-sm text-zinc-300">Navigation</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <SheetClose asChild key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm transition',
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/20'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white',
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-300' : 'text-zinc-400')} />
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={cn('text-xs', isActive ? 'text-emerald-300' : 'text-zinc-500')}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="text-xs text-zinc-500">Dica</p>
                <p className="text-sm text-zinc-300 mt-1">Use o menu para navegar no celular.</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
