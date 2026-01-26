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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className="relative">
          <SidebarProvider defaultOpen>
            <Sidebar variant="inset" className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
              <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">SaaS</p>
                    <p className="text-base font-semibold text-white truncate">Assinaturas Pro</p>
                  </div>
                </div>

                {currentUser && (
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </SidebarHeader>

              <SidebarSeparator className="bg-zinc-800/80" />

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
                <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/70 to-zinc-900/30 p-4">
                  <p className="text-xs text-zinc-500">Plano atual</p>
                  <p className="text-sm font-semibold text-white">Starter</p>
                  <p className="text-xs text-emerald-400 mt-1">Upgrade disponível</p>
                </div>
                <div className="mt-2">
                  <LogoutButton floating={false} className="w-full" />
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="bg-transparent">
              <div className="px-4 md:px-6 py-6">
                <div className="flex items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-start md:items-center gap-3">
                    <SidebarTrigger className="md:hidden text-zinc-200 hover:bg-zinc-800/60" />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
                      {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
                    </div>
                  </div>

                  {rightBadges && rightBadges.length > 0 && (
                    <div className="hidden md:flex flex-wrap items-center justify-end gap-2">
                      {rightBadges.map((b) => (
                        <Badge
                          key={b.label}
                          variant={b.variant ?? 'outline'}
                          className={
                            (b.variant ?? 'outline') === 'outline'
                              ? 'bg-zinc-900/70 text-zinc-300 border border-zinc-800'
                              : undefined
                          }
                        >
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
      </div>
    </div>
  );
}
