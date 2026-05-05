import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSessionId } from './useSessionId';

interface RascunhoData {
  id?: string;
  dados: Record<string, unknown>;
  etapa: number;
}

export function useRascunhoAgendamento() {
  const sessionId = useSessionId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const salvarRascunho = useCallback(async (dados: Record<string, unknown>, etapa: number) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    setSalvo(false);
    
    try {
      const { data: existente } = await supabase
        .from('agendamentos_rascunho')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existente) {
        const { error: updateError } = await supabase
          .from('agendamentos_rascunho')
          .update({ dados, etapa, updated_at: new Date().toISOString() })
          .eq('id', existente.id)
          .eq('session_id', sessionId);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('agendamentos_rascunho')
          .insert({ 
            session_id: sessionId, 
            dados, 
            etapa,
            current_step: etapa 
          });
        
        if (insertError) throw insertError;
      }
      
      setSalvo(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const carregarRascunho = useCallback(async (): Promise<RascunhoData | null> => {
    if (!sessionId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('agendamentos_rascunho')
        .select('dados, etapa, current_step')
        .eq('session_id', sessionId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        return {
          dados: data.dados,
          etapa: data.etapa || data.current_step || 1
        };
      }
      return null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const limparRascunho = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await supabase
        .from('agendamentos_rascunho')
        .delete()
        .eq('session_id', sessionId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, [sessionId]);

  return { salvarRascunho, carregarRascunho, limparRascunho, loading, error, salvo };
}