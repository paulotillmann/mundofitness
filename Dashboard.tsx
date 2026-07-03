import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import {
  LayoutDashboard,
  Users,
  FolderHeart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  Search,
  Plus,
  Bell,
  MessageSquare,
  LogOut,
  ArrowUpRight
} from 'lucide-react';

// Subcomponentes separados
import DashboardTab from './components/DashboardTab';
import ClientesTab from './components/ClientesTab';
import GruposTab from './components/GruposTab';
import ConsorciosTab from './components/ConsorciosTab';
import ConfiguracoesTab from './components/ConfiguracoesTab';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Estados Globais de Dados (Sincronizados com o Supabase)
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [gruposList, setGruposList] = useState<any[]>([]);
  const [consorciosList, setConsorciosList] = useState<any[]>([]);

  // Carregar Clientes do Supabase
  const refreshClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      if (error) {
        console.error('Erro ao buscar clientes no Supabase:', error);
        return;
      }
      if (data) {
        const formatted = data.map((c) => ({
          id: c.id,
          bubble_id: c.bubble_id,
          name: c.nome,
          phone: c.celular || '(00) 00000-0000',
          email: c.email || '',
          plan: c.plano || 'Básico',
          status: c.status || 'Ativo',
          endereco: c.endereco,
          datanascimento: c.datanascimento,
          outrasinformacoes: c.outrasinformacoes,
          vestetamanho: c.vestetamanho,
          data_cadastro: c.data_cadastro
        }));
        setClientesList(formatted);
      }
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    }
  };

  // Carregar Grupos do Supabase
  const refreshGrupos = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('mesinicial_date', { ascending: false });
      if (error) {
        console.error('Erro ao buscar grupos no Supabase:', error);
        return;
      }
      if (data) {
        setGruposList(data);
      }
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    }
  };

  // Carregar Consórcios do Supabase
  const refreshConsorcios = async () => {
    try {
      const { data, error } = await supabase
        .from('consorcios')
        .select(`
          *,
          clientes (nome, outrasinformacoes),
          grupos (periodo_text, valorcota_number, encerrado_boolean)
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Erro ao buscar consórcios no Supabase:', error);
        return;
      }
      if (data) {
        setConsorciosList(data);
      }
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    }
  };

  // Carregamento Inicial
  useEffect(() => {
    refreshClientes();
    refreshGrupos();
    refreshConsorcios();
  }, []);

  // Cores do Tema (Objeto A)
  const A = darkMode ? {
    bg: "bg-[#0B0F19] text-slate-100",
    card: "bg-slate-800 border-slate-700",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-400",
    border: "border-slate-700",
    bgLight: "bg-slate-900",
    bgHover: "hover:bg-slate-800",
    inputText: "bg-slate-800 text-slate-100 border-slate-700 focus:ring-brand-purple",
    tableHeader: "bg-slate-900 text-slate-400",
    tableRowHover: "hover:bg-slate-800/50"
  } : {
    bg: "bg-neutralLight text-textPrimary",
    card: "bg-white border-borderGray",
    textPrimary: "text-textPrimary",
    textMuted: "text-textMuted",
    border: "border-borderGray",
    bgLight: "bg-slate-50",
    bgHover: "hover:bg-slate-100",
    inputText: "bg-white text-textPrimary border-slate-200 focus:ring-brand-purple",
    tableHeader: "bg-slate-50 text-textMuted",
    tableRowHover: "hover:bg-slate-50/50"
  };

  // Itens de navegação lateral
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'grupos', label: 'Grupos', icon: FolderHeart },
    { id: 'consorcios', label: 'Consórcios', icon: DollarSign }
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${A.bg} transition-colors duration-300 font-sans`}>
      
      {/* SIDEBAR (Barra de Navegação Lateral) */}
      <div className={`relative flex flex-col justify-between py-6 border-r ${A.border} ${darkMode ? "bg-[#0F172A]" : "bg-white"} z-30 transition-all duration-300 ${
        sidebarExpanded ? "w-64 px-4 items-stretch" : "w-20 md:w-24 px-2 items-center"
      }`}>
        {/* Botão de Expandir/Recolher */}
        <button
          onClick={() => setSidebarExpanded((prev) => !prev)}
          className={`absolute -right-3.5 top-[104px] -translate-y-1/2 z-50 w-7 h-7 flex items-center justify-center rounded-full border ${A.border} ${
            darkMode
              ? "bg-[#1E293B] text-slate-300 hover:text-brand-lime border-slate-700"
              : "bg-white text-slate-600 hover:text-brand-purple border-slate-200"
          } shadow-md transition-all cursor-pointer active:scale-95`}
          title={sidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
        >
          {sidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Topo da Sidebar (Logo e Branding) */}
        <div className="flex flex-col gap-6 w-full">
          <div className={`flex items-center ${sidebarExpanded ? "justify-start px-2" : "justify-center"} w-full border-b ${A.border} pb-6`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-brand-purple shadow-md cursor-pointer flex items-center justify-center flex-shrink-0">
                <img
                  src="/import/logomundo.png"
                  alt="MundoFitness Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              {sidebarExpanded && (
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-[18pt] tracking-tight leading-none bg-gradient-to-r from-blue-600 via-brand-purple to-pink-500 bg-clip-text text-transparent">
                    MUNDO
                  </span>
                  <span className="font-black text-[18pt] tracking-wide leading-none mt-1 bg-gradient-to-r from-blue-600 via-brand-purple to-pink-500 bg-clip-text text-transparent">
                    FITNESS
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itens de Menu */}
          <nav className={`flex flex-col gap-3 mt-4 ${sidebarExpanded ? "w-full" : ""}`}>
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarExpanded ? undefined : item.label}
                  className={`relative flex items-center transition-all ${
                    sidebarExpanded ? "w-full gap-3 text-left hover:text-brand-purple" : "justify-center"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                      : `${A.textMuted} ${A.bgHover} hover:text-brand-purple`
                  }`}>
                    <IconComponent size={20} />
                  </div>
                  {sidebarExpanded && (
                    <span className={`font-semibold text-sm transition-colors ${
                      isSelected ? "text-brand-purple" : A.textMuted
                    }`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar (Modo Escuro, Configurações e Logout) */}
        <div className={`flex flex-col gap-3 w-full ${sidebarExpanded ? "px-1" : "items-center"}`}>
          {/* Toggle Modo Escuro */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className={`relative flex items-center transition-all ${
              sidebarExpanded ? "w-full gap-3 text-left hover:text-brand-purple" : "justify-center"
            }`}
            title={sidebarExpanded ? undefined : darkMode ? "Modo Claro" : "Modo Escuro"}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${A.textMuted} ${A.bgHover} hover:text-brand-purple`}>
              {darkMode ? (
                <Sun size={20} className="text-brand-lime" />
              ) : (
                <Moon size={20} />
              )}
            </div>
            {sidebarExpanded && (
              <span className={`font-semibold text-sm transition-colors ${A.textMuted}`}>
                {darkMode ? "Modo Claro" : "Modo Escuro"}
              </span>
            )}
          </button>

          {/* Link de Configurações */}
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`relative flex items-center transition-all ${
              sidebarExpanded ? "w-full gap-3 text-left hover:text-brand-purple" : "justify-center"
            }`}
            title={sidebarExpanded ? undefined : "Configurações"}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              activeTab === 'configuracoes'
                ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                : `${A.textMuted} ${A.bgHover} hover:text-brand-purple`
            }`}>
              <Settings size={20} />
            </div>
            {sidebarExpanded && (
              <span className={`font-semibold text-sm transition-colors ${
                activeTab === 'configuracoes' ? "text-brand-purple" : A.textMuted
              }`}>
                Configurações
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`relative flex items-center transition-all ${
              sidebarExpanded ? "w-full gap-3 text-left hover:text-rose-600" : "justify-center"
            }`}
            title={sidebarExpanded ? undefined : "Sair"}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 bg-rose-50 text-rose-500 hover:bg-rose-100 shadow-sm">
              <LogOut size={20} />
            </div>
            {sidebarExpanded && (
              <span className="font-semibold text-sm transition-colors text-rose-500 hover:text-rose-600">
                Sair
              </span>
            )}
          </button>
        </div>

      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (Header + Tabs) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER (Barra Superior) */}
        <header className={`h-20 border-b ${A.border} ${darkMode ? "bg-[#0B0F19]/50" : "bg-white/80"} backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-20`}>
          {/* Busca Global */}
          <div className="relative w-64 md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Pesquisar..."
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
          </div>

          {/* Notificações, Chat e Avatar */}
          <div className="flex items-center gap-4">
            <button className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all`}>
              <MessageSquare size={18} />
            </button>
            <button className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all relative`}>
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-purple rounded-full" />
            </button>
            <div className={`h-6 w-px ${A.border}`} />
            
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt="Avatar Noah Miles"
                className="w-10 h-10 rounded-full object-cover border border-brand-purple"
              />
              <div className="hidden lg:block text-left">
                <p className={`text-sm font-bold leading-none ${A.textPrimary}`}>
                  Noah Miles
                </p>
                <p className={`text-[10px] mt-0.5 ${A.textMuted}`}>
                  Euclid Avenue, CA
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER DA ABA ATIVA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardTab key="dashboard" A={A} />
            )}
            
            {activeTab === 'clientes' && (
              <ClientesTab
                key="clientes"
                A={A}
                globalSearch={globalSearch}
                clientesList={clientesList}
                refreshClientes={refreshClientes}
              />
            )}

            {activeTab === 'grupos' && (
              <GruposTab
                key="grupos"
                A={A}
                gruposList={gruposList}
                refreshGrupos={refreshGrupos}
              />
            )}

            {activeTab === 'consorcios' && (
              <ConsorciosTab
                key="consorcios"
                A={A}
                gruposList={gruposList}
                consorciosList={consorciosList}
                refreshConsorcios={refreshConsorcios}
              />
            )}

            {activeTab === 'configuracoes' && (
              <ConfiguracoesTab
                key="configuracoes"
                A={A}
                refreshClientes={refreshClientes}
                refreshGrupos={refreshGrupos}
                refreshConsorcios={refreshConsorcios}
              />
            )}
          </AnimatePresence>
        </main>

      </div>

    </div>
  );
};

export default Dashboard;
