import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAutoCheckout() {
  useEffect(() => {
    const checkAndExpireVisits = async () => {
      try {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        const { data: exceededVisits, error: fetchError } = await supabase
          .from('visits')
          .select('id, checkin')
          .eq('status', 'Ativo')
          .lt('checkin', oneHourAgo.toISOString());

        if (fetchError) {
          console.error('Auto-checkout: erro ao buscar visitas', fetchError);
          return;
        }

        if (!exceededVisits || exceededVisits.length === 0) {
          return;
        }

        const now = new Date().toISOString();
        const visitIds = exceededVisits.map(v => v.id);

        console.log(`Auto-checkout: ${visitIds.length} visita(s) encontrada(s) excedida(s)`);

        const { error: updateError } = await supabase
          .from('visits')
          .update({ 
            status: 'Excedido', 
            checkout: now 
          })
          .in('id', visitIds);

        if (updateError) {
          console.error('Auto-checkout: erro ao atualizar', updateError);
        } else {
          console.log(`Auto-checkout: ${visitIds.length} visita(s) encerrada(s) automaticamente`);
        }
      } catch (error) {
        console.error('Auto-checkout: erro crítico', error);
      }
    };

    checkAndExpireVisits();
    
    const interval = setInterval(checkAndExpireVisits, 60000);
    
    return () => clearInterval(interval);
  }, []);
}