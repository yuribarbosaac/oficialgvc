import { supabase } from '../lib/supabase';

export const visitService = {
    async listActive(espacoId: string) {
        const { data, error } = await supabase
            .from('visits')
            .select('*, visitors(full_name, cpf, passport, is_foreigner)')
            .eq('espaco_id', espacoId)
            .in('status', ['Ativo', 'Excedido'])
            .order('checkin', { ascending: false });
        return { data, error };
    },

    async listHistory(espacoId: string, limit = 50) {
        const { data, error } = await supabase
            .from('visits')
            .select('*, visitors(full_name, cpf, passport, is_foreigner)')
            .eq('espaco_id', espacoId)
            .order('checkin', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    async countToday(espacoId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })
            .eq('espaco_id', espacoId)
            .gte('checkin', `${today}T00:00:00`)
            .lte('checkin', `${today}T23:59:59`);
        return { count, error };
    }
};