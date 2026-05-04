import { useState, useEffect, useCallback } from 'react';
import { agendamentoService, Agendamento, AgendamentoFilter, DashboardAgendamentos } from '../services/agendamentoService';

export function useAgendamentos(filters?: AgendamentoFilter) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await agendamentoService.list(filters);
    
    if (fetchError) {
      setError(fetchError.message);
      setAgendamentos([]);
    } else {
      setAgendamentos(data || []);
    }
    
    setLoading(false);
  }, [filters?.espaco_id, filters?.status, filters?.data_inicio, filters?.data_fim]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  return { agendamentos, loading, error, refetch: fetchAgendamentos };
}

export function useAgendamento(id: string) {
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAgendamento = async () => {
      setLoading(true);
      const { data, error: fetchError } = await agendamentoService.getById(id);
      
      if (fetchError) {
        setError(fetchError.message);
        setAgendamento(null);
      } else {
        setAgendamento(data);
      }
      
      setLoading(false);
    };

    fetchAgendamento();
  }, [id]);

  return { agendamento, loading, error };
}

export function useDashboardAgendamentos(espacoId?: string) {
  const [stats, setStats] = useState<DashboardAgendamentos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error: fetchError } = await agendamentoService.getDashboardStats(espacoId);
      
      if (fetchError) {
        setError(fetchError.message);
        setStats(null);
      } else {
        setStats(data);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, [espacoId]);

  return { stats, loading, error };
}

export function useConflitos(espacoId: string, data: string, inicio: string, fim: string, excludeId?: string) {
  const [conflitos, setConflitos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);

  const checkConflitos = useCallback(async () => {
    if (!espacoId || !data || !inicio || !fim) return;

    setLoading(true);
    const { data: conflitosData, error } = await agendamentoService.getConflitos(espacoId, data, inicio, fim, excludeId);
    
    if (!error && conflitosData) {
      setConflitos(conflitosData);
    } else {
      setConflitos([]);
    }
    
    setLoading(false);
  }, [espacoId, data, inicio, fim, excludeId]);

  useEffect(() => {
    checkConflitos();
  }, [checkConflitos]);

  return { conflitos, loading, checkConflitos };
}

export function useCreateAgendamento() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (agendamento: Omit<Agendamento, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    const { data, error: createError } = await agendamentoService.create(agendamento);

    setLoading(false);

    if (createError) {
      setError(createError.message);
      return { data: null, error: createError };
    }

    return { data, error: null };
  };

  return { create, loading, error };
}

export function useUpdateStatusAgendamento() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    id: string,
    status: 'aprovado' | 'rejeitado' | 'cancelado',
    resposta?: string
  ) => {
    setLoading(true);
    setError(null);

    const { data, error: updateError } = await agendamentoService.updateStatus(id, status, resposta);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    return { data, error: null };
  };

  return { updateStatus, loading, error };
}