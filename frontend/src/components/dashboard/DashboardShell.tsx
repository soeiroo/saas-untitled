'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import LogoutButton from '@/components/ui/LogoutButton';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';
import { LayoutDashboard, CreditCard, Settings, User as UserIcon } from 'lucide-react';

export type DashboardSection = 'overview' | 'subscriptions';

interface DashboardShellProps {
  active: DashboardSection;
  title: string;
  subtitle?: string;
  rightBadges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'outline' }>;
  children: React.ReactNode;
}

export default function DashboardShell({
  active,
  title,
  subtitle,
  rightBadges,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        setCurrentUser(me);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen>
        <Sidebar variant="inset">
              <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border bg-card flex items-center justify-center" />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">SaaS</p>
                    <p className="text-base font-semibold truncate">Assinaturas Pro</p>
                  </div>
                </div>

                {currentUser && (
                  <div className="mt-4 rounded-2xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl border bg-background flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </SidebarHeader>

              <SidebarSeparator />

              <SidebarContent className="px-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={active === 'overview'} onClick={() => router.push('/overview')}>
                      <LayoutDashboard />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={active === 'subscriptions'}
                      onClick={() => router.push('/assinaturas')}
                    >
                      <CreditCard />
                      <span>Assinaturas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => router.push('/profile')}>
                      <Settings />
                      <span>Configurações</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter className="p-3">
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Plano atual</p>
                  <p className="text-sm font-semibold">Starter</p>
                  <p className="text-xs text-muted-foreground mt-1">Upgrade disponível</p>
                </div>
                <div className="mt-2">
                  <LogoutButton floating={false} className="w-full" />
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset>
              <div className="px-4 md:px-6 py-6">
                <div className="flex items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-start md:items-center gap-3">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
                      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                  </div>

                  {rightBadges && rightBadges.length > 0 && (
                    <div className="hidden md:flex flex-wrap items-center justify-end gap-2">
                      {rightBadges.map((b) => (
                        <Badge key={b.label} variant={b.variant ?? 'outline'}>
                          {b.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {children}
              </div>
            </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
