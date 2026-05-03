import { supabase } from '../lib/supabase';

export interface Space {
  id?: string;
  nome: string;
  email?: string;
  endereco?: string;
  municipio?: string;
  horario_funcionamento?: string;
  perfil_armarios?: boolean;
  perfil_armarios_quantidade?: number;
  perfil_telecentro?: boolean;
  perfil_agendamento?: boolean;
  mensagem_boas_vindas?: string;
  ativo?: boolean;
}

export const spaceService = {
  async list() {
    const { data, error } = await supabase
      .from('espacos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });
    return { data: data as Space[], error };
  },

  async listAll() {
    const { data, error } = await supabase
      .from('espacos')
      .select('*')
      .order('nome', { ascending: true });
    return { data: data as Space[], error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('espacos')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as Space, error };
  },

  async create(space: Omit<Space, 'id'>) {
    const { data, error } = await supabase
      .from('espacos')
      .insert(space)
      .select()
      .single();
    return { data: data as Space, error };
  },

  async update(id: string, updates: Partial<Space>) {
    const { data, error } = await supabase
      .from('espacos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Space, error };
  },

  async deactivate(id: string) {
    const { error } = await supabase
      .from('espacos')
      .update({ ativo: false })
      .eq('id', id);
    return { error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('espacos')
      .delete()
      .eq('id', id);
    return { error };
  }
};