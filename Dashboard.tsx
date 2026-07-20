import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { DashboardContext, DashboardContextType } from './DashboardContext';
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
  ArrowUpRight,
  CreditCard,
  History,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Gift,
  X
} from 'lucide-react';

// Subcomponentes separados
import DashboardTab from './components/DashboardTab';
import ClientesTab from './components/ClientesTab';
import GruposTab from './components/GruposTab';
import ConsorciosTab from './components/ConsorciosTab';
import ConfiguracoesTab from './components/ConfiguracoesTab';
import CrediariosTab from './components/CrediariosTab';
import HistoricosTab from './components/HistoricosTab';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [themeMode, setThemeMode] = useState<number>(0);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Estados Globais de Dados (Sincronizados com o Supabase)
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [gruposList, setGruposList] = useState<any[]>([]);
  const [consorciosList, setConsorciosList] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal de Edição de Perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBirthdaysModal, setShowBirthdaysModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalConfirmPassword, setModalConfirmPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showModalConfirmPassword, setShowModalConfirmPassword] = useState(false);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const [changeModalPasswordChecked, setChangeModalPasswordChecked] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário atual:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setModalName(currentUser.nome || '');
      setModalPhone(currentUser.celular || '');
      setModalImagePreview(currentUser.foto_url || null);
    }
  }, [currentUser]);

  const handleModalAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModalImageFile(file);
      setModalImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfileFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalSaving(true);
    setModalErrorMsg(null);
    setModalSuccessMsg(null);

    try {
      let finalFotoUrl = currentUser?.foto_url;

      if (modalImageFile && currentUser) {
        const fileExt = modalImageFile.name.split('.').pop();
        const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, modalImageFile, { upsert: true });

        if (uploadError) throw new Error(`Erro no upload da imagem: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalFotoUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: modalName,
          celular: modalPhone,
          foto_url: finalFotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      if (changeModalPasswordChecked && modalPassword) {
        if (modalPassword !== modalConfirmPassword) {
          throw new Error('As senhas digitadas não coincidem.');
        }
        if (modalPassword.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: modalPassword
        });

        if (passwordError) throw passwordError;
        setModalPassword('');
        setModalConfirmPassword('');
        setChangeModalPasswordChecked(false);
      }

      setModalSuccessMsg('Perfil atualizado com sucesso!');
      await fetchProfile();
      setTimeout(() => setShowProfileModal(false), 800);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Erro ao atualizar perfil.';
      if (msg.includes('New password should be different from the old password')) {
        msg = 'A nova senha deve ser diferente da sua senha atual.';
      }
      setModalErrorMsg(msg);
    } finally {
      setIsModalSaving(false);
    }
  };

  // Carregar Clientes do Supabase
  const refreshClientes = async () => {
    try {
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const to = from + step - 1;
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('nome', { ascending: true })
          .range(from, to);

        if (error) {
          console.error('Erro ao buscar clientes no Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
      }

      const formatted = allData.map((c) => ({
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
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const to = from + step - 1;
        const { data, error } = await supabase
          .from('consorcios')
          .select(`
            *,
            clientes (nome, outrasinformacoes, celular, vestetamanho),
            grupos (periodo_text, valorcota_number, encerrado_boolean)
          `)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Erro ao buscar consórcios no Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
      }

      setConsorciosList(allData);
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    }
  };

  // Carregamento Inicial
  useEffect(() => {
    refreshClientes();
    refreshGrupos();
    refreshConsorcios();
    fetchProfile();
  }, []);

  // Clientes que fazem aniversário hoje
  const aniversariantesHoje = useMemo(() => {
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth(); // 0-11

    return clientesList.filter((c) => {
      if (!c.datanascimento) return false;
      try {
        const d = new Date(c.datanascimento);
        if (isNaN(d.getTime())) return false;
        return d.getUTCDate() === diaHoje && d.getUTCMonth() === mesHoje;
      } catch {
        return false;
      }
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [clientesList]);

  // Cores do Tema (Objeto A) — 0=light, 1=dark, 2=super dark
  const A = themeMode === 2 ? {
    bg: "bg-[#030712] text-slate-50",
    card: "bg-[#0a0e17] border-[#111827]",
    textPrimary: "text-slate-50",
    textMuted: "text-slate-500",
    border: "border-[#111827]",
    bgLight: "bg-[#030712]",
    bgHover: "hover:bg-[#0a0e17]",
    inputText: "bg-[#0a0e17] text-slate-50 border-[#111827] focus:ring-brand-purple",
    tableHeader: "bg-[#0a0e17] text-slate-500",
    tableRowHover: "hover:bg-[#0a0e17]/50"
  } : themeMode === 1 ? {
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

  const isDark = themeMode >= 1;

  // Mapeamento de rotas para itens do sidebar
  const sidebarRoutes: Record<string, string> = {
    dashboard: '/',
    clientes: '/clientes',
    grupos: '/grupos',
    consorcios: '/consorcios',
    crediarios: '/crediarios',
    historico: '/historicos',
    configuracoes: '/configuracoes'
  };

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'grupos', label: 'Grupos', icon: FolderHeart },
    { id: 'consorcios', label: 'Consórcios', icon: DollarSign },
    { id: 'crediarios', label: 'Crediários', icon: CreditCard },
    { id: 'historico', label: 'Históricos', icon: History }
  ];

  const contextValue: DashboardContextType = {
    A,
    globalSearch,
    clientesList,
    gruposList,
    consorciosList,
    currentUser,
    refreshClientes,
    refreshGrupos,
    refreshConsorcios,
    refreshProfile: fetchProfile
  };

  const getAge = (birthdateStr: string) => {
    try {
      const birth = new Date(birthdateStr);
      const today = new Date();
      let age = today.getFullYear() - birth.getUTCFullYear();
      const monthDiff = today.getMonth() - birth.getUTCMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getUTCDate())) {
        age--;
      }
      return age;
    } catch {
      return 0;
    }
  };

  return (
    <DashboardContext.Provider value={contextValue}>
    <div className={`flex h-screen overflow-hidden ${A.bg} transition-colors duration-300 font-sans ${isDark ? 'dark' : ''}`}>
      
      {/* SIDEBAR (Barra de Navegação Lateral) */}
      <div 
        style={{ backgroundColor: '#4B32A6' }}
        className={`relative flex flex-col justify-between py-6 border-r border-purple-700/30 z-30 transition-all duration-300 ${
          sidebarExpanded ? "w-64 px-4 items-stretch" : "w-20 md:w-24 px-2 items-center"
        }`}
      >
        {/* Botão de Expandir/Recolher */}
        <button
          onClick={() => setSidebarExpanded((prev) => !prev)}
          className={`absolute -right-3.5 top-[104px] -translate-y-1/2 z-50 w-7 h-7 flex items-center justify-center rounded-full border border-purple-700/30 bg-[#4B32A6] text-purple-200 hover:text-white shadow-md transition-all cursor-pointer active:scale-95`}
          title={sidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
        >
          {sidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Topo da Sidebar (Logo e Branding) */}
        <div className="flex flex-col gap-6 w-full">
          <div className={`flex items-center ${sidebarExpanded ? "justify-start px-2" : "justify-center"} w-full border-b border-purple-700/30 pb-6`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-purple-400/30 shadow-md cursor-pointer flex items-center justify-center flex-shrink-0">
                <img
                  src="/import/logomundo.png"
                  alt="MundoFitness Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              {sidebarExpanded && (
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-[18pt] tracking-tight leading-none bg-gradient-to-r from-blue-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                    MUNDO
                  </span>
                  <span className="font-black text-[18pt] tracking-wide leading-none mt-1 bg-gradient-to-r from-blue-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                    FITNESS
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itens de Menu */}
          <nav className={`flex flex-col gap-3 mt-4 ${sidebarExpanded ? "w-full" : ""}`}>
            {sidebarRoutes && Object.entries(sidebarRoutes).map(([id, path]) => {
              const item = sidebarNavItems.find(i => i.id === id);
              if (!item) return null;
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={id}
                  to={path}
                  title={sidebarExpanded ? undefined : item.label}
                  className={({ isActive: navActive }) => `group relative flex items-center transition-all ${
                    sidebarExpanded 
                      ? `w-full gap-3 text-left px-4 py-2.5 rounded-xl ${
                          navActive 
                            ? "bg-white text-[#4B32A6] shadow-lg shadow-white/10" 
                            : "text-purple-200 hover:bg-white/10 hover:text-white"
                        }`
                      : "justify-center"
                  }`}
                >
                  {({ isActive: navActive }) => (
                    <>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        sidebarExpanded
                          ? navActive
                            ? "text-[#4B32A6]"
                            : "text-purple-200 bg-transparent group-hover:bg-white/10 group-hover:text-white"
                          : navActive
                            ? "bg-white text-[#4B32A6] shadow-lg shadow-white/10"
                            : "text-purple-200 bg-transparent group-hover:bg-white/10 group-hover:text-white"
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      {sidebarExpanded && (
                        <span className={`font-semibold text-sm transition-colors ${
                          navActive ? "text-[#4B32A6] font-bold" : "text-purple-200 group-hover:text-white"
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>


      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (Header + Tabs) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER (Barra Superior) */}
        <header className={`h-20 border-b ${A.border} ${isDark ? "bg-[#0B0F19]/50" : "bg-white/80"} backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-20 shadow-sm`}>
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
              className={`w-full pl-10 pr-10 py-2 text-sm rounded-full border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Limpar pesquisa"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Notificações, Chat, Tema, Configurações e Avatar */}
          <div className="flex items-center gap-4">
            {/* Toggle de Tema (Light → Dark → Super Dark) */}
            <button
              onClick={() => setThemeMode((prev) => (prev + 1) % 3)}
              className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all`}
              title={themeMode === 0 ? "Modo Escuro" : themeMode === 1 ? "Modo Super Dark" : "Modo Claro"}
            >
              {themeMode === 0 ? (
                <Moon size={18} />
              ) : themeMode === 1 ? (
                <Moon size={18} className="text-brand-lime" />
              ) : (
                <Sun size={18} className="text-amber-400" />
              )}
            </button>

            {/* Aniversariantes do Dia */}
            <div className="relative">
              <button
                onClick={() => setShowBirthdaysModal((prev) => !prev)}
                className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-[#7C3AED] transition-all relative`}
                title="Aniversariantes do Dia"
              >
                <Gift size={18} className={aniversariantesHoje.length > 0 ? "text-[#7C3AED] dark:text-[#a855f7]" : ""} />
                {aniversariantesHoje.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Popover Suspenso (Dropdown) */}
              <AnimatePresence>
                {showBirthdaysModal && (
                  <>
                    {/* Backdrop Invisível para fechar ao clicar fora */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setShowBirthdaysModal(false)}
                    />
                    
                    {/* Popover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-80 border ${A.border} ${A.card} rounded-2xl shadow-xl z-50 overflow-hidden`}
                    >
                      {/* Header do Popover */}
                      <div className="flex justify-between items-center p-4 border-b border-dashed border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <Gift size={16} className="text-[#7C3AED] dark:text-[#a855f7]" />
                          <span className={`font-bold text-sm ${A.textPrimary}`}>Aniversariantes</span>
                        </div>
                        {aniversariantesHoje.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300">
                            {aniversariantesHoje.length} HOJE
                          </span>
                        )}
                      </div>

                      {/* Lista dos Aniversariantes */}
                      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                        {aniversariantesHoje.length === 0 ? (
                          <div className="text-center py-6">
                            <Gift size={24} className="mx-auto text-slate-400 dark:text-slate-500 opacity-40 mb-2" />
                            <p className={`text-xs font-semibold ${A.textPrimary}`}>Nenhum aniversariante hoje</p>
                            <p className={`text-[10px] ${A.textMuted} mt-0.5`}>Não há aniversariantes no dia de hoje. 🎈</p>
                          </div>
                        ) : (
                          aniversariantesHoje.map((c) => {
                            const age = c.datanascimento ? getAge(c.datanascimento) : null;
                            const phone = c.phone || '';
                            const formattedPhone = phone && phone !== '(00) 00000-0000' ? phone.replace(/\D/g, '') : '';
                            const message = encodeURIComponent(`Parabéns, ${c.name}! Feliz aniversário! Nós da equipe Mundo Fitness desejamos a você muita saúde, felicidades e conquistas! 🎉🎂`);
                            const whatsappUrl = formattedPhone ? `https://wa.me/55${formattedPhone}?text=${message}` : '#';

                            return (
                              <div key={c.id} className="flex flex-col gap-2 p-3 bg-slate-50/40 dark:bg-slate-900/10 border border-slate-100/50 dark:border-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] flex-shrink-0" />
                                  <span className={`font-bold text-xs ${A.textPrimary} truncate flex-1`} title={c.name}>
                                    {c.name}
                                  </span>
                                  {age !== null && age > 0 && (
                                    <span className="text-[10px] text-slate-505 font-medium">
                                      {age} anos
                                    </span>
                                  )}
                                </div>
                                {phone && phone !== '(00) 00000-0000' ? (
                                  <div className="flex justify-between items-center mt-1 pl-3.5">
                                    <span className={`text-[10px] ${A.textMuted}`}>{phone}</span>
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                                    >
                                      WhatsApp
                                    </a>
                                  </div>
                                ) : (
                                  <span className={`text-[10px] ${A.textMuted} pl-3.5`}>Sem telefone</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                        <button
                          onClick={() => setShowBirthdaysModal(false)}
                          className="text-xs font-bold text-[#7C3AED] dark:text-[#a855f7] hover:underline cursor-pointer"
                        >
                          Fechar Agenda
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all`}>
              <MessageSquare size={18} />
            </button>

            <NavLink
              to="/notificacoes"
              className={({ isActive }) => `p-2.5 rounded-full transition-all relative ${
                isActive
                  ? 'bg-brand-purple/10 text-brand-purple'
                  : `${A.bgHover} ${A.textMuted} hover:text-brand-purple`
              }`}
            >
              {({ isActive }) => (
                <>
                  <Bell size={18} />
                  <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 ${
                    A.border
                  } ${isActive ? 'bg-brand-purple' : 'bg-rose-500'}`} />
                </>
              )}
            </NavLink>

            {/* Link de Configurações */}
            <NavLink
              to="/configuracoes"
              className={({ isActive }) => `p-2.5 rounded-full transition-all relative ${
                isActive
                  ? 'bg-brand-purple/10 text-brand-purple'
                  : `${A.bgHover} ${A.textMuted} hover:text-brand-purple`
              }`}
              title="Configurações"
            >
              <Settings size={18} />
            </NavLink>

            <div className={`h-6 w-px ${A.border}`} />
            
            <div className="flex items-center gap-3">
              <div
                onClick={() => setShowProfileModal(true)}
                className={`cursor-pointer transition-transform hover:scale-105 ${
                  currentUser?.foto_url ? 'w-10 h-10 rounded-full overflow-hidden border-2 border-brand-purple shadow-md' : 'w-10 h-10 rounded-full bg-brand-purple text-white font-bold flex items-center justify-center border-2 border-brand-purple shadow-md'
                }`}
                title="Editar Perfil"
              >
                {currentUser?.foto_url ? (
                  <img
                    src={currentUser.foto_url}
                    alt={`Avatar ${currentUser.nome}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{(currentUser?.nome || currentUser?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className={`text-sm font-bold leading-none ${A.textPrimary}`}>
                  {currentUser?.nome || 'Carregando...'}
                </p>
                <p className={`text-[10px] mt-0.5 ${A.textMuted}`}>
                  {currentUser?.email || ''}
                </p>
              </div>
            </div>

            <div className={`h-6 w-px ${A.border}`} />

            {/* Logout */}
            <button
              onClick={async () => {
                await onLogout();
                navigate('/login');
              }}
              className={`p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all`}
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* CONTAINER DAS ROTAS (Outlet) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>

      </div>

      {/* Modal de Edição de Perfil */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[480px] mx-4 z-10"
            >
              <div className={`border ${A.card} rounded-[24px] shadow-xl overflow-hidden`}>
                {/* Header do Modal */}
                  <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${A.border}`}>
                  <div>
                    <h2 className={`font-bold text-xl ${A.textPrimary}`}>Editar Perfil</h2>
                    <p className={`text-xs ${A.textMuted} mt-0.5`}>
                      Atualize suas informações pessoais e foto.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${A.bgHover} ${A.textMuted} hover:text-brand-purple`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>

                {/* Corpo do Modal */}
                <form onSubmit={handleUpdateProfileFromModal} className="p-6 space-y-6">
                  {/* Upload de Avatar */}
                  <div className="flex flex-col items-center sm:flex-row gap-5 border-b pb-6 border-slate-200 dark:border-slate-700">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-brand-purple shadow-md">
                      {modalImagePreview ? (
                        <img
                          src={modalImagePreview}
                          alt="Avatar Preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-2xl">
                          {(modalName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-opacity">
                        <Camera size={18} className="mb-1" />
                        Alterar Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleModalAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <p className={`text-sm font-bold ${A.textPrimary}`}>Foto de Perfil</p>
                      <p className={`text-xs ${A.textMuted}`}>
                        Formatos aceitos: PNG, JPG ou WEBP. Tamanho máximo: 5MB.
                      </p>
                      {modalImageFile && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand-purple/10 text-brand-purple text-[10px] font-bold rounded">
                          Nova imagem selecionada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div className="space-y-1 text-left">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        Nome Completo
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                          <History size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          value={modalName}
                          onChange={(e) => setModalName(e.target.value)}
                          placeholder="Seu nome"
                          className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="space-y-1 text-left">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        Telefone
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                          <Bell size={16} />
                        </span>
                        <input
                          type="text"
                          value={modalPhone}
                          onChange={(e) => setModalPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                        />
                      </div>
                    </div>

                    {/* E-mail (Somente Leitura) */}
                    <div className="space-y-1 text-left md:col-span-2">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        E-mail (Não pode ser alterado)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || ''}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none font-medium opacity-50 cursor-not-allowed ${A.inputText}`}
                      />
                    </div>
                  </div>

                  {/* Alterar Senha */}
                  <div className="border-t pt-5 border-slate-200 dark:border-slate-700 space-y-4">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={changeModalPasswordChecked}
                        onChange={(e) => setChangeModalPasswordChecked(e.target.checked)}
                        className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple w-4 h-4"
                      />
                      <span className={`text-sm font-bold ${A.textPrimary}`}>Desejo alterar minha senha de acesso</span>
                    </label>

                    {changeModalPasswordChecked && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nova Senha */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                            Nova Senha
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                              <Lock size={16} />
                            </span>
                            <input
                              type={showModalPassword ? 'text' : 'password'}
                              value={modalPassword}
                              onChange={(e) => setModalPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              autoComplete="new-password"
                              className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowModalPassword(!showModalPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-brand-purple"
                            >
                              {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                            Confirmar Nova Senha
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                              <Lock size={16} />
                            </span>
                            <input
                              type={showModalConfirmPassword ? 'text' : 'password'}
                              value={modalConfirmPassword}
                              onChange={(e) => setModalConfirmPassword(e.target.value)}
                              placeholder="Repita a nova senha"
                              autoComplete="new-password"
                              className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowModalConfirmPassword(!showModalConfirmPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-brand-purple"
                            >
                              {showModalConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedbacks */}
                  {modalErrorMsg && (
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-xs text-left">
                      <p className="font-bold">⚠️ Erro</p>
                      <p>{modalErrorMsg}</p>
                    </div>
                  )}
                  {modalSuccessMsg && (
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs text-left">
                      <p>✅ {modalSuccessMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isModalSaving}
                    className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-5 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer w-full justify-center"
                  >
                    {isModalSaving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Salvar Alterações
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
