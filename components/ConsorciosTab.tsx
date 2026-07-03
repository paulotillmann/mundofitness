import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  FolderHeart,
  Briefcase,
  Calendar,
  CircleCheck,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';

interface Grupo {
  id: string;
  bubble_id?: string;
  periodo_text: string;
  valor_number?: number;
  valorcota_number?: number;
  mesinicial_date?: string;
  mesfinal_date?: string;
  encerrado_boolean: boolean;
}

interface Consorcio {
  id: string;
  grupo_id: string;
  cliente_id: string;
  bubble_id?: string;
  cotano_number?: number;
  dataretirada_date?: string;
  vencimentodia_number?: number;
  mesretirada_text?: string;
  clientes?: {
    nome: string;
    outrasinformacoes?: string;
  };
  grupos?: {
    periodo_text: string;
    valorcota_number?: number;
    encerrado_boolean: boolean;
  };
}

interface Parcela {
  id: string;
  consorcio_id: string;
  grupo_id: string;
  grupo_text: string;
  mesano_text: string;
  valor_parcela: number;
  data_vencimento?: string;
  valorpago_number: number | null;
  datapagamento_date: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ConsorciosTabProps {
  A: any;
  gruposList: Grupo[];
  consorciosList: Consorcio[];
  refreshConsorcios: () => Promise<void>;
}

const ConsorciosTab: React.FC<ConsorciosTabProps> = ({
  A,
  gruposList,
  consorciosList,
  refreshConsorcios
}) => {
  const isDark = A.bgLight === 'bg-slate-900';
  // Estado de Seleção
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  const [selectedConsorcioId, setSelectedConsorcioId] = useState<string | null>(null);
  const [selectedPagamentos, setSelectedPagamentos] = useState<Parcela[]>([]);
  const [selectedClienteNome, setSelectedClienteNome] = useState(''); // cs no código original

  // Buscas locais
  const [searchGrupo, setSearchGrupo] = useState('');
  const [searchCota, setSearchCota] = useState('');

  // Estados do Filtro de Mês/Ano
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [isFilterActive, setIsFilterActive] = useState<boolean>(true);
  const [showFilterCalendarPopover, setShowFilterCalendarPopover] = useState<boolean>(false);

  // Estados dos Modais de Parcelas
  const [showGerarParcelasModal, setShowGerarParcelasModal] = useState<boolean>(false);
  const [newParcelasQtde, setNewParcelasQtde] = useState<number>(10);
  const [newParcelasValor, setNewParcelasValor] = useState<string>('');
  const [newParcelasMesInicial, setNewParcelasMesInicial] = useState<string>('');
  const [isGeneratingParcelas, setIsGeneratingParcelas] = useState<boolean>(false);

  const [showBaixarParcelaModal, setShowBaixarParcelaModal] = useState<boolean>(false);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [valorpagoInput, setValorpagoInput] = useState('');
  const [datapagamentoInput, setDatapagamentoInput] = useState('');
  const [isUpdatingParcela, setIsUpdatingParcela] = useState<boolean>(false);

  const [showDeleteParcelaConfirmModal, setShowDeleteParcelaConfirmModal] = useState<boolean>(false);
  const [parcelaToDelete, setParcelaToDelete] = useState<Parcela | null>(null);

  // Filtros de visualização dos grupos (cgf no Dashboard original)
  const [gruposFilterType, setGruposFilterType] = useState<'todos' | 'ativos' | 'encerrados'>('ativos');

  // Buscar pagamentos do consórcio selecionado
  const fetchPagamentos = async (consorcioId: string) => {
    try {
      const { data, error } = await supabase
        .from('consorcios_pagamentos')
        .select('*')
        .eq('consorcio_id', consorcioId);
      if (error) throw error;
      setSelectedPagamentos(data || []);
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
    }
  };

  useEffect(() => {
    if (!selectedConsorcioId) {
      setSelectedPagamentos([]);
      return;
    }
    fetchPagamentos(selectedConsorcioId);
  }, [selectedConsorcioId]);

  // Limpar seleção de consórcio quando mudar o grupo selecionado
  useEffect(() => {
    setSelectedConsorcioId(null);
    setSelectedClienteNome('');
  }, [selectedGrupoId]);

  // Formatar Moeda
  const formatCurrencyPTBR = (val: string | number) => {
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    const num = parseFloat(clean) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const parseMesAnoText = (text: string) => {
    if (!text) return null;
    const parts = text.split('/');
    if (parts.length !== 2) return null;
    const [mStr, yStr] = parts;
    const monthIdx = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].indexOf(mStr);
    const yearVal = 2000 + parseInt(yStr);
    if (monthIdx === -1 || isNaN(yearVal)) return null;
    return { month: monthIdx, year: yearVal };
  };

  const formatRetiradaDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Não retirado';
    try {
      const d = new Date(dateStr);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Não retirado';
    }
  };

  const formatGroupDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '-';
    }
  };

  // Gerar parcelas
  const handleGerarParcelasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsorcioId || !newParcelasValor) return;
    setIsGeneratingParcelas(true);
    try {
      const valParcela = parseFloat(newParcelasValor.replace(/\D/g, '')) / 100;
      const installments = [];
      const [initYear, initMonth] = newParcelasMesInicial.split('-').map(Number);

      const consorcio = consorciosList.find((c) => c.id === selectedConsorcioId);
      const vencimentoDia = consorcio?.vencimentodia_number || 10;
      const grupo = gruposList.find((g) => g.id === selectedGrupoId);

      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      for (let idx = 0; idx < newParcelasQtde; idx++) {
        const currentMonthIndex = (initMonth - 1 + idx) % 12;
        const yearOffset = Math.floor((initMonth - 1 + idx) / 12);
        const currentYear = initYear + yearOffset;

        const monthText = monthNames[currentMonthIndex];
        const yearText = String(currentYear).substring(2);
        const mesanoText = `${monthText}/${yearText}`;

        const dueDate = new Date(currentYear, currentMonthIndex, vencimentoDia, 12, 0, 0);

        installments.push({
          consorcio_id: selectedConsorcioId,
          grupo_id: selectedGrupoId,
          grupo_text: grupo?.periodo_text || '',
          mesano_text: mesanoText,
          valor_parcela: valParcela,
          data_vencimento: dueDate.toISOString(),
          valorpago_number: null,
          datapagamento_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      const { error } = await supabase.from('consorcios_pagamentos').insert(installments);
      if (error) throw error;

      await fetchPagamentos(selectedConsorcioId);
      setShowGerarParcelasModal(false);
    } catch (err: any) {
      console.error('Erro ao gerar parcelas:', err);
      alert('Erro ao gerar parcelas: ' + err.message);
    } finally {
      setIsGeneratingParcelas(false);
    }
  };

  // Baixar parcela
  const handleBaixarParcelasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcela || !selectedConsorcioId) return;
    const valPago = parseFloat(valorpagoInput.replace(/\D/g, '')) / 100;
    if (isNaN(valPago) || valPago < 0) {
      alert('O valor pago deve ser igual ou maior que zero.');
      return;
    }
    setIsUpdatingParcela(true);
    try {
      const datePagamento = datapagamentoInput ? `${datapagamentoInput}T12:00:00Z` : new Date().toISOString();
      const { error } = await supabase
        .from('consorcios_pagamentos')
        .update({
          valorpago_number: valPago,
          datapagamento_date: datePagamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedParcela.id);
      if (error) throw error;

      await fetchPagamentos(selectedConsorcioId);
      setShowBaixarParcelaModal(false);
    } catch (err: any) {
      console.error('Erro ao baixar parcela:', err);
      alert('Erro ao baixar parcela: ' + err.message);
    } finally {
      setIsUpdatingParcela(false);
    }
  };

  // Estornar pagamento
  const handleEstornarPagamento = async () => {
    if (!selectedParcela || !selectedConsorcioId) return;
    setIsUpdatingParcela(true);
    try {
      const { error } = await supabase
        .from('consorcios_pagamentos')
        .update({
          valorpago_number: null,
          datapagamento_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedParcela.id);
      if (error) throw error;

      await fetchPagamentos(selectedConsorcioId);
      setShowBaixarParcelaModal(false);
    } catch (err: any) {
      console.error('Erro ao estornar pagamento:', err);
      alert('Erro ao estornar pagamento: ' + err.message);
    } finally {
      setIsUpdatingParcela(false);
    }
  };

  // Excluir parcela
  const executeDeleteParcela = async () => {
    if (!parcelaToDelete || !selectedConsorcioId) return;
    try {
      const { error } = await supabase
        .from('consorcios_pagamentos')
        .delete()
        .eq('id', parcelaToDelete.id);
      if (error) throw error;

      await fetchPagamentos(selectedConsorcioId);
      setShowDeleteParcelaConfirmModal(false);
      setParcelaToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir parcela:', err);
      alert('Erro ao excluir parcela: ' + err.message);
    }
  };

  // Listagem de Grupos Ativos / Todos (Coluna 1)
  const filteredGruposList = useMemo(() => {
    const list = gruposList.filter((g) =>
      gruposFilterType === 'todos'
        ? true
        : gruposFilterType === 'ativos'
          ? !g.encerrado_boolean
          : g.encerrado_boolean
    );

    const s = searchGrupo.toLowerCase().trim();
    return s ? list.filter((g) => (g.periodo_text || '').toLowerCase().includes(s)) : list;
  }, [gruposList, gruposFilterType, searchGrupo]);

  // Garantir seleção de grupo inicial
  useEffect(() => {
    if (filteredGruposList.length > 0) {
      if (!selectedGrupoId || !filteredGruposList.some((g) => g.id === selectedGrupoId)) {
        setSelectedGrupoId(filteredGruposList[0].id);
      }
    } else {
      setSelectedGrupoId(null);
    }
  }, [filteredGruposList, selectedGrupoId]);

  // Grupo Selecionado
  const selectedGrupoObj = useMemo(() => {
    return gruposList.find((g) => g.id === selectedGrupoId) || null;
  }, [gruposList, selectedGrupoId]);

  // Clientes do Grupo Selecionado (Coluna 2)
  const filteredConsorciosList = useMemo(() => {
    if (!selectedGrupoId) return [];
    const list = consorciosList.filter((c) => c.grupo_id === selectedGrupoId);

    const s = searchCota.toLowerCase().trim();
    const matches = s
      ? list.filter((c) => {
        const nomeCliente = (c.clientes?.nome || '').toLowerCase();
        const cotaNo = c.cotano_number ? String(c.cotano_number) : '';
        const vencimento = c.vencimentodia_number ? String(c.vencimentodia_number) : '';
        return nomeCliente.includes(s) || cotaNo.includes(s) || vencimento.includes(s);
      })
      : list;

    // Ordenar por nome de cliente
    return [...matches].sort((a, b) => {
      const nameA = (a.clientes?.nome || '').toLowerCase();
      const nameB = (b.clientes?.nome || '').toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });
  }, [consorciosList, selectedGrupoId, searchCota]);

  // FILTRAGEM REAL DE PAGAMENTOS E TOTAIS (O filtro de meses não deve filtrar as parcelas de clientes)
  const payments = useMemo(() => {
    return selectedPagamentos;
  }, [selectedPagamentos]);

  // Parcelas Ordenadas pelo Vencimento para Exibição
  const sortedPagamentos = useMemo(() => {
    return [...payments].sort((a, b) => {
      const dateA = a.data_vencimento ? new Date(a.data_vencimento) : (a.datapagamento_date ? new Date(a.datapagamento_date) : new Date(0));
      const dateB = b.data_vencimento ? new Date(b.data_vencimento) : (b.datapagamento_date ? new Date(b.datapagamento_date) : new Date(0));
      return dateA.getTime() - dateB.getTime();
    });
  }, [payments]);

  // Totais Financeiros
  const totals = useMemo(() => {
    const totalPago = payments
      .filter((item) => !!item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valorpago_number !== null ? curr.valorpago_number : curr.valor_parcela || 0), 0);

    const totalAPagar = payments
      .filter((item) => !item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valor_parcela || 0), 0);

    const saldo = totalPago - totalAPagar;
    const totalPagoCount = payments.filter((item) => !!item.datapagamento_date).length;
    const totalAPagarCount = payments.filter((item) => !item.datapagamento_date).length;

    return {
      totalPago,
      totalAPagar,
      saldo,
      totalPagoCount,
      totalAPagarCount
    };
  }, [payments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-left"
    >
      {/* Cabeçalho com Filtro de Mês/Ano */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 text-left w-full">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Consórcios
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Visualize e gerencie as cotas de consórcios dos clientes
          </p>
        </div>

        {/* Filtro de Mês e Ano */}
        <div className="relative inline-block">
          <button
            onClick={() => setShowFilterCalendarPopover(!showFilterCalendarPopover)}
            className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold rounded-full border ${A.border} ${A.card} ${A.bgHover} ${A.textPrimary} transition-all shadow-sm cursor-pointer`}
          >
            <Calendar size={14} className="text-[#64748B] flex-shrink-0" />
            <span className={A.textPrimary}>
              {isFilterActive ? (
                <>
                  <span className="text-brand-purple font-bold">
                    {`01 - ${new Date(filterYear, filterMonth + 1, 0).getDate()} `}
                  </span>
                  {`${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][filterMonth]} ${filterYear}`}
                </>
              ) : (
                'Todos os Períodos'
              )}
            </span>
            <svg
              className={`w-4 h-4 ml-1 text-slate-400 transition-transform ${showFilterCalendarPopover ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilterCalendarPopover && (
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowFilterCalendarPopover(false)} />
          )}

          {showFilterCalendarPopover && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute right-0 mt-2 w-72 p-4 rounded-[20px] border ${A.border} ${A.card} shadow-xl z-50 text-left space-y-4`}
            >
              {/* Seleção de Ano */}
              <div className="flex items-center justify-between border-b border-dashed pb-2 border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setFilterYear((y) => y - 1)}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={`font-bold text-sm ${A.textPrimary}`}>{filterYear}</span>
                <button
                  type="button"
                  onClick={() => setFilterYear((y) => y + 1)}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Grade de Meses */}
              <div className="grid grid-cols-3 gap-1.5">
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mName, mIdx) => {
                  const isSelected = isFilterActive && filterMonth === mIdx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setFilterMonth(mIdx);
                        setIsFilterActive(true);
                        setShowFilterCalendarPopover(false);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isSelected
                        ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                        : `border border-transparent ${A.bgHover} ${A.textPrimary}`
                        }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>

              {/* Opção Limpar Filtro */}
              <button
                type="button"
                onClick={() => {
                  setIsFilterActive(false);
                  setShowFilterCalendarPopover(false);
                }}
                className={`w-full py-2 text-center text-xs font-bold rounded-xl border border-dashed ${A.border} text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all cursor-pointer`}
              >
                Todos os Períodos
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Grid Principal de 3 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA 1: Grupos (tamanho 3) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-base whitespace-nowrap ${A.textPrimary}`}>
              {gruposFilterType === 'todos' ? 'Todos os Grupos' : gruposFilterType === 'ativos' ? 'Grupos Ativos' : 'Grupos Encerrados'}
            </h2>
            <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${A.border} ${A.card} shadow-sm`}>
              <button
                onClick={() => setGruposFilterType('ativos')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${gruposFilterType === 'ativos' ? 'bg-[#7C3AED] text-white shadow-sm' : `${A.textMuted} hover:text-[#0F172A]`
                  }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setGruposFilterType('todos')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${gruposFilterType === 'todos' ? 'bg-[#7C3AED] text-white shadow-sm' : `${A.textMuted} hover:text-[#0F172A]`
                  }`}
              >
                Todos
              </button>
            </div>
          </div>

          <div className={`border ${A.card} rounded-[24px] p-4 space-y-3 shadow-sm`}>
            {/* Input de Busca de Grupo */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar grupo..."
                value={searchGrupo}
                onChange={(e) => setSearchGrupo(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-1 focus:ring-brand-purple focus:border-transparent transition-all`}
              />
            </div>

            {/* Listagem de Grupos */}
            <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredGruposList.length === 0 ? (
                <div className={`p-6 text-center text-xs ${A.textMuted}`}>Nenhum grupo encontrado</div>
              ) : (
                filteredGruposList.map((g) => {
                  const isSelected = selectedGrupoId === g.id;
                  const valorCotaF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(g.valorcota_number || 0);
                  const valorMensalF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(g.valor_number || 0);

                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGrupoId(g.id)}
                      className={`p-5 rounded-[24px] border text-left cursor-pointer transition-all duration-200 ${isSelected
                        ? 'border-brand-purple bg-brand-purple/5 shadow-sm'
                        : `border-slate-200 dark:border-slate-700 ${A.bgHover} hover:border-slate-300 dark:hover:border-slate-600`
                        }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-extrabold text-sm tracking-wide uppercase ${A.textPrimary}`}>
                          {g.periodo_text ? g.periodo_text.toUpperCase() : ''}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-[6px] text-xs font-bold ${g.encerrado_boolean
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          : 'bg-emerald-500/15 text-[#047857] dark:bg-emerald-500/20 dark:text-[#047857]'
                          }`}>
                          {g.encerrado_boolean ? 'Encerrado' : 'Ativo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        {/* Coluna esquerda */}
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Valor da Cota</p>
                          <p className="font-extrabold text-[#7C3AED] dark:text-[#a855f7] text-[15px]">{valorCotaF}</p>
                        </div>

                        {/* Coluna direita */}
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Valor Mensal</p>
                          <p className={`font-extrabold text-[15px] ${A.textPrimary}`}>{valorMensalF}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 2: Cotas / Clientes do Grupo (tamanho 5) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-base ${A.textPrimary} flex items-center flex-wrap gap-1.5`}>
              {selectedGrupoObj ? (
                <>
                  Cotas do Grupo:{' '}
                  <span
                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', fontSize: '12px' }}
                    className="px-2 py-0.5 rounded-full font-bold inline-block border border-[#7C3AED]/20"
                  >
                    {selectedGrupoObj.periodo_text}
                  </span>
                </>
              ) : (
                'Cotas do Grupo'
              )}
            </h2>
            <span className="text-xs font-bold bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#7c3aed] px-2.5 py-1 rounded-full border border-[#7c3aed]/20 dark:border-[#7c3aed]/20">
              {filteredConsorciosList.length} clientes
            </span>
          </div>

          <div className={`border ${A.card} rounded-[24px] p-4 space-y-3 shadow-sm`}>
            {/* Input de Busca de Cota */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar cota ou nome..."
                value={searchCota}
                onChange={(e) => setSearchCota(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-1 focus:ring-brand-purple focus:border-transparent transition-all`}
              />
            </div>

            {/* Tabela de Cotas */}
            <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                    <th className="p-3 font-semibold uppercase tracking-wider text-xs text-center w-20">Nº Cota</th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedGrupoId ? (
                    <tr>
                      <td colSpan={2} className="p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                            <Briefcase size={28} />
                          </div>
                          <span className="font-bold text-base mt-2 text-slate-800 dark:text-slate-200">
                            Selecione um grupo
                          </span>
                          <span className="text-xs opacity-75">
                            Escolha um dos grupos ativos na coluna ao lado para visualizar os clientes.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredConsorciosList.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                            <Briefcase size={24} />
                          </div>
                          <span className="font-bold text-xs mt-2 text-slate-800 dark:text-slate-200">
                            Nenhum cliente cadastrado neste grupo
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredConsorciosList.map((c) => {
                      const isSelected = selectedConsorcioId === c.id;
                      const clientName = c.clientes?.nome || 'Sem Cliente';

                      return (
                        <tr
                          key={c.id}
                          onClick={() => {
                            if (selectedConsorcioId !== c.id) {
                              setSelectedConsorcioId(c.id);
                              setSelectedPagamentos([]);
                              setSelectedClienteNome(clientName);
                            }
                          }}
                          className={`border-b ${A.border} ${A.tableRowHover} cursor-pointer transition-colors ${isSelected ? 'bg-brand-purple/5' : ''
                            }`}
                        >
                          <td className={`p-3 text-sm font-bold text-center align-middle ${A.textPrimary}`}>
                            {c.cotano_number ? String(c.cotano_number).padStart(2, '0') : '-'}
                          </td>
                          <td className={`p-3 ${A.textPrimary} align-middle`}>
                            <div className="flex items-center gap-2 font-bold text-sm">
                              <Briefcase className="text-brand-purple flex-shrink-0" size={16} />
                              {clientName}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1 pl-[20px]">
                              {c.clientes?.outrasinformacoes && (
                                <div className="mb-0.5">
                                  <span className="text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                                    {c.clientes.outrasinformacoes}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#64748B]">
                                <span>Retirada: <strong className="text-brand-purple font-bold">{formatRetiradaDate(c.dataretirada_date)}</strong></span>
                                <span className="text-[#dfdfdf]">•</span>
                                <span>Venc: <strong className="text-brand-purple font-bold">{c.vencimentodia_number ? `Dia ${c.vencimentodia_number}` : '-'}</strong></span>
                                {c.mesretirada_text && (
                                  <>
                                    <span className="text-[#dfdfdf]">•</span>
                                    <span>Mês Ret.: <strong className="text-brand-purple font-bold">{c.mesretirada_text}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA 3: Histórico de Pagamentos e Totais (tamanho 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between gap-1">
            <div className="text-left">
              <h2 className={`font-bold text-sm ${A.textPrimary} flex items-center flex-wrap gap-1.5`}>
                {selectedClienteNome ? (
                  <>
                    Histórico:{' '}
                    <span
                      style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', fontSize: '12px' }}
                      className="px-2 py-0.5 rounded-full font-bold inline-block border border-[#7C3AED]/20"
                    >
                      {selectedClienteNome}
                    </span>
                  </>
                ) : (
                  'Histórico de Pagamentos'
                )}
              </h2>
              <p className={`text-[10px] ${A.textMuted}`}>
                {selectedClienteNome ? 'Pagamentos da cota selecionada.' : 'Selecione uma cota.'}
              </p>
            </div>
            {selectedConsorcioId && (
              <button
                onClick={() => {
                  const activeGroup = gruposList.find((g) => g.id === selectedGrupoId);
                  const valMensal = activeGroup?.valor_number || 0;
                  setNewParcelasValor(formatCurrencyPTBR(valMensal * 100));
                  setNewParcelasQtde(10);
                  const d = new Date();
                  setNewParcelasMesInicial(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                  setShowGerarParcelasModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-lg transition-all shadow-sm shadow-brand-purple/10 flex-shrink-0 cursor-pointer"
              >
                <Calendar size={14} />
                Gerar Parcelas
              </button>
            )}
          </div>

          {/* Tabela de Parcelas */}
          <div className={`border ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-360px)] min-h-[180px]">
              {!selectedConsorcioId ? (
                <div className={`p-8 text-center text-sm ${A.textMuted}`}>
                  Selecione uma cota para ver os pagamentos.
                </div>
              ) : sortedPagamentos.length === 0 ? (
                <div className={`p-8 text-center text-sm ${A.textMuted}`}>
                  Nenhuma parcela registrada. Clique em 'Gerar Parcelas' acima.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px]">Ref</th>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px]">Vencimento</th>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px]">A Pagar</th>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px]">Pago</th>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px]">Pago Em</th>
                      <th className="p-2 font-semibold uppercase tracking-wider text-[11px] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPagamentos.map((item, idx) => {
                      const isPaid = !!item.datapagamento_date;
                      const isOverdue =
                        !isPaid &&
                        item.data_vencimento &&
                        new Date(item.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0);

                      const valParcelaFormatted = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.valor_parcela || 0);

                      const valPagoFormatted =
                        item.valorpago_number !== null
                          ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.valorpago_number || 0)
                          : '-';

                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            setSelectedParcela(item);
                            setValorpagoInput(
                              item.valorpago_number !== null
                                ? formatCurrencyPTBR(item.valorpago_number * 100)
                                : formatCurrencyPTBR((item.valor_parcela || 0) * 100)
                            );
                            setDatapagamentoInput(
                              item.datapagamento_date
                                ? item.datapagamento_date.substring(0, 10)
                                : new Date().toISOString().substring(0, 10)
                            );
                            setShowBaixarParcelaModal(true);
                          }}
                          className={`border-b ${A.border} ${A.tableRowHover} cursor-pointer text-xs transition-colors`}
                        >
                          <td className={`p-2 font-bold ${A.textPrimary} flex items-center gap-1`}>
                            {item.mesano_text || '-'}
                            {isOverdue && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" title="Atrasado" />
                            )}
                          </td>
                          <td className={`p-2 ${A.textMuted}`}>{formatGroupDate(item.data_vencimento)}</td>
                          <td className="p-2 font-bold text-[#7c3aed]">{valParcelaFormatted}</td>
                          <td className={`p-2 ${isPaid ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-slate-400 dark:text-slate-500'}`}>
                            {valPagoFormatted}
                          </td>
                          <td className={`p-2 ${A.textMuted}`}>{formatGroupDate(item.datapagamento_date)}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setParcelaToDelete(item);
                                setShowDeleteParcelaConfirmModal(true);
                              }}
                              className={`p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-rose-600 transition-all cursor-pointer`}
                              title="Excluir Parcela"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Cards de Totais Financeiros */}
          {selectedConsorcioId && (
            <div className="grid grid-cols-2 gap-2 mt-4 text-left">
              {/* Card 1: A Pagar */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className={`relative overflow-hidden p-3 border rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 ${A.card}`}
              >
                <div className="flex justify-between items-start z-10 gap-1">
                  <span className="text-[11px] xl:text-xs tracking-wider font-bold text-[#64748B] uppercase truncate">
                    A Pagar
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-orange-950/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                    <Calendar size={12} />
                  </div>
                </div>
                <div className="my-1.5 z-10">
                  <span className={`text-base sm:text-lg xl:text-xl font-bold tracking-tight ${A.textPrimary} block truncate`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.totalAPagar)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 z-10 truncate">
                  <Calendar size={12} />
                  <span className="truncate">
                    {totals.totalAPagarCount} aberta{totals.totalAPagarCount === 1 ? '' : 's'}
                  </span>
                </div>
                <Calendar size={64} className="absolute -right-2 -bottom-2 text-orange-500/5 pointer-events-none z-0" />
              </motion.div>

              {/* Card 2: Pagos */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className={`relative overflow-hidden p-3 border rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 ${A.card}`}
              >
                <div className="flex justify-between items-start z-10 gap-1">
                  <span className="text-[11px] xl:text-xs tracking-wider font-bold text-[#64748B] uppercase truncate">
                    Pagos
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-950/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <CircleCheck size={12} />
                  </div>
                </div>
                <div className="my-1.5 z-10">
                  <span className={`text-base sm:text-lg xl:text-xl font-bold tracking-tight ${A.textPrimary} block truncate`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.totalPago)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 z-10 truncate">
                  <CircleCheck size={12} />
                  <span className="truncate">
                    {totals.totalPagoCount} paga{totals.totalPagoCount === 1 ? '' : 's'}
                  </span>
                </div>
                <CircleCheck size={64} className="absolute -right-2 -bottom-2 text-emerald-500/5 pointer-events-none z-0" />
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: GERAR PARCELAS */}
      {showGerarParcelasModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${A.textPrimary}`}>Gerar Parcelas</h3>
              <button
                type="button"
                onClick={() => setShowGerarParcelasModal(false)}
                className={`p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleGerarParcelasSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Valor da Parcela
                </label>
                <input
                  type="text"
                  required
                  value={newParcelasValor}
                  onChange={(e) => setNewParcelasValor(formatCurrencyPTBR(e.target.value))}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={newParcelasQtde}
                    onChange={(e) => setNewParcelasQtde(parseInt(e.target.value) || 10)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mês de Início
                  </label>
                  <input
                    type="month"
                    required
                    value={newParcelasMesInicial}
                    onChange={(e) => setNewParcelasMesInicial(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGerarParcelasModal(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingParcelas}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingParcelas ? 'Gerando...' : 'Gerar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: BAIXAR PARCELA */}
      {showBaixarParcelaModal && selectedParcela && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${A.textPrimary}`}>
                {selectedParcela.datapagamento_date ? 'Estornar ou Editar' : 'Baixar Parcela'} ({selectedParcela.mesano_text})
              </h3>
              <button
                type="button"
                onClick={() => setShowBaixarParcelaModal(false)}
                className={`p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleBaixarParcelasSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Valor Pago
                </label>
                <input
                  type="text"
                  required
                  value={valorpagoInput}
                  onChange={(e) => setValorpagoInput(formatCurrencyPTBR(e.target.value))}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Data de Pagamento
                </label>
                <input
                  type="date"
                  required
                  value={datapagamentoInput}
                  onChange={(e) => setDatapagamentoInput(e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                />
              </div>

              <div className="flex justify-between items-center pt-2 gap-2">
                {selectedParcela.datapagamento_date ? (
                  <button
                    type="button"
                    onClick={handleEstornarPagamento}
                    disabled={isUpdatingParcela}
                    className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Estornar
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBaixarParcelaModal(false)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingParcela}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingParcela ? 'Gravando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: EXCLUIR PARCELA */}
      {showDeleteParcelaConfirmModal && parcelaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-sm p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-center`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className={`text-lg font-bold ${A.textPrimary} mb-2`}>Excluir Parcela?</h3>
            <p className={`text-xs ${A.textMuted} mb-6`}>
              Tem certeza que deseja excluir permanentemente a parcela de referência{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{parcelaToDelete.mesano_text}</span>?
              Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteParcelaConfirmModal(false)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteParcela}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ConsorciosTab;
