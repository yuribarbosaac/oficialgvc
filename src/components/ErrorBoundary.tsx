import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Critical UI Error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 p-8 text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Ocorreu um erro inesperado na interface. Nossa equipe de monitoramento já foi notificada.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detalhes Técnicos</p>
              <p className="text-xs font-mono text-red-600 break-all">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <RefreshCcw size={18} /> Recarregar
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Home size={18} /> Início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
