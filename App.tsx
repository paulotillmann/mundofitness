import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import Dashboard from './Dashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão atual
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession) {
        // Verificar se está aprovado na tabela usuarios
        const { data: profile } = await supabase
          .from('usuarios')
          .select('aprovado')
          .eq('id', currentSession.user.id)
          .single();
        
        if (profile && profile.aprovado) {
          setSession(currentSession);
        } else {
          await supabase.auth.signOut();
          setSession(null);
        }
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('aprovado')
          .eq('id', newSession.user.id)
          .single();
        
        if (profile && profile.aprovado) {
          setSession(newSession);
        } else {
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return <Dashboard onLogout={async () => { await supabase.auth.signOut(); }} />;
};

export default App;