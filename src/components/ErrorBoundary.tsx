import.meta.env.VITE_API_URL import * as React from 'react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Props {
import.meta.env.VITE_API_URL   children: React.ReactNode;
import.meta.env.VITE_API_URL   fallback?: React.ReactNode;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface State {
import.meta.env.VITE_API_URL   hasError: boolean;
import.meta.env.VITE_API_URL   error: Error | null;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export class ErrorBoundary extends React.Component<any, any> {
import.meta.env.VITE_API_URL   constructor(props: any) {
import.meta.env.VITE_API_URL     super(props);
import.meta.env.VITE_API_URL     this.state = { hasError: false, error: null };
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   public static getDerivedStateFromError(error: Error): State {
import.meta.env.VITE_API_URL     return { hasError: true, error };
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
import.meta.env.VITE_API_URL     console.error('Uncaught error:', error, errorInfo);
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   public render() {
import.meta.env.VITE_API_URL     if (this.state.hasError) {
import.meta.env.VITE_API_URL       return this.props.fallback || (
import.meta.env.VITE_API_URL         <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
import.meta.env.VITE_API_URL           <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
import.meta.env.VITE_API_URL             <h1 className="text-2xl font-black text-slate-900 mb-4">Erro ao iniciar a aplicação</h1>
import.meta.env.VITE_API_URL             <p className="text-slate-600 font-medium mb-6">
import.meta.env.VITE_API_URL               Ocorreu um erro inesperado ao carregar o TrataTudo. Por favor, verifique a consola do navegador para mais detalhes.
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={() => window.location.reload()}
import.meta.env.VITE_API_URL               className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               Recarregar Aplicação
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       );
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return this.props.children;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL }
