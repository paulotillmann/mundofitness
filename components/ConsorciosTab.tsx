import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { DashboardContext } from '../DashboardContext';
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
  Trash2,
  Edit2,
  X,
  Filter,
  Search
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
    celular?: string;
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

const ConsorciosTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A, gruposList, consorciosList, clientesList, refreshConsorcios } = ctx;
  const isDark = A.bgLight === 'bg-slate-900';
  // Estado de Seleção
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  const [selectedConsorcioId, setSelectedConsorcioId] = useState<string | null>(null);
  const [selectedPagamentos, setSelectedPagamentos] = useState<Parcela[]>([]);
  const [selectedClienteNome, setSelectedClienteNome] = useState(''); // cs no código original
  const [grupoPagamentos, setGrupoPagamentos] = useState<Parcela[]>([]);
  const [activeGroupsPagamentos, setActiveGroupsPagamentos] = useState<Parcela[]>([]);

  // Buscas locais
  const [searchGrupo, setSearchGrupo] = useState('');
  const [searchCota, setSearchCota] = useState('');

  // Estados do Filtro de Mês/Ano
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [isFilterActive, setIsFilterActive] = useState<boolean>(true);
  const [showFilterCalendarPopover, setShowFilterCalendarPopover] = useState<boolean>(false);

  // Estados do Filtro de Cliente
  const [selectedFilterClienteId, setSelectedFilterClienteId] = useState<string | null>(null);
  const [clientFilterQuery, setClientFilterQuery] = useState<string>('');
  const [showClientFilterPopover, setShowClientFilterPopover] = useState<boolean>(false);

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

  const [showOpenInstallmentsModal, setShowOpenInstallmentsModal] = useState<boolean>(false);
  const [openInstallmentsScope, setOpenInstallmentsScope] = useState<'grupo' | 'ativos'>('grupo');

  // Estados para edição e exclusão de Cota (Consórcio)
  const [showEditCotaModal, setShowEditCotaModal] = useState<boolean>(false);
  const [cotaToEdit, setCotaToEdit] = useState<Consorcio | null>(null);
  const [editCotaNo, setEditCotaNo] = useState<string>('');
  const [editCotaVencimentoDia, setEditCotaVencimentoDia] = useState<string>('');
  const [editCotaDataRetirada, setEditCotaDataRetirada] = useState<string>('');
  const [editCotaMesRetirada, setEditCotaMesRetirada] = useState<string>('');
  const [isSavingCota, setIsSavingCota] = useState<boolean>(false);
  const [showEditRetiradaMonthPopover, setShowEditRetiradaMonthPopover] = useState<boolean>(false);
  const [editRetiradaYear, setEditRetiradaYear] = useState<number>(new Date().getFullYear());

  const [showDeleteCotaConfirmModal, setShowDeleteCotaConfirmModal] = useState<boolean>(false);
  const [cotaToDelete, setCotaToDelete] = useState<Consorcio | null>(null);
  const [isDeletingCota, setIsDeletingCota] = useState<boolean>(false);

  // Estados para inclusão de nova Cota (Consórcio)
  const [showAddCotaModal, setShowAddCotaModal] = useState<boolean>(false);
  const [newCotaClienteId, setNewCotaClienteId] = useState<string>('');
  const [newCotaNo, setNewCotaNo] = useState<string>('');
  const [newCotaVencimentoDia, setNewCotaVencimentoDia] = useState<string>('10');
  const [newCotaDataRetirada, setNewCotaDataRetirada] = useState<string>('');
  const [newCotaMesRetirada, setNewCotaMesRetirada] = useState<string>('');
  const [isSavingNewCota, setIsSavingNewCota] = useState<boolean>(false);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [showRetiradaMonthPopover, setShowRetiradaMonthPopover] = useState<boolean>(false);
  const [retiradaYear, setRetiradaYear] = useState<number>(new Date().getFullYear());

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

  // Buscar pagamentos de todo o grupo selecionado
  const fetchGrupoPagamentos = async (grupoId: string) => {
    try {
      const { data, error } = await supabase
        .from('consorcios_pagamentos')
        .select('*')
        .eq('grupo_id', grupoId);
      if (error) throw error;
      setGrupoPagamentos(data || []);
    } catch (err) {
      console.error('Erro ao buscar pagamentos do grupo:', err);
    }
  };

  // Buscar pagamentos de todos os grupos ativos
  const fetchActiveGroupsPagamentos = async (activeIds: string[]) => {
    if (activeIds.length === 0) {
      setActiveGroupsPagamentos([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('consorcios_pagamentos')
        .select('*')
        .in('grupo_id', activeIds);
      if (error) throw error;
      setActiveGroupsPagamentos(data || []);
    } catch (err) {
      console.error('Erro ao buscar pagamentos dos grupos ativos:', err);
    }
  };

  // Função auxiliar para atualizar todos os dados financeiros
  const refreshAllTotals = async () => {
    if (selectedConsorcioId) {
      await fetchPagamentos(selectedConsorcioId);
    }
    if (selectedGrupoId) {
      await fetchGrupoPagamentos(selectedGrupoId);
    }
    const activeIds = gruposList.filter((g) => !g.encerrado_boolean).map((g) => g.id);
    await fetchActiveGroupsPagamentos(activeIds);
  };

  useEffect(() => {
    if (!selectedConsorcioId) {
      setSelectedPagamentos([]);
      return;
    }
    fetchPagamentos(selectedConsorcioId);
  }, [selectedConsorcioId]);

  // Limpar ou auto-selecionar cota do cliente filtrado quando mudar o grupo selecionado
  useEffect(() => {
    if (selectedGrupoId && selectedFilterClienteId) {
      const cotaDoCliente = consorciosList.find(
        (c) => c.grupo_id === selectedGrupoId && c.cliente_id === selectedFilterClienteId
      );
      if (cotaDoCliente) {
        setSelectedConsorcioId(cotaDoCliente.id);
        setSelectedClienteNome(cotaDoCliente.clientes?.nome || 'Sem Cliente');
        return;
      }
    }
    setSelectedConsorcioId(null);
    setSelectedClienteNome('');
  }, [selectedGrupoId, selectedFilterClienteId, consorciosList]);

  // Carregar dados de pagamentos do grupo quando o grupo selecionado mudar
  useEffect(() => {
    if (selectedGrupoId) {
      fetchGrupoPagamentos(selectedGrupoId);
    } else {
      setGrupoPagamentos([]);
    }
  }, [selectedGrupoId]);

  // Carregar dados dos pagamentos dos grupos ativos
  useEffect(() => {
    const activeIds = gruposList.filter((g) => !g.encerrado_boolean).map((g) => g.id);
    fetchActiveGroupsPagamentos(activeIds);
  }, [gruposList]);

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
    let [mStr, yStr] = parts;
    
    mStr = mStr.trim().toLowerCase();
    yStr = yStr.trim();

    const monthsFull = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const monthsAbbr = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    
    let monthIdx = monthsFull.indexOf(mStr);
    if (monthIdx === -1) {
      const normalizedStr = mStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      monthIdx = monthsFull.map(m => m.normalize("NFD").replace(/[\u0300-\u036f]/g, "")).indexOf(normalizedStr);
    }
    if (monthIdx === -1) {
      monthIdx = monthsAbbr.indexOf(mStr.substring(0, 3));
    }

    if (monthIdx === -1) return null;

    let yearVal = parseInt(yStr);
    if (isNaN(yearVal)) return null;

    if (yStr.length === 2) {
      yearVal = 2000 + yearVal;
    }

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

      await refreshAllTotals();
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

      await refreshAllTotals();
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

      await refreshAllTotals();
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

      await refreshAllTotals();
      setShowDeleteParcelaConfirmModal(false);
      setParcelaToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir parcela:', err);
      alert('Erro ao excluir parcela: ' + err.message);
    }
  };

  // Ações de Edição e Exclusão de Cota (Consórcio)
  const handleEditCotaClick = (cota: Consorcio) => {
    setCotaToEdit(cota);
    setEditCotaNo(cota.cotano_number !== undefined && cota.cotano_number !== null ? String(cota.cotano_number) : '');
    setEditCotaVencimentoDia(cota.vencimentodia_number !== undefined && cota.vencimentodia_number !== null ? String(cota.vencimentodia_number) : '');
    setEditCotaDataRetirada(cota.dataretirada_date ? cota.dataretirada_date.substring(0, 10) : '');
    setEditCotaMesRetirada(cota.mesretirada_text || '');
    setShowEditRetiradaMonthPopover(false);

    if (cota.mesretirada_text && cota.mesretirada_text.includes('/')) {
      const parts = cota.mesretirada_text.split('/');
      const yearPart = parseInt(parts[1]);
      if (!isNaN(yearPart)) {
        setEditRetiradaYear(2000 + yearPart);
      } else {
        setEditRetiradaYear(new Date().getFullYear());
      }
    } else {
      setEditRetiradaYear(new Date().getFullYear());
    }

    setShowEditCotaModal(true);
  };

  const handleEditCotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cotaToEdit) return;
    setIsSavingCota(true);
    try {
      const dataRetirada = editCotaDataRetirada ? `${editCotaDataRetirada}T12:00:00Z` : null;
      const { error } = await supabase
        .from('consorcios')
        .update({
          dataretirada_date: dataRetirada,
          mesretirada_text: editCotaMesRetirada || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', cotaToEdit.id);

      if (error) throw error;

      await refreshConsorcios();
      setShowEditCotaModal(false);
      setCotaToEdit(null);
    } catch (err: any) {
      console.error('Erro ao editar cota:', err);
      alert('Erro ao editar cota: ' + err.message);
    } finally {
      setIsSavingCota(false);
    }
  };

  const handleDeleteCotaClick = (cota: Consorcio) => {
    const hasInstallments = grupoPagamentos.some((p) => p.consorcio_id === cota.id);
    if (hasInstallments) {
      alert('Não é possível excluir uma cota que possui parcelas.');
      return;
    }
    setCotaToDelete(cota);
    setShowDeleteCotaConfirmModal(true);
  };

  const executeDeleteCota = async () => {
    if (!cotaToDelete) return;
    setIsDeletingCota(true);
    try {
      const { error } = await supabase
        .from('consorcios')
        .delete()
        .eq('id', cotaToDelete.id);
      if (error) throw error;

      await refreshConsorcios();

      if (selectedConsorcioId === cotaToDelete.id) {
        setSelectedConsorcioId(null);
        setSelectedClienteNome('');
      }

      setShowDeleteCotaConfirmModal(false);
      setCotaToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir cota:', err);
      alert('Erro ao excluir cota: ' + err.message);
    } finally {
      setIsDeletingCota(false);
    }
  };

  // Ações de inclusão de cota
  const handleAddCotaClick = () => {
    setNewCotaClienteId('');
    setClientSearchQuery('');
    setShowClientDropdown(false);
    setShowRetiradaMonthPopover(false);
    setRetiradaYear(new Date().getFullYear());

    // Calcular próxima cota da sequência
    const existingCotaNumbers = filteredConsorciosList
      .map((c) => c.cotano_number)
      .filter((n): n is number => n !== undefined && n !== null);
    const maxCota = existingCotaNumbers.length > 0 ? Math.max(...existingCotaNumbers) : 0;
    setNewCotaNo(String(maxCota + 1));

    setNewCotaVencimentoDia('10');
    setNewCotaDataRetirada('');
    setNewCotaMesRetirada('');
    setShowAddCotaModal(true);
  };

  const handleAddCotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrupoId || !newCotaClienteId || !newCotaNo || !newCotaVencimentoDia) {
      alert('Por favor, selecione um cliente da lista.');
      return;
    }
    setIsSavingNewCota(true);
    try {
      const dataRetirada = newCotaDataRetirada ? `${newCotaDataRetirada}T12:00:00Z` : null;
      const { error } = await supabase
        .from('consorcios')
        .insert({
          grupo_id: selectedGrupoId,
          cliente_id: newCotaClienteId,
          cotano_number: Number(newCotaNo),
          vencimentodia_number: Number(newCotaVencimentoDia),
          dataretirada_date: dataRetirada,
          mesretirada_text: newCotaMesRetirada || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await refreshConsorcios();
      setShowAddCotaModal(false);

      // Resetar
      setNewCotaClienteId('');
      setClientSearchQuery('');
      setNewCotaNo('');
      setNewCotaVencimentoDia('10');
      setNewCotaDataRetirada('');
      setNewCotaMesRetirada('');
    } catch (err: any) {
      console.error('Erro ao incluir cota:', err);
      alert('Erro ao incluir cota: ' + err.message);
    } finally {
      setIsSavingNewCota(false);
    }
  };

  // Ordenar clientes em ordem alfabética para exibição no dropdown
  const sortedClientes = useMemo(() => {
    return [...clientesList].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });
  }, [clientesList]);

  // Clientes filtrados de acordo com a busca no modal
  const filteredSearchClientes = useMemo(() => {
    const s = clientSearchQuery.toLowerCase().trim();
    if (!s) return sortedClientes;
    return sortedClientes.filter((cli) => (cli.name || '').toLowerCase().includes(s));
  }, [sortedClientes, clientSearchQuery]);

  // Clientes filtrados para o popover de filtro de clientes
  const filteredFilterClientes = useMemo(() => {
    const s = clientFilterQuery.toLowerCase().trim();
    
    const sorted = [...clientesList].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });

    if (!s) return sorted;
    return sorted.filter((cli) => (cli.name || '').toLowerCase().includes(s));
  }, [clientesList, clientFilterQuery]);

  // Conjunto de IDs de grupos onde o cliente filtrado está definido
  const gruposComCliente = useMemo(() => {
    if (!selectedFilterClienteId) return null;
    return new Set(
      consorciosList
        .filter((c) => c.cliente_id === selectedFilterClienteId)
        .map((c) => c.grupo_id)
    );
  }, [consorciosList, selectedFilterClienteId]);

  // Listagem de Grupos Ativos / Todos (Coluna 1)
  const filteredGruposList = useMemo(() => {
    let list = gruposList.filter((g) =>
      gruposFilterType === 'todos'
        ? true
        : gruposFilterType === 'ativos'
          ? !g.encerrado_boolean
          : g.encerrado_boolean
    );

    const s = searchGrupo.toLowerCase().trim();
    if (s) {
      list = list.filter((g) => (g.periodo_text || '').toLowerCase().includes(s));
    }

    if (selectedFilterClienteId && gruposComCliente) {
      list = list.filter((g) => gruposComCliente.has(g.id));
    }

    return list;
  }, [gruposList, gruposFilterType, searchGrupo, selectedFilterClienteId, gruposComCliente]);

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

    // Ordenar por mês de retirada (e nome do cliente em caso de empate/não retirado)
    return [...matches].sort((a, b) => {
      const getRetiradaValue = (c: any) => {
        if (c.mesretirada_text) {
          const parsed = parseMesAnoText(c.mesretirada_text);
          if (parsed) {
            return parsed.year * 12 + parsed.month;
          }
        }
        if (c.dataretirada_date) {
          const d = new Date(c.dataretirada_date);
          if (!isNaN(d.getTime())) {
            return d.getUTCFullYear() * 12 + d.getUTCMonth();
          }
        }
        return Infinity; // Quem não retirou fica por último
      };

      const valA = getRetiradaValue(a);
      const valB = getRetiradaValue(b);

      if (valA !== valB) {
        return valA - valB;
      }

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

  // Helper de filtragem para data de pagamento (ou referência mesano_text se em aberto)
  const itemMatchesFilter = (item: Parcela) => {
    if (!isFilterActive) return true;
    
    // Se está paga, filtra pela data de pagamento
    if (item.datapagamento_date) {
      const date = new Date(item.datapagamento_date);
      return date.getUTCMonth() === filterMonth && date.getUTCFullYear() === filterYear;
    }
    
    // Se está em aberto (não paga), filtra pelo mesano_text (referência do mês/ano)
    const parsed = parseMesAnoText(item.mesano_text);
    return parsed && parsed.month === filterMonth && parsed.year === filterYear;
  };

  // Filtragem dos pagamentos do grupo selecionado
  const filteredGrupoPagamentos = useMemo(() => {
    return grupoPagamentos.filter(itemMatchesFilter);
  }, [grupoPagamentos, isFilterActive, filterMonth, filterYear]);

  // Totais do Grupo Selecionado
  const grupoTotals = useMemo(() => {
    const totalPago = filteredGrupoPagamentos
      .filter((item) => !!item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valorpago_number !== null ? curr.valorpago_number : curr.valor_parcela || 0), 0);

    const totalAPagar = filteredGrupoPagamentos
      .filter((item) => !item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valor_parcela || 0), 0);

    const totalPagoCount = filteredGrupoPagamentos.filter((item) => !!item.datapagamento_date).length;
    const totalAPagarCount = filteredGrupoPagamentos.filter((item) => !item.datapagamento_date).length;

    return {
      totalPago,
      totalAPagar,
      totalPagoCount,
      totalAPagarCount
    };
  }, [filteredGrupoPagamentos]);

  // Filtragem dos pagamentos de todos os grupos ativos
  const filteredActiveGroupsPagamentos = useMemo(() => {
    return activeGroupsPagamentos.filter(itemMatchesFilter);
  }, [activeGroupsPagamentos, isFilterActive, filterMonth, filterYear]);

  // Totais de todos os Grupos Ativos
  const activeGroupsTotals = useMemo(() => {
    const totalPago = filteredActiveGroupsPagamentos
      .filter((item) => !!item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valorpago_number !== null ? curr.valorpago_number : curr.valor_parcela || 0), 0);

    const totalAPagar = filteredActiveGroupsPagamentos
      .filter((item) => !item.datapagamento_date)
      .reduce((acc, curr) => acc + (curr.valor_parcela || 0), 0);

    const totalPagoCount = filteredActiveGroupsPagamentos.filter((item) => !!item.datapagamento_date).length;
    const totalAPagarCount = filteredActiveGroupsPagamentos.filter((item) => !item.datapagamento_date).length;

    return {
      totalPago,
      totalAPagar,
      totalPagoCount,
      totalAPagarCount
    };
  }, [filteredActiveGroupsPagamentos]);

  // Rótulo dinâmico do período do filtro
  const filterPeriodLabel = useMemo(() => {
    if (!isFilterActive) return 'no total';
    const monthStr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][filterMonth];
    const yearShort = String(filterYear).substring(2);
    return `em ${monthStr}/${yearShort}`;
  }, [isFilterActive, filterMonth, filterYear]);

  const targetMonth = isFilterActive ? filterMonth : new Date().getMonth();
  const targetYear = isFilterActive ? filterYear : new Date().getFullYear();

  const clienteRetiradaMesObj = useMemo(() => {
    if (!selectedGrupoId) return null;
    return consorciosList.find((c) => {
      if (c.grupo_id !== selectedGrupoId) return false;
      
      if (c.mesretirada_text) {
        const parsed = parseMesAnoText(c.mesretirada_text);
        if (parsed && parsed.month === targetMonth && parsed.year === targetYear) {
          return true;
        }
      }
      
      if (c.dataretirada_date) {
        const d = new Date(c.dataretirada_date);
        if (!isNaN(d.getTime())) {
          return d.getUTCMonth() === targetMonth && d.getUTCFullYear() === targetYear;
        }
      }
      
      return false;
    });
  }, [consorciosList, selectedGrupoId, targetMonth, targetYear]);

  const parcelasDoClienteContemplado = useMemo(() => {
    if (!clienteRetiradaMesObj) return [];
    return grupoPagamentos.filter((p) => p.consorcio_id === clienteRetiradaMesObj.id);
  }, [grupoPagamentos, clienteRetiradaMesObj]);

  const clienteContempladoStatus = useMemo(() => {
    if (!clienteRetiradaMesObj) return null;
    if (parcelasDoClienteContemplado.length === 0) return 'em_dia';
    
    const hoje = new Date().setHours(0, 0, 0, 0);
    const temAtrasada = parcelasDoClienteContemplado.some((p) => {
      const isPaid = !!p.datapagamento_date;
      const vencimento = p.data_vencimento ? new Date(p.data_vencimento).getTime() : null;
      return !isPaid && vencimento && vencimento < hoje;
    });
    
    return temAtrasada ? 'atraso' : 'em_dia';
  }, [parcelasDoClienteContemplado, clienteRetiradaMesObj]);

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

        {/* Contêiner de Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Cliente */}
          <div className="relative inline-block">
            <button
              onClick={() => {
                setShowClientFilterPopover(!showClientFilterPopover);
                setShowFilterCalendarPopover(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold rounded-full border ${A.border} ${A.card} ${A.bgHover} ${A.textPrimary} transition-all shadow-sm cursor-pointer`}
            >
              <Filter size={14} className={selectedFilterClienteId ? "text-brand-purple" : "text-[#64748B] flex-shrink-0"} />
              <span className={A.textPrimary}>
                {selectedFilterClienteId ? (
                  <>
                    Cliente:{' '}
                    <span className="text-brand-purple font-bold">
                      {clientesList.find((c) => c.id === selectedFilterClienteId)?.name || 'Selecionado'}
                    </span>
                  </>
                ) : (
                  'Filtrar por Cliente'
                )}
              </span>
              <svg
                className={`w-4 h-4 ml-1 text-slate-400 transition-transform ${showClientFilterPopover ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showClientFilterPopover && (
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowClientFilterPopover(false)} />
            )}

            {showClientFilterPopover && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute right-0 mt-2 w-72 p-4 rounded-[20px] border ${A.border} ${A.card} shadow-xl z-50 text-left space-y-3`}
              >
                {/* Busca */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={12} />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={clientFilterQuery}
                    onChange={(e) => setClientFilterQuery(e.target.value)}
                    className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-1 focus:ring-brand-purple focus:border-transparent transition-all`}
                    autoFocus
                  />
                  {clientFilterQuery && (
                    <button
                      type="button"
                      onClick={() => setClientFilterQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Lista de Clientes */}
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {filteredFilterClientes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum cliente encontrado
                    </div>
                  ) : (
                    filteredFilterClientes.slice(0, 50).map((cli) => {
                      const isSelected = selectedFilterClienteId === cli.id;
                      return (
                        <button
                          key={cli.id}
                          type="button"
                          onClick={() => {
                            setSelectedFilterClienteId(cli.id);
                            setShowClientFilterPopover(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                            isSelected
                              ? 'bg-brand-purple text-white font-bold'
                              : `hover:bg-slate-100 dark:hover:bg-slate-800 ${A.textPrimary}`
                          }`}
                        >
                          {cli.name}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Limpar Filtro */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterClienteId(null);
                    setClientFilterQuery('');
                    setShowClientFilterPopover(false);
                  }}
                  className={`w-full py-2 text-center text-xs font-bold rounded-xl border border-dashed ${A.border} text-[#64748B] hover:text-[#0F172A] dark:hover:text-slate-200 transition-all cursor-pointer`}
                >
                  Todos os Clientes
                </button>
              </motion.div>
            )}
          </div>

          {/* Filtro de Mês e Ano */}
          <div className="relative inline-block">
            <button
              onClick={() => {
                setShowFilterCalendarPopover(!showFilterCalendarPopover);
                setShowClientFilterPopover(false);
              }}
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
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 select-none">
        {/* Card 1: Total Aberto (Ativos) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => {
            setOpenInstallmentsScope('ativos');
            setShowOpenInstallmentsModal(true);
          }}
          className="relative overflow-hidden p-4 border border-purple-200 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-200 text-purple-950 cursor-pointer shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex justify-between items-start z-10 gap-1">
            <span className="text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
              Total Aberto (Ativos)
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-orange-600">
              <Calendar size={16} />
            </div>
          </div>
          <div className="my-2 z-10">
            <span className="text-2xl font-black tracking-tight text-purple-955 block truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeGroupsTotals.totalAPagar)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 z-10 truncate">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="truncate">
              {activeGroupsTotals.totalAPagarCount} aberta{activeGroupsTotals.totalAPagarCount === 1 ? '' : 's'} {filterPeriodLabel}
            </span>
          </div>
          <Calendar size={72} className="absolute -right-3 -bottom-3 text-orange-500/5 pointer-events-none z-0" />
        </motion.div>

        {/* Card 2: Total Pago (Ativos) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="relative overflow-hidden p-4 border border-purple-200 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-200 text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex justify-between items-start z-10 gap-1">
            <span className="text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
              Total Pago (Ativos)
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-emerald-600">
              <CircleCheck size={16} />
            </div>
          </div>
          <div className="my-2 z-10">
            <span className="text-2xl font-black tracking-tight text-purple-955 block truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeGroupsTotals.totalPago)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 z-10 truncate">
            <CircleCheck size={14} className="flex-shrink-0" />
            <span className="truncate">
              {activeGroupsTotals.totalPagoCount} paga{activeGroupsTotals.totalPagoCount === 1 ? '' : 's'} {filterPeriodLabel}
            </span>
          </div>
          <CircleCheck size={72} className="absolute -right-3 -bottom-3 text-emerald-500/5 pointer-events-none z-0" />
        </motion.div>

        {/* Card 3: Em Aberto (Grupo) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => {
            if (selectedGrupoId) {
              setOpenInstallmentsScope('grupo');
              setShowOpenInstallmentsModal(true);
            }
          }}
          className={`relative overflow-hidden p-4 border border-purple-200 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-200 text-purple-950 ${
            selectedGrupoId ? 'cursor-pointer shadow-sm hover:shadow-md' : ''
          }`}
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex justify-between items-start z-10 gap-1">
            <span className="text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
              Em Aberto (Grupo)
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-orange-600">
              <Calendar size={16} />
            </div>
          </div>
          <div className="my-2 z-10">
            <span className="text-2xl font-black tracking-tight text-purple-955 block truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grupoTotals.totalAPagar)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 z-10 truncate">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="truncate">
              {grupoTotals.totalAPagarCount} aberta{grupoTotals.totalAPagarCount === 1 ? '' : 's'} {filterPeriodLabel}
            </span>
          </div>
          <Calendar size={72} className="absolute -right-3 -bottom-3 text-orange-500/5 pointer-events-none z-0" />
        </motion.div>

        {/* Card 4: Pagos (Grupo) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="relative overflow-hidden p-4 border border-purple-200 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-200 text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex justify-between items-start z-10 gap-1">
            <span className="text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
              Pagos (Grupo)
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-emerald-600">
              <CircleCheck size={16} />
            </div>
          </div>
          <div className="my-2 z-10">
            <span className="text-2xl font-black tracking-tight text-purple-955 block truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grupoTotals.totalPago)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 z-10 truncate">
            <CircleCheck size={14} className="flex-shrink-0" />
            <span className="truncate">
              {grupoTotals.totalPagoCount} paga{grupoTotals.totalPagoCount === 1 ? '' : 's'} {filterPeriodLabel}
            </span>
          </div>
          <CircleCheck size={72} className="absolute -right-3 -bottom-3 text-emerald-500/5 pointer-events-none z-0" />
        </motion.div>

        {/* Card 5: Retirada do Mês */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="relative overflow-hidden p-4 border border-purple-200 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-200 text-purple-950"
          style={{ backgroundColor: '#EFE0F8' }}
        >
          <div className="flex justify-between items-start z-10 gap-1">
            <span className="text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
              Retirada do Mês
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-[#7C3AED]">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="my-2 z-10 space-y-1">
            {clienteRetiradaMesObj ? (
              <>
                <span style={{ fontSize: '16pt' }} className="font-extrabold text-purple-955 block line-clamp-1 leading-tight">
                  {clienteRetiradaMesObj.clientes?.nome}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center">
                    {clienteContempladoStatus === 'atraso' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Em Atraso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Em Dia
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-purple-900/60">
                    Retirada:{' '}
                    <span className="text-brand-purple font-extrabold">
                      {formatRetiradaDate(clienteRetiradaMesObj.dataretirada_date)}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <span className="text-sm font-medium text-purple-900/50 block italic">
                Nenhuma retirada
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] z-10 truncate">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="truncate">
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][targetMonth]} de {targetYear}
            </span>
          </div>
          <ArrowUpRight size={72} className="absolute -right-3 -bottom-3 text-purple-500/5 pointer-events-none z-0" />
        </motion.div>
      </div>

      {/* Grid Principal de 3 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA 1: Grupos (tamanho 3) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base whitespace-nowrap ${A.textPrimary}`}>
                {gruposFilterType === 'todos' ? 'Todos os Grupos' : gruposFilterType === 'ativos' ? 'Grupos Ativos' : 'Grupos Encerrados'}
              </h2>
              <span className="text-xs font-bold bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#7c3aed] px-2.5 py-1 rounded-full border border-[#7c3aed]/20 dark:border-[#7c3aed]/20">
                {filteredGruposList.length} {filteredGruposList.length === 1 ? 'grupo' : 'grupos'}
              </span>
            </div>
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
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-1 focus:ring-brand-purple focus:border-transparent transition-all`}
              />
              {searchGrupo && (
                <button
                  type="button"
                  onClick={() => setSearchGrupo('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Limpar"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Listagem de Grupos */}
            <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredGruposList.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'} text-slate-400`}>
                    <FolderHeart size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${A.textPrimary}`}>Nenhum grupo encontrado</p>
                    <p className={`text-[10px] ${A.textMuted}`}>Tente mudar o filtro ou termo de busca.</p>
                  </div>
                </div>
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
          <div className="flex items-center justify-between flex-wrap gap-2">
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#7c3aed] px-2.5 py-1 rounded-full border border-[#7c3aed]/20 dark:border-[#7c3aed]/20">
                {filteredConsorciosList.length} clientes
              </span>
              {selectedGrupoId && (
                <button
                  type="button"
                  onClick={handleAddCotaClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-lg transition-all shadow-sm shadow-brand-purple/10 cursor-pointer"
                >
                  <Plus size={14} />
                  Incluir Cliente
                </button>
              )}
            </div>
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
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-1 focus:ring-brand-purple focus:border-transparent transition-all`}
              />
              {searchCota && (
                <button
                  type="button"
                  onClick={() => setSearchCota('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Limpar"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Tabela de Cotas */}
            <div className={`border ${A.border} rounded-2xl overflow-hidden`}>
              <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                      <th className="p-3 font-semibold uppercase tracking-wider text-xs text-center w-20">Nº Cota</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-xs text-right w-24">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedGrupoId ? (
                      <tr>
                        <td colSpan={3} className="p-10 text-center">
                          <div className="flex flex-col items-center justify-center py-6 space-y-3 max-w-xs mx-auto">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                            >
                              <Briefcase size={22} />
                            </motion.div>
                            <div className="space-y-1">
                              <h4 className={`font-bold text-xs ${A.textPrimary}`}>Selecione um grupo</h4>
                              <p className={`text-[11px] ${A.textMuted} leading-relaxed`}>
                                Escolha um dos grupos na coluna lateral para gerenciar as cotas dos clientes.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredConsorciosList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-10 text-center">
                          <div className="flex flex-col items-center justify-center py-6 space-y-3 max-w-xs mx-auto">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                            >
                              <Briefcase size={22} className="opacity-60" />
                            </motion.div>
                            <div className="space-y-1">
                              <h4 className={`font-bold text-xs ${A.textPrimary}`}>Sem cotas ativas</h4>
                              <p className={`text-[11px] ${A.textMuted} leading-relaxed`}>
                                Não há clientes cadastrados ou ativos neste grupo de consórcio.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredConsorciosList.map((c) => {
                        const isSelected = selectedConsorcioId === c.id;
                        const clientName = c.clientes?.nome || 'Sem Cliente';
                        const hasInstallments = grupoPagamentos.some((p) => p.consorcio_id === c.id);

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
                                  <div className="mb-1">
                                    <span className={`inline-block text-[10px] font-normal px-1.5 py-0.5 rounded-md ${
                                      isDark 
                                        ? 'bg-[#334155] text-slate-300' 
                                        : 'bg-[#f1f5f9] text-slate-700'
                                    }`}>
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
                            <td className="p-3 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditCotaClick(c)}
                                  className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-brand-purple transition-all cursor-pointer`}
                                  title="Editar Cota"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCotaClick(c)}
                                  disabled={hasInstallments}
                                  className={`p-1.5 rounded-lg ${
                                    hasInstallments
                                      ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600'
                                      : `${A.bgHover} text-slate-400 hover:text-rose-600 transition-all cursor-pointer`
                                  }`}
                                  title={hasInstallments ? 'Não é possível excluir cota com parcelas' : 'Excluir Cota'}
                                >
                                  <Trash2 size={14} />
                                </button>
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

          {/* Cards de Totais Financeiros */}
          {selectedConsorcioId && (
            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Card 1: A Pagar */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="relative overflow-hidden p-3 border border-purple-200 rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 text-purple-950"
                style={{ backgroundColor: '#EFE0F8' }}
              >
                <div className="flex justify-between items-start z-10 gap-1">
                  <span className="text-[11px] xl:text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
                    A Pagar
                  </span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-orange-600">
                    <Calendar size={12} />
                  </div>
                </div>
                <div className="my-1.5 z-10">
                  <span className="text-base sm:text-lg xl:text-xl font-bold tracking-tight text-purple-955 block truncate">
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
                className="relative overflow-hidden p-3 border border-purple-200 rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 text-purple-950"
                style={{ backgroundColor: '#EFE0F8' }}
              >
                <div className="flex justify-between items-start z-10 gap-1">
                  <span className="text-[11px] xl:text-xs tracking-wider font-bold text-purple-900/70 uppercase truncate">
                    Pagos
                  </span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200/60 text-emerald-600">
                    <CircleCheck size={12} />
                  </div>
                </div>
                <div className="my-1.5 z-10">
                  <span className="text-base sm:text-lg xl:text-xl font-bold tracking-tight text-purple-955 block truncate">
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

          {/* Tabela de Parcelas */}
          <div className={`border ${A.card} rounded-[24px] overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-360px)] min-h-[180px]">
              {!selectedConsorcioId ? (
                <div className="flex flex-col items-center justify-center p-10 text-center min-h-[220px] space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Briefcase size={24} />
                  </motion.div>
                  <div className="max-w-xs space-y-1">
                    <h3 className={`text-sm font-bold tracking-tight ${A.textPrimary}`}>
                      Selecione uma cota
                    </h3>
                    <p className={`text-xs ${A.textMuted} leading-relaxed`}>
                      Escolha uma cota de cliente na tabela ao lado para visualizar e gerenciar o histórico de pagamentos.
                    </p>
                  </div>
                </div>
              ) : sortedPagamentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center min-h-[220px] space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-orange-950/20 text-orange-400' : 'bg-orange-50 text-orange-500'
                    }`}
                  >
                    <Calendar size={24} />
                  </motion.div>
                  <div className="max-w-xs space-y-1">
                    <h3 className={`text-sm font-bold tracking-tight ${A.textPrimary}`}>
                      Sem parcelas geradas
                    </h3>
                    <p className={`text-xs ${A.textMuted} leading-relaxed`}>
                      Nenhum cronograma de pagamento encontrado para esta cota. Clique em <strong className="text-brand-purple font-bold">Gerar Parcelas</strong> para iniciar.
                    </p>
                  </div>
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

      {/* MODAL: DETALHES DE PARCELAS EM ABERTO */}
      {showOpenInstallmentsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-lg p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
          >
            <div className="flex justify-between items-center mb-4 border-b border-dashed pb-3 border-slate-200 dark:border-slate-700/50">
              <div>
                <h3 className={`text-lg font-bold ${A.textPrimary}`}>
                  {openInstallmentsScope === 'grupo' ? 'Parcelas em Aberto (Grupo)' : 'Parcelas em Aberto (Todos os Grupos Ativos)'}
                </h3>
                <p className={`text-xs ${A.textMuted} mt-0.5`}>
                  {openInstallmentsScope === 'grupo' ? (
                    <>Grupo: <strong className="text-brand-purple">{selectedGrupoObj?.periodo_text || ''}</strong></>
                  ) : (
                    <strong className="text-brand-purple">Todos os Grupos Ativos</strong>
                  )} {filterPeriodLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenInstallmentsModal(false)}
                className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {(() => {
                const pagamentosList = openInstallmentsScope === 'grupo' ? filteredGrupoPagamentos : filteredActiveGroupsPagamentos;
                const emAberto = pagamentosList.filter((item) => !item.datapagamento_date);

                const sortedEmAberto = [...emAberto].sort((a, b) => {
                  const consorcioA = consorciosList.find((c) => c.id === a.consorcio_id);
                  const clientNameA = consorcioA?.clientes?.nome || 'Sem Cliente';
                  const isOverdueA = !!(a.data_vencimento && new Date(a.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0));

                  const consorcioB = consorciosList.find((c) => c.id === b.consorcio_id);
                  const clientNameB = consorcioB?.clientes?.nome || 'Sem Cliente';
                  const isOverdueB = !!(b.data_vencimento && new Date(b.data_vencimento).getTime() < new Date().setHours(0, 0, 0, 0));

                  // 1. Atrasados primeiro
                  if (isOverdueA && !isOverdueB) return -1;
                  if (!isOverdueA && isOverdueB) return 1;

                  // 2. Ordem alfabética
                  return clientNameA.localeCompare(clientNameB);
                });

                if (sortedEmAberto.length === 0) {
                  return (
                    <p className={`text-sm ${A.textMuted} text-center py-6`}>
                      Nenhuma parcela em aberto encontrada para este período.
                    </p>
                  );
                }

                return sortedEmAberto.map((item) => {
                  const consorcio = consorciosList.find((c) => c.id === item.consorcio_id);
                  const clientName = consorcio?.clientes?.nome || 'Sem Cliente';
                  const outrasInfo = consorcio?.clientes?.outrasinformacoes || '';
                  const phone = consorcio?.clientes?.celular || '';
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
                          }).format(item.valor_parcela || 0)}
                        </p>
                        <p className={`text-[10px] font-semibold ${A.textMuted}`}>
                          {openInstallmentsScope === 'ativos' && item.grupo_text ? `Grupo: ${item.grupo_text} • ` : ''}
                          Ref: {item.mesano_text} • Venc: {formatGroupDate(item.data_vencimento)}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setShowOpenInstallmentsModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: EDITAR COTA */}
      {showEditCotaModal && cotaToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
          >
            <div className="flex justify-between items-center mb-4 border-b border-dashed pb-3 border-slate-200 dark:border-slate-700/50">
              <div>
                <h3 className={`text-lg font-bold ${A.textPrimary}`}>Editar Cota</h3>
                <p className={`text-xs ${A.textMuted} mt-0.5`}>
                  Cliente: <strong className="text-brand-purple">{cotaToEdit.clientes?.nome || ''}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCotaModal(false)}
                className={`p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEditCotaSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Número da Cota
                  </label>
                  <input
                    type="number"
                    value={editCotaNo}
                    disabled
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} opacity-60 cursor-not-allowed outline-none shadow-sm`}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={editCotaVencimentoDia}
                    disabled
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} opacity-60 cursor-not-allowed outline-none shadow-sm`}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Data de Retirada
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={editCotaDataRetirada}
                    onChange={(e) => setEditCotaDataRetirada(e.target.value)}
                    className={`flex-1 px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                  />
                  {editCotaDataRetirada && (
                    <button
                      type="button"
                      onClick={() => setEditCotaDataRetirada('')}
                      className={`px-3 rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} text-xs font-bold transition-all cursor-pointer`}
                      title="Limpar Data"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mês de Retirada (Opcional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditRetiradaMonthPopover(!showEditRetiradaMonthPopover)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none cursor-pointer text-left month-popover-trigger`}
                  >
                    <span className={editCotaMesRetirada ? A.textPrimary : 'text-slate-400'}>
                      {editCotaMesRetirada || 'Selecionar Mês/Ano'}
                    </span>
                    <Calendar size={16} className="text-slate-400" />
                  </button>

                  {showEditRetiradaMonthPopover && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowEditRetiradaMonthPopover(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute left-0 right-0 mt-1 p-4 rounded-[20px] border ${A.border} ${A.card} shadow-xl z-50 text-left space-y-4`}
                      >
                        {/* Seleção de Ano */}
                        <div className="flex items-center justify-between border-b border-dashed pb-2 border-slate-200 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => setEditRetiradaYear((y) => y - 1)}
                            className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className={`font-bold text-sm ${A.textPrimary}`}>{editRetiradaYear}</span>
                          <button
                            type="button"
                            onClick={() => setEditRetiradaYear((y) => y + 1)}
                            className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Grade de Meses */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mName) => {
                            const yearShort = String(editRetiradaYear).substring(2);
                            const currentVal = `${mName}/${yearShort}`;
                            const isSelected = editCotaMesRetirada === currentVal;

                            return (
                              <button
                                key={mName}
                                type="button"
                                onClick={() => {
                                  setEditCotaMesRetirada(currentVal);
                                  setShowEditRetiradaMonthPopover(false);
                                }}
                                className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                                    : `border border-transparent ${A.bgHover} ${A.textPrimary}`
                                }`}
                              >
                                {mName}
                              </button>
                            );
                          })}
                        </div>

                        {/* Opção Limpar */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditCotaMesRetirada('');
                            setShowEditRetiradaMonthPopover(false);
                          }}
                          className={`w-full py-2 text-center text-xs font-bold rounded-xl border border-dashed ${A.border} text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer`}
                        >
                          Limpar Seleção
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCotaModal(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCota}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCota ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE COTA */}
      {showDeleteCotaConfirmModal && cotaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-sm p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-center`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className={`text-lg font-bold ${A.textPrimary} mb-2`}>Excluir Cota de Consórcio?</h3>
            <p className={`text-xs ${A.textMuted} mb-6`}>
              Tem certeza que deseja excluir a cota do cliente{' '}
              <strong className="text-slate-800 dark:text-slate-200">{cotaToDelete.clientes?.nome || ''}</strong>?
              Esta ação removerá a associação deste cliente a este grupo e não poderá ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteCotaConfirmModal(false)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteCota}
                disabled={isDeletingCota}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/10 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingCota ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: INCLUIR CLIENTE NO GRUPO */}
      {showAddCotaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`}
          >
            <div className="flex justify-between items-center mb-4 border-b border-dashed pb-3 border-slate-200 dark:border-slate-700/50">
              <div>
                <h3 className={`text-lg font-bold ${A.textPrimary}`}>Incluir Cliente no Grupo</h3>
                <p className={`text-xs ${A.textMuted} mt-0.5`}>
                  Grupo: <strong className="text-brand-purple">{selectedGrupoObj?.periodo_text || ''}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCotaModal(false)}
                className={`p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddCotaSubmit} className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Pesquise por nome do cliente..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setShowClientDropdown(true);
                      if (newCotaClienteId) setNewCotaClienteId('');
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className={`w-full pl-4 pr-28 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                  />
                  {newCotaClienteId && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CircleCheck size={14} />
                      Selecionado
                    </span>
                  )}
                  {clientSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setClientSearchQuery('');
                        if (newCotaClienteId) setNewCotaClienteId('');
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Limpar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown de Clientes */}
                {showClientDropdown && clientSearchQuery && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowClientDropdown(false)} />
                    <div className={`absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border ${A.border} ${A.card} shadow-xl z-50 py-1.5 text-left`}>
                      {filteredSearchClientes.length === 0 ? (
                        <div className="px-4 py-2 text-xs text-slate-400">
                          Nenhum cliente encontrado
                        </div>
                      ) : (
                        filteredSearchClientes.map((cli) => (
                          <div
                            key={cli.id}
                            onClick={() => {
                              setNewCotaClienteId(cli.id);
                              setClientSearchQuery(cli.name);
                              setShowClientDropdown(false);
                            }}
                            className={`px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-brand-purple hover:text-white transition-colors ${A.textPrimary}`}
                          >
                            {cli.name}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Número da Cota
                  </label>
                  <input
                    type="number"
                    required
                    disabled
                    min={1}
                    value={newCotaNo}
                    onChange={(e) => setNewCotaNo(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm opacity-60 cursor-not-allowed`}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={newCotaVencimentoDia}
                    onChange={(e) => setNewCotaVencimentoDia(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Data de Retirada (Opcional)
                </label>
                <input
                  type="date"
                  value={newCotaDataRetirada}
                  onChange={(e) => setNewCotaDataRetirada(e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`}
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mês de Retirada (Opcional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRetiradaMonthPopover(!showRetiradaMonthPopover)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none cursor-pointer text-left month-popover-trigger`}
                  >
                    <span className={newCotaMesRetirada ? A.textPrimary : 'text-slate-400'}>
                      {newCotaMesRetirada || 'Selecionar Mês/Ano'}
                    </span>
                    <Calendar size={16} className="text-slate-400" />
                  </button>

                  {showRetiradaMonthPopover && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowRetiradaMonthPopover(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute left-0 right-0 mt-1 p-4 rounded-[20px] border ${A.border} ${A.card} shadow-xl z-50 text-left space-y-4`}
                      >
                        {/* Seleção de Ano */}
                        <div className="flex items-center justify-between border-b border-dashed pb-2 border-slate-200 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => setRetiradaYear((y) => y - 1)}
                            className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className={`font-bold text-sm ${A.textPrimary}`}>{retiradaYear}</span>
                          <button
                            type="button"
                            onClick={() => setRetiradaYear((y) => y + 1)}
                            className={`p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Grade de Meses */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mName) => {
                            const yearShort = String(retiradaYear).substring(2);
                            const currentVal = `${mName}/${yearShort}`;
                            const isSelected = newCotaMesRetirada === currentVal;

                            return (
                              <button
                                key={mName}
                                type="button"
                                onClick={() => {
                                  setNewCotaMesRetirada(currentVal);
                                  setShowRetiradaMonthPopover(false);
                                }}
                                className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                                    : `border border-transparent ${A.bgHover} ${A.textPrimary}`
                                }`}
                              >
                                {mName}
                              </button>
                            );
                          })}
                        </div>

                        {/* Opção Limpar */}
                        <button
                          type="button"
                          onClick={() => {
                            setNewCotaMesRetirada('');
                            setShowRetiradaMonthPopover(false);
                          }}
                          className={`w-full py-2 text-center text-xs font-bold rounded-xl border border-dashed ${A.border} text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer`}
                        >
                          Limpar Seleção
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCotaModal(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewCota}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingNewCota ? 'Incluindo...' : 'Incluir'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ConsorciosTab;
