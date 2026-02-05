import '@/styles/sidebar.css';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Contact, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '@/api/user';
import type { User } from '@/types/user';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

interface SidebarProps {
  activePage: 'overview' | 'subscriptions' | 'friends' | 'reports' | 'settings';
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileActions, setShowProfileActions] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved !== null) setIsExpanded(saved === 'true');
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const me = await getCurrentUser();
        if (mounted) setUser(me);
      } catch {
        // ignore
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showProfileActions) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (sidebarRef.current && target && !sidebarRef.current.contains(target)) {
        setShowProfileActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileActions]);

  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarExpanded', String(next));
      }
      return next;
    });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Deseja sair da conta?');
    if (!confirmLogout) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen bg-zinc-950/45 border-r border-white/5 px-2 py-6 backdrop-blur-xl overflow-hidden z-40 ${isExpanded ? 'is-expanded px-5' : ''}`}
      >
        <div className="flex flex-col items-center justify-center min-h-16 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.55)] flex items-center justify-center mx-auto">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
          </div>
          <div className="sidebar-label opacity-0 transition-opacity duration-200 mt-2">
            <p className="text-base font-semibold sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Nexio</p>
          </div>
        </div>
        <div className={`mb-6 flex ${isExpanded ? 'justify-start' : 'justify-center'} px-1`}>
          <button
            type="button"
            onClick={toggleSidebar}
            className={`inline-flex h-8 items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-950/50 text-zinc-300 transition hover:text-white hover:bg-white/5 ${
              isExpanded ? 'px-3' : 'w-8'
            }`}
            aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {isExpanded && <span className="text-[11px] font-medium text-zinc-400">Recolher</span>}
          </button>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/dashboard"
            className={`sidebar-item flex items-center rounded-lg border transition-all duration-300 px-0 py-0 h-12 w-full ${activePage === 'overview'
                ? 'bg-emerald-500/10 text-emerald-200 border-white/10 shadow-[0_14px_34px_rgba(16,185,129,0.10)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            style={{ minHeight: '3rem' }}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Visão geral</span>
            </span>
            {activePage === 'overview' && (
              <span className="text-xs text-emerald-400 sidebar-label opacity-0 transition-opacity duration-200 pr-3">Atual</span>
            )}
          </Link>
          <Link
            href="/friends"
            className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${activePage === 'friends'
                ? 'bg-emerald-500/10 text-emerald-200 border border-white/10 shadow-[0_14px_34px_rgba(16,185,129,0.10)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            style={{ minHeight: '3rem' }}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
              <Contact className="h-4 w-4 flex-shrink-0" />
              <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Amigos</span>
            </span>
            {activePage === 'friends' && (
              <span className="text-xs text-emerald-400 sidebar-label opacity-0 transition-opacity duration-200 pr-3">Atual</span>
            )}
          </Link>
          <Link
            href="/assinaturas"
            className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${activePage === 'subscriptions'
                ? 'bg-emerald-500/10 text-emerald-200 border border-white/10 shadow-[0_14px_34px_rgba(16,185,129,0.10)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            style={{ minHeight: '3rem' }}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Assinaturas</span>
            </span>
            {activePage === 'subscriptions' && (
              <span className="text-xs text-emerald-400 sidebar-label opacity-0 transition-opacity duration-200 pr-3">Atual</span>
            )}
          </Link>
          <button
            className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${activePage === 'reports'
                ? 'bg-emerald-500/10 text-emerald-200 border border-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            style={{ minHeight: '3rem' }}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Relatórios</span>
            </span>
            <span className="text-xs sidebar-label opacity-0 transition-opacity duration-200 pr-3">Em breve</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 space-y-3">
          <div
            className={`space-y-2 overflow-hidden transition-all duration-200 ease-out ${
              showProfileActions ? 'max-h-32 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1.5 text-left transition hover:border-white/20 hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <LogOut className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="min-w-0 sidebar-label opacity-0 transition-opacity duration-200">
                  <p className="text-xs font-medium text-white">Sair da conta</p>
                  <p className="text-[10px] text-zinc-500">Encerrar sessão</p>
                </div>
              </div>
            </button>

            <Link
              href="/profile"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1.5 text-left transition hover:border-white/20 hover:bg-white/5"
              onClick={() => setShowProfileActions(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <Settings className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="min-w-0 sidebar-label opacity-0 transition-opacity duration-200">
                  <p className="text-xs font-medium text-white">Configurações</p>
                  <p className="text-[10px] text-zinc-500">Conta e segurança</p>
                </div>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileActions((prev) => !prev)}
            className={`w-full rounded-xl border bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 px-3 py-2 text-left transition duration-200 ${
              showProfileActions
                ? 'border-emerald-500/30 shadow-[0_10px_28px_rgba(16,185,129,0.12)]'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
            aria-expanded={showProfileActions}
          >
            <div className={`flex items-center gap-3 ${isExpanded ? '' : 'justify-center'}`}>
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <ImageWithFallback src={user.profilePicture} alt={user.name ?? 'Usuário'} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] font-semibold text-white/80">{initials}</span>
                )}
              </div>
              <div className="min-w-0 sidebar-label opacity-0 transition-opacity duration-200">
                <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Minha conta'}</p>
                <p className="text-[11px] text-zinc-400 truncate">Perfil</p>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <div className={`sidebar hidden lg:block shrink-0 ${isExpanded ? 'is-expanded' : ''}`} aria-hidden="true" />
    </>
  );
};
