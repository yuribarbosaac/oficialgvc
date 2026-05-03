import { useState, useEffect, useCallback } from 'react';
import { visitService } from '../services/visitService';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  visitorsToday: number;
  activeVisits: number;
  occupiedLockers: number;
  exceededVisits: number;
}

export interface RecentVisit {
  id: string;
  nome: string;
  local: string;
  perfil: string;
  checkin: string;
  checkout: string | null;
  status: string;
}

export interface ChartData {
  name: string;
  count: number;
  fullDate: string;
}

interface UseDashboardStatsResult {
  stats: DashboardStats;
  recentVisits: RecentVisit[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardStats(spaceId: string | null): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats>({
    visitorsToday: 0,
    activeVisits: 0,
    occupiedLockers: 0,
    exceededVisits: 0
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!spaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const startToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const [countResult, activeResult, recentResult, chartResult] = await Promise.all([
        visitService.countToday(spaceId),
        visitService.listActive(spaceId),
        visitService.listHistory(spaceId, 5),
        fetchChartData(spaceId)
      ]);

      const activeData = activeResult.data || [];
      const occupiedLockersCount = activeData.filter((d: any) => d.armario).length;

      setStats({
        visitorsToday: countResult.count || 0,
        activeVisits: activeData.length,
        occupiedLockers: occupiedLockersCount,
        exceededVisits: activeData.filter((d: any) => d.status === 'Excedido').length
      });

      if (recentResult.data) {
        setRecentVisits(recentResult.data.map((doc: any) => normalizeVisit(doc)));
      }

      if (chartResult) {
        setChartData(chartResult);
      }

    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setError("Falha ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('dashboard-stats-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { stats, recentVisits, chartData, loading, error, refetch: fetchData };
}

async function fetchChartData(spaceId: string): Promise<ChartData[]> {
  const days: ChartData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const start = new Date(day.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(day.setHours(23, 59, 59, 999)).toISOString();

    const { count } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('espaco_id', spaceId)
      .gte('checkin', start)
      .lte('checkin', end);

    days.push({
      name: formatDayName(day),
      count: count || 0,
      fullDate: formatDate(day)
    });
  }

  return days;
}

function formatDayName(date: Date): string {
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  return days[date.getDay()];
}

function formatDate(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

function normalizeVisit(doc: any): RecentVisit {
  return {
    id: doc.id,
    nome: doc.visitors?.full_name || 'Visitante',
    local: doc.espaco_id || 'Espaço',
    perfil: doc.visitors?.category || 'Visitante',
    checkin: doc.checkin,
    checkout: doc.checkout,
    status: doc.status || 'Ativo'
  };
}