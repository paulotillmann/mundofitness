import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  FolderHeart,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
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

interface GruposTabProps {
  A: any;
  gruposList: Grupo[];
  refreshGrupos: () => Promise<void>;
}

const GruposTab: React.FC<GruposTabProps> = ({
  A,
  gruposList,
  refreshGrupos
}) => {
  // Estados do Formulário
  const [showForm, setShowForm] = useState(false);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);

  const [periodoText, setPeriodoText] = useState('');
  const [valorMensal, setValorMensal] = useState('');
  const [valorCota, setValorCota] = useState('');
  const [mesInicial, setMesInicial] = useState('');
  const [mesFinal, setMesFinal] = useState('');
  const [encerrado, setEncerrado] = useState(false);

  // Estados de Filtro e Busca
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'encerrados'>('ativos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('mesinicial_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Resetar Formulário
  const resetForm = () => {
    setSelectedGrupoId(null);
    setPeriodoText('');
    setValorMensal('');
    setValorCota('');
    setMesInicial('');
    setMesFinal('');
    setEncerrado(false);
    setShowForm(false);
  };

  // Carregar dados para edição
  const handleEditClick = (grupo: Grupo) => {
    setSelectedGrupoId(grupo.id);
    setPeriodoText(grupo.periodo_text || '');
    setValorMensal(grupo.valor_number !== null && grupo.valor_number !== undefined ? String(grupo.valor_number) : '');
    setValorCota(grupo.valorcota_number !== null && grupo.valorcota_number !== undefined ? String(grupo.valorcota_number) : '');
    setMesInicial(grupo.mesinicial_date ? grupo.mesinicial_date.substring(0, 10) : '');
    setMesFinal(grupo.mesfinal_date ? grupo.mesfinal_date.substring(0, 10) : '');
    setEncerrado(grupo.encerrado_boolean || false);
    setShowForm(true);
  };

  // Salvar no Supabase
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodoText) return;

    try {
      if (selectedGrupoId) {
        // Atualizar
        const { error } = await supabase
          .from('grupos')
          .update({
            periodo_text: periodoText,
            valor_number: valorMensal ? parseFloat(valorMensal) : null,
            valorcota_number: valorCota ? parseFloat(valorCota) : null,
            mesinicial_date: mesInicial ? mesInicial + 'T00:00:00Z' : null,
            mesfinal_date: mesFinal ? mesFinal + 'T00:00:00Z' : null,
            encerrado_boolean: encerrado,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedGrupoId);

        if (error) {
          alert('Erro ao atualizar grupo no Supabase: ' + error.message);
          return;
        }
      } else {
        // Inserir novo
        const { error } = await supabase
          .from('grupos')
          .insert([
            {
              periodo_text: periodoText,
              valor_number: valorMensal ? parseFloat(valorMensal) : null,
              valorcota_number: valorCota ? parseFloat(valorCota) : null,
              mesinicial_date: mesInicial ? mesInicial + 'T00:00:00Z' : null,
              mesfinal_date: mesFinal ? mesFinal + 'T00:00:00Z' : null,
              encerrado_boolean: encerrado,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (error) {
          alert('Erro ao salvar grupo no Supabase: ' + error.message);
          return;
        }
      }

      await refreshGrupos();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado: ' + err.message);
    }
  };

  // Filtragem e Ordenação
  const filteredAndSortedGrupos = useMemo(() => {
    const sTerm = searchTerm.toLowerCase().trim();

    return [...gruposList.filter((g) => {
      // Filtro de Status
      const matchesStatus = statusFilter === 'todos'
        ? true
        : statusFilter === 'ativos'
        ? !g.encerrado_boolean
        : g.encerrado_boolean;

      if (!matchesStatus) return false;
      if (!sTerm) return true;

      // Busca por período, cota ou valor mensal
      const periodo = g.periodo_text ? g.periodo_text.toLowerCase() : '';
      const cotaStr = g.valorcota_number ? String(g.valorcota_number) : '';
      const valorStr = g.valor_number ? String(g.valor_number) : '';

      const cotaFormatted = g.valorcota_number ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(g.valorcota_number).toLowerCase() : '';

      const valorFormatted = g.valor_number ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(g.valor_number).toLowerCase() : '';

      return periodo.includes(sTerm) ||
        cotaStr.includes(sTerm) ||
        valorStr.includes(sTerm) ||
        cotaFormatted.includes(sTerm) ||
        valorFormatted.includes(sTerm);
    })].sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (sortField === 'mesinicial_date' || sortField === 'mesfinal_date') {
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
  }, [gruposList, statusFilter, searchTerm, sortField, sortOrder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Grupos de Consórcios
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Monitore e organize os grupos de consórcios da MundoFitness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {gruposList.length > 0 && (
            <div className={`flex items-center gap-1 p-1 rounded-full border ${A.border} ${A.card} shadow-sm`}>
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFilter === 'todos' ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' : `${A.textMuted} ${A.bgHover} hover:text-textPrimary`
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ativos')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFilter === 'ativos' ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' : `${A.textMuted} ${A.bgHover} hover:text-textPrimary`
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('encerrados')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFilter === 'encerrados' ? 'bg-black text-white shadow-md' : `${A.textMuted} ${A.bgHover} hover:text-textPrimary`
                }`}
              >
                Encerrados
              </button>
            </div>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-4 rounded-xl font-semibold shadow-md shadow-brand-purple/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus size={18} /> Novo Grupo
          </button>
        </div>
      </div>

      {/* Formulário de Criação/Edição */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border ${A.card} rounded-[24px] p-6 overflow-hidden shadow-inner text-left`}
          >
            <div className="flex items-center justify-between gap-4 mb-6 pb-2">
              <h3 className={`font-bold text-lg flex items-center gap-2 ${A.textPrimary}`}>
                <FolderHeart className="text-brand-purple" size={20} />
                {selectedGrupoId ? `Editar Grupo: ${periodoText}` : 'Cadastrar Novo Grupo'}
              </h3>
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Status
                </span>
                <button
                  type="button"
                  onClick={() => setEncerrado((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    encerrado ? 'bg-slate-200 dark:bg-slate-700' : 'bg-emerald-500'
                  }`}
                  title={`Alterar status para ${encerrado ? 'Ativo' : 'Encerrado'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      encerrado ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
                <span className={`text-sm font-bold transition-colors duration-200 ${encerrado ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-500'}`}>
                  {encerrado ? 'Encerrado' : 'Ativo'}
                </span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Período (Nome/Descrição)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grupo A - Manhã"
                  value={periodoText}
                  onChange={(e) => setPeriodoText(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Valor da Cota (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={valorCota}
                  onChange={(e) => setValorCota(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Valor Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={valorMensal}
                  onChange={(e) => setValorMensal(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-6 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Mês Inicial
                </label>
                <input
                  type="date"
                  value={mesInicial}
                  onChange={(e) => setMesInicial(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-6 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Mês Final
                </label>
                <input
                  type="date"
                  value={mesFinal}
                  onChange={(e) => setMesFinal(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de Filtros e Busca */}
      {gruposList.length > 0 && (
        <div className={`flex flex-col xl:flex-row gap-4 items-center justify-between p-5 rounded-[24px] border ${A.card} shadow-sm transition-all text-left`}>
          <div className="relative w-full xl:w-[420px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por período, cota ou valor mensal..."
              className={`w-full pl-11 pr-10 py-3 text-sm rounded-2xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-brand-purple transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold w-full xl:w-auto xl:justify-end">
            <div className="flex items-center gap-2">
              <span className={A.textMuted}>Ordenar por:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className={`p-2 rounded-xl border outline-none text-xs font-bold cursor-pointer transition-all ${A.inputText}`}
              >
                <option value="periodo_text">Nome período</option>
                <option value="mesinicial_date">Data Início</option>
                <option value="mesfinal_date">Data término</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className={A.textMuted}>Ordem:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className={`p-2 rounded-xl border outline-none text-xs font-bold cursor-pointer transition-all ${A.inputText}`}
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Listagem de Grupos */}
      {gruposList.length === 0 ? (
        <div className={`p-12 text-center border ${A.card} rounded-[24px] shadow-sm`}>
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
              <FolderHeart size={28} />
            </div>
            <span className={`font-bold text-base mt-2 ${A.textPrimary}`}>
              Nenhum grupo cadastrado
            </span>
            <span className={`text-xs ${A.textMuted}`}>
              Acesse as Configurações &gt; Importação para carregar os grupos do Bubble.io ou crie um grupo novo acima.
            </span>
          </div>
        </div>
      ) : filteredAndSortedGrupos.length === 0 ? (
        <div className={`p-12 text-center border ${A.card} rounded-[24px] shadow-sm`}>
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
              <FolderHeart size={28} />
            </div>
            <span className={`font-bold text-base mt-2 ${A.textPrimary}`}>
              Nenhum grupo {statusFilter === 'ativos' ? 'ativo' : 'encerrado'} encontrado
            </span>
            <span className={`text-xs ${A.textMuted}`}>
              Atualmente não existem grupos de consórcios {statusFilter === 'ativos' ? 'ativos' : 'encerrados'} cadastrados com estes filtros.
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredAndSortedGrupos.map((g) => {
            const isEditing = selectedGrupoId === g.id;
            return (
              <div
                key={g.id}
                onClick={() => handleEditClick(g)}
                className={`border-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                  isEditing
                    ? 'border-brand-purple ring-2 ring-brand-purple/20'
                    : g.encerrado_boolean
                    ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    : 'border-brand-purple/70 hover:border-brand-purple'
                } ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-44`}
                title="Clique para editar este grupo"
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-lg leading-tight ${A.textPrimary}`}>
                    {g.periodo_text || 'Período não definido'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      g.encerrado_boolean
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {g.encerrado_boolean ? 'Encerrado' : 'Ativo'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold">
                  <div>
                    <p className={A.textMuted}>Valor da Cota</p>
                    <p className="text-sm font-bold text-brand-purple">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(g.valorcota_number || 0)}
                    </p>
                  </div>
                  <div>
                    <p className={A.textMuted}>Valor Mensal</p>
                    <p className={`text-sm font-bold ${A.textPrimary}`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(g.valor_number || 0)}
                    </p>
                  </div>
                  <div>
                    <p className={A.textMuted}>Início</p>
                    <p className={`text-[10px] font-medium ${A.textPrimary}`}>
                      {g.mesinicial_date ? new Date(g.mesinicial_date).toLocaleDateString('pt-BR', {
                        timeZone: 'UTC'
                      }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={A.textMuted}>Término</p>
                    <p className={`text-[10px] font-medium ${A.textPrimary}`}>
                      {g.mesfinal_date ? new Date(g.mesfinal_date).toLocaleDateString('pt-BR', {
                        timeZone: 'UTC'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default GruposTab;
