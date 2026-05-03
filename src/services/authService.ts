import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    nome: string;
    email: string;
    perfil: 'administrador' | 'coordenador' | 'funcionario' | 'monitor';
    espaco_id?: string;
    ativo: boolean;
}

export const authService = {
    // Login
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        return { session: data.session, user: data.user, error };
    },

    // Logout
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Buscar perfil do usuário logado
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        return { data: data as UserProfile, error };
    },

    // Verificar sessão atual
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },

    // Escutar mudanças na sessão (login/logout)
    onAuthStateChange(callback: (session: any) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session);
        });
    }
};