import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../DashboardContext';
import { supabase } from '../supabaseClient';
import {
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Printer,
  User,
  Phone,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Trophy,
  Medal,
  Award,
  Crown,
  DollarSign,
  BarChart3
} from 'lucide-react';

const DashboardTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A } = ctx;

  const [chartData, setChartData] = useState<{
    consorcios: any[];
    crediarios: any[];
  }>({ consorcios: [], crediarios: [] });
  const [loadingChart, setLoadingChart] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'simplificado' | 'detalhado'>('simplificado');
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [groupComparisonList, setGroupComparisonList] = useState<{
    name: string;
    paid: number;
    pending: number;
  }[]>([]);

  // Estados para o Ranking dos Top 10 Clientes
  const [rankingMetric, setRankingMetric] = useState<'pago' | 'contratado'>('pago');
  const [rankingPeriod, setRankingPeriod] = useState<'geral' | 'ano' | 'mes'>('geral');
  const [hoveredRankingIndex, setHoveredRankingIndex] = useState<number | null>(null);

  // Estados para o Gráfico Comparativo Mensal (Pagos vs Não Pagos)
  const [comparativeChartYear, setComparativeChartYear] = useState<number>(new Date().getFullYear());
  const [hoveredComparativeBar, setHoveredComparativeBar] = useState<{ monthIdx: number; category: 'pagos' | 'naoPagos' } | null>(null);
  const [comparativeTooltipPos, setComparativeTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Estado para controle de retiradas
  const [selectedWithdrawalMonthYear, setSelectedWithdrawalMonthYear] = useState<string>(() => {
    const today = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[today.getMonth()]}/${today.getFullYear()}`;
  });
  const [editingConsorcioId, setEditingConsorcioId] = useState<string | null>(null);
  const [withdrawalDateInput, setWithdrawalDateInput] = useState<string>('');
  const [isWithdrawalFilterOpen, setIsWithdrawalFilterOpen] = useState<boolean>(false);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // Estado para controle de grupos
  const [selectedGroupMonthYear, setSelectedGroupMonthYear] = useState<string>(() => {
    const today = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[today.getMonth()]}/${today.getFullYear()}`;
  });
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState<boolean>(false);
  const [groupFilterYear, setGroupFilterYear] = useState<number>(new Date().getFullYear());
  const [selectedHistoricoFilter, setSelectedHistoricoFilter] = useState<string>('todos');

  // Estado para controle de crediários
  const [selectedCrediarioMonthYear, setSelectedCrediarioMonthYear] = useState<string>(() => {
    const today = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[today.getMonth()]}/${today.getFullYear()}`;
  });
  const [isCrediarioFilterOpen, setIsCrediarioFilterOpen] = useState<boolean>(false);
  const [crediarioFilterYear, setCrediarioFilterYear] = useState<number>(new Date().getFullYear());

  // Estados e manipuladores para controle de hover no gráfico Gauge (Crediários)
  const [hoveredGaugeSegment, setHoveredGaugeSegment] = useState<string | null>(null);
  const [gaugeTooltipPos, setGaugeTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleGaugeMouseEnter = (segment: string) => {
    setHoveredGaugeSegment(segment);
  };
  const handleGaugeMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setGaugeTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  const handleGaugeMouseLeave = () => {
    setHoveredGaugeSegment(null);
    setGaugeTooltipPos(null);
  };

  const portugueseMonthNames = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);

  const shortMonthNames = useMemo(() => [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ], []);

  const [activeFilterMonth, activeFilterYear] = useMemo(() => {
    if (!selectedWithdrawalMonthYear) return [null, null];
    const [mName, yStr] = selectedWithdrawalMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    return [mIndex !== -1 ? mIndex : null, parseInt(yStr, 10) || null];
  }, [selectedWithdrawalMonthYear, portugueseMonthNames]);

  const filterLabel = useMemo(() => {
    if (!selectedWithdrawalMonthYear) return 'Todos os Períodos';
    const [mName, yStr] = selectedWithdrawalMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    if (mIndex === -1) return selectedWithdrawalMonthYear;
    const shortName = shortMonthNames[mIndex];
    const days = new Date(parseInt(yStr, 10), mIndex + 1, 0).getDate();
    return `01 - ${days} ${shortName} ${yStr}`;
  }, [selectedWithdrawalMonthYear, portugueseMonthNames, shortMonthNames]);

  const [activeGroupFilterMonth, activeGroupFilterYear] = useMemo(() => {
    if (!selectedGroupMonthYear) return [null, null];
    const [mName, yStr] = selectedGroupMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    return [mIndex !== -1 ? mIndex : null, parseInt(yStr, 10) || null];
  }, [selectedGroupMonthYear, portugueseMonthNames]);

  const groupFilterLabel = useMemo(() => {
    if (!selectedGroupMonthYear) return 'Todos os Períodos';
    const [mName, yStr] = selectedGroupMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    if (mIndex === -1) return selectedGroupMonthYear;
    const shortName = shortMonthNames[mIndex];
    const days = new Date(parseInt(yStr, 10), mIndex + 1, 0).getDate();
    return `01 - ${days} ${shortName} ${yStr}`;
  }, [selectedGroupMonthYear, portugueseMonthNames, shortMonthNames]);

  const [activeCrediarioFilterMonth, activeCrediarioFilterYear] = useMemo(() => {
    if (!selectedCrediarioMonthYear) return [null, null];
    const [mName, yStr] = selectedCrediarioMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    return [mIndex !== -1 ? mIndex : null, parseInt(yStr, 10) || null];
  }, [selectedCrediarioMonthYear, portugueseMonthNames]);

  const crediarioFilterLabel = useMemo(() => {
    if (!selectedCrediarioMonthYear) return 'Todos os Períodos';
    const [mName, yStr] = selectedCrediarioMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    if (mIndex === -1) return selectedCrediarioMonthYear;
    const shortName = shortMonthNames[mIndex];
    const days = new Date(parseInt(yStr, 10), mIndex + 1, 0).getDate();
    return `01 - ${days} ${shortName} ${yStr}`;
  }, [selectedCrediarioMonthYear, portugueseMonthNames, shortMonthNames]);

  // Timezone-immune date parser
  const parseDateParts = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth(),
        day: d.getUTCDate()
      };
    }
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1, // 0-indexed
      day: parseInt(match[3], 10)
    };
  };

  // Helper de paginação para buscar TODOS os registros do Supabase sem limite de 1.000 linhas por requisição
  const fetchAllSupabasePages = async (queryFn: (from: number, to: number) => any) => {
    let allData: any[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
      const to = from + step - 1;
      const { data, error } = await queryFn(from, to);
      if (error) throw error;
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
    return allData;
  };

  const fetchChartData = async (year: number) => {
    setLoadingChart(true);
    try {
      // 1. Fetch consorcios payments com paginação automática
      const consData = await fetchAllSupabasePages((from, to) =>
        supabase
          .from('consorcios_pagamentos')
          .select('consorcio_id, datapagamento_date, valorpago_number, valor_parcela, data_vencimento')
          .range(from, to)
      );

      // 2. Fetch crediarios payments com paginação automática
      const credData = await fetchAllSupabasePages((from, to) =>
        supabase
          .from('crediarios')
          .select('id, data_pagamento, data_vencimento, data_compra, valor_pago, valor_pagar, crediario_cliente_id, crediarios_clientes (cliente_id, clientes (id, nome, celular)), historico (id, descricao)')
          .range(from, to)
      );

      setChartData({
        consorcios: consData || [],
        crediarios: credData || []
      });
    } catch (err) {
      console.error('Erro ao buscar dados do gráfico:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  // Cálculo do Ranking dos Top 10 Clientes (Soma Crediário + Consórcio)
  const top10Clientes = useMemo(() => {
    if (!ctx.clientesList || ctx.clientesList.length === 0) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Mapeamento dos consórcios para encontrar cliente_id por consorcio_id
    const consorcioToClienteMap: { [consorcioId: string]: { clienteId: string; clienteNome: string; clienteCelular?: string } } = {};
    ctx.consorciosList.forEach((c) => {
      if (c.id && c.cliente_id) {
        consorcioToClienteMap[c.id] = {
          clienteId: c.cliente_id,
          clienteNome: c.clientes?.nome || 'Cliente Desconhecido',
          clienteCelular: c.clientes?.celular || ''
        };
      }
    });

    const accumulator: {
      [clienteId: string]: {
        clienteId: string;
        nome: string;
        celular?: string;
        totalCrediario: number;
        totalConsorcio: number;
      };
    } = {};

    const initClient = (id: string, name: string, phone?: string) => {
      if (!accumulator[id]) {
        accumulator[id] = {
          clienteId: id,
          nome: name,
          celular: phone || '',
          totalCrediario: 0,
          totalConsorcio: 0
        };
      }
    };

    ctx.clientesList.forEach((c) => {
      if (c.id) {
        initClient(c.id, c.name || 'Cliente', c.phone);
      }
    });

    // 1. Somar Consórcios
    chartData.consorcios.forEach((p) => {
      if (!p.consorcio_id) return;
      const clientInfo = consorcioToClienteMap[p.consorcio_id];
      if (!clientInfo) return;

      const dateStr = p.datapagamento_date || p.data_vencimento;
      if (dateStr) {
        const parts = parseDateParts(dateStr);
        if (parts) {
          if (rankingPeriod === 'ano' && parts.year !== chartYear) return;
          if (rankingPeriod === 'mes' && (parts.year !== currentYear || parts.month !== currentMonth)) return;
        }
      }

      let val = 0;
      if (rankingMetric === 'pago') {
        if (p.datapagamento_date || Number(p.valorpago_number || 0) > 0) {
          val = Number(p.valorpago_number || 0);
        }
      } else {
        val = Number(p.valor_parcela || p.valorpago_number || 0);
      }

      if (val > 0) {
        initClient(clientInfo.clienteId, clientInfo.clienteNome, clientInfo.clienteCelular);
        accumulator[clientInfo.clienteId].totalConsorcio += val;
      }
    });

    // 2. Somar Crediários
    chartData.crediarios.forEach((c) => {
      const clienteId = c.crediarios_clientes?.cliente_id || c.crediario_cliente_id;
      const clienteNome = c.crediarios_clientes?.clientes?.nome;
      const clienteCelular = c.crediarios_clientes?.clientes?.celular;

      if (!clienteId) return;

      const dateStr = c.data_pagamento || c.data_vencimento || c.data_compra;
      if (dateStr) {
        const parts = parseDateParts(dateStr);
        if (parts) {
          if (rankingPeriod === 'ano' && parts.year !== chartYear) return;
          if (rankingPeriod === 'mes' && (parts.year !== currentYear || parts.month !== currentMonth)) return;
        }
      }

      let val = 0;
      if (rankingMetric === 'pago') {
        if (c.data_pagamento || Number(c.valor_pago || 0) > 0) {
          val = Number(c.valor_pago || 0);
        }
      } else {
        val = Number(c.valor_pagar || c.valor_pago || 0);
      }

      if (val > 0) {
        initClient(clienteId, clienteNome || 'Cliente Desconhecido', clienteCelular);
        accumulator[clienteId].totalCrediario += val;
      }
    });

    return Object.values(accumulator)
      .map((cli) => ({
        ...cli,
        totalGeral: cli.totalCrediario + cli.totalConsorcio
      }))
      .filter((cli) => cli.totalGeral > 0)
      .sort((a, b) => b.totalGeral - a.totalGeral)
      .slice(0, 10);
  }, [ctx.clientesList, ctx.consorciosList, chartData, rankingMetric, rankingPeriod, chartYear]);

  // Cálculo do Gráfico Comparativo Mensal (Consórcios + Crediários: Pagos vs Não Pagos)
  const monthlyComparativeData = useMemo(() => {
    const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      name: monthsShort[i],
      monthIdx: i,
      pagosConsorcio: 0,
      pagosCrediario: 0,
      totalPagos: 0,
      naoPagosConsorcio: 0,
      naoPagosCrediario: 0,
      totalNaoPagos: 0
    }));

    // 1. Processar Consórcios
    chartData.consorcios.forEach((p) => {
      // Se pago
      if (p.datapagamento_date) {
        const parts = parseDateParts(p.datapagamento_date);
        if (parts && parts.year === comparativeChartYear) {
          const val = Number(p.valorpago_number || 0);
          monthly[parts.month].pagosConsorcio += val;
          monthly[parts.month].totalPagos += val;
        }
      } else {
        // Se pendente / não pago
        const dateStr = p.data_vencimento;
        if (dateStr) {
          const parts = parseDateParts(dateStr);
          if (parts && parts.year === comparativeChartYear) {
            const val = Number(p.valor_parcela || 0);
            monthly[parts.month].naoPagosConsorcio += val;
            monthly[parts.month].totalNaoPagos += val;
          }
        }
      }
    });

    // 2. Processar Crediários
    chartData.crediarios.forEach((c) => {
      // Valor pago
      if (c.data_pagamento || Number(c.valor_pago || 0) > 0) {
        const dateStr = c.data_pagamento || c.data_vencimento;
        if (dateStr) {
          const parts = parseDateParts(dateStr);
          if (parts && parts.year === comparativeChartYear) {
            const val = Number(c.valor_pago || 0);
            monthly[parts.month].pagosCrediario += val;
            monthly[parts.month].totalPagos += val;
          }
        }
      }

      // Valor não pago / em aberto
      const valorPagar = Number(c.valor_pagar || 0);
      const valorPago = Number(c.valor_pago || 0);
      const emAberto = Math.max(0, valorPagar - valorPago);

      if (!c.data_pagamento && emAberto > 0) {
        const dateStr = c.data_vencimento || c.data_compra;
        if (dateStr) {
          const parts = parseDateParts(dateStr);
          if (parts && parts.year === comparativeChartYear) {
            monthly[parts.month].naoPagosCrediario += emAberto;
            monthly[parts.month].totalNaoPagos += emAberto;
          }
        }
      }
    });

    return monthly;
  }, [chartData, comparativeChartYear]);

  const maxComparativeVal = useMemo(() => {
    let max = 0;
    monthlyComparativeData.forEach(d => {
      if (d.totalPagos > max) max = d.totalPagos;
      if (d.totalNaoPagos > max) max = d.totalNaoPagos;
    });
    return max === 0 ? 1000 : max;
  }, [monthlyComparativeData]);

  const formatCompactK = (val: number) => {
    if (!val || val <= 0) return '';
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`;
    }
    return String(Math.round(val));
  };

  const processGroupCompData = (data: any[], filterMonthIndex: number | null, filterYearVal: number | null) => {
    // 1. Map of group ID to label
    const labelsMap: { [groupId: string]: string } = {};
    const labelsCount: { [label: string]: number } = {};
    
    ctx.gruposList.forEach(g => {
      const baseLabel = g.periodo_text || 'Sem Grupo';
      const cotaStr = g.valorcota_number ? ` (R$ ${g.valorcota_number})` : '';
      const fullBase = `${baseLabel}${cotaStr}`;
      labelsMap[g.id] = fullBase;
      labelsCount[fullBase] = (labelsCount[fullBase] || 0) + 1;
    });
    
    const sequenceTracker: { [label: string]: number } = {};
    ctx.gruposList.forEach(g => {
      const baseLabel = labelsMap[g.id];
      if (labelsCount[baseLabel] > 1) {
        sequenceTracker[baseLabel] = (sequenceTracker[baseLabel] || 0) + 1;
        labelsMap[g.id] = `${baseLabel} #${sequenceTracker[baseLabel]}`;
      }
    });

    const groupsMap: { [key: string]: { id: string; name: string; paid: number; pending: number; mesinicial_date: string | null } } = {};
    
    // 2. Initialize active groups for the selected month/year
    if (filterMonthIndex !== null && filterYearVal !== null) {
      ctx.gruposList.forEach(g => {
        const start = parseDateParts(g.mesinicial_date);
        const end = parseDateParts(g.mesfinal_date);
        if (start && end) {
          const isAfterStart = (filterYearVal > start.year) || (filterYearVal === start.year && filterMonthIndex >= start.month);
          const isBeforeEnd = (filterYearVal < end.year) || (filterYearVal === end.year && filterMonthIndex <= end.month);
          
          if (isAfterStart && isBeforeEnd) {
            groupsMap[g.id] = {
              id: g.id,
              name: labelsMap[g.id] || g.periodo_text || 'Sem Grupo',
              paid: 0,
              pending: 0,
              mesinicial_date: g.mesinicial_date || null
            };
          }
        }
      });
    } else {
      // If "Todos os Períodos" is selected, initialize all groups from the list
      ctx.gruposList.forEach(g => {
        groupsMap[g.id] = {
          id: g.id,
          name: labelsMap[g.id] || g.periodo_text || 'Sem Grupo',
          paid: 0,
          pending: 0,
          mesinicial_date: g.mesinicial_date || null
        };
      });
    }

    // 3. Aggregate payments for these active groups using grupo_id
    data.forEach(row => {
      const groupId = row.grupo_id;
      if (groupId && groupsMap[groupId] !== undefined) {
        if (row.datapagamento_date) {
          if (filterMonthIndex !== null && filterYearVal !== null) {
            const payDate = parseDateParts(row.datapagamento_date);
            if (payDate && payDate.month === filterMonthIndex && payDate.year === filterYearVal) {
              groupsMap[groupId].paid += Number(row.valorpago_number || 0);
            }
          } else {
            groupsMap[groupId].paid += Number(row.valorpago_number || 0);
          }
        } else {
          if (filterMonthIndex !== null && filterYearVal !== null) {
            const dueDate = parseDateParts(row.data_vencimento);
            if (dueDate && dueDate.month === filterMonthIndex && dueDate.year === filterYearVal) {
              groupsMap[groupId].pending += Number(row.valor_parcela || 0);
            }
          } else {
            groupsMap[groupId].pending += Number(row.valor_parcela || 0);
          }
        }
      }
    });

    const list = Object.values(groupsMap).sort((a, b) => {
      if (!a.mesinicial_date) return 1;
      if (!b.mesinicial_date) return -1;
      const timeA = new Date(a.mesinicial_date).getTime();
      const timeB = new Date(b.mesinicial_date).getTime();
      return timeB - timeA;
    });

    setGroupComparisonList(list);
  };

  const fetchGroupComparison = async () => {
    if (!selectedGroupMonthYear) {
      try {
        const data = await fetchAllSupabasePages((from, to) =>
          supabase
            .from('consorcios_pagamentos')
            .select('datapagamento_date, valorpago_number, valor_parcela, grupo_text, grupo_id, data_vencimento')
            .range(from, to)
        );
        processGroupCompData(data || [], null, null);
      } catch (err) {
        console.error('Erro ao buscar comparativo geral de grupos:', err);
      }
      return;
    }

    const [mName, yStr] = selectedGroupMonthYear.split('/');
    const mIndex = portugueseMonthNames.indexOf(mName);
    if (mIndex === -1) return;
    const yearVal = parseInt(yStr, 10);

    const startDate = new Date(Date.UTC(yearVal, mIndex, 1)).toISOString();
    const endDate = new Date(Date.UTC(yearVal, mIndex + 1, 0, 23, 59, 59, 999)).toISOString();

    try {
      const data = await fetchAllSupabasePages((from, to) =>
        supabase
          .from('consorcios_pagamentos')
          .select('datapagamento_date, valorpago_number, valor_parcela, grupo_text, grupo_id, data_vencimento')
          .or(`and(datapagamento_date.gte.${startDate},datapagamento_date.lte.${endDate}),and(data_vencimento.gte.${startDate},data_vencimento.lte.${endDate})`)
          .range(from, to)
      );
      processGroupCompData(data || [], mIndex, yearVal);
    } catch (err) {
      console.error('Erro ao buscar comparativo de grupos:', err);
    }
  };

  useEffect(() => {
    fetchChartData(chartYear);
  }, [chartYear]);

  useEffect(() => {
    fetchGroupComparison();
  }, [selectedGroupMonthYear, ctx.gruposList]);

  // Aggregation logic
  const aggregatedChartData = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();

    // 12 months structure
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      consorcios: 0,
      crediariosConsorcio: 0,
      crediariosCompras: 0,
      total: 0
    }));

    // Days in current month structure
    const daysInMonth = new Date(chartYear, currentMonthIndex + 1, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({
      name: String(i + 1),
      consorcios: 0,
      crediariosConsorcio: 0,
      crediariosCompras: 0,
      total: 0
    }));

    // Aggregate consorcios payments
    chartData.consorcios.forEach(pay => {
      const parts = parseDateParts(pay.datapagamento_date);
      if (!parts) return;
      const { year, month, day } = parts;

      if (year === chartYear) {
        const val = Number(pay.valorpago_number || pay.valor_parcela || 0);
        monthly[month].consorcios += val;
        monthly[month].total += val;

        if (month === currentMonthIndex && day >= 1 && day <= daysInMonth) {
          daily[day - 1].consorcios += val;
          daily[day - 1].total += val;
        }
      }
    });

    // Aggregate crediarios payments
    chartData.crediarios.forEach(c => {
      const parts = parseDateParts(c.data_pagamento);
      if (!parts) return;
      const { year, month, day } = parts;

      if (year === chartYear) {
        const val = Number(c.valor_pago || 0);
        const descUpper = (c.historico?.descricao || '').toUpperCase();

        if (descUpper.includes('CONSORCIO') || descUpper.includes('CONSÓRCIO')) {
          monthly[month].crediariosConsorcio += val;
          monthly[month].total += val;
          if (month === currentMonthIndex && day >= 1 && day <= daysInMonth) {
            daily[day - 1].crediariosConsorcio += val;
            daily[day - 1].total += val;
          }
        } else {
          monthly[month].crediariosCompras += val;
          monthly[month].total += val;
          if (month === currentMonthIndex && day >= 1 && day <= daysInMonth) {
            daily[day - 1].crediariosCompras += val;
            daily[day - 1].total += val;
          }
        }
      }
    });

    return { monthly, daily };
  }, [chartData, chartYear]);

  const activeData = viewMode === 'simplificado' ? aggregatedChartData.monthly : aggregatedChartData.daily;

  const maxVal = useMemo(() => {
    const max = Math.max(...activeData.map(d => d.total), 0);
    return max === 0 ? 1000 : max;
  }, [activeData]);

  // Round up max to clean values
  const getCleanMax = (val: number) => {
    if (val <= 10) return 10;
    const power = Math.pow(10, Math.floor(Math.log10(val)));
    const ratio = val / power;
    let multiplier = 1;
    if (ratio <= 1) multiplier = 1;
    else if (ratio <= 1.2) multiplier = 1.2;
    else if (ratio <= 1.5) multiplier = 1.5;
    else if (ratio <= 2) multiplier = 2;
    else if (ratio <= 2.5) multiplier = 2.5;
    else if (ratio <= 3) multiplier = 3;
    else if (ratio <= 4) multiplier = 4;
    else if (ratio <= 5) multiplier = 5;
    else if (ratio <= 6) multiplier = 6;
    else if (ratio <= 8) multiplier = 8;
    else multiplier = 10;
    return Math.ceil(power * multiplier);
  };

  const cleanMax = useMemo(() => getCleanMax(maxVal), [maxVal]);

  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')} M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, '')} mil`;
    }
    return String(value);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // WhatsApp Link Helper
  const getWhatsAppLink = (phone: string | undefined | null) => {
    if (!phone) return '#';
    const clean = phone.replace(/\D/g, '');
    if (!clean) return '#';
    const finalPhone = clean.startsWith('55') ? clean : `55${clean}`;
    return `https://wa.me/${finalPhone}`;
  };

  // Sorting withdrawal months chronologically
  const sortMonthYearStrings = (a: string, b: string) => {
    const months = {
      'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4, 'Maio': 5, 'Junho': 6,
      'Julho': 7, 'Agosto': 8, 'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
    };
    const [monthA, yearA] = a.split('/');
    const [monthB, yearB] = b.split('/');
    const yA = parseInt(yearA, 10) || 0;
    const yB = parseInt(yearB, 10) || 0;
    if (yA !== yB) return yA - yB;
    const mA = months[monthA as keyof typeof months] || 0;
    const mB = months[monthB as keyof typeof months] || 0;
    return mA - mB;
  };

  // Month-year options for the withdrawals list
  const withdrawalMonthOptions = useMemo(() => {
    const months = new Set<string>();
    const currentMonthName = portugueseMonthNames[new Date().getMonth()];
    const currentYearStr = String(new Date().getFullYear());
    months.add(`${currentMonthName}/${currentYearStr}`);

    ctx.consorciosList.forEach(c => {
      if (c.mesretirada_text) {
        months.add(c.mesretirada_text);
      }
    });

    return Array.from(months).sort(sortMonthYearStrings);
  }, [ctx.consorciosList, portugueseMonthNames]);

  // Filtered withdrawals list
  const filteredWithdrawals = useMemo(() => {
    if (!selectedWithdrawalMonthYear) return [];
    return ctx.consorciosList.filter(c => c.mesretirada_text === selectedWithdrawalMonthYear);
  }, [ctx.consorciosList, selectedWithdrawalMonthYear]);

  // Handle setting withdrawal date
  const handleStartEditWithdrawal = (id: string, existingDate: string | null) => {
    setEditingConsorcioId(id);
    if (existingDate) {
      const d = new Date(existingDate);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
      setWithdrawalDateInput(localISO);
    } else {
      const today = new Date();
      const tzOffset = today.getTimezoneOffset() * 60000;
      const localISO = new Date(today.getTime() - tzOffset).toISOString().slice(0, 10);
      setWithdrawalDateInput(localISO);
    }
  };

  const handleSaveWithdrawalDate = async (consorcioId: string) => {
    try {
      const finalDate = withdrawalDateInput ? new Date(withdrawalDateInput + 'T12:00:00Z').toISOString() : null;
      const { error } = await supabase
        .from('consorcios')
        .update({ dataretirada_date: finalDate })
        .eq('id', consorcioId);

      if (error) throw error;

      setEditingConsorcioId(null);
      await ctx.refreshConsorcios();
    } catch (err) {
      console.error('Erro ao atualizar data de retirada:', err);
      alert('Erro ao atualizar data de retirada.');
    }
  };

  const handleRefreshAll = async () => {
    setLoadingChart(true);
    await Promise.all([
      ctx.refreshClientes(),
      ctx.refreshGrupos(),
      ctx.refreshConsorcios(),
      fetchChartData(chartYear),
      fetchGroupComparison()
    ]);
    setLoadingChart(false);
  };

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Helper para desenhar os caminhos de arco segmentados
  const getGaugeArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy - r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy - r * Math.sin(endRad);
    const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
    const sweepFlag = startAngle > endAngle ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
  };

  // Lógica para o gráfico de Gauge de crediários por histórico
  const currentMonthIndex = activeCrediarioFilterMonth !== null ? activeCrediarioFilterMonth : new Date().getMonth();
  const targetYearForCrediarios = activeCrediarioFilterYear !== null ? activeCrediarioFilterYear : chartYear;

  // Filtrar crediários do mês/ano selecionado usando o critério de data_pagamento || data_vencimento
  const currentMonthCrediarios = useMemo(() => {
    return chartData.crediarios.filter(c => {
      const dateStr = c.data_pagamento || c.data_vencimento;
      if (!dateStr) return false;
      const parts = parseDateParts(dateStr);
      if (!parts) return false;

      // Se não há filtro de período (Todos os Períodos)
      if (activeCrediarioFilterMonth === null && activeCrediarioFilterYear === null) {
        return true;
      }

      return parts.year === targetYearForCrediarios && parts.month === currentMonthIndex;
    });
  }, [chartData.crediarios, targetYearForCrediarios, currentMonthIndex, activeCrediarioFilterMonth, activeCrediarioFilterYear]);

  // Filtrar crediários do mês anterior para fins de comparação
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevYearForCrediarios = currentMonthIndex === 0 ? targetYearForCrediarios - 1 : targetYearForCrediarios;
  const prevMonthCrediarios = useMemo(() => {
    return chartData.crediarios.filter(c => {
      const dateStr = c.data_pagamento || c.data_vencimento;
      if (!dateStr) return false;
      const parts = parseDateParts(dateStr);
      if (!parts) return false;

      // Se não há filtro de período, não há mês anterior para comparar
      if (activeCrediarioFilterMonth === null && activeCrediarioFilterYear === null) {
        return false;
      }

      return parts.year === prevYearForCrediarios && parts.month === prevMonthIndex;
    });
  }, [chartData.crediarios, prevMonthIndex, prevYearForCrediarios, activeCrediarioFilterMonth, activeCrediarioFilterYear]);

  // Agrupamento dos dados do mês atual por histórico
  const crediariosGroupedByHistorico = useMemo(() => {
    const groups: { [key: string]: { historico: string; recebido: number; aReceber: number } } = {};

    currentMonthCrediarios.forEach(c => {
      const desc = c.historico?.descricao || 'Sem Histórico';
      if (!groups[desc]) {
        groups[desc] = { historico: desc, recebido: 0, aReceber: 0 };
      }
      const p = Number(c.valor_pago || 0);
      const a = Math.max(Number(c.valor_pagar || 0), p);
      groups[desc].recebido += p;
      groups[desc].aReceber += a;
    });

    return Object.values(groups);
  }, [currentMonthCrediarios]);

  // Agrupamento dos dados do mês anterior por histórico
  const prevMonthGrouped = useMemo(() => {
    const groups: { [key: string]: { recebido: number } } = {};

    prevMonthCrediarios.forEach(c => {
      const desc = c.historico?.descricao || 'Sem Histórico';
      if (!groups[desc]) {
        groups[desc] = { recebido: 0 };
      }
      groups[desc].recebido += Number(c.valor_pago || 0);
    });

    return groups;
  }, [prevMonthCrediarios]);

  // Obter lista única de descrições de históricos ativos no mês atual para o seletor dropdown
  const activeHistoricos = useMemo(() => {
    const list = currentMonthCrediarios.map(c => c.historico?.descricao || 'Sem Histórico');
    return Array.from(new Set(list)).filter(Boolean);
  }, [currentMonthCrediarios]);

  // Totais conforme o filtro selecionado (dropdown)
  const currentTotals = useMemo(() => {
    if (selectedHistoricoFilter === 'todos') {
      let recebido = 0;
      let aReceber = 0;
      crediariosGroupedByHistorico.forEach(g => {
        recebido += g.recebido;
        aReceber += g.aReceber;
      });
      return { recebido, aReceber };
    } else {
      const group = crediariosGroupedByHistorico.find(g => g.historico === selectedHistoricoFilter);
      return {
        recebido: group ? group.recebido : 0,
        aReceber: group ? group.aReceber : 0
      };
    }
  }, [crediariosGroupedByHistorico, selectedHistoricoFilter]);

  // Recebido do mês passado para o histórico selecionado (ou todos) para calcular variação
  const prevTotals = useMemo(() => {
    if (selectedHistoricoFilter === 'todos') {
      let recebido = 0;
      (Object.values(prevMonthGrouped) as { recebido: number }[]).forEach(g => {
        recebido += g.recebido;
      });
      return { recebido };
    } else {
      const group = prevMonthGrouped[selectedHistoricoFilter] as { recebido: number } | undefined;
      return {
        recebido: group ? group.recebido : 0
      };
    }
  }, [prevMonthGrouped, selectedHistoricoFilter]);

  // Porcentagem preenchida do gráfico (recebido / a receber)
  const fillingPercentage = useMemo(() => {
    if (currentTotals.aReceber <= 0) return 0;
    return Math.min(1, currentTotals.recebido / currentTotals.aReceber);
  }, [currentTotals]);

  // Crescimento em relação ao mês anterior (soma dos valores recebidos)
  const variationPercentage = useMemo(() => {
    const prev = prevTotals.recebido;
    const curr = currentTotals.recebido;
    if (prev <= 0) {
      return curr > 0 ? 100 : 0;
    }
    return ((curr - prev) / prev) * 100;
  }, [prevTotals, currentTotals]);

  // Ângulos do Gauge
  const gaugeArcs = useMemo(() => {
    const P = fillingPercentage;
    
    // Segmento 1: 200 a 132 graus
    const p1 = Math.min(1, Math.max(0, P / 0.3333));
    const end1 = 200 - p1 * 68;

    // Segmento 2: 124 a 56 graus
    const p2 = Math.min(1, Math.max(0, (P - 0.3333) / 0.3333));
    const end2 = 124 - p2 * 68;

    // Segmento 3: 48 a -20 graus
    const p3 = Math.min(1, Math.max(0, (P - 0.6666) / 0.3333));
    const end3 = 48 - p3 * 68;

    return {
      p1, end1,
      p2, end2,
      p3, end3
    };
  }, [fillingPercentage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Dashboard
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Observe suas vendas e indicadores de forma simplificada.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto text-xs font-semibold">
          <select
            value={chartYear}
            onChange={(e) => setChartYear(Number(e.target.value))}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm outline-none cursor-pointer transition-all`}
          >
            <option value={2024}>Ano: 2024</option>
            <option value={2025}>Ano: 2025</option>
            <option value={2026}>Ano: 2026</option>
            <option value={2027}>Ano: 2027</option>
          </select>
          <button
            onClick={handleRefreshAll}
            disabled={loadingChart}
            className="p-2.5 rounded-xl bg-brand-purple text-white hover:bg-brand-purpleDark shadow-md shadow-brand-purple/15 transition-all disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={loadingChart ? "animate-spin" : ""} />
          </button>
          <button className={`p-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`}>
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #chart-print-area, #chart-print-area * {
            visibility: visible !important;
          }
          #chart-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
          }
          /* Ensure backgrounds print correctly */
          #chart-print-area * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide print button/toggles when printing */
          #chart-print-header-actions {
            display: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAFICO DE RECEITAS (Stacked Bar Chart) */}
        <div
          id="chart-print-area"
          className={`lg:col-span-8 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[400px] relative transition-all duration-300`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>Entradas por Período</h3>
              <p className={`text-xs ${A.textMuted}`}>
                {viewMode === 'simplificado'
                  ? `Receitas mensais do ano de ${chartYear}`
                  : `Receitas diárias de ${portugueseMonthNames[new Date().getMonth()]} de ${chartYear}`
                }
              </p>
            </div>

            {/* Ações do Gráfico */}
            <div id="chart-print-header-actions" className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => window.print()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${A.card} ${A.bgHover} shadow-sm transition-all text-[#4B32A6] hover:bg-purple-50`}
                title="Imprimir gráfico"
              >
                <Printer size={13} />
                <span>Imprimir Gráfico</span>
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-[10px] font-bold">
                <button
                  onClick={() => setViewMode('detalhado')}
                  className={`px-3 py-1 rounded-full transition-all ${viewMode === 'detalhado'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  detalhado
                </button>
                <button
                  onClick={() => setViewMode('simplificado')}
                  className={`px-3 py-1 rounded-full transition-all ${viewMode === 'simplificado'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  simplificado
                </button>
              </div>
            </div>
          </div>

          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-xs font-semibold px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }} />
              <span className={A.textPrimary}>Consórcios Recebidos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, #22D3EE, #0891B2)' }} />
              <span className={A.textPrimary}>Crediários (# DO CONSORCIO)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, #A3E635, #84CC16)' }} />
              <span className={A.textPrimary}>Crediários (COMPRAS)</span>
            </div>
          </div>

          {/* Área de Visualização do Gráfico */}
          <div className="flex-1 relative flex items-end justify-center min-h-[220px] w-full mt-2">
            {loadingChart ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-brand-purple" />
              </div>
            ) : activeData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Nenhum dado encontrado para o período.
              </div>
            ) : (
              <div className="w-full h-full relative flex flex-col justify-between">
                {/* SVG do Gráfico */}
                <div className="flex-1 relative">
                  <svg
                    className="w-full h-full min-h-[220px]"
                    viewBox="0 0 800 300"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6D28D9" />
                      </linearGradient>
                      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="100%" stopColor="#0891B2" />
                      </linearGradient>
                      <linearGradient id="limeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A3E635" />
                        <stop offset="100%" stopColor="#84CC16" />
                      </linearGradient>
                    </defs>

                    {/* Linhas de Grade e Eixo Y */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = (cleanMax / 4) * i;
                      const y = 20 + 250 - (value / cleanMax) * 250;
                      return (
                        <g key={`grid-${i}`} className="opacity-40">
                          <line
                            x1="60"
                            y1={y}
                            x2="780"
                            y2={y}
                            stroke="#E2E8F0"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="50"
                            y={y + 4}
                            textAnchor="end"
                            className="fill-slate-400 text-[10px] font-bold"
                          >
                            {formatYAxisLabel(value)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Barras Empilhadas */}
                    {activeData.map((item, idx) => {
                      const barWidth = 720 / activeData.length;
                      const gap = viewMode === 'simplificado' ? 18 : 6;
                      const w = barWidth - gap;
                      const x = 60 + idx * barWidth + gap / 2;

                      const h1 = (item.consorcios / cleanMax) * 250;
                      const h2 = (item.crediariosConsorcio / cleanMax) * 250;
                      const h3 = (item.crediariosCompras / cleanMax) * 250;

                      let currentY = 20 + 250;

                      // Coordenadas Y para cada fatia
                      const y1 = currentY - h1;
                      const y2 = y1 - h2;
                      const y3 = y2 - h3;

                      return (
                        <g key={`bar-group-${idx}`} className="transition-all duration-300">
                          {/* Consórcios */}
                          {h1 > 0 && (
                            <rect
                              x={x}
                              y={y1}
                              width={w}
                              height={h1}
                              fill="url(#purpleGrad)"
                              rx={h2 === 0 && h3 === 0 ? 3 : 0}
                            />
                          )}
                          {/* Crediários Consórcio */}
                          {h2 > 0 && (
                            <rect
                              x={x}
                              y={y2}
                              width={w}
                              height={h2}
                              fill="url(#cyanGrad)"
                              rx={h3 === 0 ? 3 : 0}
                            />
                          )}
                          {/* Crediários Compras */}
                          {h3 > 0 && (
                            <rect
                              x={x}
                              y={y3}
                              width={w}
                              height={h3}
                              fill="url(#limeGrad)"
                              rx={3}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Camada Invisível de Hover para Interação */}
                    {activeData.map((item, idx) => {
                      const barWidth = 720 / activeData.length;
                      const x = 60 + idx * barWidth;
                      return (
                        <rect
                          key={`hover-rect-${idx}`}
                          x={x}
                          y={20}
                          width={barWidth}
                          height={250}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={(e) => {
                            setHoveredBarIndex(idx);
                            setTooltipPos({
                              x: x + barWidth / 2,
                              y: 120
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredBarIndex(null);
                            setTooltipPos(null);
                          }}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Eixo X (Nomes/Dias) */}
                <div className="h-6 flex justify-between items-center text-[10px] font-bold text-slate-400 pl-[60px] pr-[20px] pt-1">
                  {activeData.map((item, idx) => {
                    const barWidth = 720 / activeData.length;
                    // Em modo detalhado (31 dias), reduzir densidade de rótulos para não embolar
                    const showLabel =
                      viewMode === 'simplificado' ||
                      idx === 0 ||
                      idx === activeData.length - 1 ||
                      (idx + 1) % 5 === 0;

                    return (
                      <div
                        key={`x-label-${idx}`}
                        style={{ width: `${barWidth}px` }}
                        className="text-center"
                      >
                        {showLabel ? item.name : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tooltip Customizado */}
            {hoveredBarIndex !== null && tooltipPos !== null && activeData[hoveredBarIndex] && (() => {
              const item = activeData[hoveredBarIndex];
              const totalVal = item.total || 0;
              const divisor = totalVal > 0 ? totalVal : 1;
              const pctConsorcios = ((item.consorcios / divisor) * 100).toFixed(0);
              const pctCrediariosConsorcio = ((item.crediariosConsorcio / divisor) * 100).toFixed(0);
              const pctCrediariosCompras = ((item.crediariosCompras / divisor) * 100).toFixed(0);

              return (
                <div
                  className="absolute z-10 bg-slate-900/95 text-white text-xs p-3.5 rounded-2xl shadow-xl border border-slate-700 pointer-events-none transition-all duration-150 backdrop-blur-sm"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y}px`,
                    transform: 'translate(-50%, -100%)',
                    marginTop: '-12px'
                  }}
                >
                  <p className="font-bold border-b border-slate-700 pb-1 mb-2 text-center text-[11px] uppercase tracking-wider text-slate-300">
                    {viewMode === 'simplificado' ? `Mês: ${item.name}` : `Dia: ${item.name}`}
                  </p>
                  <div className="space-y-1.5 min-w-[210px]">
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-purple inline-block" />
                        Consórcios:
                      </span>
                      <span className="font-semibold text-slate-100">
                        {formatCurrency(item.consorcios)} <span className="text-[10px] text-slate-400 font-medium">({pctConsorcios}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue inline-block" />
                        Crediários (Consórcio):
                      </span>
                      <span className="font-semibold text-slate-100">
                        {formatCurrency(item.crediariosConsorcio)} <span className="text-[10px] text-slate-400 font-medium">({pctCrediariosConsorcio}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-lime inline-block" />
                        Crediários (Compras):
                      </span>
                      <span className="font-semibold text-slate-100">
                        {formatCurrency(item.crediariosCompras)} <span className="text-[10px] text-slate-400 font-medium">({pctCrediariosCompras}%)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 border-t border-slate-700/60 pt-1.5 mt-1.5 font-bold text-[13px] text-brand-purple">
                      <span className="text-white">Total:</span>
                      <span>{formatCurrency(totalVal)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* QUADRO DE RETIRADAS DE CLIENTES */}
        <div className={`lg:col-span-4 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[400px] h-full`}>
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header do Quadro */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className={`font-bold text-lg ${A.textPrimary}`}>Retiradas</h3>
                <p className={`text-xs ${A.textMuted}`}>Clientes do mês</p>
              </div>

              {/* Seletor de Mês/Ano Popover */}
              <div className="relative">
                {/* Trigger Button */}
                <button
                  onClick={() => setIsWithdrawalFilterOpen(prev => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-purple outline-none ${isWithdrawalFilterOpen
                      ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-850'
                      : `${A.card} ${A.textPrimary} ${A.border} hover:bg-slate-50 dark:hover:bg-slate-700`
                    }`}
                >
                  <Calendar size={13} className="text-slate-400" />
                  <span>{filterLabel}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform ${isWithdrawalFilterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Popover Content */}
                <AnimatePresence>
                  {isWithdrawalFilterOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsWithdrawalFilterOpen(false)}
                      />

                      {/* Popover Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-72 rounded-[24px] border p-4 shadow-xl z-50 flex flex-col gap-4 ${A.card
                          } ${A.border}`}
                      >
                        {/* Year Selector Header */}
                        <div className="flex items-center justify-between font-bold text-sm">
                          <button
                            onClick={() => setFilterYear(prev => prev - 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className={A.textPrimary}>{filterYear}</span>
                          <button
                            onClick={() => setFilterYear(prev => prev + 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* 3x4 Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {shortMonthNames.map((mShort, idx) => {
                            const isSelected = activeFilterMonth === idx && activeFilterYear === filterYear;
                            return (
                              <button
                                key={mShort}
                                onClick={() => {
                                  const monthName = portugueseMonthNames[idx];
                                  setSelectedWithdrawalMonthYear(`${monthName}/${filterYear}`);
                                  setIsWithdrawalFilterOpen(false);
                                }}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all ${isSelected
                                    ? 'bg-[#7C3AED] text-white shadow-md shadow-brand-purple/20'
                                    : `${A.textPrimary} ${A.bgHover}`
                                  }`}
                              >
                                {mShort}
                              </button>
                            );
                          })}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                        {/* Todos os Períodos Button */}
                        <button
                          onClick={() => {
                            setSelectedWithdrawalMonthYear('');
                            setIsWithdrawalFilterOpen(false);
                          }}
                          className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold text-center transition-all ${!selectedWithdrawalMonthYear
                              ? 'bg-[#7C3AED] text-white border-transparent'
                              : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                          Todos os Períodos
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Listagem de Clientes */}
            <div className="flex-1 overflow-y-auto max-h-[540px] space-y-3 pr-1">
              {filteredWithdrawals.length === 0 ? (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-4">
                  <Clock size={32} className="text-slate-300 dark:text-slate-600 mb-2 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">Nenhuma retirada agendada</p>
                  <p className="text-[10px] text-slate-400/80 mt-0.5">para {selectedWithdrawalMonthYear || 'Todos os Períodos'}</p>
                </div>
              ) : (
                filteredWithdrawals.map(c => {
                  const isRetirado = !!c.dataretirada_date;
                  const formattedWithdrawalDate = c.dataretirada_date
                    ? new Date(c.dataretirada_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : '-';

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border ${A.border} hover:shadow-sm transition-all duration-200 ${isRetirado ? 'bg-emerald-500/5 border-emerald-500/10' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-extrabold ${A.textPrimary} uppercase tracking-tight`}>
                            {c.clientes?.nome || 'Cliente sem nome'}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            {/* Contato do Cliente */}
                            {c.clientes?.celular && (
                              <a
                                href={getWhatsAppLink(c.clientes.celular)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-brand-purple hover:underline font-bold"
                                title="Enviar mensagem no WhatsApp"
                              >
                                <Phone size={12} />
                                <span>{c.clientes.celular}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                            
                            {c.clientes?.vestetamanho && (
                              <>
                                {c.clientes?.celular && <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>}
                                <span className="text-xs font-bold text-slate-400">
                                  Tamanho: <span className="text-brand-purple font-extrabold">{c.clientes.vestetamanho}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cota Info */}
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple text-xs font-bold">
                            Cota {c.cotano_number}
                          </span>
                          <p className={`text-xs font-bold mt-1 ${A.textPrimary}`}>
                            {formatCurrency(Number(c.grupos?.valorcota_number || 0))}
                          </p>
                        </div>
                      </div>

                      {/* Informações de Grupo e Retirada */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2.5 text-xs font-bold text-slate-400">
                        <span>{c.grupos?.periodo_text || 'Grupo sem período'}</span>

                        {/* Editor de Data de Retirada */}
                        <div className="flex items-center gap-1">
                          {editingConsorcioId === c.id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="date"
                                value={withdrawalDateInput}
                                onChange={(e) => setWithdrawalDateInput(e.target.value)}
                                className={`px-2 py-1 text-xs rounded-lg border outline-none ${A.inputText}`}
                              />
                              <button
                                onClick={() => handleSaveWithdrawalDate(c.id)}
                                className="p-1 rounded bg-brand-purple text-white hover:bg-brand-purpleDark"
                                title="Salvar"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setEditingConsorcioId(null)}
                                className="p-1 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300"
                                title="Cancelar"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditWithdrawal(c.id, c.dataretirada_date)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${isRetirado
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                }`}
                              title={isRetirado ? "Clique para editar a data de retirada" : "Clique para marcar como retirado"}
                            >
                              {isRetirado ? <Check size={11} /> : <Clock size={11} />}
                              <span>{isRetirado ? `Retirado: ${formattedWithdrawalDate}` : 'Pendente'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: GRUPOS DE CONSÓRCIOS + CREDIÁRIOS (Abaixo de Entradas por Período) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-2 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[480px]`}>
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className={A.textMuted} />
                <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                  Grupos de Consórcios
                </h3>
              </div>
              {/* Seletor de Mês/Ano Popover (Grupos) */}
              <div className="relative">
                {/* Trigger Button */}
                <button
                  onClick={() => setIsGroupFilterOpen(prev => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-purple outline-none ${
                    isGroupFilterOpen
                      ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-850'
                      : `${A.card} ${A.textPrimary} ${A.border} hover:bg-slate-50 dark:hover:bg-slate-700`
                  }`}
                >
                  <Calendar size={13} className="text-slate-400" />
                  <span>{groupFilterLabel}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform ${isGroupFilterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Popover Content */}
                <AnimatePresence>
                  {isGroupFilterOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsGroupFilterOpen(false)}
                      />
                      
                      {/* Popover Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-72 rounded-[24px] border p-4 shadow-xl z-50 flex flex-col gap-4 ${
                          A.card
                        } ${A.border}`}
                      >
                        {/* Year Selector Header */}
                        <div className="flex items-center justify-between font-bold text-sm">
                          <button
                            onClick={() => setGroupFilterYear(prev => prev - 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className={A.textPrimary}>{groupFilterYear}</span>
                          <button
                            onClick={() => setGroupFilterYear(prev => prev + 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* 3x4 Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {shortMonthNames.map((mShort, idx) => {
                            const isSelected = activeGroupFilterMonth === idx && activeGroupFilterYear === groupFilterYear;
                            return (
                              <button
                                key={mShort}
                                onClick={() => {
                                  const monthName = portugueseMonthNames[idx];
                                  setSelectedGroupMonthYear(`${monthName}/${groupFilterYear}`);
                                  setIsGroupFilterOpen(false);
                                }}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[#7C3AED] text-white shadow-md shadow-brand-purple/20'
                                    : `${A.textPrimary} ${A.bgHover}`
                                }`}
                              >
                                {mShort}
                              </button>
                            );
                          })}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                        {/* Todos os Períodos Button */}
                        <button
                          onClick={() => {
                            setSelectedGroupMonthYear('');
                            setIsGroupFilterOpen(false);
                          }}
                          className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold text-center transition-all ${
                            !selectedGroupMonthYear
                              ? 'bg-[#7C3AED] text-white border-transparent'
                              : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          Todos os Períodos
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className={`text-xs ${A.textMuted}`}>
              Comparativo de parcelas pagas vs a receber por grupo.
            </p>

            {/* List and scroll wrapper */}
            <div className="flex-1 overflow-y-auto max-h-[370px] pr-1 space-y-5 mt-2">
              {groupComparisonList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold text-center py-8">Nenhum grupo ativo no período selecionado</p>
              ) : (
                (() => {
                  const maxGroupVal = Math.max(...groupComparisonList.map(g => g.paid + g.pending), 100);
                  return groupComparisonList.map(g => {
                    const totalG = g.paid + g.pending;
                    return (
                      <div key={g.name} className="space-y-2">
                        <div className="flex justify-between items-baseline text-xs font-bold text-slate-500">
                          <span className="truncate max-w-[280px]" title={g.name}>{g.name}</span>
                          <span className={A.textPrimary}>{formatCurrency(totalG)}</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          {/* Bar 1: Pagos */}
                          <div className="flex items-center gap-3">
                            <span className="w-20 text-xs text-[#7C3AED] font-bold truncate">Pago</span>
                            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalG > 0 ? (g.paid / maxGroupVal) * 100 : 0}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                              />
                            </div>
                            <span className="w-24 text-right text-xs text-slate-400 font-bold">{formatCurrency(g.paid)}</span>
                          </div>

                          {/* Bar 2: A Receber */}
                          <div className="flex items-center gap-3">
                            <span className="w-20 text-xs text-[#06B6D4] font-bold truncate">A Receber</span>
                            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalG > 0 ? (g.pending / maxGroupVal) * 100 : 0}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                              />
                            </div>
                            <span className="w-24 text-right text-xs text-slate-400 font-bold">{formatCurrency(g.pending)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-[18px] font-bold">
                <span className="text-[#6D28D9] dark:text-[#a78bfa] font-bold">Total Pago:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {formatCurrency(groupComparisonList.reduce((acc, curr) => acc + curr.paid, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-[18px] font-bold">
                <span className="text-[#0E7490] dark:text-[#22D3EE] font-bold">Total a Receber:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {formatCurrency(groupComparisonList.reduce((acc, curr) => acc + curr.pending, 0))}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-100 dark:border-slate-800/40 my-1" />
              <div className="flex justify-between items-center text-[20px] font-bold">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Total Projetado:</span>
                <span className="text-slate-900 dark:text-[#a78bfa] font-extrabold">
                  {formatCurrency(groupComparisonList.reduce((acc, curr) => acc + curr.paid + curr.pending, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[480px]`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                Crediários
              </h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Dropdown de Históricos */}
              <select
                value={selectedHistoricoFilter}
                onChange={(e) => setSelectedHistoricoFilter(e.target.value)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer ${A.card} ${A.textPrimary} ${A.border} hover:bg-slate-50 dark:hover:bg-slate-800`}
              >
                <option value="todos">Todos</option>
                {activeHistoricos.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              {/* Seletor de Mês/Ano Popover (Crediários) */}
              <div className="relative">
                {/* Trigger Button */}
                <button
                  onClick={() => setIsCrediarioFilterOpen(prev => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-purple outline-none ${
                    isCrediarioFilterOpen
                      ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-850'
                      : `${A.card} ${A.textPrimary} ${A.border} hover:bg-slate-50 dark:hover:bg-slate-700`
                  }`}
                >
                  <Calendar size={13} className="text-slate-400" />
                  <span>{crediarioFilterLabel}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform ${isCrediarioFilterOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Popover Content */}
                <AnimatePresence>
                  {isCrediarioFilterOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsCrediarioFilterOpen(false)}
                      />
                      
                      {/* Popover Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-72 rounded-[24px] border p-4 shadow-xl z-50 flex flex-col gap-4 ${
                          A.card
                        } ${A.border}`}
                      >
                        {/* Year Selector Header */}
                        <div className="flex items-center justify-between font-bold text-sm">
                          <button
                            onClick={() => setCrediarioFilterYear(prev => prev - 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className={A.textPrimary}>{crediarioFilterYear}</span>
                          <button
                            onClick={() => setCrediarioFilterYear(prev => prev + 1)}
                            className={`p-1.5 rounded-lg border ${A.border} ${A.bgHover} transition-all`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* 3x4 Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {shortMonthNames.map((mShort, idx) => {
                            const isSelected = activeCrediarioFilterMonth === idx && activeCrediarioFilterYear === crediarioFilterYear;
                            return (
                              <button
                                key={mShort}
                                onClick={() => {
                                  const monthName = portugueseMonthNames[idx];
                                  setSelectedCrediarioMonthYear(`${monthName}/${crediarioFilterYear}`);
                                  setIsCrediarioFilterOpen(false);
                                }}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[#7C3AED] text-white shadow-md shadow-brand-purple/20'
                                    : `${A.textPrimary} ${A.bgHover}`
                                }`}
                              >
                                {mShort}
                              </button>
                            );
                          })}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                        {/* Todos os Períodos Button */}
                        <button
                          onClick={() => {
                            setSelectedCrediarioMonthYear('');
                            setIsCrediarioFilterOpen(false);
                          }}
                          className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold text-center transition-all ${
                            !selectedCrediarioMonthYear
                              ? 'bg-[#7C3AED] text-white border-transparent'
                              : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          Todos os Períodos
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex flex-col pt-2">
            <span className={`text-xs text-slate-400 font-bold uppercase tracking-wider`}>
              {activeCrediarioFilterMonth === null && activeCrediarioFilterYear === null
                ? 'Todos os Períodos'
                : `Mês Atual: ${portugueseMonthNames[currentMonthIndex]} / ${targetYearForCrediarios}`}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className={`text-3xl font-black ${A.textPrimary}`}>{formatCurrency(currentTotals.recebido)}</h4>
              <span className="text-xs text-slate-400 font-semibold">
                recebidos
              </span>
            </div>
            {variationPercentage > 0 ? (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                ↑ {variationPercentage.toFixed(1)}% <span className="text-slate-400 font-medium normal-case">em relação ao mês passado</span>
              </span>
            ) : variationPercentage < 0 ? (
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-0.5">
                ↓ {Math.abs(variationPercentage).toFixed(1)}% <span className="text-slate-400 font-medium normal-case">em relação ao mês passado</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                0.0% <span className="text-slate-400 font-medium normal-case">em relação ao mês passado</span>
              </span>
            )}
          </div>
          
          {/* Gauge Chart SVG */}
          <div className="relative flex justify-center items-center h-40 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 220 140"
            >
              {/* Segmento 1 (Compras): Roxo (#7C3AED) */}
              <g
                className="cursor-pointer transition-all duration-200 hover:opacity-85"
                onMouseEnter={() => handleGaugeMouseEnter('compras')}
                onMouseMove={handleGaugeMouseMove}
                onMouseLeave={handleGaugeMouseLeave}
              >
                {/* Segmento 1 de fundo */}
                <path
                  d={getGaugeArcPath(110, 95, 80, 200, 132)}
                  fill="none"
                  stroke={A.textPrimary === 'text-slate-100' ? '#1E293B' : '#F1F5F9'}
                  strokeWidth="21"
                  strokeLinecap="round"
                />
                {/* Segmento 1 ativo */}
                {gaugeArcs.p1 > 0 && (
                  <path
                    d={getGaugeArcPath(110, 95, 80, 200, gaugeArcs.end1)}
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="21"
                    strokeLinecap="round"
                  />
                )}
              </g>

              {/* Segmento 2 (Consórcio): Azul-Turquesa (#06B6D4) */}
              <g
                className="cursor-pointer transition-all duration-200 hover:opacity-85"
                onMouseEnter={() => handleGaugeMouseEnter('consorcio')}
                onMouseMove={handleGaugeMouseMove}
                onMouseLeave={handleGaugeMouseLeave}
              >
                {/* Segmento 2 de fundo */}
                <path
                  d={getGaugeArcPath(110, 95, 80, 124, 56)}
                  fill="none"
                  stroke={A.textPrimary === 'text-slate-100' ? '#1E293B' : '#F1F5F9'}
                  strokeWidth="21"
                  strokeLinecap="round"
                />
                {/* Segmento 2 ativo */}
                {gaugeArcs.p2 > 0 && (
                  <path
                    d={getGaugeArcPath(110, 95, 80, 124, gaugeArcs.end2)}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="21"
                    strokeLinecap="round"
                  />
                )}
              </g>

              {/* Segmento 3 (Outros): Verde-Lima (#C0F62C) */}
              <g
                className="cursor-pointer transition-all duration-200 hover:opacity-85"
                onMouseEnter={() => handleGaugeMouseEnter('outros')}
                onMouseMove={handleGaugeMouseMove}
                onMouseLeave={handleGaugeMouseLeave}
              >
                {/* Segmento 3 de fundo */}
                <path
                  d={getGaugeArcPath(110, 95, 80, 48, -20)}
                  fill="none"
                  stroke={A.textPrimary === 'text-slate-100' ? '#1E293B' : '#F1F5F9'}
                  strokeWidth="21"
                  strokeLinecap="round"
                />
                {/* Segmento 3 ativo */}
                {gaugeArcs.p3 > 0 && (
                  <path
                    d={getGaugeArcPath(110, 95, 80, 48, gaugeArcs.end3)}
                    fill="none"
                    stroke="#C0F62C"
                    strokeWidth="21"
                    strokeLinecap="round"
                  />
                )}
              </g>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center top-[68%] -translate-y-1/2 pointer-events-none">
              <span className={`text-3xl font-black ${A.textPrimary}`}>
                {Math.round(fillingPercentage * 100)}%
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Do total a receber
              </span>
            </div>

            {/* Tooltip Customizado para o Gauge */}
            {hoveredGaugeSegment !== null && gaugeTooltipPos !== null && (() => {
              let segmentData = null;
              let segmentName = '';
              let segmentColor = '#C0F62C';

              if (hoveredGaugeSegment === 'compras') {
                segmentData = crediariosGroupedByHistorico.find(g => {
                  const h = g.historico.toUpperCase();
                  return h.includes('COMPRAS') || h.includes('COMPRA');
                });
                segmentName = segmentData?.historico || 'Compras';
                segmentColor = '#7C3AED';
              } else if (hoveredGaugeSegment === 'consorcio') {
                segmentData = crediariosGroupedByHistorico.find(g => {
                  const h = g.historico.toUpperCase();
                  return h.includes('CONSORCIO') || h.includes('CONSÓRCIO');
                });
                segmentName = segmentData?.historico || '# DO CONSORCIO';
                segmentColor = '#06B6D4';
              } else if (hoveredGaugeSegment === 'outros') {
                segmentData = crediariosGroupedByHistorico.find(g => {
                  const h = g.historico.toUpperCase();
                  return !h.includes('COMPRAS') && !h.includes('COMPRA') && !h.includes('CONSORCIO') && !h.includes('CONSÓRCIO');
                });
                segmentName = segmentData?.historico || 'Outros Históricos';
                segmentColor = '#C0F62C';
              }

              if (!segmentData) return null;

              const totalSegment = segmentData.aReceber;
              const divisorSegment = totalSegment > 0 ? totalSegment : 1;
              const pctSegment = ((segmentData.recebido / divisorSegment) * 100).toFixed(0);

              return (
                <div
                  className="absolute z-10 bg-slate-900/95 text-white text-xs p-3.5 rounded-2xl shadow-xl border border-slate-700 pointer-events-none transition-all duration-150 backdrop-blur-sm"
                  style={{
                    left: `${gaugeTooltipPos.x}px`,
                    top: `${gaugeTooltipPos.y}px`,
                    transform: 'translate(-50%, -100%)',
                    marginTop: '-12px'
                  }}
                >
                  <p className="font-bold border-b border-slate-700 pb-1 mb-2 text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: segmentColor }} />
                    {segmentName}
                  </p>
                  <div className="space-y-1.5 min-w-[170px]">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-300">Recebido:</span>
                      <span className="font-semibold text-slate-100">{formatCurrency(segmentData.recebido)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-300">Total a Receber:</span>
                      <span className="font-semibold text-slate-100">{formatCurrency(segmentData.aReceber)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 border-t border-slate-700/60 pt-1.5 mt-1.5 font-bold text-[13px] text-brand-lime">
                      <span className="text-white">Progresso:</span>
                      <span>{pctSegment}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex justify-between">
            <span>Total a Receber:</span>
            <span className={A.textPrimary}>{formatCurrency(currentTotals.aReceber)}</span>
          </div>

          {/* Listagem agrupada por histórico */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 overflow-y-auto max-h-[180px] pr-1">
            {crediariosGroupedByHistorico.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">Nenhum histórico ativo este mês</p>
            ) : (
              crediariosGroupedByHistorico.map(g => {
                const pct = g.aReceber > 0 ? (g.recebido / g.aReceber) * 100 : 0;
                const isSelected = selectedHistoricoFilter === g.historico;

                // Determina a cor com base no histórico para corresponder às cores exatas do gráfico de rosca (gauge)
                const hUpper = g.historico.toUpperCase();
                let barColor = '#C0F62C'; // Verde-Lima (Outros)
                if (hUpper.includes('COMPRAS') || hUpper.includes('COMPRA')) {
                  barColor = '#7C3AED'; // Roxo (Compras)
                } else if (hUpper.includes('CONSORCIO') || hUpper.includes('CONSÓRCIO')) {
                  barColor = '#06B6D4'; // Azul-Turquesa (Do Consórcio)
                }

                return (
                  <button
                    key={g.historico}
                    onClick={() => setSelectedHistoricoFilter(isSelected ? 'todos' : g.historico)}
                    className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-1 ${
                      isSelected 
                        ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[120px]" title={g.historico}>{g.historico}</span>
                      <span className={`${A.textPrimary}`}>{formatCurrency(g.recebido)} / {formatCurrency(g.aReceber)}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/40">
                        <div
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 w-8 text-right">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO LADO A LADO: TOP 10 CLIENTES + GRÁFICO COMPARATIVO MENSAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SEÇÃO RANKING TOP 10 CLIENTES (Crediário + Consórcio) */}
        <div className={`lg:col-span-6 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}>
          {/* Header do Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-xl tracking-tight ${A.textPrimary}`}>
                  Top 10 Clientes
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] border border-amber-500/20 uppercase tracking-wider">
                  Crediário + Consórcio
                </span>
              </div>
              <p className={`text-xs ${A.textMuted} mt-0.5`}>
                Ranking dos melhores clientes acumulados.
              </p>
            </div>

            {/* Filtros e Alternância de Métrica */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto text-xs font-semibold">
              {/* Seletor de Período */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setRankingPeriod('geral')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                    rankingPeriod === 'geral'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setRankingPeriod('ano')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                    rankingPeriod === 'ano'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Ano ({chartYear})
                </button>
                <button
                  onClick={() => setRankingPeriod('mes')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                    rankingPeriod === 'mes'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Mês Atual
                </button>
              </div>

              {/* Alternância de Métrica: Pago vs Contratado */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setRankingMetric('pago')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                    rankingMetric === 'pago'
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-brand-purple/20'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Total efetivamente pago em Crediários + Consórcios"
                >
                  <Check size={12} />
                  <span>Total Pago</span>
                </button>
                <button
                  onClick={() => setRankingMetric('contratado')}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                    rankingMetric === 'contratado'
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-brand-purple/20'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Total contratado (soma de compras e cotas)"
                >
                  <DollarSign size={12} />
                  <span>Total Compras</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legenda do Gráfico de Ranking */}
          <div className="flex items-center justify-between pt-4 pb-2 text-xs font-semibold px-1">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Volume:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 inline-block" />
                <span className={A.textPrimary}>Crediário</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 inline-block" />
                <span className={A.textPrimary}>Consórcio</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              Top {top10Clientes.length}
            </span>
          </div>

          {/* Lista de Ranking */}
          <div className="space-y-3.5 mt-2">
            {top10Clientes.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Trophy size={36} className="mx-auto text-slate-300 dark:text-slate-600 opacity-40 animate-pulse" />
                <p className={`text-sm font-bold ${A.textPrimary}`}>Nenhum cliente registrado neste período</p>
                <p className={`text-xs ${A.textMuted}`}>Alterne os filtros para visualizar o ranking de outros períodos.</p>
              </div>
            ) : (
              (() => {
                const maxTotal = top10Clientes[0]?.totalGeral || 1;
                const sumTop10 = top10Clientes.reduce((acc, c) => acc + c.totalGeral, 0);

                return top10Clientes.map((item, idx) => {
                  const rank = idx + 1;
                  const pctOfMax = (item.totalGeral / maxTotal) * 100;
                  const pctOfTop10 = sumTop10 > 0 ? ((item.totalGeral / sumTop10) * 100).toFixed(1) : '0';
                  
                  const pctCrediario = item.totalGeral > 0 ? (item.totalCrediario / item.totalGeral) * 100 : 0;
                  const pctConsorcio = item.totalGeral > 0 ? (item.totalConsorcio / item.totalGeral) * 100 : 0;

                  // Estilos por posição no pódio
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <motion.div
                      key={item.clienteId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      onMouseEnter={() => setHoveredRankingIndex(idx)}
                      onMouseLeave={() => setHoveredRankingIndex(null)}
                      className={`relative p-3 rounded-2xl border transition-all duration-200 ${
                        isTop1
                          ? 'bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-transparent border-amber-500/30 shadow-md shadow-amber-500/5'
                          : isTop2
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-300/50 dark:border-slate-700/60'
                          : isTop3
                          ? 'bg-amber-900/5 dark:bg-amber-950/10 border-amber-700/20'
                          : `border-transparent hover:bg-slate-50/60 dark:hover:bg-slate-800/30`
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        {/* Posição + Avatar + Nome */}
                        <div className="flex items-center gap-2.5 min-w-[200px] max-w-[260px]">
                          {/* Posição / Badge do Pódio */}
                          <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                            {isTop1 ? (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/30" title="1º Lugar (Ouro)">
                                🥇
                              </div>
                            ) : isTop2 ? (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 flex items-center justify-center font-black text-xs shadow-sm" title="2º Lugar (Prata)">
                                🥈
                              </div>
                            ) : isTop3 ? (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 text-white flex items-center justify-center font-black text-xs shadow-sm" title="3º Lugar (Bronze)">
                                🥉
                              </div>
                            ) : (
                              <span className="font-black text-xs text-slate-400 dark:text-slate-500">
                                #{rank}
                              </span>
                            )}
                          </div>

                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                            isTop1
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-2 border-amber-400'
                              : isTop2
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600'
                              : isTop3
                              ? 'bg-amber-900/10 text-amber-700 dark:text-amber-400 border-2 border-amber-700/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {item.nome.charAt(0).toUpperCase()}
                          </div>

                          {/* Nome do Cliente e Sub-linha */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs truncate leading-tight ${A.textPrimary}`} title={item.nome}>
                              {item.nome}
                            </p>
                            <p className={`text-[9px] ${A.textMuted} mt-0.5 flex items-center gap-1`}>
                              <span>{pctOfTop10}%</span>
                              {item.celular && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <a
                                    href={getWhatsAppLink(item.celular)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-0.5"
                                    title="Abrir WhatsApp"
                                  >
                                    <Phone size={9} />
                                    <span>Whats</span>
                                  </a>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progresso Empilhada (Crediário + Consórcio) */}
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden flex p-0.5 border border-slate-200/40 dark:border-slate-700/40 relative">
                            {/* Segmento Crediário */}
                            {item.totalCrediario > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.totalCrediario / maxTotal) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-l-full relative group"
                                title={`Crediário: ${formatCurrency(item.totalCrediario)} (${pctCrediario.toFixed(0)}%)`}
                              />
                            )}
                            {/* Segmento Consórcio */}
                            {item.totalConsorcio > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.totalConsorcio / maxTotal) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full bg-gradient-to-r from-cyan-400 to-cyan-500 ${
                                  item.totalCrediario === 0 ? 'rounded-l-full' : ''
                                } rounded-r-full relative group`}
                                title={`Consórcio: ${formatCurrency(item.totalConsorcio)} (${pctConsorcio.toFixed(0)}%)`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Valor Total */}
                        <div className="text-right min-w-[100px] self-end sm:self-center">
                          <span className={`text-xs font-black tracking-tight ${
                            isTop1
                              ? 'text-amber-500 dark:text-amber-400'
                              : A.textPrimary
                          }`}>
                            {formatCurrency(item.totalGeral)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()
            )}
          </div>

          {/* Rodapé Informativo / Métricas dos Top 10 */}
          {top10Clientes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                <span>
                  Total Top 10:{' '}
                  <strong className={A.textPrimary}>
                    {formatCurrency(top10Clientes.reduce((acc, c) => acc + c.totalGeral, 0))}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 font-extrabold text-[10px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Trophy size={11} />
                <span>#1: {top10Clientes[0].nome}</span>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO GRÁFICO COMPARATIVO MENSAL (Pagos vs Não Pagos) */}
        <div className={`lg:col-span-6 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}>
          {/* Header do Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <h3 className={`font-black text-xl tracking-tight ${A.textPrimary}`}>
                Comparativo Mensal
              </h3>
              <p className={`text-xs ${A.textMuted} mt-0.5`}>
                Consórcios + Crediários (Pagos vs Em Aberto)
              </p>
            </div>

            {/* Seletor de Ano */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
              <select
                value={comparativeChartYear}
                onChange={(e) => setComparativeChartYear(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-xl border ${A.card} ${A.textPrimary} ${A.border} hover:bg-slate-50 dark:hover:bg-slate-800 outline-none cursor-pointer transition-all shadow-sm`}
              >
                <option value={2024}>Ano: 2024</option>
                <option value={2025}>Ano: 2025</option>
                <option value={2026}>Ano: 2026</option>
                <option value={2027}>Ano: 2027</option>
              </select>
            </div>
          </div>

          {/* Legenda do Gráfico Comparativo */}
          <div className="flex flex-wrap items-center justify-between pt-4 pb-2 text-xs font-semibold px-1 gap-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 inline-block" />
                <span className={A.textPrimary}>Pagos (Consórcio + Crediário)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 inline-block" />
                <span className={A.textPrimary}>Não Pagos / Em Aberto</span>
              </div>
            </div>
          </div>

          {/* Visualização de Colunas Comparativas (Estilo Modelo de Referência) */}
          <div className="flex-1 relative flex items-end justify-center min-h-[300px] w-full mt-4">
            <div className="w-full h-full relative flex flex-col justify-between">
              <div className="flex-1 relative">
                <svg
                  className="w-full h-full min-h-[280px]"
                  viewBox="0 0 720 280"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="paidColGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                    <linearGradient id="unpaidColGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>
                  </defs>

                  {/* Linhas de Grade discretas no fundo */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y = 30 + (220 / 3) * i;
                    return (
                      <line
                        key={`comp-grid-${i}`}
                        x1="10"
                        y1={y}
                        x2="710"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeWidth="0.4"
                        strokeDasharray="4 4"
                        className="opacity-30"
                      />
                    );
                  })}

                  {/* Desenho das Duas Colunas Comparativas por Mês */}
                  {monthlyComparativeData.map((item, idx) => {
                    const monthWidth = 700 / 12;
                    const groupX = 10 + idx * monthWidth;
                    const colWidth = (monthWidth - 14) / 2;

                    const hPaid = maxComparativeVal > 0 ? (item.totalPagos / maxComparativeVal) * 220 : 0;
                    const hUnpaid = maxComparativeVal > 0 ? (item.totalNaoPagos / maxComparativeVal) * 220 : 0;

                    const yPaid = 30 + 220 - hPaid;
                    const yUnpaid = 30 + 220 - hUnpaid;

                    const xPaid = groupX + 3;
                    const xUnpaid = xPaid + colWidth + 4;

                    const labelPaid = formatCompactK(item.totalPagos);
                    const labelUnpaid = formatCompactK(item.totalNaoPagos);

                    return (
                      <g key={`comp-col-group-${idx}`} className="transition-all duration-300">
                        {/* Coluna 1: Total Pagos */}
                        {item.totalPagos > 0 && (
                          <>
                            <rect
                              x={xPaid}
                              y={yPaid}
                              width={colWidth}
                              height={hPaid}
                              fill="url(#paidColGrad)"
                              rx="5"
                              ry="5"
                              className="cursor-pointer hover:opacity-90 transition-opacity"
                              onMouseEnter={() => setHoveredComparativeBar({ monthIdx: idx, category: 'pagos' })}
                              onMouseLeave={() => setHoveredComparativeBar(null)}
                            />
                            {/* Rótulo de Valor no Topo da Coluna (Estilo Modelo "38K", "52K") */}
                            <text
                              x={xPaid + colWidth / 2}
                              y={Math.max(20, yPaid - 6)}
                              textAnchor="middle"
                              className="fill-slate-700 dark:fill-slate-200 text-[9px] font-black"
                            >
                              {labelPaid}
                            </text>
                          </>
                        )}

                        {/* Coluna 2: Total Não Pagos */}
                        {item.totalNaoPagos > 0 && (
                          <>
                            <rect
                              x={xUnpaid}
                              y={yUnpaid}
                              width={colWidth}
                              height={hUnpaid}
                              fill="url(#unpaidColGrad)"
                              rx="5"
                              ry="5"
                              className="cursor-pointer hover:opacity-90 transition-opacity"
                              onMouseEnter={() => setHoveredComparativeBar({ monthIdx: idx, category: 'naoPagos' })}
                              onMouseLeave={() => setHoveredComparativeBar(null)}
                            />
                            {/* Rótulo de Valor no Topo da Coluna */}
                            <text
                              x={xUnpaid + colWidth / 2}
                              y={Math.max(20, yUnpaid - 6)}
                              textAnchor="middle"
                              className="fill-slate-700 dark:fill-slate-200 text-[9px] font-black"
                            >
                              {labelUnpaid}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Rótulos do Eixo X (Mêses) */}
              <div className="h-6 flex justify-between items-center text-[10px] font-extrabold text-slate-400 pl-[10px] pr-[10px] pt-1">
                {monthlyComparativeData.map((item, idx) => (
                  <div
                    key={`comp-x-label-${idx}`}
                    style={{ width: `${700 / 12}px` }}
                    className="text-center"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip Customizado do Gráfico Comparativo */}
            {hoveredComparativeBar !== null && monthlyComparativeData[hoveredComparativeBar.monthIdx] && (() => {
              const item = monthlyComparativeData[hoveredComparativeBar.monthIdx];
              
              const totalMonth = item.totalPagos + item.totalNaoPagos;
              const pctPaid = totalMonth > 0 ? ((item.totalPagos / totalMonth) * 100).toFixed(0) : '0';

              return (
                <div
                  className="absolute z-20 bg-slate-900/95 text-white text-xs p-3.5 rounded-2xl shadow-xl border border-slate-700 pointer-events-none transition-all duration-150 backdrop-blur-sm"
                  style={{
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <p className="font-bold border-b border-slate-700 pb-1 mb-2 text-center text-[11px] uppercase tracking-wider text-slate-300">
                    Mês: {item.name} / {comparativeChartYear}
                  </p>
                  <div className="space-y-1.5 min-w-[210px]">
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                        Total Pagos:
                      </span>
                      <span className="font-extrabold text-slate-100">
                        {formatCurrency(item.totalPagos)}
                      </span>
                    </div>
                    <div className="pl-4 text-[10px] text-slate-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Consórcio Pago:</span>
                        <span className="font-semibold text-slate-300">{formatCurrency(item.pagosConsorcio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crediário Pago:</span>
                        <span className="font-semibold text-slate-300">{formatCurrency(item.pagosCrediario)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 my-1" />

                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                        Não Pagos (Em Aberto):
                      </span>
                      <span className="font-extrabold text-slate-100">
                        {formatCurrency(item.totalNaoPagos)}
                      </span>
                    </div>
                    <div className="pl-4 text-[10px] text-slate-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Consórcio Pendente:</span>
                        <span className="font-semibold text-slate-300">{formatCurrency(item.naoPagosConsorcio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crediário em Aberto:</span>
                        <span className="font-semibold text-slate-300">{formatCurrency(item.naoPagosCrediario)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4 border-t border-slate-700/60 pt-1.5 mt-1.5 font-bold text-[12px] text-emerald-400">
                      <span className="text-white">Taxa de Quitação:</span>
                      <span>{pctPaid}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Rodapé Informativo / Resumo Anual */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
              <span>
                Total Pago no Ano:{' '}
                <strong className="text-purple-600 dark:text-purple-400 font-extrabold">
                  {formatCurrency(monthlyComparativeData.reduce((acc, m) => acc + m.totalPagos, 0))}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                Em Aberto:{' '}
                <strong className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                  {formatCurrency(monthlyComparativeData.reduce((acc, m) => acc + m.totalNaoPagos, 0))}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              <BarChart3 size={11} />
              <span>Ano {comparativeChartYear}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardTab;
