import { supabase } from '../lib/supabase';

export type AuditoriaAcao = 
  | "criou_usuario" 
  | "excluiu_usuario" 
  | "editou_usuario" 
  | "criou_espaco" 
  | "excluiu_espaco" 
  | "editou_espaco" 
  | "alterou_configuracoes" 
  | "exportou_backup" 
  | "excluiu_visita";

export const registrarAuditoria = async (acao: AuditoriaAcao, detalhes: string, entidadeId: string | null = null, userProfile: any = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('auditoria').insert({
      usuario: user?.email || "sistema",
      perfil: userProfile?.perfil || "desconhecido",
      acao: acao,
      detalhes: detalhes,
      entidade_id: entidadeId
    });
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};
