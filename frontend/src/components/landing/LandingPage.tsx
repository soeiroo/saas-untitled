'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCounter } from '@/components/common/StatCounter';
import Particles from '@/components/Particles';

const highlights = [
  {
    title: 'Controle total das assinaturas',
    description: 'Visualize gastos, renovações e planos em um só painel com clareza.',
    icon: Sparkles,
  },
  {
    title: 'Compartilhamento inteligente',
    description: 'Divida valores com amigos e deixe claro o que cada um deve pagar.',
    icon: Users,
  },
  {
    title: 'Segurança e privacidade',
    description: 'Seus dados protegidos com boas práticas e acessos seguros.',
    icon: ShieldCheck,
  },
];

const steps = [
  'Cadastre suas assinaturas em minutos',
  'Organize por categoria e próximas cobranças',
  'Compartilhe e acompanhe valores combinados',
];

const stats = [
  { label: 'Assinaturas gerenciadas', value: 120, suffix: '+' },
  { label: 'Economia média', value: 23, suffix: '%' },
  { label: 'Renovações evitadas', value: 300, suffix: '+' },
];

const marqueeItems = [
  'Controle total das assinaturas',
  'Compartilhamento inteligente',
  'Segurança e privacidade',
  'Notificações antes de renovar',
  'Visão compartilhada com amigos',
  'Insights de gastos recorrentes',
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const repeatedMarqueeItems = useMemo(() => [...marqueeItems, ...marqueeItems], []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, scale: 0.97, y: 24 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-zinc-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(139,92,246,0.12),_transparent_45%)]" />
        <div className="absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(63,63,70,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(63,63,70,0.15)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 pointer-events-none opacity-45 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
          <Particles
            className="absolute inset-0"
            particleCount={160}
            particleSpread={10}
            speed={0.08}
            particleColors={['#10B981', '#8B5CF6', '#ffffff']}
            alphaParticles
            particleBaseSize={90}
            sizeRandomness={1.2}
            cameraDistance={20}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
        <div className="relative">
          <header className="px-6 py-6 lg:px-12">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="Logo" className="h-10 w-10 rounded-full" />
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Nexio</p>
                <p className="text-sm font-semibold text-white">Assinaturas inteligentes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="bg-zinc-900/60 border-zinc-700 text-white hover:bg-zinc-800 shadow-none hover:shadow-none">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white hidden sm:inline-flex shadow-none hover:shadow-none">
                <Link href="/login">Começar agora</Link>
              </Button>
            </div>
            </div>
          </header>

          <main className="px-6 pb-16 lg:px-12">
            <section className="reveal-section max-w-6xl mx-auto pt-10 lg:pt-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-emerald-300">
                  Controle total
                </span>
                <h1 className="text-4xl sm:text-6xl font-semibold text-white leading-[1.05]">
                  O painel moderno para gerenciar assinaturas sem esforço.
                </h1>
                <p className="text-base sm:text-lg text-zinc-300 max-w-xl">
                  Acompanhe gastos, próximas cobranças e compartilhamentos em um fluxo simples,
                  inspirado nos melhores layouts da Webflow.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none hover:shadow-none">
                    <Link href="/login">Experimentar agora</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-zinc-900/60 border-zinc-700 text-white hover:bg-zinc-800 shadow-none hover:shadow-none">
                    <Link href="/login">Ver demo</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Configuração rápida
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    Dados protegidos
                  </span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-zinc-900/70 border-zinc-800 p-5 shadow-lg shadow-black/30 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Visão geral</p>
                    <span className="text-xs text-emerald-300">Hoje</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                        <p className="text-lg font-semibold text-white mt-2">
                          <StatCounter
                            target={stat.value}
                            formatter={(value) => `${Math.round(value)}${stat.suffix ?? ''}`}
                          />
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="bg-zinc-900/70 border-zinc-800 p-5 shadow-lg shadow-black/30">
                  <p className="text-sm text-zinc-400">Próxima renovação</p>
                  <p className="text-xl text-white font-semibold mt-3">Spotify Premium · 02 Fev</p>
                  <p className="text-xs text-emerald-300 mt-2">Você paga: R$ 9,90</p>
                </Card>
                <Card className="bg-zinc-900/70 border-zinc-800 p-5 shadow-lg shadow-black/30">
                  <p className="text-sm text-zinc-400 mb-3">Fluxo claro em 3 passos</p>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <section className="reveal-section max-w-6xl mx-auto mt-12">
              <div className="marquee rounded-2xl border border-zinc-800/70 bg-zinc-900/50 px-2 py-3">
                <div className="marquee-track gap-6">
                  {repeatedMarqueeItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center gap-3 rounded-full border border-zinc-800/80 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-300"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="reveal-section max-w-6xl mx-auto mt-16 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="group bg-zinc-900/70 border-zinc-800 p-6 transition hover:-translate-y-1 hover:border-zinc-700/80 hover:bg-zinc-900/90">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </Card>
                );
              })}
            </section>

            <section className="reveal-section max-w-6xl mx-auto mt-16 grid lg:grid-cols-2 gap-8 items-center">
              <Card className="bg-zinc-900/70 border-zinc-800 p-6">
                <h3 className="text-2xl font-semibold text-white mb-4">Fluxo claro em 3 passos</h3>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
                      <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-300">{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="space-y-5">
                <h3 className="text-3xl font-semibold text-white">Pronto para tornar sua rotina mais inteligente?</h3>
                <p className="text-base text-zinc-300">
                  Use uma experiência premium, visualmente refinada e feita para deixar cada assinatura sob controle.
                </p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  {[
                    'Notificações antes de renovar',
                    'Visão compartilhada com amigos',
                    'Insights de gastos recorrentes',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none hover:shadow-none">
                  <Link href="/login" className="inline-flex items-center gap-2">
                    Criar minha conta
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>

            <section className="reveal-section max-w-6xl mx-auto mt-16">
              <Card className="bg-zinc-900/70 border-zinc-800 p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Experiência premium</p>
                  <h3 className="text-2xl font-semibold text-white mt-2">Leve a gestão de assinaturas para outro nível</h3>
                  <p className="text-sm text-zinc-400 mt-2 max-w-xl">
                    Uma interface limpa, moderna e preparada para escalar com você.
                  </p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none hover:shadow-none">
                  <Link href="/login">Solicitar acesso</Link>
                </Button>
              </Card>
            </section>
          </main>

          <footer className="px-6 py-10 lg:px-12 border-t border-zinc-800/60">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="text-sm text-zinc-500">© 2026 Nexio. Todos os direitos reservados.</div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <Link href="/login" className="hover:text-white transition">Entrar</Link>
                <Link href="/login" className="hover:text-white transition">Começar</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
