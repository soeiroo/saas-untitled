import '@/styles/sidebar.css';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Contact, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface SidebarProps {
  activePage: 'overview' | 'subscriptions' | 'friends' | 'reports' | 'settings';
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved !== null) setIsExpanded(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarExpanded', String(next));
      }
      return next;
    });
  };

  return (
    <aside className={`sidebar hidden lg:flex lg:flex-col lg:min-h-screen bg-zinc-900/80 border-r border-zinc-800 px-2 py-6 backdrop-blur overflow-hidden ${isExpanded ? 'is-expanded px-5' : ''}`}>
      <div className="flex flex-col items-center justify-center min-h-16 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex items-center justify-center mx-auto">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400" />
        </div>
        <div className="sidebar-label opacity-0 transition-opacity duration-200 mt-2">
          <p className="text-base font-semibold sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Assinaturas Pro</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="mx-auto mb-6 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition"
        aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <nav className="flex flex-col gap-2 text-sm">
        <Link
          href="/dashboard"
          className={`sidebar-item flex items-center rounded-lg border transition-all duration-300 px-0 py-0 h-12 w-full ${
            activePage === 'overview'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border-transparent'
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
          className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${
            activePage === 'friends'
              ? 'bg-emerald-500/10 text-emerald-200'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
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
          className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${
            activePage === 'subscriptions'
              ? 'bg-emerald-500/10 text-emerald-200'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
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
          className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 w-full ${
            activePage === 'reports'
              ? 'bg-emerald-500/10 text-emerald-200'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
          style={{ minHeight: '3rem' }}
        >
          <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Relatórios</span>
          </span>
          <span className="text-xs sidebar-label opacity-0 transition-opacity duration-200 pr-3">Em breve</span>
        </button>
        <Link
          href="/profile"
          className={`sidebar-item flex items-center rounded-lg transition-all duration-300 px-0 py-0 h-12 ${isExpanded ? 'w-full' : 'w-[70%]'} ${
            activePage === 'settings'
              ? 'bg-emerald-500/10 text-emerald-200'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
          style={{ minHeight: '3rem' }}
        >
          <span className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="sidebar-label opacity-0 transition-opacity duration-200 whitespace-nowrap">Configurações</span>
          </span>
        </Link>
      </nav>
      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-4 opacity-0 transition-opacity duration-200">
          <p className="text-xs text-zinc-500">Plano atual</p>
          <p className="text-sm font-semibold">Inicial</p>
          <p className="text-xs text-emerald-400 mt-1">Upgrade disponível</p>
        </div>
      </div>
    </aside>
  );
};
