import React from 'react';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Agendamento() {
  const { userData } = useAuth();
  
  const canAccess = userData?.perfil === 'administrador' || userData?.perfil === 'coordenador';

  if (!canAccess) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Apenas administradores e coordenadores podem gerenciar agendamentos de espaços.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <CalendarDays size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">
            Agendamento de Espaços
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Gerencie reservas de salas, auditórios e espaços multiuso.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 text-center overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className="max-w-md mx-auto space-y-6">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
              <CalendarDays size={48} className="text-slate-300" />
           </div>
           
           <h2 className="text-2xl font-display font-bold text-slate-900">
             Módulo em Desenvolvimento
           </h2>
           
           <p className="text-slate-500 leading-relaxed">
             O módulo de <b>Agendamento de Espaços</b> está sendo preparado para oferecer uma experiência completa de gestão de eventos. Em breve você poderá criar, aprovar e visualizar cronogramas de uso das salas.
           </p>

           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             Lançamento em Breve
           </div>
        </div>
      </div>
    </div>
  );
}
