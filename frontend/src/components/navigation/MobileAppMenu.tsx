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
        { href: '/overview', label: 'Overview', icon: LayoutDashboard, badge: 'Current' },
        { href: '/assinaturas', label: 'Assinaturas', icon: CreditCard },
        { href: '/profile', label: 'Account', icon: Settings },
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
    <div className="lg:hidden sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl border bg-card" />
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Menu</p>
              <p className="text-sm font-semibold">{title}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <SheetContent
            side="top"
            className="border-b bg-background p-4"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border bg-card" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">Navigation</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-card border p-2">
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
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={cn('h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={cn('text-xs', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Dica</p>
                <p className="text-sm text-muted-foreground mt-1">Use o menu para navegar no celular.</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
