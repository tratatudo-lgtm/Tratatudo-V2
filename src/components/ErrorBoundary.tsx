import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <h1 className="text-2xl font-black text-slate-900 mb-4">Erro ao iniciar a aplicação</h1>
            <p className="text-slate-600 font-medium mb-6">
              Ocorreu um erro inesperado ao carregar o TrataTudo. Por favor, verifique a consola do navegador para mais detalhes.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
