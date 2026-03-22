import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '../lib/utils';

interface StateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'A carregar...', className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 gap-4", className)}>
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Ocorreu um erro ao carregar os dados.', className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 gap-4 text-center", className)}>
      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <p className="text-slate-600 font-medium max-w-xs">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'Nenhum dado encontrado.', className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 gap-4 text-center", className)}>
      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
        <Inbox className="w-6 h-6" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
