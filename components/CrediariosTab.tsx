import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  CreditCard,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ArrowUpRight,
  Search,
  DollarSign,
  TrendingUp,
  Receipt,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Trash2
} from 'lucide-react';



interface Crediario {
  id: string;
  bubble_id?: string;
  crediario_cliente_id?: string;
  crediarios_clientes?: {
    cliente_id: string;
    clientes?: {
      nome: string;
      celular?: string;
      outrasinformacoes?: string;
    } | null;
  } | null;
  data_pagamento?: string;
  data_vencimento?: string;
  forma_pagamento?: string;
  historico_id?: string;
  historico?: {
    descricao: string;
  } | null;
  parcelas?: string;
  tipo_pagamento?: string;
  valor_pagar?: number;
  valor_pago?: number;
  valor_taxa_cartao?: number;
  created_at?: string;
}

interface Historico {
  id: string;
  bubble_id?: string | null;
  descricao: string;
  created_at?: string;
  updated_at?: string;
}

const formatCurrencyInput = (value: string | number) => {
  const strValue = typeof value === 'number' ? (value * 100).toFixed(0) : String(value);
  const cleanValue = strValue.replace(/\D/g, '');
  if (!cleanValue) return 'R$ 0,00';
  const numberValue = Number(cleanValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numberValue);
};

const parseCurrencyInputToNumber = (formattedValue: string) => {
  const clean = formattedValue.replace(/\D/g, '');
  return (Number(clean) || 0) / 100;
};

interface CrediariosTabProps {
  A: any;
  globalSearch: string;
}

const CrediariosTab: React.FC<CrediariosTabProps> = ({ A, globalSearch }) => {
  const isDarkMode = A.textPrimary === 'text-slate-100';
  const [crediarios, setCrediarios] = useState<Crediario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtro de Período Geral (Mock-up)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(6); // Default para Julho (como no mockup)
  const [selectedYear, setSelectedYear] = useState<number | null>(2026); // Default para 2026
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState<boolean>(false);

  // Cliente selecionado para a Coluna 2
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  // Filtros da Coluna 1 (Clientes)
  const [clientSearch, setClientSearch] = useState<string>('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'Todos' | 'Com Pendências' | 'Quitados'>('Todos');

  // Filtros da Coluna 2 (Lançamentos)
  const [launchSearch, setLaunchSearch] = useState<string>('');
  const [launchStatusFilter, setLaunchStatusFilter] = useState<'Todos' | 'Pago' | 'Pendente'>('Todos');

  // Carregar dados do Supabase
  const fetchCrediarios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let allData: Crediario[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const to = from + step - 1;
        const { data, error } = await supabase
          .from('crediarios')
          .select(`
            *,
            crediarios_clientes (
              cliente_id,
              clientes (nome, celular, outrasinformacoes)
            ),
            historico (descricao)
          `)
          .range(from, to);

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          allData = [...allData, ...(data as Crediario[])];
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
      }

      setCrediarios(allData);
    } catch (err: any) {
      console.error('Erro ao carregar crediários:', err);
      setErrorMsg('Não foi possível carregar os crediários: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [historicos, setHistoricos] = useState<Historico[]>([]);

  const fetchHistoricos = async () => {
    try {
      const { data, error } = await supabase
        .from('historico')
        .select('*')
        .order('descricao', { ascending: true });
      if (error) throw error;
      setHistoricos(data || []);
    } catch (err) {
      console.error('Erro ao buscar históricos:', err);
    }
  };

  useEffect(() => {
    fetchCrediarios();
    fetchHistoricos();
  }, []);

  // Estados para exclusão de lançamento
  const [showDeleteLaunchConfirmModal, setShowDeleteLaunchConfirmModal] = useState<boolean>(false);
  const [launchToDelete, setLaunchToDelete] = useState<Crediario | null>(null);
  const [isDeletingLaunch, setIsDeletingLaunch] = useState<boolean>(false);

  const handleRequestDeleteLaunch = (launch: Crediario) => {
    setLaunchToDelete(launch);
    setShowDeleteLaunchConfirmModal(true);
  };

  const executeDeleteLaunch = async () => {
    if (!launchToDelete) return;
    setIsDeletingLaunch(true);
    try {
      const { error } = await supabase
        .from('crediarios')
        .delete()
        .eq('id', launchToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar dados localmente
      setCrediarios((prev) => prev.filter((c) => c.id !== launchToDelete.id));
      setShowDeleteLaunchConfirmModal(false);
      setLaunchToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir lançamento:', err);
      alert('Não foi possível excluir o lançamento: ' + err.message);
    } finally {
      setIsDeletingLaunch(false);
    }
  };

  // Estados do Modal de Baixa de Pagamento
  const [showBaixaModal, setShowBaixaModal] = useState<boolean>(false);
  const [selectedLaunchForBaixa, setSelectedLaunchForBaixa] = useState<Crediario | null>(null);
  const [baixaValorPago, setBaixaValorPago] = useState<string>('');
  const [baixaDataPagamento, setBaixaDataPagamento] = useState<string>('');
  const [baixaFormaPagamento, setBaixaFormaPagamento] = useState<string>('PIX');
  const [baixaValorTaxaCartao, setBaixaValorTaxaCartao] = useState<string>('0');
  const [baixaSubmitting, setBaixaSubmitting] = useState<boolean>(false);
  const [baixaError, setBaixaError] = useState<string | null>(null);

  const handleOpenBaixaModal = (launch: Crediario) => {
    setSelectedLaunchForBaixa(launch);
    const pendingAmount = Number(launch.valor_pagar || 0) - Number(launch.valor_pago || 0);
    setBaixaValorPago(formatCurrencyInput(pendingAmount > 0 ? pendingAmount : 0));
    
    // Set default payment date to today in YYYY-MM-DD
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10);
    setBaixaDataPagamento(localISOTime);
    
    setBaixaFormaPagamento(launch.forma_pagamento || 'PIX');
    setBaixaValorTaxaCartao(formatCurrencyInput(Number(launch.valor_taxa_cartao || 0)));
    setBaixaError(null);
    setShowBaixaModal(true);
  };

  const handleConfirmBaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchForBaixa) return;

    setBaixaSubmitting(true);
    setBaixaError(null);

    const valorPagoNum = parseCurrencyInputToNumber(baixaValorPago);
    const taxaNum = parseCurrencyInputToNumber(baixaValorTaxaCartao);

    if (valorPagoNum <= 0) {
      setBaixaError('O valor pago deve ser maior que zero.');
      setBaixaSubmitting(false);
      return;
    }

    try {
      const novoValorPago = Number(selectedLaunchForBaixa.valor_pago || 0) + valorPagoNum;

      const { data, error } = await supabase
        .from('crediarios')
        .update({
          valor_pago: novoValorPago,
          data_pagamento: new Date(baixaDataPagamento + 'T12:00:00Z').toISOString(),
          forma_pagamento: baixaFormaPagamento,
          valor_taxa_cartao: taxaNum,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLaunchForBaixa.id)
        .select(`
          *,
          crediarios_clientes (
            cliente_id,
            clientes (nome, celular, outrasinformacoes)
          ),
          historico (descricao)
        `);

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedLaunch = data[0];
        setCrediarios(prev => prev.map(c => c.id === updatedLaunch.id ? updatedLaunch : c));
      }

      setShowBaixaModal(false);
      setSelectedLaunchForBaixa(null);
    } catch (err: any) {
      console.error('Erro ao dar baixa:', err);
      setBaixaError(err.message || 'Erro ao processar baixa.');
    } finally {
      setBaixaSubmitting(false);
    }
  };

  // Estados do Modal de Incluir Pagamento / Parcelamento
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createType, setCreateType] = useState<'A vista' | 'Crediário'>('A vista');
  const [createHistoricoId, setCreateHistoricoId] = useState<string>('');
  const [createNovaDescricao, setCreateNovaDescricao] = useState<string>('');
  const [createShowNovaDescricao, setCreateShowNovaDescricao] = useState<boolean>(false);
  const [createValorTotal, setCreateValorTotal] = useState<string>('');
  const [createDataVencimento, setCreateDataVencimento] = useState<string>('');
  const [createDataPagamento, setCreateDataPagamento] = useState<string>('');
  const [createFormaPagamento, setCreateFormaPagamento] = useState<string>('PIX');
  const [createValorTaxaCartao, setCreateValorTaxaCartao] = useState<string>('0');
  const [createParcelasCount, setCreateParcelasCount] = useState<number>(2);
  const [createIntervalDays, setCreateIntervalDays] = useState<number>(30);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Novos estados para busca de cliente no modal
  const [showCreateModalSearch, setShowCreateModalSearch] = useState<boolean>(false);
  const [modalSelectedCliente, setModalSelectedCliente] = useState<{ id: string; nome: string; celular?: string; } | null>(null);
  const [allDbClientes, setAllDbClientes] = useState<{ id: string; nome: string; celular?: string; }[]>([]);
  const [loadingDbClientes, setLoadingDbClientes] = useState<boolean>(false);
  const [newLaunchClientSearch, setNewLaunchClientSearch] = useState<string>('');

  const fetchAllDbClientes = async () => {
    setLoadingDbClientes(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, celular')
        .order('nome', { ascending: true });
      if (error) throw error;
      setAllDbClientes(data || []);
    } catch (err) {
      console.error('Erro ao buscar todos os clientes do banco:', err);
    } finally {
      setLoadingDbClientes(false);
    }
  };

  const handleOpenCreateModalForAny = () => {
    setCreateType('A vista');
    setCreateHistoricoId(historicos.length > 0 ? historicos[0].id : '');
    setCreateNovaDescricao('');
    setCreateShowNovaDescricao(false);
    setCreateValorTotal('R$ 0,00');
    
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10);
    setCreateDataVencimento(localISOTime);
    setCreateDataPagamento(localISOTime);
    
    setCreateFormaPagamento('PIX');
    setCreateValorTaxaCartao('R$ 0,00');
    setCreateParcelasCount(2);
    setCreateIntervalDays(30);
    setCreateError(null);

    // Configurar modo de busca
    setShowCreateModalSearch(true);
    setModalSelectedCliente(null);
    setNewLaunchClientSearch('');
    fetchAllDbClientes();

    setShowCreateModal(true);
  };

  const handleOpenCreateModal = () => {
    setCreateType('A vista');
    setCreateHistoricoId(historicos.length > 0 ? historicos[0].id : '');
    setCreateNovaDescricao('');
    setCreateShowNovaDescricao(false);
    setCreateValorTotal('R$ 0,00');
    
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10);
    setCreateDataVencimento(localISOTime);
    setCreateDataPagamento(localISOTime);
    
    setCreateFormaPagamento('PIX');
    setCreateValorTaxaCartao('R$ 0,00');
    setCreateParcelasCount(2);
    setCreateIntervalDays(30);
    setCreateError(null);

    // Resetar modo de busca
    setShowCreateModalSearch(false);
    setModalSelectedCliente(null);

    setShowCreateModal(true);
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClienteId = showCreateModalSearch ? modalSelectedCliente?.id : selectedClienteId;
    if (!targetClienteId) {
      setCreateError('Por favor, selecione um cliente.');
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);

    const valorTotalNum = parseCurrencyInputToNumber(createValorTotal);
    if (valorTotalNum <= 0) {
      setCreateError('O valor total deve ser maior que zero.');
      setCreateSubmitting(false);
      return;
    }

    try {
      let finalHistoricoId = createHistoricoId;

      if (createShowNovaDescricao) {
        if (!createNovaDescricao.trim()) {
          setCreateError('A descrição do novo histórico é obrigatória.');
          setCreateSubmitting(false);
          return;
        }

        const { data: newHist, error: histErr } = await supabase
          .from('historico')
          .insert([{ descricao: createNovaDescricao.trim() }])
          .select();

        if (histErr) {
          if (histErr.code === '23505') {
            throw new Error('Já existe um histórico cadastrado com esta descrição.');
          }
          throw histErr;
        }

        if (newHist && newHist.length > 0) {
          finalHistoricoId = newHist[0].id;
          await fetchHistoricos();
        } else {
          throw new Error('Falha ao obter ID do histórico criado.');
        }
      }

      if (!finalHistoricoId) {
        setCreateError('Selecione ou crie um histórico.');
        setCreateSubmitting(false);
        return;
      }

      // Garantir que existe o registro na tabela mestre crediarios_clientes
      let { data: ccData, error: ccError } = await supabase
        .from('crediarios_clientes')
        .select('id')
        .eq('cliente_id', targetClienteId)
        .maybeSingle();

      if (ccError) throw ccError;

      let crediarioClienteId = ccData?.id;

      if (!crediarioClienteId) {
        const { data: newCC, error: insertError } = await supabase
          .from('crediarios_clientes')
          .insert([{ cliente_id: targetClienteId }])
          .select('id')
          .single();
        if (insertError) throw insertError;
        crediarioClienteId = newCC.id;
      }

      if (createType === 'A vista') {
        const { data, error } = await supabase
          .from('crediarios')
          .insert([{
            crediario_cliente_id: crediarioClienteId,
            historico_id: finalHistoricoId,
            tipo_pagamento: 'A vista',
            valor_pagar: valorTotalNum,
            valor_pago: valorTotalNum,
            data_pagamento: new Date(createDataPagamento + 'T12:00:00Z').toISOString(),
            data_vencimento: new Date(createDataPagamento + 'T12:00:00Z').toISOString(),
            forma_pagamento: createFormaPagamento,
            valor_taxa_cartao: parseCurrencyInputToNumber(createValorTaxaCartao)
          }])
          .select(`
            *,
            crediarios_clientes (
              cliente_id,
              clientes (nome, celular, outrasinformacoes)
            ),
            historico (descricao)
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          setCrediarios(prev => [data[0], ...prev]);
          if (showCreateModalSearch) {
            setSelectedClienteId(targetClienteId);
          }
        }
      } else {
        const installmentRows = [];
        const baseValue = Number((valorTotalNum / createParcelasCount).toFixed(2));
        
        for (let i = 1; i <= createParcelasCount; i++) {
          const dueDate = new Date(createDataVencimento + 'T12:00:00Z');
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          
          let finalValue = baseValue;
          if (i === createParcelasCount) {
            const sumOtherInstallments = baseValue * (createParcelasCount - 1);
            finalValue = Number((valorTotalNum - sumOtherInstallments).toFixed(2));
          }

          installmentRows.push({
            crediario_cliente_id: crediarioClienteId,
            historico_id: finalHistoricoId,
            tipo_pagamento: 'Crediário',
            parcelas: `${i}/${createParcelasCount}`,
            valor_pagar: finalValue,
            valor_pago: 0,
            data_vencimento: dueDate.toISOString(),
          });
        }

        const { data, error } = await supabase
          .from('crediarios')
          .insert(installmentRows)
          .select(`
            *,
            crediarios_clientes (
              cliente_id,
              clientes (nome, celular, outrasinformacoes)
            ),
            historico (descricao)
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          setCrediarios(prev => [...data, ...prev]);
          if (showCreateModalSearch) {
            setSelectedClienteId(targetClienteId);
          }
        }
      }

      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Erro ao criar lançamento:', err);
      setCreateError(err.message || 'Erro ao criar lançamento.');
    } finally {
      setCreateSubmitting(false);
    }
  };


  // Formatação de Moeda
  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Formatação de Data
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return '-';
    }
  };

  // Nomes dos meses para o seletor
  const monthsNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  };

  // Lógica de correspondência com o Período Geral
  const matchPeriod = (c: Crediario) => {
    if (selectedMonth === null || selectedYear === null) return true;
    
    // Critério: usar data_pagamento se existir; caso contrário, data_vencimento
    const dateStr = c.data_pagamento || c.data_vencimento;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    return year === selectedYear && month === selectedMonth;
  };

  // Dados filtrados pelo Período Geral
  const filteredByPeriod = useMemo(() => {
    return crediarios.filter(matchPeriod);
  }, [crediarios, selectedMonth, selectedYear]);

  // Estatísticas Gerais (baseadas no período geral)
  const metrics = useMemo(() => {
    let totalPagar = 0;
    let totalPago = 0;
    let totalAberto = 0;
    let totalTaxas = 0;

    filteredByPeriod.forEach((c) => {
      const pagar = Number(c.valor_pagar || 0);
      const pago = Number(c.valor_pago || 0);
      const taxa = Number(c.valor_taxa_cartao || 0);

      totalPagar += pagar;
      totalPago += pago;
      totalAberto += Math.max(0, pagar - pago);
      totalTaxas += taxa;
    });

    return {
      totalPagar,
      totalPago,
      totalAberto,
      totalTaxas,
      count: filteredByPeriod.length
    };
  }, [filteredByPeriod]);

  // Filtrar todos os clientes cadastrados pela barra de busca do modal
  const filteredDbClientes = useMemo(() => {
    const term = newLaunchClientSearch.toLowerCase().trim();
    if (!term) return allDbClientes;
    return allDbClientes.filter(c =>
      c.nome.toLowerCase().includes(term) ||
      (c.celular && c.celular.includes(term))
    );
  }, [allDbClientes, newLaunchClientSearch]);

  // Verificar se o cliente selecionado no modal já possui lançamentos
  const hasExistingLaunch = useMemo(() => {
    if (!modalSelectedCliente) return false;
    return crediarios.some(c => c.crediarios_clientes?.cliente_id === modalSelectedCliente.id);
  }, [modalSelectedCliente, crediarios]);

  // Agrupamento por Cliente (Coluna 1) - Todos os lançamentos (não filtrados por período)
  const clientGroups = useMemo(() => {
    const groups: { [key: string]: {
      id: string;
      nome: string;
      celular?: string;
      outrasinformacoes?: string;
      totalPagar: number;
      totalPago: number;
      totalAberto: number;
      launchesCount: number;
      launches: Crediario[];
    }} = {};

    crediarios.forEach((c) => {
      const clienteId = c.crediarios_clientes?.cliente_id || 'unknown';
      const clienteNome = c.crediarios_clientes?.clientes?.nome || 'Cliente Desconhecido';
      const celular = c.crediarios_clientes?.clientes?.celular || '';
      const outrasinformacoes = c.crediarios_clientes?.clientes?.outrasinformacoes || '';

      if (!groups[clienteId]) {
        groups[clienteId] = {
          id: clienteId,
          nome: clienteNome,
          celular,
          outrasinformacoes,
          totalPagar: 0,
          totalPago: 0,
          totalAberto: 0,
          launchesCount: 0,
          launches: []
        };
      }

      const pagar = Number(c.valor_pagar || 0);
      const pago = Number(c.valor_pago || 0);

      groups[clienteId].totalPagar += pagar;
      groups[clienteId].totalPago += pago;
      groups[clienteId].totalAberto += Math.max(0, pagar - pago);
      groups[clienteId].launchesCount += 1;
      groups[clienteId].launches.push(c);
    });

    return Object.values(groups);
  }, [crediarios]);

  // Lista de Clientes (Coluna 1)
  const filteredClients = useMemo(() => {
    const term = clientSearch.toLowerCase().trim();
    const sTermGlobal = globalSearch.toLowerCase().trim();
    
    return clientGroups.filter((client) => {
      // Filtro de Busca por texto (nome, celular ou outras informações) na coluna 1
      const matchText = !term || 
        client.nome.toLowerCase().includes(term) ||
        (client.celular && client.celular.includes(term)) ||
        (client.outrasinformacoes && client.outrasinformacoes.toLowerCase().includes(term));

      // Busca global integrada
      const matchGlobal = !sTermGlobal || client.nome.toLowerCase().includes(sTermGlobal);

      // Filtro de Status da Coluna 1
      let matchStatus = true;
      if (clientStatusFilter === 'Com Pendências') {
        matchStatus = client.totalAberto > 0;
      } else if (clientStatusFilter === 'Quitados') {
        matchStatus = client.totalAberto === 0;
      }

      return matchText && matchGlobal && matchStatus;
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [clientGroups, clientSearch, globalSearch, clientStatusFilter]);

  // Cliente Ativo e Lançamentos
  const selectedClientData = useMemo(() => {
    if (!selectedClienteId) return null;
    return clientGroups.find((c) => c.id === selectedClienteId) || null;
  }, [clientGroups, selectedClienteId]);

  // Lançamentos do Cliente Selecionado (Coluna 2)
  const filteredLaunches = useMemo(() => {
    if (!selectedClientData) return [];

    const term = launchSearch.toLowerCase().trim();

    return selectedClientData.launches.filter((launch) => {
      const desc = launch.historico?.descricao?.toLowerCase() || '';
      const form = launch.forma_pagamento?.toLowerCase() || '';
      const valPagarStr = String(launch.valor_pagar || '');
      const valPagoStr = String(launch.valor_pago || '');

      const matchText = !term ||
        desc.includes(term) ||
        form.includes(term) ||
        valPagarStr.includes(term) ||
        valPagoStr.includes(term);

      const pagar = Number(launch.valor_pagar || 0);
      const pago = Number(launch.valor_pago || 0);
      const isAberto = pagar > pago;

      let matchStatus = true;
      if (launchStatusFilter === 'Pago') {
        matchStatus = !isAberto;
      } else if (launchStatusFilter === 'Pendente') {
        matchStatus = isAberto;
      }

      return matchText && matchStatus;
    }).sort((a, b) => {
      // Ordenação decrescente de data (vencimento ou pagamento)
      const dateA = new Date(a.data_pagamento || a.data_vencimento || 0).getTime();
      const dateB = new Date(b.data_pagamento || b.data_vencimento || 0).getTime();
      return dateB - dateA;
    });
  }, [selectedClientData, launchSearch, launchStatusFilter]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Título e Filtro de Período Geral */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Crediários
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Consulte e gerencie as pendências agrupadas por cliente e os lançamentos detalhados.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Popover Calendário de Período Geral */}
          <div className="relative">
            <button
              onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
              className={`month-popover-trigger flex items-center gap-2 border ${A.border} ${A.card} hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 rounded-full font-semibold shadow-sm transition-all active:scale-[0.98] text-sm`}
            >
              <Calendar size={16} className="text-brand-purple" />
              <span className="text-brand-purple dark:text-purple-400 font-bold">
                {selectedMonth !== null && selectedYear !== null
                  ? `01 - ${getDaysInMonth(selectedYear, selectedMonth)} ${monthsNames[selectedMonth]} ${selectedYear}`
                  : 'Todos os Períodos'}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isPeriodPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPeriodPickerOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsPeriodPickerOpen(false)}
              />
            )}
            <AnimatePresence>
              {isPeriodPickerOpen && (
                <motion.div
                  key="period-picker-popover"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-80 p-5 rounded-[24px] border ${A.border} ${A.card} shadow-xl z-50 text-center`}
                >
                  {/* Navegação de Ano */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedYear(prev => (prev ? prev - 1 : 2026))}
                      className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`font-extrabold text-base ${A.textPrimary}`}>
                      {selectedYear || 2026}
                    </span>
                    <button
                      onClick={() => setSelectedYear(prev => (prev ? prev + 1 : 2026))}
                      className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <hr className={`border-t ${A.border} border-dashed mb-4`} />

                  {/* Grade de Meses */}
                  <div className="grid grid-cols-3 gap-2">
                    {monthsNames.map((monthName, idx) => {
                      const isSelected = selectedMonth === idx;
                      return (
                        <button
                          key={monthName}
                          onClick={() => {
                            setSelectedMonth(idx);
                            if (!selectedYear) {
                              setSelectedYear(2026);
                            }
                            setIsPeriodPickerOpen(false);
                          }}
                          className={`py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                              : `text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`
                          }`}
                        >
                          {monthName}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => {
                        setSelectedMonth(null);
                        setSelectedYear(null);
                        setIsPeriodPickerOpen(false);
                      }}
                      className={`w-full py-2.5 rounded-xl border border-dashed ${A.border} text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all`}
                    >
                      Todos os Períodos
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={fetchCrediarios}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-4 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98] text-sm"
          >
            Atualizar Dados
          </button>
        </div>
      </div>

      {/* Grid de Estatísticas Gerais do Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {/* Total Lançamentos */}
        <div
          className={`border ${A.border} ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-950/40 text-brand-purple' : 'bg-purple-50 text-brand-purple'}`}>
                <Receipt size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${A.textMuted}`}>
                Lançamentos
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/40' 
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              Qtd: {metrics.count}
            </span>
          </div>
          <div className="mt-4">
            <h4 className={`text-2xl font-black tracking-tight ${A.textPrimary}`}>
              {formatCurrency(metrics.totalPagar)}
            </h4>
            <p className={`text-[10px] ${A.textMuted} font-medium mt-1`}>
              Valor total a receber lançado
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-brand-purple h-full rounded-full w-full" />
          </div>
        </div>

        {/* Total Recebido */}
        <div
          className={`border ${A.border} ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-950/40 text-emerald-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <TrendingUp size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${A.textMuted}`}>
                Total Recebido
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Pago
            </span>
          </div>
          <div className="mt-4">
            <h4 className={`text-2xl font-black tracking-tight ${A.textPrimary}`}>
              {formatCurrency(metrics.totalPago)}
            </h4>
            <p className={`text-[10px] ${A.textMuted} font-medium mt-1`}>
              Total pago no período
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPagar > 0 ? (metrics.totalPago / metrics.totalPagar) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Total Em Aberto */}
        <div
          className={`border ${A.border} ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-rose-950/40 text-rose-500' : 'bg-rose-50 text-rose-500'}`}>
                <DollarSign size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${A.textMuted}`}>
                Total Em Aberto
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/40' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              Pendente
            </span>
          </div>
          <div className="mt-4">
            <h4 className={`text-2xl font-black tracking-tight ${A.textPrimary}`}>
              {formatCurrency(metrics.totalAberto)}
            </h4>
            <p className={`text-[10px] ${A.textMuted} font-medium mt-1`}>
              Valor pendente de recebimento
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPagar > 0 ? (metrics.totalAberto / metrics.totalPagar) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Taxas do Cartão */}
        <div
          className={`border ${A.border} ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-950/40 text-amber-500' : 'bg-amber-50 text-amber-500'}`}>
                <Percent size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${A.textMuted}`}>
                Taxas de Cartão
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/40' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              Despesa
            </span>
          </div>
          <div className="mt-4">
            <h4 className={`text-2xl font-black tracking-tight ${A.textPrimary}`}>
              {formatCurrency(metrics.totalTaxas)}
            </h4>
            <p className={`text-[10px] ${A.textMuted} font-medium mt-1`}>
              Custo total de taxas de cartão
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPago > 0 ? (metrics.totalTaxas / metrics.totalPago) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seção Principal de Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* COLUNA 1: Lista de Clientes (lg:col-span-5) */}
        <div className={`lg:col-span-5 flex flex-col h-[650px] border ${A.border} ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
          {/* Header e Filtros da Coluna 1 */}
          <div className="p-4 border-b border-dashed border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/20 dark:bg-slate-900/10">
            <div className="flex items-center justify-between">
              <h2 className={`text-base font-bold tracking-tight ${A.textPrimary}`}>Clientes</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateModalForAny}
                  className="flex items-center gap-1 bg-brand-purple hover:bg-brand-purpleDark text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={12} />
                  Novo Cliente
                </button>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple dark:bg-purple-950/40 dark:text-purple-300 border border-brand-purple/20">
                  {filteredClients.length}
                </span>
              </div>
            </div>
            
            {/* Campo de Busca da Coluna 1 */}
            <div className="relative">
              <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar cliente por nome ou celular..."
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
              />
            </div>
            
            {/* Filtros Rápido de Status (Pill) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(['Todos', 'Com Pendências', 'Quitados'] as const).map((status) => {
                const isSelected = clientStatusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setClientStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#0F172A] text-white dark:bg-brand-purple dark:text-white shadow-sm'
                        : `bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Cards de Clientes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-3 border-brand-purple border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-xs text-slate-500">Carregando clientes...</span>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-2">
                  <AlertCircle size={20} />
                </div>
                <span className={`text-xs font-bold ${A.textPrimary}`}>Nenhum cliente encontrado</span>
                <span className={`text-[10px] ${A.textMuted} mt-0.5`}>Ajuste a busca ou troque o filtro.</span>
              </div>
            ) : (
              filteredClients.map((client, idx) => {
                const isSelected = selectedClienteId === client.id;
                const isAberto = client.totalAberto > 0;
                const statusColor = isAberto ? 'bg-rose-500' : 'bg-emerald-500';
                const isEven = idx % 2 === 0;
                
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClienteId(client.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-purple bg-purple-50/20 dark:bg-purple-950/20 shadow-sm'
                        : isEven
                        ? 'border-transparent bg-[#7c3aed08] dark:bg-[#7c3aed15]'
                        : 'border-transparent bg-[#7c3aed00]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 max-w-[75%]">
                        <h3 className={`text-base font-bold truncate ${A.textPrimary}`}>{client.nome}</h3>
                        {client.celular && (
                          <p className={`text-xs flex items-center gap-1.5 ${A.textMuted} mt-0.5`}>
                            <Phone size={12} className="opacity-60" />
                            {client.celular}
                          </p>
                        )}
                        {client.outrasinformacoes && (
                          <div className="mt-1">
                            <span 
                              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#d1d1d1] text-slate-800 max-w-full truncate" 
                              title={client.outrasinformacoes}
                            >
                              {client.outrasinformacoes}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                        <span className={`text-xs font-bold ${A.textMuted}`}>
                          {client.launchesCount} lanc.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA 2: Lançamentos Detalhados (lg:col-span-7) */}
        <div className={`lg:col-span-7 flex flex-col h-[650px] border ${A.border} ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
          {selectedClientData ? (
            <>
              {/* Header do Cliente Selecionado */}
              <div className="p-4 border-b border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${A.textPrimary}`}>{selectedClientData.nome}</h2>
                      <p className={`text-[10px] ${A.textMuted}`}>
                        {selectedClientData.celular || 'Sem número cadastrado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      selectedClientData.totalAberto > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                    }`}>
                      {selectedClientData.totalAberto > 0 ? 'Pendente' : 'Quitado'}
                    </span>
                    <button
                      onClick={handleOpenCreateModal}
                      className="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-purpleDark text-white px-3 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
                      style={{ paddingTop: '7px', paddingBottom: '7px' }}
                    >
                      <Plus size={12} />
                      Novo Lançamento
                    </button>
                  </div>
                </div>

                {/* Métricas Consolidadas do Cliente (Formato de Card) */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-3 p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                  <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-semibold mb-1">Total Lançado</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(selectedClientData.totalPagar)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-semibold mb-1">Total Pago</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedClientData.totalPago)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-semibold mb-1">Total Aberto</span>
                    <span className="text-base sm:text-lg font-bold text-rose-500 dark:text-rose-400">
                      {formatCurrency(selectedClientData.totalAberto)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-semibold mb-1">Lançamentos</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedClientData.launchesCount}
                    </span>
                  </div>
                </div>
              </div>
              {/* Filtros da Coluna 2 */}
              <div className="p-4 border-b border-dashed border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-3 bg-slate-50/20 dark:bg-slate-900/10">
                <div className="relative flex-1">
                  <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input
                    type="text"
                    value={launchSearch}
                    onChange={(e) => setLaunchSearch(e.target.value)}
                    placeholder="Filtrar lançamentos por histórico, valor ou forma..."
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {(['Todos', 'Pendente', 'Pago'] as const).map((status) => {
                    const isSelected = launchStatusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setLaunchStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-[#0F172A] text-white dark:bg-brand-purple dark:text-white shadow-sm'
                            : `bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Header do Grid (Alinhado com os cards de lançamentos) */}
              <div className="px-4 py-2.5 grid grid-cols-12 gap-2 text-slate-450 dark:text-slate-500 uppercase tracking-wider font-bold text-xs text-left select-none">
                <div className="col-span-1">REF</div>
                <div className="col-span-2">HISTÓRICO</div>
                <div className="col-span-2">VENCIMENTO</div>
                <div className="col-span-2">A PAGAR</div>
                <div className="col-span-2">PAGO</div>
                <div className="col-span-2">PAGO EM</div>
                <div className="col-span-1 text-center">AÇÕES</div>
              </div>

              {/* Lista dos Lançamentos Individuais em Cards Stacked */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {filteredLaunches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-2">
                      <AlertCircle size={20} />
                    </div>
                    <span className={`text-xs font-bold ${A.textPrimary}`}>Nenhum lançamento correspondente</span>
                    <span className={`text-[10px] ${A.textMuted} mt-0.5`}>Ajuste a busca ou mude o filtro da coluna.</span>
                  </div>
                ) : (
                  filteredLaunches.map((launch, idx) => {
                    const pagar = Number(launch.valor_pagar || 0);
                    const pago = Number(launch.valor_pago || 0);
                    const isPago = pagar <= pago && pago > 0;
                    const isEven = idx % 2 === 0;
                    
                    // REF Format: e.g. "Jul/26"
                    let refText = '-';
                    if (launch.data_vencimento) {
                      try {
                        const d = new Date(launch.data_vencimento);
                        if (!isNaN(d.getTime())) {
                          const monthStr = monthsNames[d.getUTCMonth()];
                          const yearStr = String(d.getUTCFullYear()).slice(-2);
                          refText = `${monthStr}/${yearStr}`;
                        }
                      } catch {}
                    }

                    return (
                      <div
                        key={launch.id}
                        className={`p-4 grid grid-cols-12 gap-2 items-center rounded-2xl transition-all duration-200 text-sm text-left ${
                          isEven
                            ? 'bg-[#7c3aed08] dark:bg-[#7c3aed15]'
                            : 'bg-[#7c3aed00]'
                        }`}
                      >
                        <div className={`col-span-1 font-bold ${A.textPrimary}`}>{refText}</div>
                        <div className="col-span-2 text-slate-700 dark:text-slate-200 font-semibold truncate" title={launch.historico?.descricao || '-'}>
                          {launch.historico?.descricao || '-'}
                        </div>
                        <div className="col-span-2 text-slate-600 dark:text-slate-300 font-medium">
                          {formatDate(launch.data_vencimento)}
                        </div>
                        <div className="col-span-2 font-bold text-brand-purple dark:text-purple-400">
                          {formatCurrency(launch.valor_pagar)}
                        </div>
                        <div className={`col-span-2 font-bold ${isPago ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {isPago ? formatCurrency(launch.valor_pago) : '-'}
                        </div>
                        <div className="col-span-2 text-slate-600 dark:text-slate-300 font-medium">
                          {isPago ? formatDate(launch.data_pagamento) : '-'}
                        </div>
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          {!isPago && (
                            <button
                              onClick={() => handleOpenBaixaModal(launch)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors active:scale-95"
                              title="Dar Baixa no Pagamento"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRequestDeleteLaunch(launch)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors active:scale-95 cursor-pointer"
                            title="Excluir Lançamento"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Blank State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-4 shadow-inner relative animate-pulse">
                <Receipt size={32} />
              </div>
              <h3 className={`text-sm font-bold ${A.textPrimary}`}>Visualizar Lançamentos</h3>
              <p className={`text-xs ${A.textMuted} mt-2 max-w-sm`}>
                Selecione um cliente na lista à esquerda para detalhar as contas, histórico e pagamentos correspondentes.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* MODAL DE BAIXA DE PAGAMENTO */}
      <AnimatePresence>
        {showBaixaModal && selectedLaunchForBaixa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-[24px] border ${A.border} ${A.card} p-6 shadow-2xl space-y-4 text-left`}
            >
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-brand-purple">
                  <CheckCircle2 size={24} />
                  <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                    Dar Baixa no Pagamento
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowBaixaModal(false);
                    setSelectedLaunchForBaixa(null);
                  }}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textMuted} hover:text-rose-500 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {baixaError && (
                <div className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold shadow-sm">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{baixaError}</span>
                </div>
              )}

              <div className="text-xs space-y-1.5">
                <p className={`${A.textMuted}`}>
                  Cliente: <strong className={`${A.textPrimary}`}>{selectedClientData?.nome}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Histórico: <strong className={`${A.textPrimary}`}>{selectedLaunchForBaixa.historico?.descricao || '-'}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Valor Lançado: <strong className={`${A.textPrimary}`}>{formatCurrency(selectedLaunchForBaixa.valor_pagar)}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Valor Pago Anteriormente: <strong className={`${A.textPrimary}`}>{formatCurrency(selectedLaunchForBaixa.valor_pago || 0)}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Saldo Pendente: <strong className="text-rose-500">{formatCurrency(Number(selectedLaunchForBaixa.valor_pagar || 0) - Number(selectedLaunchForBaixa.valor_pago || 0))}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirmBaixa} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Valor a Receber Agora *
                  </label>
                  <input
                    type="text"
                    required
                    value={baixaValorPago}
                    onChange={(e) => setBaixaValorPago(formatCurrencyInput(e.target.value))}
                    placeholder="R$ 0,00"
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Data do Pagamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={baixaDataPagamento}
                    onChange={(e) => setBaixaDataPagamento(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Forma de Pagamento *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['dinheiro', 'PIX', 'cartão'].map((forma) => {
                      const isSelected = baixaFormaPagamento === forma;
                      return (
                        <button
                          key={forma}
                          type="button"
                          onClick={() => setBaixaFormaPagamento(forma)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                              : `border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`
                          }`}
                        >
                          {forma.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {['cartão BB', 'cartão Santander', 'Cartão Nubank', 'Cartão Sicoob'].map((forma) => {
                      const isSelected = baixaFormaPagamento === forma;
                      return (
                        <button
                          key={forma}
                          type="button"
                          onClick={() => setBaixaFormaPagamento(forma)}
                          className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                            isSelected
                              ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                              : `border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800`
                          }`}
                        >
                          {forma}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Taxa do Cartão (Opcional)
                  </label>
                  <input
                    type="text"
                    value={baixaValorTaxaCartao}
                    onChange={(e) => setBaixaValorTaxaCartao(formatCurrencyInput(e.target.value))}
                    placeholder="R$ 0,00"
                    disabled={!baixaFormaPagamento.toLowerCase().includes('cartão')}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText} disabled:opacity-50`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBaixaModal(false);
                      setSelectedLaunchForBaixa(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={baixaSubmitting}
                    className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {baixaSubmitting ? 'Salvando...' : 'Dar Baixa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE INCLUIR NOVO LANÇAMENTO */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-[24px] border ${A.border} ${A.card} p-6 shadow-2xl space-y-4 my-8 text-left`}
            >
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-brand-purple">
                  <CreditCard size={24} />
                  <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                    Novo Lançamento / Pagamento
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textMuted} hover:text-rose-500 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {createError && (
                <div className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold shadow-sm">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              {showCreateModalSearch ? (
                <div className="space-y-3">
                  {!modalSelectedCliente ? (
                    <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        Buscar Cliente *
                      </label>
                      <div className="relative">
                        <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                        <input
                          type="text"
                          value={newLaunchClientSearch}
                          onChange={(e) => setNewLaunchClientSearch(e.target.value)}
                          placeholder="Digite o nome ou celular do cliente..."
                          className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
                        />
                      </div>
                      
                      {loadingDbClientes ? (
                        <div className="text-center py-4 text-xs text-slate-500">
                          Carregando clientes...
                        </div>
                      ) : (
                        <div className={`border ${A.border} rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/20`}>
                          {filteredDbClientes.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-500">
                              Nenhum cliente cadastrado encontrado.
                            </div>
                          ) : (
                            filteredDbClientes.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setModalSelectedCliente(c)}
                                className={`w-full text-left p-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center ${A.textPrimary}`}
                              >
                                <span>{c.nome}</span>
                                {c.celular && <span className="text-[10px] text-slate-400 font-normal">{c.celular}</span>}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div className="text-xs">
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>Cliente Selecionado</span>
                        <strong className={`text-sm ${A.textPrimary}`}>{modalSelectedCliente.nome}</strong>
                        {modalSelectedCliente.celular && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">{modalSelectedCliente.celular}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModalSelectedCliente(null);
                          setNewLaunchClientSearch('');
                        }}
                        className="text-xs font-bold text-brand-purple hover:underline cursor-pointer"
                      >
                        Alterar
                      </button>
                    </div>
                  )}

                  {/* Verificação e Alerta de Lançamento Existente */}
                  {modalSelectedCliente && hasExistingLaunch && (
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-sm animate-fadeIn">
                      <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Aviso: Cliente já possui crediário</p>
                        <p className="font-normal text-[10px] mt-0.5 opacity-90">Este cliente já possui lançamentos anteriores registrados. Deseja realizar um novo lançamento mesmo assim?</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p className={`${A.textMuted}`}>
                    Cliente: <strong className={`${A.textPrimary}`}>{selectedClientData?.nome}</strong>
                  </p>
                </div>
              )}

              {(!showCreateModalSearch || modalSelectedCliente) && (
                <>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {(['A vista', 'Crediário'] as const).map((type) => {
                      const isSelected = createType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCreateType(type)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-slate-700 text-brand-purple shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {type === 'A vista' ? 'À Vista' : 'Parcelado (Crediário)'}
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleConfirmCreate} className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                          Histórico / Descrição *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateShowNovaDescricao(!createShowNovaDescricao);
                            setCreateNovaDescricao('');
                          }}
                          className="text-[10px] font-bold text-brand-purple hover:underline"
                        >
                          {createShowNovaDescricao ? 'Selecionar Existente' : '+ Criar Novo Histórico'}
                        </button>
                      </div>

                      {createShowNovaDescricao ? (
                        <input
                          type="text"
                          required
                          value={createNovaDescricao}
                          onChange={(e) => setCreateNovaDescricao(e.target.value)}
                          placeholder="Descrição do novo histórico (ex: Venda Luva)"
                          className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                        />
                      ) : (
                        <select
                          value={createHistoricoId}
                          onChange={(e) => setCreateHistoricoId(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                        >
                          {historicos.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.descricao}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        Valor Total *
                      </label>
                      <input
                        type="text"
                        required
                        value={createValorTotal}
                        onChange={(e) => setCreateValorTotal(formatCurrencyInput(e.target.value))}
                        placeholder="R$ 0,00"
                        className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                      />
                    </div>

                    {createType === 'A vista' ? (
                      <>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                            Data de Recebimento *
                          </label>
                          <input
                            type="date"
                            required
                            value={createDataPagamento}
                            onChange={(e) => setCreateDataPagamento(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                            Forma de Pagamento *
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['dinheiro', 'PIX', 'cartão'].map((forma) => {
                              const isSelected = createFormaPagamento === forma;
                              return (
                                <button
                                  key={forma}
                                  type="button"
                                  onClick={() => setCreateFormaPagamento(forma)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                                      : `border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`
                                  }`}
                                >
                                  {forma.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                            {['cartão BB', 'cartão Santander', 'Cartão Nubank', 'Cartão Sicoob'].map((forma) => {
                              const isSelected = createFormaPagamento === forma;
                              return (
                                <button
                                  key={forma}
                                  type="button"
                                  onClick={() => setCreateFormaPagamento(forma)}
                                  className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                                      : `border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800`
                                  }`}
                                >
                                  {forma}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                            Taxa do Cartão (Opcional)
                          </label>
                          <input
                            type="text"
                            value={createValorTaxaCartao}
                            onChange={(e) => setCreateValorTaxaCartao(formatCurrencyInput(e.target.value))}
                            placeholder="R$ 0,00"
                            disabled={!createFormaPagamento.toLowerCase().includes('cartão')}
                            className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText} disabled:opacity-50`}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                              Qtd. de Parcelas
                            </label>
                            <select
                              value={createParcelasCount}
                              onChange={(e) => setCreateParcelasCount(Number(e.target.value))}
                              className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                            >
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <option key={num} value={num}>
                                  {num}x
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                              1º Vencimento *
                            </label>
                            <input
                              type="date"
                              required
                              value={createDataVencimento}
                              onChange={(e) => setCreateDataVencimento(e.target.value)}
                              className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                            />
                          </div>
                        </div>

                        {parseCurrencyInputToNumber(createValorTotal) > 0 && (
                          <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                              Pré-visualização das Parcelas
                            </label>
                            <div className={`border ${A.border} rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-900 text-xs`}>
                              {(() => {
                                const totalVal = parseCurrencyInputToNumber(createValorTotal);
                                const numInstallments = createParcelasCount;
                                const baseVal = Number((totalVal / numInstallments).toFixed(2));
                                const list = [];
                                for (let i = 1; i <= numInstallments; i++) {
                                  const dueDate = new Date(createDataVencimento + 'T12:00:00Z');
                                  dueDate.setMonth(dueDate.getMonth() + (i - 1));
                                  let finalVal = baseVal;
                                  if (i === numInstallments) {
                                    const sumOthers = baseVal * (numInstallments - 1);
                                    finalVal = Number((totalVal - sumOthers).toFixed(2));
                                  }
                                  list.push(
                                    <div key={i} className="flex justify-between items-center py-1 border-b border-dashed last:border-0 border-slate-200 dark:border-slate-800">
                                      <span className="font-semibold text-slate-500">Parcela {i}/{numInstallments}</span>
                                      <span className={`font-bold ${A.textPrimary}`}>{formatCurrency(finalVal)}</span>
                                      <span className="text-slate-500">{dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                    </div>
                                  );
                                }
                                return list;
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={createSubmitting}
                        className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                      >
                        {createSubmitting ? 'Salvando...' : 'Gerar Lançamento'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CONFIRMAR EXCLUSÃO DE LANÇAMENTO */}
      {showDeleteLaunchConfirmModal && launchToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-sm p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-center`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className={`text-lg font-bold ${A.textPrimary} mb-2`}>Excluir Lançamento?</h3>
            <p className={`text-xs ${A.textMuted} mb-6`}>
              Tem certeza que deseja excluir permanentemente o lançamento de{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {launchToDelete.historico?.descricao || 'Crediário'}
              </span>{' '}
              no valor de{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(launchToDelete.valor_pagar || 0)}
              </span>
              ? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteLaunchConfirmModal(false);
                  setLaunchToDelete(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteLaunch}
                disabled={isDeletingLaunch}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
              >
                {isDeletingLaunch ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CrediariosTab;

