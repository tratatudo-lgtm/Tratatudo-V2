import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn } from '../lib/utils';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface StateProps {
import.meta.env.VITE_API_URL   message?: string;
import.meta.env.VITE_API_URL   className?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function LoadingState({ message = 'A carregar...', className }: StateProps) {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className={cn("flex flex-col items-center justify-center p-12 gap-4", className)}>
import.meta.env.VITE_API_URL       <Loader2 className="w-8 h-8 text-primary animate-spin" />
import.meta.env.VITE_API_URL       <p className="text-slate-500 font-medium">{message}</p>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function ErrorState({ message = 'Ocorreu um erro ao carregar os dados.', className }: StateProps) {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className={cn("flex flex-col items-center justify-center p-12 gap-4 text-center", className)}>
import.meta.env.VITE_API_URL       <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
import.meta.env.VITE_API_URL         <AlertCircle className="w-6 h-6" />
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL       <p className="text-slate-600 font-medium max-w-xs">{message}</p>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function EmptyState({ message = 'Nenhum dado encontrado.', className }: StateProps) {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className={cn("flex flex-col items-center justify-center p-12 gap-4 text-center", className)}>
import.meta.env.VITE_API_URL       <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
import.meta.env.VITE_API_URL         <Inbox className="w-6 h-6" />
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL       <p className="text-slate-500 font-medium">{message}</p>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
