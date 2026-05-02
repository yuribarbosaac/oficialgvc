import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { normalizarVisita, traduzirPerfil } from '../../lib/utils';
import { 
  Users, 
  Lock, 
  AlertCircle, 
  Clock,
  MapPin,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { userData, spaceConfig } = useAuth();
  const [stats, setStats] = useState({
    visitorsToday: 0,
    activeVisits: 0,
    occupiedLockers: 0,
    exceededVisits: 0
  });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userData) return;
    const isGlobal = userData.perfil === 'administrador' || userData.espacoId === 'todos';
    const targetSpaceId = userData.espacoId;

    try {
      const today = new Date();
      const startToday = startOfDay(today).toISOString();
      const endToday = endOfDay(today).toISOString();

      // 1. Visitantes Hoje
      let qToday = supabase.from('visits').select('*', { count: 'exact', head: true })
        .gte('checkin', startToday)
        .lte('checkin', endToday);
      if (!isGlobal) qToday = qToday.eq('espaco_id', targetSpaceId);
      const { count: countToday } = await qToday;

      // 2. Visitas Ativas
      let qActive = supabase.from('visits').select('*')
        .eq('status', 'Ativo');
      if (!isGlobal) qActive = qActive.eq('espaco_id', targetSpaceId);
      const { data: activeData } = await qActive;
      const activeVisitsCount = activeData?.length || 0;
      const occupiedLockersCount = activeData?.filter(d => d.armario).length || 0;

      // 3. Visitas Excedidas
      let qExceeded = supabase.from('visits').select('*', { count: 'exact', head: true })
        .eq('status', 'Excedido');
      if (!isGlobal) qExceeded = qExceeded.eq('espaco_id', targetSpaceId);
      const { count: countExceeded } = await qExceeded;

      setStats({
        visitorsToday: countToday || 0,
        activeVisits: activeVisitsCount,
        occupiedLockers: occupiedLockersCount,
        exceededVisits: countExceeded || 0
      });

      // 4. Últimos 5 Check-ins
      let qRecent = supabase.from('visits').select('*')
        .order('checkin', { ascending: false })
        .limit(5);
      if (!isGlobal) qRecent = qRecent.eq('espaco_id', targetSpaceId);
      const { data: recentData } = await qRecent;
      if (recentData) {
        setRecentVisits(recentData.map(doc => normalizarVisita(doc)));
      }

      // 5. Gráfico de 7 dias
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const start = startOfDay(day).toISOString();
        const end = endOfDay(day).toISOString();
        
        let q = supabase.from('visits').select('*', { count: 'exact', head: true })
          .gte('checkin', start)
          .lte('checkin', end);
        if (!isGlobal) q = q.eq('espaco_id', targetSpaceId);
        
        const { count } = await q;
        days.push({
          name: format(day, 'eee', { locale: ptBR }).toUpperCase(),
          count: count || 0,
          fullDate: format(day, 'dd/MM')
        });
      }
      setChartData(days);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchData();

    // Supabase Realtime Subscription
    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const formatTime = (ts: any) => {
    if (!ts) return '--:--';
    const date = new Date(ts);
    return format(date, 'HH:mm');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
          Bem-vindo ao GVC, {(userData?.nome || 'Usuário').split(" ")[0]}!
        </h1>
        {spaceConfig?.mensagemBoasVindas ? (
          <p className="text-gray-500 font-medium italic">"{spaceConfig.mensagemBoasVindas}"</p>
        ) : (
          <>
            {userData?.perfil === 'administrador' && (
              <p className="text-gray-500">Visão geral completa do sistema. Acompanhamento em tempo real das atividades.</p>
            )}
            {userData?.perfil === 'coordenador' && (
              <p className="text-gray-500">Gerencie as atividades do espaço: <strong className="text-slate-900">{userData.espacoNome}</strong> em {spaceConfig?.municipio || 'Acre'}</p>
            )}
            {userData?.perfil === 'funcionario' && (
              <p className="text-gray-500">Registre check-ins e gerencie armários de <strong>{userData.espacoNome}</strong></p>
            )}
          </>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Visitantes Hoje" 
          value={stats.visitorsToday.toString()} 
          icon={<Users className="text-blue-600" />} 
          color="blue"
        />
        <StatCard 
          label="Visitas Ativas" 
          value={stats.activeVisits.toString()} 
          icon={<Clock className="text-emerald-600" />} 
          color="emerald"
        />
        <StatCard 
          label="Armários Ocupados" 
          value={stats.occupiedLockers.toString()} 
          icon={<Lock className="text-amber-600" />} 
          color="amber"
          desc={`De ${spaceConfig?.totalArmarios || 20} armários disponíveis`}
        />
        <StatCard 
          label="Visitas Excedidas" 
          value={stats.exceededVisits.toString()} 
          icon={<AlertCircle className="text-red-600" />} 
          color="red"
          isAlert={stats.exceededVisits > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-lg font-display font-bold text-gray-900">Volume de Visitas</h3>
               <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Últimos 7 Dias</p>
             </div>
             <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
               <TrendingUp size={16} /> Total: {chartData.reduce((acc, curr) => acc + curr.count, 0)}
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? '#1e3a8a' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Últimos Check-ins</h3>
            </div>
            <Link 
              to="/reports" 
              className="group flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-tighter hover:gap-2 transition-all"
            >
              Ver Relatórios <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
             {loading ? (
               <div className="p-8 text-center animate-pulse text-gray-400">Carregando...</div>
             ) : recentVisits.length > 0 ? recentVisits.map((visit) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={visit.id} 
                  className="p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                      {visit.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                     <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{visit.nome}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-wide">
                         <MapPin size={10} className="text-primary" /> {visit.local}
                         <span className="mx-1">•</span>
                         {traduzirPerfil(visit.perfil)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{formatTime(visit.checkin)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm inline-block mt-1 ${
                        visit.status === 'Ativo' || visit.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        (visit.status === 'Concluído' || visit.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700')
                      }`}>
                        {visit.status === 'Ativo' || visit.status === 'active' ? 'Em curso' : (visit.status === 'Concluído' || visit.status === 'completed' ? 'Encerrado' : visit.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )) : (
               <div className="p-12 text-center text-gray-400 italic text-sm">Nenhum check-in registrado.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, desc, isAlert }: any) {
  const colors: Record<string, string> = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50/30 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50/30 text-amber-700',
    red: 'border-red-100 bg-red-50/30 text-red-700'
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border shadow-sm transition-all ${isAlert ? 'border-red-200 bg-red-50' : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color] || 'bg-gray-100'}`}>
          {icon}
        </div>
        {isAlert && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={`text-3xl font-display font-black ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</h4>
        {desc && <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tight">{desc}</p>}
      </div>
    </motion.div>
  );
}
