import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { DashboardContext } from '../DashboardContext';
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
  Trash2,
  Pencil,
  FileText
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
  referente_a?: string | null;
  data_compra?: string | null;
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

const CrediariosTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A, globalSearch } = ctx;
  const isDarkMode = A.textPrimary === 'text-slate-100';
  const [crediarios, setCrediarios] = useState<Crediario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtro de Período Geral (inicia sempre no mês e ano atuais)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number | null>(() => new Date().getFullYear());
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState<boolean>(false);

  // Cliente selecionado para a Coluna 2
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  // Filtros da Coluna 1 (Clientes)
  const [clientSearch, setClientSearch] = useState<string>('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'Todos' | 'Com Pendências' | 'Com Pendência no Mês' | 'Quitados'>('Todos');

  // Filtros da Coluna 2 (Lançamentos)
  const [launchSearch, setLaunchSearch] = useState<string>('');
  const [launchStatusFilter, setLaunchStatusFilter] = useState<'Todos' | 'Pago' | 'Pendente'>('Todos');

  // Paginação dos Lançamentos (Coluna 2)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  useEffect(() => {
    const handleResize = () => {
      // Ajusta dinamicamente a quantidade de itens por página de acordo com a altura da janela
      const availableHeight = window.innerHeight - 630;
      const count = Math.max(4, Math.floor(availableHeight / 60));
      setItemsPerPage(count);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClienteId, launchSearch, launchStatusFilter]);

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
  const [baixaReferenteA, setBaixaReferenteA] = useState<string>('');
  const [baixaSubmitting, setBaixaSubmitting] = useState<boolean>(false);
  const [baixaError, setBaixaError] = useState<string | null>(null);

  // Estados do Modal de Edição de Pagamento Pago
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedLaunchForEdit, setSelectedLaunchForEdit] = useState<Crediario | null>(null);
  const [editReferenteA, setEditReferenteA] = useState<string>('');
  const [editDataCompra, setEditDataCompra] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Estados do Modal de Alteração de Parcela Pendente
  const [showEditPendenteModal, setShowEditPendenteModal] = useState<boolean>(false);
  const [selectedLaunchForEditPendente, setSelectedLaunchForEditPendente] = useState<Crediario | null>(null);
  const [editPendenteDataCompra, setEditPendenteDataCompra] = useState<string>('');
  const [editPendenteReferenteA, setEditPendenteReferenteA] = useState<string>('');
  const [editPendenteHistoricoId, setEditPendenteHistoricoId] = useState<string>('');
  const [editPendenteNovaDescricao, setEditPendenteNovaDescricao] = useState<string>('');
  const [editPendenteShowNovaDescricao, setEditPendenteShowNovaDescricao] = useState<boolean>(false);
  const [editPendenteDataVencimento, setEditPendenteDataVencimento] = useState<string>('');
  const [editPendenteValorPagar, setEditPendenteValorPagar] = useState<string>('');
  const [editPendenteSubmitting, setEditPendenteSubmitting] = useState<boolean>(false);
  const [editPendenteError, setEditPendenteError] = useState<string | null>(null);

  const [showAbertoCrediariosModal, setShowAbertoCrediariosModal] = useState<boolean>(false);

  // Estados do Modal de Relatório PDF
  const [showPdfReportModal, setShowPdfReportModal] = useState<boolean>(false);
  const [pdfStartDate, setPdfStartDate] = useState<string>('');
  const [pdfEndDate, setPdfEndDate] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

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
    setBaixaReferenteA(launch.referente_a || '');
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
          referente_a: baixaReferenteA,
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

  const handleOpenEditModal = (launch: Crediario) => {
    setSelectedLaunchForEdit(launch);
    setEditReferenteA(launch.referente_a || '');
    
    let formattedDate = '';
    if (launch.data_compra) {
      try {
        const d = new Date(launch.data_compra);
        if (!isNaN(d.getTime())) {
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch {}
    }
    setEditDataCompra(formattedDate);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchForEdit) return;

    setEditSubmitting(true);
    setEditError(null);

    try {
      const updatedDataCompra = editDataCompra ? new Date(editDataCompra + 'T12:00:00Z').toISOString() : null;
      const updatedReferenteA = editReferenteA.trim() || null;

      const { data, error } = await supabase
        .from('crediarios')
        .update({
          data_compra: updatedDataCompra,
          referente_a: updatedReferenteA,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLaunchForEdit.id)
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

      setShowEditModal(false);
      setSelectedLaunchForEdit(null);
    } catch (err: any) {
      console.error('Erro ao editar lançamento:', err);
      setEditError(err.message || 'Erro ao salvar alterações.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenEditPendenteModal = (launch: Crediario) => {
    setSelectedLaunchForEditPendente(launch);

    let formattedDataCompra = '';
    if (launch.data_compra) {
      try {
        const d = new Date(launch.data_compra);
        if (!isNaN(d.getTime())) {
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          formattedDataCompra = `${year}-${month}-${day}`;
        }
      } catch {}
    }
    setEditPendenteDataCompra(formattedDataCompra);

    setEditPendenteReferenteA(launch.referente_a || '');
    setEditPendenteHistoricoId(launch.historico_id || (historicos.length > 0 ? historicos[0].id : ''));
    setEditPendenteNovaDescricao('');
    setEditPendenteShowNovaDescricao(false);

    let formattedDataVencimento = '';
    if (launch.data_vencimento) {
      try {
        const d = new Date(launch.data_vencimento);
        if (!isNaN(d.getTime())) {
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          formattedDataVencimento = `${year}-${month}-${day}`;
        }
      } catch {}
    }
    setEditPendenteDataVencimento(formattedDataVencimento);

    setEditPendenteValorPagar(formatCurrencyInput(Number(launch.valor_pagar || 0)));
    setEditPendenteError(null);
    setShowEditPendenteModal(true);
  };

  const handleConfirmEditPendente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunchForEditPendente) return;

    setEditPendenteSubmitting(true);
    setEditPendenteError(null);

    const valorPagarNum = parseCurrencyInputToNumber(editPendenteValorPagar);
    if (valorPagarNum <= 0) {
      setEditPendenteError('O valor a pagar deve ser maior que zero.');
      setEditPendenteSubmitting(false);
      return;
    }

    try {
      let finalHistoricoId = editPendenteHistoricoId;

      if (editPendenteShowNovaDescricao) {
        if (!editPendenteNovaDescricao.trim()) {
          setEditPendenteError('A descrição do novo histórico é obrigatória.');
          setEditPendenteSubmitting(false);
          return;
        }

        const { data: newHist, error: histErr } = await supabase
          .from('historico')
          .insert([{ descricao: editPendenteNovaDescricao.trim() }])
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
        setEditPendenteError('Selecione ou crie um histórico.');
        setEditPendenteSubmitting(false);
        return;
      }

      const updatedDataCompra = editPendenteDataCompra ? new Date(editPendenteDataCompra + 'T12:00:00Z').toISOString() : null;
      const updatedDataVencimento = editPendenteDataVencimento ? new Date(editPendenteDataVencimento + 'T12:00:00Z').toISOString() : null;
      const updatedReferenteA = editPendenteReferenteA.trim() || null;

      const { data, error } = await supabase
        .from('crediarios')
        .update({
          data_compra: updatedDataCompra,
          referente_a: updatedReferenteA,
          historico_id: finalHistoricoId,
          data_vencimento: updatedDataVencimento,
          valor_pagar: valorPagarNum,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLaunchForEditPendente.id)
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

      setShowEditPendenteModal(false);
      setSelectedLaunchForEditPendente(null);
    } catch (err: any) {
      console.error('Erro ao alterar parcela pendente:', err);
      setEditPendenteError(err.message || 'Erro ao salvar alterações.');
    } finally {
      setEditPendenteSubmitting(false);
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
  const [createReferenteA, setCreateReferenteA] = useState<string>('');
  const [createDataCompra, setCreateDataCompra] = useState<string>('');

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
    setCreateReferenteA('');
    setCreateDataCompra(localISOTime);

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
    setCreateReferenteA('');
    setCreateDataCompra(localISOTime);

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
            valor_pago: 0,
            data_pagamento: null,
            data_vencimento: new Date(createDataVencimento + 'T12:00:00Z').toISOString(),
            forma_pagamento: null,
            valor_taxa_cartao: 0,
            referente_a: createReferenteA.trim() || null,
            data_compra: createDataCompra ? new Date(createDataCompra + 'T12:00:00Z').toISOString() : null
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
            referente_a: createReferenteA.trim() || null,
            data_compra: createDataCompra ? new Date(createDataCompra + 'T12:00:00Z').toISOString() : null
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


  // Geração do Relatório PDF de Inadimplentes
  const generatePdfReport = () => {
    if (!pdfStartDate || !pdfEndDate) return;
    setIsGeneratingPdf(true);

    try {
      const startDate = new Date(pdfStartDate + 'T00:00:00Z');
      const endDate = new Date(pdfEndDate + 'T23:59:59Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrar crediários: em aberto (sem pagamento), vencidos, e dentro do período de vencimento
      const overdueItems = crediarios.filter((c) => {
        const pagar = Number(c.valor_pagar || 0);
        const pago = Number(c.valor_pago || 0);
        const isPending = !c.data_pagamento && pagar > pago;
        if (!isPending) return false;

        if (!c.data_vencimento) return false;
        const vencDate = new Date(c.data_vencimento);
        const isOverdue = vencDate.getTime() < today.getTime();
        if (!isOverdue) return false;

        // Verifica se a data de vencimento está dentro do período selecionado
        return vencDate >= startDate && vencDate <= endDate;
      });

      // Agrupar por cliente
      const grouped: Record<string, {
        nome: string;
        celular: string;
        items: typeof overdueItems;
        totalPendente: number;
      }> = {};

      overdueItems.forEach((c) => {
        const clienteId = c.crediarios_clientes?.cliente_id || 'unknown';
        const nome = c.crediarios_clientes?.clientes?.nome || 'Sem Cliente';
        const celular = c.crediarios_clientes?.clientes?.celular || '';
        const pagar = Number(c.valor_pagar || 0);
        const pago = Number(c.valor_pago || 0);
        const pendente = pagar - pago;

        if (!grouped[clienteId]) {
          grouped[clienteId] = { nome, celular, items: [], totalPendente: 0 };
        }
        grouped[clienteId].items.push(c);
        grouped[clienteId].totalPendente += pendente;
      });

      const sortedClients = Object.values(grouped).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      const totalGeral = sortedClients.reduce((sum, c) => sum + c.totalPendente, 0);

      const fmtCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      const fmtDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      };

      const startFormatted = new Date(pdfStartDate + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const endFormatted = new Date(pdfEndDate + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const generatedAt = new Date().toLocaleString('pt-BR');

      const clientRows = sortedClients.map((client) => {
        const itemRows = client.items
          .sort((a, b) => new Date(a.data_vencimento || 0).getTime() - new Date(b.data_vencimento || 0).getTime())
          .map((item) => {
            const pagar = Number(item.valor_pagar || 0);
            const pago = Number(item.valor_pago || 0);
            const pendente = pagar - pago;
            const daysOverdue = item.data_vencimento
              ? Math.floor((today.getTime() - new Date(item.data_vencimento).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            return `
              <tr>
                <td>${item.historico?.descricao || '-'}</td>
                <td>${item.referente_a || '-'}</td>
                <td>${item.parcelas || '1/1'}</td>
                <td class="date">${fmtDate(item.data_vencimento)}</td>
                <td class="amount">${fmtCurrency(pagar)}</td>
                <td class="amount paid">${fmtCurrency(pago)}</td>
                <td class="amount overdue">${fmtCurrency(pendente)}</td>
                <td class="days"><span class="days-badge">${daysOverdue}d</span></td>
              </tr>`;
          }).join('');

        return `
          <div class="client-block">
            <div class="client-header">
              <div class="client-info">
                <span class="client-name">${client.nome}</span>
                ${client.celular ? `<span class="client-phone">${client.celular}</span>` : ''}
              </div>
              <div class="client-total">
                <span class="total-label">Total Pendente</span>
                <span class="total-value">${fmtCurrency(client.totalPendente)}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Histórico</th>
                  <th>Referente a</th>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Valor Total</th>
                  <th>Pago</th>
                  <th>Pendente</th>
                  <th>Atraso</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>`;
      }).join('');

      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Inadimplentes - MundoFitness</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11px;
      color: #1e293b;
      background: white;
      padding: 24px 28px;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 2px solid #7c3aed;
      margin-bottom: 20px;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 16px;
    }
    .brand-text { font-size: 18px; font-weight: 800; color: #7c3aed; }
    .brand-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .report-meta { text-align: right; }
    .report-title { font-size: 14px; font-weight: 700; color: #1e293b; }
    .report-period { font-size: 10px; color: #64748b; margin-top: 3px; }
    .report-generated { font-size: 9px; color: #94a3b8; margin-top: 2px; }
    .summary-banner {
      background: linear-gradient(135deg, #7c3aed15, #a855f715);
      border: 1px solid #7c3aed30;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      gap: 32px;
      align-items: center;
    }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 9px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 16px; font-weight: 800; color: #1e293b; }
    .summary-value.red { color: #dc2626; }
    .client-block { margin-bottom: 18px; page-break-inside: avoid; }
    .client-header {
      background: linear-gradient(135deg, #f8f4ff, #f3e8ff);
      border: 1px solid #e9d5ff;
      border-radius: 8px 8px 0 0;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .client-info { display: flex; flex-direction: column; gap: 2px; }
    .client-name { font-weight: 700; font-size: 12px; color: #4c1d95; }
    .client-phone { font-size: 9px; color: #7c3aed; }
    .client-total { text-align: right; }
    .total-label { font-size: 9px; color: #7c3aed; display: block; font-weight: 600; text-transform: uppercase; }
    .total-value { font-size: 13px; font-weight: 800; color: #dc2626; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e9d5ff; border-top: none; }
    thead tr { background: #4c1d95; }
    thead th { padding: 7px 10px; text-align: left; color: white; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    thead th.amount, thead th.days { text-align: right; }
    tbody tr { border-bottom: 1px solid #f1f5f9; }
    tbody tr:nth-child(even) { background: #fafafa; }
    tbody td { padding: 7px 10px; vertical-align: middle; }
    td.date { white-space: nowrap; color: #64748b; }
    td.amount { text-align: right; font-weight: 600; }
    td.paid { color: #16a34a; }
    td.overdue { color: #dc2626; font-weight: 700; }
    td.days { text-align: right; }
    .days-badge {
      display: inline-block;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 99px;
      padding: 1px 7px;
      font-size: 9px;
      font-weight: 700;
    }
    .report-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-total {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }
    .footer-total span { color: #dc2626; }
    .footer-note { font-size: 9px; color: #94a3b8; }
    @media print {
      body { padding: 15px 20px; }
      .client-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="brand">
      <div class="brand-logo">M</div>
      <div>
        <div class="brand-text">MundoFitness</div>
        <div class="brand-sub">Sistema de Gestão</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">Relatório de Inadimplentes</div>
      <div class="report-period">Período de vencimento: ${startFormatted} a ${endFormatted}</div>
      <div class="report-generated">Gerado em: ${generatedAt}</div>
    </div>
  </div>

  <div class="summary-banner">
    <div class="summary-item">
      <span class="summary-label">Total de Clientes</span>
      <span class="summary-value">${sortedClients.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Total de Lançamentos</span>
      <span class="summary-value">${overdueItems.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Total Inadimplente</span>
      <span class="summary-value red">${fmtCurrency(totalGeral)}</span>
    </div>
  </div>

  ${sortedClients.length === 0
    ? '<p style="text-align:center; padding: 40px; color: #94a3b8; font-size: 14px;">Nenhum pagamento vencido encontrado para o período selecionado.</p>'
    : clientRows
  }

  <div class="report-footer">
    <div class="footer-total">Total Geral Pendente: <span>${fmtCurrency(totalGeral)}</span></div>
    <div class="footer-note">Relatório gerado pelo sistema MundoFitness &bull; ${generatedAt}</div>
  </div>
</body>
</html>`;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 800);
      }

      setShowPdfReportModal(false);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenPdfModal = () => {
    // Default: último mês completo vencido
    const today = new Date();
    const firstDayThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const lastDayPrevMonth = new Date(firstDayThisMonth.getTime() - 1);
    const firstDayPrevMonth = new Date(Date.UTC(lastDayPrevMonth.getUTCFullYear(), lastDayPrevMonth.getUTCMonth(), 1));

    const toInputDate = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setPdfStartDate(toInputDate(firstDayPrevMonth));
    setPdfEndDate(toInputDate(lastDayPrevMonth));
    setShowPdfReportModal(true);
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
      totalAberto += c.data_pagamento ? 0 : Math.max(0, pagar - pago);
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

  // Crediários em aberto do período geral filtrado
  const abertoCrediarios = useMemo(() => {
    const list = filteredByPeriod.filter((c) => {
      const pagar = Number(c.valor_pagar || 0);
      const pago = Number(c.valor_pago || 0);
      return !c.data_pagamento && (pagar - pago > 0);
    });

    return list.sort((a, b) => {
      const clientNameA = a.crediarios_clientes?.clientes?.nome || 'Sem Cliente';
      const isOverdueA = !!(a.data_vencimento && new Date(a.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0));

      const clientNameB = b.crediarios_clientes?.clientes?.nome || 'Sem Cliente';
      const isOverdueB = !!(b.data_vencimento && new Date(b.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0));

      // 1. Atrasados primeiro
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // 2. Ordem alfabética
      return clientNameA.localeCompare(clientNameB);
    });
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
      groups[clienteId].totalAberto += c.data_pagamento ? 0 : Math.max(0, pagar - pago);
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
      } else if (clientStatusFilter === 'Com Pendência no Mês') {
        matchStatus = client.launches.some(launch => {
          const pagar = Number(launch.valor_pagar || 0);
          const pago = Number(launch.valor_pago || 0);
          const isAberto = !launch.data_pagamento && pagar > pago;
          return isAberto && matchPeriod(launch);
        });
      } else if (clientStatusFilter === 'Quitados') {
        matchStatus = client.totalAberto === 0;
      }

      return matchText && matchGlobal && matchStatus;
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [clientGroups, clientSearch, globalSearch, clientStatusFilter, selectedMonth, selectedYear]);

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
      const isAberto = !launch.data_pagamento && pagar > pago;

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

  // Paginação dos Lançamentos
  const totalLaunchesPages = Math.ceil(filteredLaunches.length / itemsPerPage);

  const paginatedLaunches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLaunches.slice(start, start + itemsPerPage);
  }, [filteredLaunches, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalLaunchesPages, start + 5 - 1);
    if (end - start + 1 < 5) {
      start = Math.max(1, end - 5 + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    if (currentPage > totalLaunchesPages && totalLaunchesPages > 0) {
      setCurrentPage(totalLaunchesPages);
    }
  }, [filteredLaunches.length, totalLaunchesPages, currentPage]);


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
                      onClick={() => setSelectedYear(prev => (prev ? prev - 1 : new Date().getFullYear()))}
                      className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`font-extrabold text-base ${A.textPrimary}`}>
                      {selectedYear || new Date().getFullYear()}
                    </span>
                    <button
                      onClick={() => setSelectedYear(prev => (prev ? prev + 1 : new Date().getFullYear()))}
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
                              setSelectedYear(new Date().getFullYear());
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
            onClick={handleOpenPdfModal}
            className="flex items-center gap-2 border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 py-2.5 px-4 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98] text-sm"
            title="Gerar relatório PDF de pagamentos vencidos em aberto"
          >
            <FileText size={16} />
            Relatório PDF
          </button>

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
          className="border border-purple-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-200/60 text-brand-purple">
                <Receipt size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                Lançamentos
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 bg-purple-200/50 text-purple-855">
              Qtd: {metrics.count}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black tracking-tight text-purple-950">
              {formatCurrency(metrics.totalPagar)}
            </h4>
            <p className="text-[10px] text-purple-800/80 font-medium mt-1">
              Valor total a receber lançado
            </p>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-brand-purple h-full rounded-full w-full" />
          </div>
        </div>

        {/* Total Recebido */}
        <div
          className="border border-purple-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-200/60 text-emerald-600">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                Total Recebido
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 bg-purple-200/50 text-emerald-700">
              Pago
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black tracking-tight text-purple-950">
              {formatCurrency(metrics.totalPago)}
            </h4>
            <p className="text-[10px] text-purple-800/80 font-medium mt-1">
              Total pago no período
            </p>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPagar > 0 ? (metrics.totalPago / metrics.totalPagar) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Total Em Aberto */}
        <div
          onClick={() => setShowAbertoCrediariosModal(true)}
          className="border border-purple-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left text-purple-950 cursor-pointer shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-200/60 text-rose-600">
                <DollarSign size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                Total Em Aberto
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 bg-purple-200/50 text-rose-700">
              Pendente
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black tracking-tight text-purple-950">
              {formatCurrency(metrics.totalAberto)}
            </h4>
            <p className="text-[10px] text-purple-800/80 font-medium mt-1">
              Valor pendente de recebimento
            </p>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPagar > 0 ? (metrics.totalAberto / metrics.totalPagar) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Taxas do Cartão */}
        <div
          className="border border-purple-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden text-left text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-200/60 text-amber-600">
                <Percent size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                Taxas de Cartão
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 bg-purple-200/50 text-amber-700">
              Despesa
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black tracking-tight text-purple-950">
              {formatCurrency(metrics.totalTaxas)}
            </h4>
            <p className="text-[10px] text-purple-800/80 font-medium mt-1">
              Custo total de taxas de cartão
            </p>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.totalPago > 0 ? (metrics.totalTaxas / metrics.totalPago) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seção Principal de Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* COLUNA 1: Lista de Clientes (lg:col-span-3) */}
        <div className={`lg:col-span-3 flex flex-col lg:h-[calc(100vh-380px)] lg:min-h-[480px] h-[550px] border ${A.border} ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
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
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
              />
              {clientSearch && (
                <button
                  type="button"
                  onClick={() => setClientSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Limpar"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            
            {/* Filtros Rápido de Status (Pill) */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {(['Todos', 'Com Pendências', 'Com Pendência no Mês', 'Quitados'] as const).map((status) => {
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

        {/* COLUNA 2: Lançamentos Detalhados (lg:col-span-9) */}
        <div className={`lg:col-span-9 flex flex-col lg:h-[calc(100vh-380px)] lg:min-h-[480px] h-[550px] border ${A.border} ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
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
                <div 
                  className="grid grid-cols-4 gap-2 sm:gap-4 mt-3 p-4 rounded-2xl border border-purple-200 shadow-sm text-xs text-purple-950"
                  style={{ backgroundColor: '#EFE0F8' }}
                >
                  <div>
                    <span className="block text-purple-900/70 text-[10px] font-semibold mb-1">Total Lançado</span>
                    <span className="text-base sm:text-lg font-bold text-purple-950">
                      {formatCurrency(selectedClientData.totalPagar)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-purple-900/70 text-[10px] font-semibold mb-1">Total Pago</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-700">
                      {formatCurrency(selectedClientData.totalPago)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-purple-900/70 text-[10px] font-semibold mb-1">Total Aberto</span>
                    <span className="text-base sm:text-lg font-bold text-rose-700">
                      {formatCurrency(selectedClientData.totalAberto)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-purple-900/70 text-[10px] font-semibold mb-1">Lançamentos</span>
                    <span className="text-base sm:text-lg font-bold text-purple-950">
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
                    className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
                  />
                  {launchSearch && (
                    <button
                      type="button"
                      onClick={() => setLaunchSearch('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Limpar"
                    >
                      <X size={12} />
                    </button>
                  )}
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
                <div className="col-span-1">COMPRA</div>
                <div className="col-span-3">REFERENTE</div>
                <div className="col-span-1">HISTÓRICO</div>
                <div className="col-span-1">VENC.</div>
                <div className="col-span-1">TIPO/PARC.</div>
                <div className="col-span-1">A PAGAR</div>
                <div className="col-span-2">PAGO/FORMA</div>
                <div className="col-span-1">PAGO EM</div>
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
                  paginatedLaunches.map((launch, idx) => {
                    const pagar = Number(launch.valor_pagar || 0);
                    const pago = Number(launch.valor_pago || 0);
                    const isPago = !!launch.data_pagamento || (pagar <= pago && pago > 0);
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
                        <div className="col-span-1 text-slate-600 dark:text-slate-300 font-medium">
                          {formatDate(launch.data_compra)}
                        </div>
                        <div className="col-span-3 text-slate-700 dark:text-slate-200 font-semibold truncate" title={launch.referente_a || '-'}>
                          {launch.referente_a || '-'}
                        </div>
                        <div className="col-span-1 text-slate-700 dark:text-slate-200 font-semibold truncate" title={launch.historico?.descricao || '-'}>
                          {launch.historico?.descricao || '-'}
                        </div>
                        <div className="col-span-1 text-slate-600 dark:text-slate-300 font-medium">
                          {formatDate(launch.data_vencimento)}
                        </div>
                        <div className="col-span-1 text-slate-600 dark:text-slate-300 font-medium truncate">
                          {launch.tipo_pagamento === 'Crediário' 
                            ? `Cred.${launch.parcelas ? ` (${launch.parcelas})` : ''}` 
                            : 'À Vista'}
                        </div>
                        <div className="col-span-1 font-bold text-brand-purple dark:text-purple-400">
                          {formatCurrency(launch.valor_pagar)}
                        </div>
                        <div className="col-span-2 text-left">
                          {isPago ? (
                            <>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                {formatCurrency(launch.valor_pago)}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block leading-tight">
                                {launch.forma_pagamento || 'PIX'}
                                {Number(launch.valor_taxa_cartao || 0) > 0 && ` (Taxa: ${formatCurrency(launch.valor_taxa_cartao)})`}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">-</span>
                          )}
                        </div>
                        <div className="col-span-1 text-slate-600 dark:text-slate-300 font-medium">
                          {isPago ? formatDate(launch.data_pagamento) : '-'}
                        </div>
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          {!isPago && (
                            <>
                              <button
                                onClick={() => handleOpenBaixaModal(launch)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors active:scale-95 cursor-pointer"
                                title="Dar Baixa no Pagamento"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEditPendenteModal(launch)}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors active:scale-95 cursor-pointer"
                                title="Alterar Parcela Pendente"
                              >
                                <Pencil size={16} />
                              </button>
                            </>
                          )}
                          {isPago && (
                            <button
                              onClick={() => handleOpenEditModal(launch)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors active:scale-95 cursor-pointer"
                              title="Editar Dados do Lançamento Pago"
                            >
                              <Pencil size={16} />
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

              {/* Paginação footer para Lançamentos */}
              {totalLaunchesPages > 1 && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t ${A.border} ${A.bgLight}`}>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Exibindo <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredLaunches.length)}</span> a{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, filteredLaunches.length)}</span> de{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{filteredLaunches.length}</span> lançamentos
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        currentPage === 1
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-brand-purple hover:border-brand-purple active:scale-95'
                      }`}
                      title="Página Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          currentPage === pageNum
                            ? 'bg-brand-purple border-brand-purple text-white shadow-md shadow-brand-purple/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-purple hover:border-brand-purple active:scale-95'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalLaunchesPages))}
                      disabled={currentPage === totalLaunchesPages}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        currentPage === totalLaunchesPages
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-brand-purple hover:border-brand-purple active:scale-95'
                      }`}
                      title="Próxima Página"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
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
      {/* MODAL: DETALHES DE CREDIÁRIOS EM ABERTO */}
      <AnimatePresence>
        {showAbertoCrediariosModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${A.card} w-full max-w-lg p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
            >
              <div className="flex justify-between items-center mb-4 border-b border-dashed pb-3 border-slate-200 dark:border-slate-700/50">
                <div>
                  <h3 className={`text-lg font-bold ${A.textPrimary}`}>Crediários em Aberto (Período)</h3>
                  <p className={`text-xs ${A.textMuted} mt-0.5`}>
                    Período: <strong className="text-brand-purple">
                      {selectedMonth !== null && selectedYear !== null 
                        ? `${monthsNames[selectedMonth]}/${selectedYear}` 
                        : 'Todos os Períodos'}
                    </strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAbertoCrediariosModal(false)}
                  className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {abertoCrediarios.length === 0 ? (
                  <p className={`text-sm ${A.textMuted} text-center py-6`}>
                    Nenhum crediário em aberto encontrado para este período.
                  </p>
                ) : (
                  abertoCrediarios.map((item) => {
                    const clientName = item.crediarios_clientes?.clientes?.nome || 'Sem Cliente';
                    const phone = item.crediarios_clientes?.clientes?.celular || '';
                    const outrasInfo = item.crediarios_clientes?.clientes?.outrasinformacoes || '';
                    const pagar = Number(item.valor_pagar || 0);
                    const pago = Number(item.valor_pago || 0);
                    const valorPendente = pagar - pago;
                    const isOverdue =
                      item.data_vencimento &&
                      new Date(item.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0);

                    // Formatar celular para link do WhatsApp se existir
                    const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
                    const whatsappUrl = formattedPhone 
                      ? `https://wa.me/55${formattedPhone}` 
                      : '#';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border ${A.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isOverdue 
                            ? 'border-rose-200 bg-rose-50/5 dark:border-rose-950/30' 
                            : ''
                        }`}
                      >
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-sm ${A.textPrimary}`}>{clientName}</span>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                                Atrasado
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-400">Ref:</span> {item.referente_a || '-'}
                          </p>

                          {outrasInfo && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-400">Obs:</span> {outrasInfo}
                            </p>
                          )}

                          {phone ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-purple hover:underline"
                            >
                              <svg className="w-3.5 h-3.5 fill-current text-emerald-500" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.01 14.12 1.01 11.49 1.01 6.05 1.01 1.625 5.378 1.62 10.81c-.001 1.716.452 3.39 1.311 4.877L1.97 20.082l4.677-1.228zM17.15 14.71c-.302-.15-1.791-.88-2.072-.982-.281-.103-.485-.15-.69.15-.205.302-.797.982-.976 1.186-.18.205-.359.23-.66.08-1.597-.798-2.613-1.47-3.663-3.274-.27-.464.27-.43.774-1.434.085-.17.043-.321-.02-.472-.064-.15-.485-1.168-.665-1.597-.175-.42-.367-.362-.505-.369-.13-.007-.28-.009-.43-.009-.15 0-.395.056-.6.282-.206.226-.785.767-.785 1.87s.803 2.17.916 2.32c.113.15 1.58 2.413 3.827 3.38.535.23 1.034.39 1.389.5.54.17 1.03.145 1.42.087.43-.064 1.79-.731 2.046-1.402.256-.67.256-1.246.18-1.402-.077-.15-.282-.25-.584-.4z"/>
                              </svg>
                              {phone}
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">Sem telefone cadastrado</span>
                          )}
                        </div>

                        <div className="text-right space-y-1 sm:self-center">
                          <p className="font-extrabold text-sm text-[#7C3AED] dark:text-[#a855f7]">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(valorPendente)}
                          </p>
                          <p className={`text-[10px] font-semibold ${A.textMuted}`}>
                            Venc: {formatDate(item.data_vencimento)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-end pt-4 mt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowAbertoCrediariosModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    Referente a
                  </label>
                  <input
                    type="text"
                    value={baixaReferenteA}
                    onChange={(e) => setBaixaReferenteA(e.target.value)}
                    placeholder="Descrição referente ao lançamento..."
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

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

      {/* MODAL DE EDIÇÃO DE PAGAMENTO BAIXADO */}
      <AnimatePresence>
        {showEditModal && selectedLaunchForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-[24px] border ${A.border} ${A.card} p-6 shadow-2xl space-y-4 text-left`}
            >
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-brand-purple">
                  <Pencil size={24} />
                  <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                    Editar Lançamento Pago
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLaunchForEdit(null);
                  }}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textMuted} hover:text-rose-500 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold shadow-sm">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="text-xs space-y-1.5">
                <p className={`${A.textMuted}`}>
                  Cliente: <strong className={`${A.textPrimary}`}>{selectedClientData?.nome}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Histórico: <strong className={`${A.textPrimary}`}>{selectedLaunchForEdit.historico?.descricao || '-'}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Valor Lançado: <strong className={`${A.textPrimary}`}>{formatCurrency(selectedLaunchForEdit.valor_pagar)}</strong>
                </p>
                <p className={`${A.textMuted}`}>
                  Valor Pago: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedLaunchForEdit.valor_pago || 0)}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirmEdit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={editDataCompra}
                    onChange={(e) => setEditDataCompra(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Referente a
                  </label>
                  <input
                    type="text"
                    value={editReferenteA}
                    onChange={(e) => setEditReferenteA(e.target.value)}
                    placeholder="Ex: mensalidade, suplementos"
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedLaunchForEdit(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {editSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE ALTERAÇÃO DE PARCELA PENDENTE */}
      <AnimatePresence>
        {showEditPendenteModal && selectedLaunchForEditPendente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-[24px] border ${A.border} ${A.card} p-6 shadow-2xl space-y-4 my-8 text-left`}
            >
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-brand-purple">
                  <Pencil size={24} />
                  <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                    Alterar Parcela Pendente
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPendenteModal(false);
                    setSelectedLaunchForEditPendente(null);
                  }}
                  className={`p-1.5 rounded-lg ${A.bgHover} ${A.textMuted} hover:text-rose-500 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {editPendenteError && (
                <div className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold shadow-sm">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{editPendenteError}</span>
                </div>
              )}

              <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className={`${A.textMuted}`}>
                  Cliente: <strong className={`${A.textPrimary}`}>{selectedClientData?.nome}</strong>
                </p>
                {selectedLaunchForEditPendente.parcelas && (
                  <p className={`${A.textMuted}`}>
                    Parcela: <strong className={`${A.textPrimary}`}>{selectedLaunchForEditPendente.parcelas} ({selectedLaunchForEditPendente.tipo_pagamento || 'Crediário'})</strong>
                  </p>
                )}
              </div>

              <form onSubmit={handleConfirmEditPendente} className="space-y-4 pt-1">
                {/* 1. Histórico / Descrição */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Histórico / Descrição *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditPendenteShowNovaDescricao(!editPendenteShowNovaDescricao);
                        setEditPendenteNovaDescricao('');
                      }}
                      className="text-[10px] font-bold text-brand-purple hover:underline cursor-pointer"
                    >
                      {editPendenteShowNovaDescricao ? 'Selecionar Existente' : '+ Criar Novo Histórico'}
                    </button>
                  </div>

                  {editPendenteShowNovaDescricao ? (
                    <input
                      type="text"
                      required
                      value={editPendenteNovaDescricao}
                      onChange={(e) => setEditPendenteNovaDescricao(e.target.value)}
                      placeholder="Descrição do novo histórico (ex: Venda Luva)"
                      className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                    />
                  ) : (
                    <select
                      value={editPendenteHistoricoId}
                      onChange={(e) => setEditPendenteHistoricoId(e.target.value)}
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

                {/* 2. Referente a */}
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Referente a
                  </label>
                  <input
                    type="text"
                    value={editPendenteReferenteA}
                    onChange={(e) => setEditPendenteReferenteA(e.target.value)}
                    placeholder="Ex: mensalidade, suplementos"
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                {/* 3. Data da Compra e Valor a Pagar */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Data da Compra
                    </label>
                    <input
                      type="date"
                      value={editPendenteDataCompra}
                      onChange={(e) => setEditPendenteDataCompra(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Valor a Pagar *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPendenteValorPagar}
                      onChange={(e) => setEditPendenteValorPagar(formatCurrencyInput(e.target.value))}
                      placeholder="R$ 0,00"
                      className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                    />
                  </div>
                </div>

                {/* 4. Data de Vencimento */}
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={editPendenteDataVencimento}
                    onChange={(e) => setEditPendenteDataVencimento(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPendenteModal(false);
                      setSelectedLaunchForEditPendente(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all cursor-pointer`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editPendenteSubmitting}
                    className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {editPendenteSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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
                          className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none transition-all`}
                        />
                        {newLaunchClientSearch && (
                          <button
                            type="button"
                            onClick={() => setNewLaunchClientSearch('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Limpar"
                          >
                            <X size={12} />
                          </button>
                        )}
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
                    {/* 2. Histórico / Descrição */}
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

                    {/* 3. Referente a */}
                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                        Referente a
                      </label>
                      <input
                        type="text"
                        value={createReferenteA}
                        onChange={(e) => setCreateReferenteA(e.target.value)}
                        placeholder="Ex: mensalidade, suplementos"
                        className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                      />
                    </div>

                    {/* 4. Data da Compra e Valor Total */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                          Data da Compra *
                        </label>
                        <input
                          type="date"
                          required
                          value={createDataCompra}
                          onChange={(e) => setCreateDataCompra(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                        />
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
                    </div>

                    {/* 5. Vencimento / Parcelas */}
                    {createType === 'A vista' ? (
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                          Data de Vencimento *
                        </label>
                        <input
                          type="date"
                          required
                          value={createDataVencimento}
                          onChange={(e) => setCreateDataVencimento(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                        />
                      </div>
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
                              Data de Vencimento *
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

      {/* MODAL: RELATÓRIO PDF DE INADIMPLENTES */}
      <AnimatePresence>
        {showPdfReportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${A.textPrimary}`}>Relatório de Inadimplentes</h3>
                    <p className={`text-[11px] ${A.textMuted} mt-0.5`}>Pagamentos vencidos e em aberto</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPdfReportModal(false)}
                  className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/40 mb-5">
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  O relatório listará <strong>todos os pagamentos vencidos e não pagos</strong> cujo vencimento esteja dentro do período selecionado, agrupados por cliente.
                </p>
              </div>

              {/* Inputs de Período */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Data Início *
                    </label>
                    <input
                      type="date"
                      value={pdfStartDate}
                      onChange={(e) => setPdfStartDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Data Fim *
                    </label>
                    <input
                      type="date"
                      value={pdfEndDate}
                      onChange={(e) => setPdfEndDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                    />
                  </div>
                </div>

                {/* Preview count */}
                {pdfStartDate && pdfEndDate && (() => {
                  const startD = new Date(pdfStartDate + 'T00:00:00Z');
                  const endD = new Date(pdfEndDate + 'T23:59:59Z');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const count = crediarios.filter((c) => {
                    const pagar = Number(c.valor_pagar || 0);
                    const pago = Number(c.valor_pago || 0);
                    if (!(!c.data_pagamento && pagar > pago)) return false;
                    if (!c.data_vencimento) return false;
                    const venc = new Date(c.data_vencimento);
                    return venc.getTime() < today.getTime() && venc >= startD && venc <= endD;
                  }).length;
                  const total = crediarios
                    .filter((c) => {
                      const pagar = Number(c.valor_pagar || 0);
                      const pago = Number(c.valor_pago || 0);
                      if (!(!c.data_pagamento && pagar > pago)) return false;
                      if (!c.data_vencimento) return false;
                      const venc = new Date(c.data_vencimento);
                      return venc.getTime() < today.getTime() && venc >= startD && venc <= endD;
                    })
                    .reduce((sum, c) => sum + (Number(c.valor_pagar || 0) - Number(c.valor_pago || 0)), 0);
                  return (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Receipt size={15} className="text-brand-purple" />
                        <span className={`text-xs font-semibold ${A.textMuted}`}>
                          {count} lançamento{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-rose-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </span>
                    </div>
                  );
                })()}

                {/* Atalhos de Período */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Atalhos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Últimos 30 dias', getDates: () => {
                        const end = new Date();
                        end.setDate(end.getDate() - 1);
                        const start = new Date();
                        start.setDate(start.getDate() - 30);
                        return { s: start, e: end };
                      }},
                      { label: 'Últimos 90 dias', getDates: () => {
                        const end = new Date();
                        end.setDate(end.getDate() - 1);
                        const start = new Date();
                        start.setDate(start.getDate() - 90);
                        return { s: start, e: end };
                      }},
                      { label: 'Este ano', getDates: () => {
                        const now = new Date();
                        return {
                          s: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
                          e: new Date()
                        };
                      }},
                      { label: 'Tudo', getDates: () => {
                        return {
                          s: new Date(Date.UTC(2020, 0, 1)),
                          e: new Date()
                        };
                      }},
                    ].map(({ label, getDates }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const { s, e } = getDates();
                          const fmt = (d: Date) => {
                            const y = d.getUTCFullYear();
                            const m = String(d.getUTCMonth() + 1).padStart(2, '0');
                            const day = String(d.getUTCDate()).padStart(2, '0');
                            return `${y}-${m}-${day}`;
                          };
                          // For non-UTC shortcut dates
                          const fmtLocal = (d: Date) => {
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            return `${y}-${m}-${day}`;
                          };
                          setPdfStartDate(label === 'Este ano' || label === 'Tudo' ? fmt(s) : fmtLocal(s));
                          setPdfEndDate(label === 'Este ano' || label === 'Tudo' ? fmtLocal(e) : fmtLocal(e));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-purple hover:text-brand-purple transition-all`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPdfReportModal(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} ${A.textPrimary} transition-all`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={generatePdfReport}
                  disabled={!pdfStartDate || !pdfEndDate || isGeneratingPdf}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={15} />
                  {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CrediariosTab;

