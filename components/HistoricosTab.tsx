import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  History,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  AlertTriangle,
  AlertCircle,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface Historico {
  id: string;
  bubble_id?: string | null;
  descricao: string;
  created_at?: string;
  updated_at?: string;
}

interface HistoricosTabProps {
  A: any;
  globalSearch: string;
}

const HistoricosTab: React.FC<HistoricosTabProps> = ({ A, globalSearch }) => {
  const isDarkMode = A.textPrimary === 'text-slate-100';

  // Estados de Dados
  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados do Formulário
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedHistoricoId, setSelectedHistoricoId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState<string>('');
  const [bubbleId, setBubbleId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Estados de Busca e Listagem
  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortField, setSortField] = useState<string>('descricao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Estados de Modais de Confirmação/Aviso
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    historico: Historico | null;
  }>({ show: false, historico: null });

  const [deleteBlocked, setDeleteBlocked] = useState<{
    show: boolean;
    historico: Historico | null;
    crediariosCount: number;
  }>({ show: false, historico: null, crediariosCount: 0 });

  // Carregar Dados
  const fetchHistoricos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('historico')
        .select('*')
        .order('descricao', { ascending: true });

      if (error) throw error;
      setHistoricos(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar históricos:', err);
      setErrorMsg('Não foi possível carregar os históricos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricos();
  }, []);

  // Timer para mensagens de sucesso
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Resetar Formulário
  const resetForm = () => {
    setSelectedHistoricoId(null);
    setDescricao('');
    setBubbleId('');
    setShowForm(false);
    setErrorMsg(null);
  };

  // Tratar Seleção para Edição
  const handleEditClick = (h: Historico) => {
    setSelectedHistoricoId(h.id);
    setDescricao(h.descricao || '');
    setBubbleId(h.bubble_id || '');
    setShowForm(true);
    setErrorMsg(null);
    // Rolar até o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enviar Formulário (Salvar / Editar)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      setErrorMsg('A descrição do histórico é obrigatória.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      descricao: descricao.trim(),
      bubble_id: bubbleId.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      if (selectedHistoricoId) {
        // Atualizar
        const { error } = await supabase
          .from('historico')
          .update(payload)
          .eq('id', selectedHistoricoId);

        if (error) {
          // Tratar erro de chave única (descricao repetida)
          if (error.code === '23505') {
            throw new Error('Já existe um histórico cadastrado com esta descrição.');
          }
          throw error;
        }
        setSuccessMsg('Histórico atualizado com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('historico')
          .insert([{
            descricao: payload.descricao,
            bubble_id: payload.bubble_id
          }]);

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um histórico cadastrado com esta descrição.');
          }
          throw error;
        }
        setSuccessMsg('Histórico criado com sucesso!');
      }

      await fetchHistoricos();
      resetForm();
    } catch (err: any) {
      console.error('Erro ao salvar histórico:', err);
      setErrorMsg(err.message || 'Erro ao salvar histórico.');
    } finally {
      setSubmitting(false);
    }
  };

  // Iniciar Fluxo de Exclusão (com validações de crediário)
  const handleDeleteRequest = async (h: Historico) => {
    setErrorMsg(null);
    try {
      // 1. Consultar se existem crediarios vinculados a este historico
      const { count, error } = await supabase
        .from('crediarios')
        .select('id', { count: 'exact', head: true })
        .eq('historico_id', h.id);

      if (error) throw error;

      const crediariosCount = count || 0;

      if (crediariosCount > 0) {
        // Bloqueia exclusão e mostra alerta informando a quantidade de vínculos
        setDeleteBlocked({
          show: true,
          historico: h,
          crediariosCount
        });
      } else {
        // Abre confirmação de exclusão normal
        setDeleteConfirm({
          show: true,
          historico: h
        });
      }
    } catch (err: any) {
      console.error('Erro ao verificar dependências:', err);
      setErrorMsg('Erro ao verificar dependências do histórico: ' + err.message);
    }
  };

  // Executar Exclusão após confirmação
  const executeDelete = async () => {
    const target = deleteConfirm.historico;
    if (!target) return;

    setLoading(true);
    setDeleteConfirm({ show: false, historico: null });

    try {
      const { error } = await supabase
        .from('historico')
        .delete()
        .eq('id', target.id);

      if (error) throw error;

      setSuccessMsg(`Histórico "${target.descricao}" excluído com sucesso!`);
      await fetchHistoricos();
    } catch (err: any) {
      console.error('Erro ao excluir histórico:', err);
      setErrorMsg('Erro ao excluir histórico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatação de Data
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // Filtragem
  const filteredHistoricos = useMemo(() => {
    const sTermGlobal = globalSearch.toLowerCase().trim();
    const sTermLocal = localSearch.toLowerCase().trim();

    return historicos.filter((h) => {
      const desc = h.descricao?.toLowerCase() || '';
      const bId = h.bubble_id?.toLowerCase() || '';

      const matchGlobal = !sTermGlobal || desc.includes(sTermGlobal) || bId.includes(sTermGlobal);
      const matchLocal = !sTermLocal || desc.includes(sTermLocal) || bId.includes(sTermLocal);

      return matchGlobal && matchLocal;
    });
  }, [historicos, globalSearch, localSearch]);

  // Ordenação
  const sortedHistoricos = useMemo(() => {
    if (!sortField) return filteredHistoricos;

    return [...filteredHistoricos].sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (sortField === 'created_at' || sortField === 'updated_at') {
        const timeA = valA ? new Date(valA).getTime() : 0;
        const timeB = valB ? new Date(valB).getTime() : 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, 'pt-BR')
          : valB.localeCompare(valA, 'pt-BR');
      }

      return valA < valB
        ? (sortOrder === 'asc' ? -1 : 1)
        : valA > valB
        ? (sortOrder === 'asc' ? 1 : -1)
        : 0;
    });
  }, [filteredHistoricos, sortField, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(sortedHistoricos.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedHistoricos.length, totalPages, currentPage]);

  const paginatedHistoricos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedHistoricos.slice(start, start + itemsPerPage);
  }, [sortedHistoricos, currentPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 5 - 1);
    if (end - start + 1 < 5) {
      start = Math.max(1, end - 5 + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const renderSortableHeader = (field: string, label: string) => {
    const isCurrent = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`p-4 font-semibold uppercase tracking-wider text-xs cursor-pointer select-none ${A.bgHover} transition-colors`}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-slate-400">
            {isCurrent ? (
              sortOrder === 'asc' ? (
                <ArrowUp size={14} className="text-brand-purple" />
              ) : (
                <ArrowDown size={14} className="text-brand-purple" />
              )
            ) : (
              <ArrowUpDown size={14} className="opacity-40 hover:opacity-100 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Mensagens de Sucesso */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-sm font-semibold shadow-sm text-left"
          >
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Título e Botão de Ação */}
      <div className="flex justify-between items-center text-left">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary} flex items-center gap-3`}>
            <History className="text-brand-purple" size={32} />
            Históricos
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Crie, altere e exclua descrições de históricos financeiros e de crediário.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-4 rounded-xl font-semibold shadow-md shadow-brand-purple/15 transition-all active:scale-[0.98]"
        >
          <Plus size={18} /> Novo Histórico
        </button>
      </div>

      {/* Erros Gerais */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-sm font-semibold shadow-sm text-left">
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulário de Criação/Edição */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border ${A.card} rounded-[24px] p-6 overflow-hidden shadow-inner text-left`}
          >
            <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className={`font-bold text-lg flex items-center gap-2 ${A.textPrimary}`}>
                <History className="text-brand-purple" size={20} />
                {selectedHistoricoId ? `Editar Histórico: ${descricao}` : 'Cadastrar Novo Histórico'}
              </h3>
              <button
                onClick={resetForm}
                className={`p-1.5 rounded-lg ${A.bgHover} ${A.textMuted} hover:text-rose-500 transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-8 space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    Descrição (Única) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mensalidade Academia, Venda de Suplementos..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>

                <div className="col-span-12 md:col-span-4 space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                    ID Bubble (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1704253163158x..."
                    value={bubbleId}
                    onChange={(e) => setBubbleId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de Busca Local */}
      <div className={`border ${A.card} rounded-[24px] p-5 shadow-sm`}>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por descrição ou ID do Bubble..."
            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
          />
        </div>
      </div>

      {/* Tabela de Históricos */}
      <div className={`border ${A.card} rounded-[24px] overflow-hidden shadow-sm text-left`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                {renderSortableHeader('descricao', 'Descrição')}
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">ID Bubble</th>
                {renderSortableHeader('created_at', 'Data de Criação')}
                {renderSortableHeader('updated_at', 'Última Atualização')}
                <th className="p-4 font-semibold uppercase tracking-wider text-xs text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-sm">Carregando históricos...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedHistoricos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        <History size={28} />
                      </div>
                      <span className="font-bold text-base mt-2 text-slate-800 dark:text-slate-200">
                        Nenhum histórico encontrado
                      </span>
                      <span className="text-xs opacity-75">
                        Nenhum registro corresponde aos termos pesquisados ou a tabela está vazia.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHistoricos.map((h) => {
                  const isEditing = selectedHistoricoId === h.id;
                  return (
                    <tr
                      key={h.id}
                      className={`group border-b ${A.border} ${A.tableRowHover} transition-colors ${
                        isEditing
                          ? 'bg-purple-100/30 dark:bg-purple-950/20 border-purple-300/30'
                          : 'hover:bg-purple-50/10 dark:hover:bg-[#1E1B4B]/10'
                      }`}
                    >
                      <td className={`p-4 font-bold text-sm ${A.textPrimary}`}>
                        {h.descricao}
                      </td>
                      <td className={`p-4 text-xs font-mono ${A.textPrimary}`}>
                        {h.bubble_id || '-'}
                      </td>
                      <td className={`p-4 text-xs ${A.textPrimary}`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-50" />
                          {formatDate(h.created_at)}
                        </div>
                      </td>
                      <td className={`p-4 text-xs ${A.textPrimary}`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-50" />
                          {formatDate(h.updated_at)}
                        </div>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditClick(h)}
                          title="Editar histórico"
                          className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-brand-purple active:scale-95 transition-all cursor-pointer`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(h)}
                          title="Excluir histórico"
                          className={`p-1.5 rounded-lg ${A.bgHover} text-slate-400 hover:text-rose-600 active:scale-95 transition-all cursor-pointer`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação Footer */}
        {!loading && totalPages > 1 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t ${A.border} ${
            isDarkMode ? 'bg-[#0F172A]' : 'bg-[#f1f5f9]'
          } text-xs`}>
            <div className={`font-semibold ${A.textMuted}`}>
              Exibindo <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredHistoricos.length)}</span> a{' '}
              <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{Math.min(currentPage * itemsPerPage, filteredHistoricos.length)}</span> de{' '}
              <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{filteredHistoricos.length}</span> históricos
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-brand-lime hover:border-brand-lime disabled:opacity-30 disabled:text-slate-600'
                    : 'border-slate-200 bg-white text-brand-purple hover:border-brand-purple disabled:opacity-40 disabled:text-slate-300'
                } active:scale-95`}
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    currentPage === num
                      ? 'bg-brand-purple border-brand-purple text-white shadow-md shadow-brand-purple/20'
                      : isDarkMode
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-brand-lime hover:border-brand-lime active:scale-95'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-brand-purple hover:border-brand-purple active:scale-95'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-brand-lime hover:border-brand-lime disabled:opacity-30 disabled:text-slate-600'
                    : 'border-slate-200 bg-white text-brand-purple hover:border-brand-purple disabled:opacity-40 disabled:text-slate-300'
                } active:scale-95`}
                title="Próxima Página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AnimatePresence>
        {deleteConfirm.show && deleteConfirm.historico && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-[24px] border ${A.card} p-6 shadow-2xl space-y-4 text-left`}
            >
              <div className="flex items-center gap-3 text-rose-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Trash2 size={24} />
                <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                  Confirmar Exclusão
                </h3>
              </div>

              <div className="space-y-2">
                <p className={`text-sm ${A.textPrimary}`}>
                  Deseja realmente excluir o histórico abaixo? Esta ação não pode ser desfeita.
                </p>
                <div className={`p-4 rounded-xl border ${A.border} ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} font-semibold text-sm ${A.textPrimary}`}>
                  {deleteConfirm.historico.descricao}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDeleteConfirm({ show: false, historico: null })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all cursor-pointer`}
                >
                  Cancelar
                </button>
                <button
                  onClick={executeDelete}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE BLOQUEIO DE EXCLUSÃO (REGRA DO NEGÓCIO) */}
      <AnimatePresence>
        {deleteBlocked.show && deleteBlocked.historico && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-[24px] border border-amber-300 dark:border-amber-900/60 ${A.card} p-6 shadow-2xl space-y-4 text-left`}
            >
              <div className="flex items-center gap-3 text-amber-500 pb-2 border-b border-amber-100 dark:border-amber-950/40">
                <AlertTriangle size={24} />
                <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                  Exclusão Bloqueada
                </h3>
              </div>

              <div className="space-y-3">
                <p className={`text-sm ${A.textPrimary} leading-relaxed`}>
                  O histórico <strong className="text-brand-purple">"{deleteBlocked.historico.descricao}"</strong> não pode ser excluído do sistema.
                </p>
                <div className={`p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 text-xs ${A.textMuted} space-y-2`}>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Motivo da restrição:
                  </p>
                  <p>
                    Este registro possui <strong className="text-slate-800 dark:text-slate-200">{deleteBlocked.crediariosCount} lançamento(s)</strong> de crediário ou receita associados a ele na base de dados.
                  </p>
                  <p>
                    Para poder excluir este histórico, você precisará desvincular ou excluir todos os crediários relacionados primeiro.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDeleteBlocked({ show: false, historico: null, crediariosCount: 0 })}
                  className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoricosTab;
