'use client';

import { Sidebar } from '@/components/navigation/Sidebar';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser, User } from '@/api/user';

export default function PlanosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState([
    {
      name: 'Básico',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 10 assinaturas',
        'Compartilhamento básico',
        'Relatórios mensais',
        'Suporte por email',
      ],
      isCurrent: true,
    },
    {
      name: 'Pro',
      price: 'R$ 59,90',
      period: '/mês',
      description: 'Para quem quer mais',
      features: [
        'Até 30 assinaturas',
        'Compartilhamento ilimitado',
        'Relatórios semanais e insights de IA',
        'Suporte prioritário',
        'Notificações personalizadas',
      ],
      isCurrent: false,
    },
    {
      name: 'Premium',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'Sem limites',
      features: [
        'Assinaturas ilimitadas',
        'Compartilhamento ilimitado',
        'Relatórios ilimitados e insights de IA',
        'Suporte 24/7',
        'Notificações personalizadas',
        'API de integração',
        'Análise avançada',
      ],
      isCurrent: false,
    },
  ]);

  useEffect(() => {
    async function fetchUser() {
      const me = await getCurrentUser();
      setUser(me);
    }
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar activePage="plans" />
      
      <main className="flex-1 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Planos</h1>
            <p className="text-zinc-400">Escolha o plano ideal para suas necessidades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="relative flex flex-col bg-zinc-900/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-white/20 transition-all duration-300 min-h-[600px]"
              >
                {plan.isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 rounded-full shadow-[0_10px_28px_rgba(16,185,129,0.25)]">
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      Seu plano atual
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-zinc-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-zinc-400 text-lg">{plan.period}</span>
                    </div>
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <Check className="h-3 w-3 text-emerald-400" />
                            </div>
                          </div>
                          <span className="text-zinc-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.isCurrent
                        ? 'bg-zinc-800 text-zinc-400 shadow-[0_10px_28px_rgba(16,185,129,0.15)] cursor-not-allowed'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                    disabled={plan.isCurrent}
                  >
                    {plan.isCurrent ? 'Plano Atual' : 'Disponível em breve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
