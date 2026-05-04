import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface PublicUser {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  tipo: 'cidadao' | 'escola' | 'ong' | 'empresa' | 'pessoa_fisica' | 'universidade';
}

interface PublicAuthContextType {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

const PublicAuthContext = createContext<PublicAuthContextType | undefined>(undefined);

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSessionToPublicUser(session));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(mapSessionToPublicUser(session));
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const mapSessionToPublicUser = (session: Session): PublicUser => ({
    id: session.user.id,
    email: session.user.email || '',
    nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || '',
    telefone: session.user.user_metadata?.telefone || '',
    tipo: session.user.user_metadata?.tipo || 'cidadao',
  });

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/agendamento-publico`,
      },
    });
    return { error: error as Error | null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <PublicAuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (context === undefined) {
    throw new Error('usePublicAuth must be used within a PublicAuthProvider');
  }
  return context;
}