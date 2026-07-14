import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../DashboardContext';
import { supabase } from '../supabaseClient';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  CreditCard,
  FolderHeart,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MailCheck,
  Trash2,
  ArrowUpRight,
  Palette
} from 'lucide-react';

interface Notificacao {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'alert' | 'system';
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  link?: string;
  icone?: string;
}

const iconMap: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  alert: AlertCircle,
  system: BellRing,
  payment: DollarSign,
  client: UserPlus,
  group: FolderHeart,
  schedule: Calendar,
  credit: CreditCard,
  trend: TrendingUp
};

const typeStyles: Record<string, { bg: string; border: string; iconBg: string; iconColor: string; text: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    text: 'text-blue-700'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    text: 'text-emerald-700'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    text: 'text-amber-700'
  },
  alert: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    text: 'text-rose-700'
  },
  system: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    text: 'text-purple-700'
  }
};

const typeStylesDark: Record<string, { bg: string; border: string; iconBg: string; iconColor: string; text: string }> = {
  info: {
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/50',
    iconBg: 'bg-blue-900/60',
    iconColor: 'text-blue-400',
    text: 'text-blue-300'
  },
  success: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/50',
    iconBg: 'bg-emerald-900/60',
    iconColor: 'text-emerald-400',
    text: 'text-emerald-300'
  },
  warning: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/50',
    iconBg: 'bg-amber-900/60',
    iconColor: 'text-amber-400',
    text: 'text-amber-300'
  },
  alert: {
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/50',
    iconBg: 'bg-rose-900/60',
    iconColor: 'text-rose-400',
    text: 'text-rose-300'
  },
  system: {
    bg: 'bg-purple-950/40',
    border: 'border-purple-800/50',
    iconBg: 'bg-purple-900/60',
    iconColor: 'text-purple-400',
    text: 'text-purple-300'
  }
};

const filterOptions = [
  { id: 'all', label: 'Todas', icon: Bell },
  { id: 'unread', label: 'Nao Lidas', icon: BellRing },
  { id: 'info', label: 'Informativos', icon: Info },
  { id: 'success', label: 'Confirmados', icon: CheckCircle },
  { id: 'warning', label: 'Atencao', icon: AlertTriangle },
  { id: 'alert', label: 'Urgentes', icon: XCircle }
];

const generateMockNotifications = (): Notificacao[] => {
  const now = new Date();
  const h = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

  return [
    {
      id: 'n1',
      tipo: 'alert',
      titulo: 'Pagamento vencido — Letícia Cristina',
      mensagem: 'A cota #428 do grupo Julho/26 a Abril/27 está com pagamento vencido há 3 dias. Valor: R$ 65,00.',
      lida: false,
      created_at: h(240),
      link: '/consorcios'
    },
    {
      id: 'n2',
      tipo: 'alert',
      titulo: 'Pagamento vencido — Ana Beatriz Costa',
      mensagem: 'A cota #425 está em atraso há 5 dias no grupo Julho/26. Entrar em contato.',
      lida: false,
      created_at: h(360),
      link: '/consorcios'
    },
    {
      id: 'n3',
      tipo: 'warning',
      titulo: 'Novo grupo de consórcio criado',
      mensagem: 'O grupo "Julho/26 a Abril/27" foi ativado com valor da cota de R$ 650,00. 10 clientes já alocados.',
      lida: false,
      created_at: h(720),
      link: '/grupos'
    },
    {
      id: 'n4',
      tipo: 'success',
      titulo: 'Novo cliente cadastrado',
      mensagem: 'Luana Leoncio Ribeiro foi adicionada ao grupo Julho/26. Cota #429 ativada.',
      lida: true,
      created_at: h(1440),
      link: '/clientes'
    },
    {
      id: 'n5',
      tipo: 'success',
      titulo: 'Crediário quitado — Helena Lena',
      mensagem: 'Todos os 8 lançamentos do crediário foram pagos. Cliente com situação limpa.',
      lida: true,
      created_at: h(2880),
      link: '/crediarios'
    },
    {
      id: 'n6',
      tipo: 'info',
      titulo: 'Relatório mensal disponível',
      mensagem: 'O relatório de julho/2026 está pronto para exportação. Total de R$ 5.016,98 em lançamentos.',
      lida: true,
      created_at: h(4320)
    },
    {
      id: 'n7',
      tipo: 'system',
      titulo: 'Sincronização Supabase concluída',
      mensagem: 'Todos os dados foram sincronizados com sucesso. 428 clientes, 14 grupos e 39 crediários atualizados.',
      lida: true,
      created_at: h(5760)
    },
    {
      id: 'n8',
      tipo: 'warning',
      titulo: 'Grupo em vias de encerramento',
      mensagem: 'O grupo "Setembro/25 a Junho/26" encerra em 15 dias. Verificar pendências dos clientes.',
      lida: true,
      created_at: h(10080),
      link: '/grupos'
    },
    {
      id: 'n9',
      tipo: 'info',
      titulo: 'Atualização de sistema',
      mensagem: 'Novas funcionalidades de importação Bubble.io adicionadas. Confira em Configurações.',
      lida: true,
      created_at: h(14400),
      link: '/configuracoes'
    },
    {
      id: 'n10',
      tipo: 'success',
      titulo: 'Pagamento confirmado — Maria José',
      mensagem: 'Cota #412 — Parcela de Dezembro/2026 confirmada via crediário. Total pago: R$ 1.292,25.',
      lida: true,
      created_at: h(21600),
      link: '/crediarios'
    },
    {
      id: 'n11',
      tipo: 'alert',
      titulo: '3 crediários com pendências urgentes',
      mensagem: 'Andressa Barcellos (28 lanc.), Gislene Ribeiro (16 lanc.) e Luciana Gauna (16 lanc.) possuem atrasos.',
      lida: false,
      created_at: h(150),
      link: '/crediarios'
    },
    {
      id: 'n12',
      tipo: 'system',
      titulo: 'Backup automático realizado',
      mensagem: 'Backup diário concluído às 03:00. Tamanho: 2.4MB. Próximo backup: 08/07/2026.',
      lida: true,
      created_at: h(28800)
    }
  ];
};

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return diffMins === 0 ? 'Agora' : `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

const NotificacoesTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A } = ctx;
  const isDark = A.textPrimary === 'text-slate-100' || A.textPrimary === 'text-slate-50';

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [filtro, setFiltro] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('notificacoes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          setNotificacoes(data as Notificacao[]);
        } else {
          setNotificacoes(generateMockNotifications());
        }
      } catch {
        setNotificacoes(generateMockNotifications());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const nonReadCount = notificacoes.filter(n => !n.lida).length;

  const handleMarkAsRead = async (id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    try {
      await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    try {
      const unreadIds = notificacoes.filter(n => !n.lida).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase.from('notificacoes').update({ lida: true }).in('id', unreadIds);
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
    try {
      await supabase.from('notificacoes').delete().eq('id', id);
    } catch {}
  };

  const filtered = notificacoes.filter(n => {
    if (filtro === 'all') return true;
    if (filtro === 'unread') return !n.lida;
    return n.tipo === filtro;
  });

  const styles = isDark ? typeStylesDark : typeStyles;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Notificações
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Acompanhe alertas, pagamentos e atualizações do sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {nonReadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                isDark
                  ? 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/60'
                  : 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <MailCheck size={14} />
              Ler todas ({nonReadCount})
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notificacoes.length, icon: Bell, color: isDark ? 'text-slate-300' : 'text-slate-700', bg: isDark ? 'bg-slate-800/50' : 'bg-slate-50' },
          { label: 'Nao Lidas', value: nonReadCount, icon: BellRing, color: 'text-rose-500', bg: isDark ? 'bg-rose-950/30' : 'bg-rose-50' },
          { label: 'Urgentes', value: notificacoes.filter(n => n.tipo === 'alert' && !n.lida).length, icon: AlertCircle, color: 'text-amber-500', bg: isDark ? 'bg-amber-950/30' : 'bg-amber-50' },
          { label: 'Hoje', value: notificacoes.filter(n => { const d = new Date(n.created_at); const t = new Date(); return d.toDateString() === t.toDateString(); }).length, icon: Clock, color: 'text-purple-500', bg: isDark ? 'bg-purple-950/30' : 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-[24px] border p-5 ${A.card} ${A.border}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              {stat.label === 'Nao Lidas' && nonReadCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className={`text-2xl font-bold ${A.textPrimary}`}>{stat.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${A.textMuted}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className={`flex flex-wrap gap-2 p-1.5 rounded-full ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
        {filterOptions.map(opt => {
          const Icon = opt.icon;
          const isActive = filtro === opt.id;
          const count = opt.id === 'all' ? notificacoes.length :
            opt.id === 'unread' ? notificacoes.filter(n => !n.lida).length :
            notificacoes.filter(n => n.tipo === opt.id).length;
          return (
            <button
              key={opt.id}
              onClick={() => setFiltro(opt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? isDark
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-[#0F172A] text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              <Icon size={14} />
              {opt.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive
                  ? 'bg-white/20 text-white'
                  : isDark
                    ? 'bg-slate-700 text-slate-400'
                    : 'bg-slate-200 text-textMuted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Notificacoes */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex flex-col items-center justify-center py-16 rounded-[24px] border ${A.card} ${A.border}`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <BellOff size={28} className={A.textMuted} />
          </div>
          <p className={`text-sm font-semibold ${A.textMuted}`}>Nenhuma notificacao encontrada</p>
          <p className={`text-xs mt-1 ${A.textMuted}`}>Todos os filtros nao possuem resultados.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <AnimatePresence mode="wait">
            {filtered.map((notif) => {
              const s = styles[notif.tipo] || styles.info;
              const IconComponent = iconMap[notif.tipo] || Info;
              return (
                <motion.div
                  key={notif.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.005, x: 4 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-[24px] border p-5 transition-all duration-200 group ${
                    !notif.lida
                      ? isDark
                        ? `${s.bg} ${s.border} shadow-lg shadow-purple-950/10`
                        : `${s.bg} ${s.border} shadow-sm`
                      : `${A.card} ${A.border}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                      <IconComponent size={20} className={s.iconColor} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${!notif.lida ? s.text : A.textPrimary}`}>
                          {notif.titulo}
                        </h3>
                        {!notif.lida && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDark ? 'bg-purple-600/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                          }`}>
                            NEW
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${!notif.lida ? `${s.text} opacity-80` : A.textMuted}`}>
                        {notif.mensagem}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`flex items-center gap-1 text-[11px] font-medium ${A.textMuted}`}>
                          <Clock size={12} />
                          {formatTimeAgo(notif.created_at)}
                        </span>
                        {notif.link && (
                          <span className={`flex items-center gap-1 text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                            isDark ? 'text-purple-400' : 'text-brand-purple'
                          }`}>
                            Ver detalhe
                            <ArrowUpRight size={12} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.lida && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title="Marcar como lida"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isDark ? 'hover:bg-rose-950/50 text-slate-400 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-500 hover:text-rose-500'
                        }`}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotificacoesTab;
