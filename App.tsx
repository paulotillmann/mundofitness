import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import DashboardTab from './components/DashboardTab';
import ClientesTab from './components/ClientesTab';
import GruposTab from './components/GruposTab';
import ConsorciosTab from './components/ConsorciosTab';
import ConfiguracoesTab from './components/ConfiguracoesTab';
import CrediariosTab from './components/CrediariosTab';
import HistoricosTab from './components/HistoricosTab';
import NotificacoesTab from './components/NotificacoesTab';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('aprovado')
          .eq('id', currentSession.user.id)
          .single();
        if (profile && profile.aprovado) {
          setAuthorized(true);
        } else {
          await supabase.auth.signOut();
          setAuthorized(false);
        }
      } else {
        setAuthorized(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('aprovado')
          .eq('id', newSession.user.id)
          .single();
        if (profile && profile.aprovado) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } else {
        setAuthorized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authorized === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutralLight">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={() => {}} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={async () => { await supabase.auth.signOut(); }} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardTab />} />
          <Route path="clientes" element={<ClientesTab />} />
          <Route path="grupos" element={<GruposTab />} />
          <Route path="consorcios" element={<ConsorciosTab />} />
          <Route path="crediarios" element={<CrediariosTab />} />
          <Route path="historicos" element={<HistoricosTab />} />
          <Route path="notificacoes" element={<NotificacoesTab />} />
          <Route path="configuracoes" element={<ConfiguracoesTab />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;