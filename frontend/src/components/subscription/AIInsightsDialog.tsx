'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface AIInsightsDialogProps {
  open: boolean;
  onClose: () => void;
  insights: string;
}

export function AIInsightsDialog({ open, onClose, insights }: AIInsightsDialogProps) {
  // Processa o conteúdo para agrupar listas
  const renderContent = () => {
    if (!insights || insights.trim() === '') {
      return (
        <div className="text-center py-8">
          <p className="text-zinc-400">Nenhum insight disponível no momento.</p>
        </div>
      );
    }

    const lines = insights.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let elementKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elementKey++}`} className="list-disc list-inside space-y-2 my-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-zinc-300 ml-4">
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line) => {
      // Detecta títulos
      if (line.startsWith('##')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elementKey++}`} className="text-lg font-semibold text-emerald-400 mt-6 mb-2">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
      } else if (line.startsWith('#')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elementKey++}`} className="text-xl font-bold text-purple-400 mt-6 mb-3">
            {line.replace(/^#\s*/, '')}
          </h2>
        );
      } else if (line.match(/^\*\*.*\*\*$/)) {
        flushList();
        elements.push(
          <p key={`bold-${elementKey++}`} className="font-semibold text-zinc-200 mt-4">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        // Agrupa items de lista
        currentList.push(line.replace(/^[\*\-]\s*/, ''));
      } else if (line.trim() === '') {
        flushList();
        elements.push(<div key={`space-${elementKey++}`} className="h-2" />);
      } else {
        flushList();
        // Processa negrito inline **texto**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={`p-${elementKey++}`} className="text-zinc-300 leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
    });

    flushList(); // Flush qualquer lista pendente
    return elements;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Análise Inteligente de Gastos
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Insights gerados por IA para otimizar suas assinaturas
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {renderContent()}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <p className="text-xs text-zinc-400">
            💡 <strong>Dica:</strong> Esses insights são gerados por inteligência artificial com base nas suas assinaturas atuais. 
            Use-os como sugestões para otimizar seus gastos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
