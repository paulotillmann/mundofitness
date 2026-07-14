import React, { useState, useMemo, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { DashboardContext } from '../DashboardContext';
import {
  Users,
  ArrowUpRight,
  Plus,
  X,
  Search,
  Shirt,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

interface Cliente {
  id: string;
  bubble_id?: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  status: string;
  endereco?: string;
  datanascimento?: string;
  outrasinformacoes?: string;
  vestetamanho?: string;
  data_cadastro?: string;
}

const ClientesTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A, globalSearch, clientesList, refreshClientes } = ctx;
  // Estados locais do Formulário
  const [showForm, setShowForm] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [datanascimento, setDatanascimento] = useState('');
  const [data_cadastro, setDataCadastro] = useState('');
  const [plano, setPlano] = useState('Premium');
  const [outrasinformacoes, setOutrasinformacoes] = useState('');
  const [vestetamanho, setVestetamanho] = useState('');
  const [status, setStatus] = useState('Ativo');

  // Estados locais de listagem/filtro
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(''); // Estado para busca local opcional se quiserem no futuro, por enquanto vazio

  const itemsPerPage = 14;

  // Formatar Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
    }
    setTelefone(formatted);
  };

  // Carregar dados no formulário de edição
  const handleEditClick = (cliente: Cliente) => {
    setSelectedClienteId(cliente.id);
    setNome(cliente.name || '');
    setTelefone(cliente.phone === '(00) 00000-0000' || cliente.phone === '(00)00000-0000' ? '' : cliente.phone || '');
    setEmail(cliente.email || '');
    setPlano(cliente.plan || 'Premium');
    setEndereco(cliente.endereco || '');
    setDatanascimento(cliente.datanascimento ? cliente.datanascimento.substring(0, 10) : '');
    setDataCadastro(cliente.data_cadastro ? cliente.data_cadastro.substring(0, 10) : '');
    setOutrasinformacoes(cliente.outrasinformacoes || '');
    setVestetamanho(cliente.vestetamanho || '');
    setStatus(cliente.status || 'Ativo');
    setShowForm(true);
  };

  // Resetar Formulário
  const resetForm = () => {
    setSelectedClienteId(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setEndereco('');
    setDatanascimento('');
    setDataCadastro('');
    setPlano('Premium');
    setOutrasinformacoes('');
    setVestetamanho('');
    setStatus('Ativo');
    setShowForm(false);
  };

  // Salvar/Editar Cliente no Supabase
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    try {
      if (selectedClienteId) {
        // Atualizar existente
        const { error } = await supabase
          .from('clientes')
          .update({
            nome,
            celular: telefone || null,
            email: email || null,
            plano,
            status,
            endereco: endereco || null,
            datanascimento: datanascimento ? datanascimento + 'T00:00:00Z' : null,
            outrasinformacoes: outrasinformacoes || null,
            vestetamanho: vestetamanho || null,
            data_cadastro: data_cadastro ? data_cadastro + 'T00:00:00Z' : null
          })
          .eq('id', selectedClienteId);

        if (error) {
          alert('Erro ao atualizar cliente no Supabase: ' + error.message);
          return;
        }
      } else {
        // Criar novo
        const { error } = await supabase
          .from('clientes')
          .insert([
            {
              nome,
              celular: telefone || null,
              email: email || null,
              plano,
              status,
              endereco: endereco || null,
              datanascimento: datanascimento ? datanascimento + 'T00:00:00Z' : null,
              outrasinformacoes: outrasinformacoes || null,
              vestetamanho: vestetamanho || null,
              data_cadastro: data_cadastro ? data_cadastro + 'T00:00:00Z' : new Date().toISOString()
            }
          ]);

        if (error) {
          alert('Erro ao salvar cliente no Supabase: ' + error.message);
          return;
        }
      }

      await refreshClientes();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado: ' + err.message);
    }
  };

  // Estatísticas de tamanhos
  const sizeStats = useMemo(() => {
    const stats: Record<string, number> = {
      PP: 0,
      P: 0,
      M: 0,
      G: 0,
      GG: 0,
      XG: 0,
      XGG: 0,
      'Não Informado': 0
    };
    clientesList.forEach((c) => {
      const size = c.vestetamanho ? String(c.vestetamanho).toUpperCase().trim() : '';
      const mappedSize = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].includes(size) ? size : 'Não Informado';
      stats[mappedSize]++;
    });
    return {
      stats,
      total: clientesList.length
    };
  }, [clientesList]);

  // Filtragem
  const filteredClientes = useMemo(() => {
    const sTermLocal = localSearch.toLowerCase().trim();
    const sTermGlobal = globalSearch.toLowerCase().trim();
    
    let res = clientesList;

    // Filtro por tamanho de roupa
    if (selectedSizeFilter) {
      res = res.filter((c) => {
        const size = c.vestetamanho ? String(c.vestetamanho).toUpperCase().trim() : '';
        const mappedSize = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].includes(size) ? size : 'Não Informado';
        return mappedSize === selectedSizeFilter;
      });
    }

    // Filtro por termos de busca
    if (sTermLocal || sTermGlobal) {
      res = res.filter((c) => {
        const name = c.name ? c.name.toLowerCase() : '';
        const mail = c.email ? c.email.toLowerCase() : '';
        const phone = c.phone ? c.phone.toLowerCase() : '';
        const phoneClean = c.phone ? c.phone.replace(/\D/g, '') : '';
        const addr = c.endereco ? c.endereco.toLowerCase() : '';
        const info = c.outrasinformacoes ? c.outrasinformacoes.toLowerCase() : '';

        const termCleanGlobal = sTermGlobal.replace(/\D/g, '');
        const matchGlobal = !sTermGlobal || 
          name.includes(sTermGlobal) ||
          mail.includes(sTermGlobal) ||
          phone.includes(sTermGlobal) ||
          (termCleanGlobal !== '' && phoneClean.includes(termCleanGlobal)) ||
          addr.includes(sTermGlobal) ||
          info.includes(sTermGlobal);

        const termCleanLocal = sTermLocal.replace(/\D/g, '');
        const matchLocal = !sTermLocal || 
          name.includes(sTermLocal) ||
          mail.includes(sTermLocal) ||
          phone.includes(sTermLocal) ||
          (termCleanLocal !== '' && phoneClean.includes(termCleanLocal)) ||
          addr.includes(sTermLocal) ||
          info.includes(sTermLocal);

        return matchGlobal && matchLocal;
      });
    }

    return res;
  }, [clientesList, selectedSizeFilter, globalSearch, localSearch]);

  // Ordenação
  const sortedClientes = useMemo(() => {
    if (!sortField) return filteredClientes;

    return [...filteredClientes].sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (sortField === 'data_cadastro' || sortField === 'datanascimento') {
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
  }, [filteredClientes, sortField, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(sortedClientes.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedClientes.length, totalPages, currentPage]);

  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedClientes.slice(start, start + itemsPerPage);
  }, [sortedClientes, currentPage]);

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

  // Auxiliar de cálculo de idade
  const getAgeText = (birthDateStr: string | undefined) => {
    if (!birthDateStr) return '';
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return '';
    const today = new Date();
    const birthYear = birth.getUTCFullYear();
    const birthMonth = birth.getUTCMonth();
    const birthDay = birth.getUTCDate();
    let age = today.getFullYear() - birthYear;
    const m = today.getMonth() - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age >= 0 ? ` (${age} anos)` : '';
  };

  // Header de Ordenação Auxiliar
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
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center text-left">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Clientes
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Consulte, edite ou crie novos clientes da academia.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-4 rounded-xl font-semibold shadow-md shadow-brand-purple/15 transition-all active:scale-[0.98]"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Grid de Estatísticas por Tamanho */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-4 select-none">
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => {
            setSelectedSizeFilter(null);
            setCurrentPage(1);
          }}
          className={`border cursor-pointer ${
            selectedSizeFilter === null
              ? 'border-brand-purple ring-2 ring-brand-purple/30 text-purple-950'
              : 'border-purple-200 text-purple-950/80 hover:border-purple-300'
          } rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden`}
          style={{ backgroundColor: '#EFE0F8' }}
          title="Mostrar todos os tamanhos"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-brand-purple" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                Total
              </span>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-200/40 text-purple-700 transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="mt-4 text-left">
            <h4 className="text-3xl font-bold tracking-tight text-purple-955">
              {sizeStats.total}
            </h4>
            <p className="text-[10px] text-purple-800/80 font-medium mt-1">
              Clientes ativos e inativos
            </p>
          </div>
          <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-brand-purple h-full rounded-full w-full" />
          </div>
        </motion.div>

        {[
          { size: 'PP', label: 'Tamanho PP', colorClass: 'text-cyan-500', barBg: 'bg-cyan-500' },
          { size: 'P', label: 'Tamanho P', colorClass: 'text-emerald-500', barBg: 'bg-emerald-500' },
          { size: 'M', label: 'Tamanho M', colorClass: 'text-[#A3E635]', barBg: 'bg-[#A3E635]' },
          { size: 'G', label: 'Tamanho G', colorClass: 'text-brand-purple', barBg: 'bg-brand-purple' },
          { size: 'GG', label: 'Tamanho GG', colorClass: 'text-blue-500', barBg: 'bg-blue-500' },
          { size: 'XG', label: 'Tamanho XG', colorClass: 'text-rose-500', barBg: 'bg-rose-500' },
          { size: 'XGG', label: 'Tamanho XGG', colorClass: 'text-amber-500', barBg: 'bg-amber-500' },
          { size: 'Não Informado', label: 'Sem Tamanho', colorClass: 'text-slate-500', barBg: 'bg-slate-400' }
        ].map((sObj) => {
          const count = sizeStats.stats[sObj.size] || 0;
          const pct = sizeStats.total > 0 ? Math.round((count / sizeStats.total) * 100) : 0;
          const isSelected = selectedSizeFilter === sObj.size;

          const borderRingClass = isSelected
            ? sObj.size === 'M'
              ? 'border-[#92d02e] ring-2 ring-[#A3E635]/30 text-purple-955'
              : `${sObj.colorClass.replace('text-', 'border-')} ring-2 ${sObj.colorClass.replace('text-', 'ring-')}/30 text-purple-955`
            : 'border-purple-200 text-purple-950/80 hover:border-purple-300';

          return (
            <motion.div
              key={sObj.size}
              whileHover={{ y: -4 }}
              onClick={() => {
                setSelectedSizeFilter((prev) => (prev === sObj.size ? null : sObj.size));
                setCurrentPage(1);
              }}
              className={`border cursor-pointer ${borderRingClass} rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden`}
              style={{ backgroundColor: '#EFE0F8' }}
              title={`Filtrar por tamanho ${sObj.size}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shirt size={16} className={sObj.colorClass} />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900/70">
                    {sObj.size === 'Não Informado' ? 'N/I' : sObj.size}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-200/40 text-purple-700 transition-all">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="mt-4 text-left">
                <h4 className="text-3xl font-bold tracking-tight text-purple-955">
                  {count}
                </h4>
                <p className="text-[10px] text-purple-800/80 font-medium mt-1">
                  {pct}% do total
                </p>
              </div>
              <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className={`${sObj.barBg} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Formulário de Criação/Edição */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`border ${A.card} rounded-[24px] p-6 overflow-hidden shadow-inner text-left`}
          >
            <div className="flex items-center justify-between gap-4 mb-6 pb-2">
              <h3 className={`font-bold text-lg flex items-center gap-2 ${A.textPrimary}`}>
                <UserPlus className="text-brand-purple" size={20} />
                {selectedClienteId ? `Editar Cliente: ${nome}` : 'Cadastrar Novo Cliente'}
              </h3>
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Status
                </span>
                <button
                  type="button"
                  onClick={() => setStatus((s) => (s === 'Ativo' ? 'Inativo' : 'Ativo'))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    status === 'Ativo' ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={`Alterar status para ${status === 'Ativo' ? 'Inativo' : 'Ativo'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      status === 'Ativo' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-bold transition-colors duration-200 ${status === 'Ativo' ? 'text-brand-purple' : 'text-slate-400 dark:text-slate-500'}`}>
                  {status}
                </span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Telefone/WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={telefone}
                  onChange={handlePhoneChange}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-6 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Endereço
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-3 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={datanascimento}
                  onChange={(e) => setDatanascimento(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-3 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Data de Cadastro
                </label>
                <input
                  type="date"
                  value={data_cadastro}
                  onChange={(e) => setDataCadastro(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`}
                />
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Plano
                </label>
                <select
                  value={plano}
                  onChange={(e) => setPlano(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-bold ${A.inputText}`}
                >
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="Básico">Básico</option>
                </select>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Tamanho de Roupa
                </label>
                <select
                  value={vestetamanho}
                  onChange={(e) => setVestetamanho(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none text-sm font-bold ${A.inputText}`}
                >
                  <option value="">Não Informado</option>
                  <option value="PP">PP</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                  <option value="XG">XG</option>
                  <option value="XGG">XGG</option>
                </select>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                  Outras Informações
                </label>
                <input
                  type="text"
                  placeholder="Ex: Restrição de saúde, observações"
                  value={outrasinformacoes}
                  onChange={(e) => setOutrasinformacoes(e.target.value)}
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

      {/* Barra de Busca Local */}
      <div className={`border ${A.card} rounded-[24px] p-5 shadow-sm text-left`}>
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
            placeholder="Buscar por nome, endereço, telefone ou observações..."
            className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className={`border ${A.card} rounded-[24px] overflow-hidden shadow-sm text-left`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                {renderSortableHeader('name', 'Nome')}
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Telefone</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">E-mail</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Plano</th>
                {renderSortableHeader('datanascimento', 'Data Nascimento')}
                {renderSortableHeader('data_cadastro', 'Data Cadastro')}
                <th className="p-4 font-semibold uppercase tracking-wider text-xs text-center">Tamanho</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Endereço</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Observações</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        <Users size={28} />
                      </div>
                      <span className="font-bold text-base mt-2 text-slate-800 dark:text-slate-200">
                        Nenhum cliente encontrado
                      </span>
                      <span className="text-xs opacity-75">
                        Nenhum registro corresponde aos filtros de busca atuais. Tente digitar outro termo.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((c) => {
                  const isEditing = selectedClienteId === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleEditClick(c)}
                      className={`group border-b ${A.border} ${A.tableRowHover} transition-colors cursor-pointer ${
                        isEditing
                          ? 'bg-purple-100/30 dark:bg-purple-950/20 border-purple-300/30'
                          : 'hover:bg-purple-50/10 dark:hover:bg-[#1E1B4B]/10'
                      }`}
                      title="Clique para editar este cliente"
                    >
                      <td className={`p-4 font-bold ${A.textPrimary}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span>{c.name}</span>
                          <span className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-brand-purple transition-all duration-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-pencil"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </span>
                        </div>
                      </td>
                      <td className={`p-4 text-xs font-semibold ${A.textPrimary}`}>{c.phone}</td>
                      <td className={`p-4 text-xs ${A.textPrimary}`}>{c.email || '-'}</td>
                      <td className="p-4 text-xs">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.plan === 'VIP'
                              ? 'bg-purple-100 text-purple-700'
                              : c.plan === 'Premium'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.plan}
                        </span>
                      </td>
                      <td className={`p-4 text-xs ${A.textPrimary}`}>
                        {c.datanascimento
                          ? `${new Date(c.datanascimento).toLocaleDateString('pt-BR', {
                              timeZone: 'UTC'
                            })}${getAgeText(c.datanascimento)}`
                          : '-'}
                      </td>
                      <td className={`p-4 text-xs ${A.textPrimary}`}>
                        {c.data_cadastro ? new Date(c.data_cadastro).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="p-4 text-xs font-bold text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 text-[10px]">
                          {c.vestetamanho || '-'}
                        </span>
                      </td>
                      <td className={`p-4 text-xs max-w-[180px] truncate ${A.textPrimary}`} title={c.endereco}>
                        {c.endereco || '-'}
                      </td>
                      <td className={`p-4 text-xs max-w-[180px] truncate ${A.textPrimary}`} title={c.outrasinformacoes}>
                        {c.outrasinformacoes || '-'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.status === 'Ativo' ? 'bg-[#C0F62C]/20 text-[#6D9800]' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Ativo' ? 'bg-brand-lime' : 'bg-rose-500'}`} />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação footer */}
        {totalPages > 1 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t ${A.border} ${A.bgLight}`}>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Exibindo <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredClientes.length)}</span> a{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, filteredClientes.length)}</span> de{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{filteredClientes.length}</span> clientes
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  currentPage === totalPages
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
      </div>
    </motion.div>
  );
};

export default ClientesTab;
