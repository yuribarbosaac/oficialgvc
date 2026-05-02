import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'administrador' | 'coordenador' | 'funcionario';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, userData, loading, isAdmin, isCoordinator, isStaff, isSuperadmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  if (!user && !isSuperadmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  let hasAccess = true;
  if (requiredRole === 'administrador' && !isAdmin) hasAccess = false;
  if (requiredRole === 'coordenador' && !isCoordinator) hasAccess = false;
  if (requiredRole === 'funcionario' && !isStaff) hasAccess = false;

  if (!hasAccess) {
    let message = "Você não possui permissões suficientes para acessar esta funcionalidade.";
    
    if (location.pathname.startsWith('/reports') || location.pathname.startsWith('/relatorios')) {
      message = "🔒 Esta área é restrita a Coordenadores e Administradores.";
    } else if (location.pathname.startsWith('/configuracoes') || location.pathname.startsWith('/settings')) {
      message = "🔒 Apenas Administradores podem acessar as configurações do sistema.";
    }

    return (
      <div className="flex flex-col items-center justify-center h-[85vh] p-8 text-center bg-white/50 backdrop-blur-sm m-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-red-100">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">Acesso Interrompido</h2>
        <div className="bg-red-50 border border-red-100 px-6 py-4 rounded-2xl mb-8">
           <p className="text-red-700 font-bold">
             {message}
           </p>
        </div>
        <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
          Caso precise de acesso a este módulo, solicite a alteração do seu perfil ao administrador geral.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
