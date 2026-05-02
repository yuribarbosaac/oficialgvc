import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Activity, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuditoriaTab: React.FC = () => {
  const { isCoordinator } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCoordinator) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      const { data, error } = await supabase.from('auditoria')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (data) {
        setLogs(data.map(d => ({
          ...d,
          entidadeId: d.entidade_id
        })));
      }
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase.channel('auditoria-updates-tab')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auditoria' }, () => {
        fetchLogs();
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCoordinator]);

  if (!isCoordinator) {
    return (
      <div className="p-12 text-center text-slate-400 italic">
        Acesso negado. Apenas coordenadores e administradores podem visualizar os logs.
      </div>
    );
  }

  const getAcaoBadge = (acao: string) => {
    const map: Record<string, string> = {
      'criou_usuario': 'bg-blue-100 text-blue-700',
      'excluiu_usuario': 'bg-red-100 text-red-700',
      'editou_usuario': 'bg-amber-100 text-amber-700',
      'criou_espaco': 'bg-emerald-100 text-emerald-700',
      'excluiu_espaco': 'bg-red-100 text-red-700',
      'editou_espaco': 'bg-amber-100 text-amber-700',
      'alterou_configuracoes': 'bg-purple-100 text-purple-700',
      'exportou_backup': 'bg-slate-100 text-slate-700',
      'excluiu_visita': 'bg-red-100 text-red-700'
    };
    return map[acao] || 'bg-slate-100 text-slate-700';
  };

  const getAcaoLabel = (acao: string) => {
    return acao.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Log de Auditoria</h3>
        <p className="text-slate-500 text-sm">Rastreamento das últimas 50 ações administrativas realizadas no sistema.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data/Hora</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ação</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center animate-pulse text-slate-400 italic">Carregando auditoria...</td></tr>
              ) : logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Clock size={12} className="text-slate-400" />
                      {log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : 'Processando...'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{log.usuario}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.perfil}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getAcaoBadge(log.acao)}`}>
                      {getAcaoLabel(log.acao)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-medium">{log.detalhes}</p>
                    {log.entidadeId && <p className="text-[10px] text-slate-400 font-mono">ID: {log.entidadeId}</p>}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic flex flex-col items-center gap-3">
                     <Activity size={32} className="text-slate-200" />
                     Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaTab;
