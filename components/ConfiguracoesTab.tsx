import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  Database,
  SlidersHorizontal,
  Lock,
  EyeOff,
  Eye,
  FileSpreadsheet,
  Globe,
  Plus,
  RefreshCw
} from 'lucide-react';

interface ConfiguracoesTabProps {
  A: any;
  refreshClientes: () => Promise<void>;
  refreshGrupos: () => Promise<void>;
  refreshConsorcios: () => Promise<void>;
}

const ConfiguracoesTab: React.FC<ConfiguracoesTabProps> = ({
  A,
  refreshClientes,
  refreshGrupos,
  refreshConsorcios
}) => {
  // Sub-abas locais
  const [activeSection, setActiveSection] = useState<'importacao' | 'geral' | 'seguranca'>('importacao');
  const [activeImportType, setActiveImportType] = useState<string>('clientes');

  // URLs, Tokens e Visibilidade do Bubble.io
  const [apiUrls, setApiUrls] = useState<Record<string, string>>({
    clientes: 'https://mundofitness.app.br/version-test/api/1.1/obj/Clientes',
    grupos: 'https://mundofitness.app.br/version-test/api/1.1/obj/Grupos',
    consorcios: 'https://mundofitness.app.br/version-test/api/1.1/obj/Consorcios',
    pagamentos: 'https://mundofitness.app.br/version-test/api/1.1/obj/ConsorciosPagamentos',
    receitas: ''
  });

  const [apiTokens, setApiTokens] = useState<Record<string, string>>({
    clientes: '',
    grupos: '764f84d372e616198a92baedc311a736',
    consorcios: '764f84d372e616198a92baedc311a736',
    pagamentos: '764f84d372e616198a92baedc311a736',
    receitas: ''
  });

  const [tokenVisibility, setTokenVisibility] = useState<Record<string, boolean>>({
    clientes: false,
    grupos: false,
    consorcios: false,
    pagamentos: false,
    receitas: false
  });

  // Registros temporários carregados
  const [importedClientes, setImportedClientes] = useState<any[]>([]);
  const [importedGrupos, setImportedGrupos] = useState<any[]>([]);
  const [importedConsorcios, setImportedConsorcios] = useState<any[]>([]);
  const [importedPagamentos, setImportedPagamentos] = useState<any[]>([]);
  const [importedReceitas, setImportedReceitas] = useState<any[]>([]);

  // Estados de feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Alterar URL da API
  const handleUrlChange = (type: string, value: string) => {
    setApiUrls((prev) => ({ ...prev, [type]: value }));
  };

  // Alterar Token
  const handleTokenChange = (type: string, value: string) => {
    setApiTokens((prev) => ({ ...prev, [type]: value }));
  };

  // Toggle visibilidade do token
  const handleTokenVisibilityToggle = (type: string) => {
    setTokenVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Ler Tabela no Bubble.io
  const handleFetchFromBubble = async (type: string) => {
    const url = apiUrls[type];
    const token = apiTokens[type];

    if (!url) {
      setErrorMsg('Por favor, informe a URL da API do Bubble.io.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let allResults: any[] = [];
      let cursor = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const separator = url.includes('?') ? '&' : '?';
        const finalUrl = `${url}${separator}cursor=${cursor}&limit=${limit}`;

        const response = await fetch(finalUrl, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        let results: any[] = [];

        if (data && data.response && Array.isArray(data.response.results)) {
          results = data.response.results;
        } else if (data && Array.isArray(data.results)) {
          results = data.results;
        } else if (Array.isArray(data)) {
          results = data;
        } else if (data && typeof data === 'object') {
          const foundArray = Object.values(data).find((val) => Array.isArray(val));
          results = foundArray ? (foundArray as any[]) : [data];
        }

        if (results.length === 0) {
          hasMore = false;
          break;
        }

        allResults = [...allResults, ...results];

        if (data && data.response && typeof data.response.remaining === 'number') {
          if (data.response.remaining === 0) {
            hasMore = false;
          } else {
            cursor += results.length;
          }
        } else if (results.length < limit) {
          hasMore = false;
        } else {
          cursor += results.length;
        }
      }

      if (allResults.length === 0) {
        setErrorMsg('Nenhum dado retornado ou formato não suportado.');
        setIsLoading(false);
        return;
      }

      const formatted = allResults.map((item, idx) => {
        if (!item._id && !item.id) {
          return { _id: `id_${idx}_${Date.now()}`, ...item };
        }
        return item;
      });

      if (type === 'clientes') setImportedClientes(formatted);
      else if (type === 'grupos') setImportedGrupos(formatted);
      else if (type === 'consorcios') setImportedConsorcios(formatted);
      else if (type === 'pagamentos') setImportedPagamentos(formatted);
      else if (type === 'receitas') setImportedReceitas(formatted);

      setSuccessMsg(`Sucesso! ${allResults.length} registros lidos da API do Bubble.io.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        'Erro de conexão/CORS: Não foi possível acessar o Bubble.io. Certifique-se de que a URL está correta, que o token privado é válido, e que as configurações de CORS do seu app permitem a origem atual.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar Mock de Teste
  const handleLoadMockData = (type: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    setTimeout(() => {
      if (type === 'clientes') {
        setImportedClientes([
          { id: 'b1', name: 'Mariana Souza (Bubble)', phone: '(11) 99999-1111', email: 'mariana.souza@bubble.io', plan: 'VIP', status: 'Ativo', 'Created Date': '2024-11-29T14:29:29.687Z' },
          { id: 'b2', name: 'Roberto Costa (Bubble)', phone: '(21) 98888-2222', email: 'roberto.costa@bubble.io', plan: 'Premium', status: 'Ativo', 'Created Date': '2024-11-29T14:30:39.925Z' },
          { id: 'b3', name: 'Clara Mendes (Bubble)', phone: '(31) 97777-3333', email: 'clara.mendes@bubble.io', plan: 'Básico', status: 'Inativo', 'Created Date': '2024-11-29T14:33:25.548Z' },
          { id: 'b4', name: 'Julio Nogueira (Bubble)', phone: '(81) 96666-4444', email: 'julio.nogueira@bubble.io', plan: 'Premium', status: 'Ativo', 'Created Date': '2024-11-29T14:36:52.343Z' },
          { id: 'b5', name: 'Beatriz Lima (Bubble)', phone: '(11) 95555-5555', email: 'beatriz.lima@bubble.io', plan: 'VIP', status: 'Ativo', 'Created Date': '2024-11-29T14:43:10.736Z' }
        ]);
      } else if (type === 'grupos') {
        setImportedGrupos([
          { id: 'g1', title: 'Bubble Crossfit A', members: 12, time: '06:00', status: 'Ativo' },
          { id: 'g2', title: 'Bubble Fit Dance', members: 25, time: '18:00', status: 'Ativo' },
          { id: 'g3', title: 'Bubble Pilates Funcional', members: 8, time: '14:00', status: 'Ativo' },
          { id: 'g4', title: 'Bubble Musculação Avançada', members: 30, time: '20:00', status: 'Lotado' }
        ]);
      } else if (type === 'consorcios') {
        setImportedConsorcios([
          {
            _id: 'c1',
            'Created Date': '2024-11-29T18:14:57.292Z',
            'Modified Date': '2026-03-13T22:14:42.475Z',
            celularcliente_text: '99137-2680',
            cliente_custom_clientes: '1732890804508x969608427584356400',
            dataretirada_date: '2026-03-12T03:00:00.000Z',
            grupo_custom_grupos: '1732903495089x440403736550441000',
            nomecliente_text: 'TALYTA DE PAULA PIQUI',
            outrasinformacoescliente_text: 'CONSÓRCIO 9 X 66,66',
            valorretirada__number: 24,
            vencimentodia_number: 10,
            vestetamanhocliente_text: 'G',
            valormesgrupo_number: 60,
            mesretirada_option_meses: 'Janeiro',
            cotano_number: 119
          },
          {
            _id: 'c2',
            'Created Date': '2024-11-30T10:00:00.000Z',
            'Modified Date': '2026-03-13T22:14:42.475Z',
            celularcliente_text: '98888-2222',
            cliente_custom_clientes: 'invalid_bubble_id_for_test',
            dataretirada_date: null,
            grupo_custom_grupos: '1732903495089x440403736550441000',
            nomecliente_text: 'EDITE ARRUDA GUIMARÃES',
            outrasinformacoescliente_text: 'PREFEITURA MUNICIPAL DE ARAGUARI',
            valorretirada__number: 24,
            vencimentodia_number: 15,
            vestetamanhocliente_text: 'G',
            valormesgrupo_number: 60,
            mesretirada_option_meses: 'Fevereiro',
            cotano_number: 120
          }
        ]);
      } else if (type === 'pagamentos') {
        setImportedPagamentos([
          {
            _id: 'p1',
            'Created Date': '2026-07-01T12:00:00.000Z',
            'Modified Date': '2026-07-01T12:00:00.000Z',
            consorcio_custom_consorcios: 'c1',
            datapagamento_date: '2026-07-01T12:00:00.000Z',
            mesano_text: 'Jul/26',
            valorpago_number: 66.66,
            grupo_text: 'CONSÓRCIO 9 X 66,66'
          },
          {
            _id: 'p2',
            'Created Date': '2026-06-01T12:00:00.000Z',
            'Modified Date': '2026-06-01T12:00:00.000Z',
            consorcio_custom_consorcios: 'c1',
            datapagamento_date: '2026-06-01T12:00:00.000Z',
            mesano_text: 'Jun/26',
            valorpago_number: 66.66,
            grupo_text: 'CONSÓRCIO 9 X 66,66'
          },
          {
            _id: 'p3',
            'Created Date': '2026-07-01T12:00:00.000Z',
            'Modified Date': '2026-07-01T12:00:00.000Z',
            consorcio_custom_consorcios: 'c2',
            datapagamento_date: '2026-07-01T12:00:00.000Z',
            mesano_text: 'Jul/26',
            valorpago_number: 60,
            grupo_text: 'PREFEITURA MUNICIPAL DE ARAGUARI'
          }
        ]);
      } else if (type === 'receitas') {
        setImportedReceitas([
          { id: 'r1', description: 'Mensalidade Mariana (Bubble)', category: 'Mensalidade', value: 'R$ 150,00', date: '24/06/2026', type: 'Entrada' },
          { id: 'r2', description: 'Venda Whey Protein (Bubble)', category: 'Venda de Produto', value: 'R$ 220,00', date: '23/06/2026', type: 'Entrada' },
          { id: 'r3', description: 'Venda Creatina Pura (Bubble)', category: 'Venda de Produto', value: 'R$ 110,00', date: '22/06/2026', type: 'Entrada' }
        ]);
      }

      setIsLoading(false);
      setSuccessMsg(`Sucesso! Carregados dados simulados de teste para a aba ${type}.`);
    }, 800);
  };

  // Integrar Clientes ao Supabase
  const handleSyncClientes = async () => {
    if (importedClientes.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Buscar grupos para mapear o plano
      const { data: dbGrupos, error: gError } = await supabase.from('grupos').select('bubble_id, periodo_text');
      if (gError) throw new Error(`Erro ao buscar grupos do Supabase: ${gError.message}`);

      const groupMap = new Map<string, string>();
      dbGrupos?.forEach((g) => {
        if (g.bubble_id) groupMap.set(g.bubble_id, g.periodo_text);
      });

      const upsertData = importedClientes.map((c) => {
        const rawGroup =
          c.grupo_list_custom_grupos && c.grupo_list_custom_grupos.length > 0
            ? c.grupo_list_custom_grupos[0]
            : c.grupo_custom || c.grupo || c.grupo_text || c.Grupo || null;

        const mappedPlan = rawGroup ? groupMap.get(rawGroup) || c.plan || c.plano || 'Básico' : c.plan || c.plano || 'Básico';

        return {
          bubble_id: c._id || c.id,
          nome: c.nome_text || 'Sem nome',
          celular: c.celular_text || null,
          endereco: c.endereco_text || null,
          datanascimento: c.datanascimento_date || null,
          outrasinformacoes: c.outrasinformacoes_text || null,
          vestetamanho: c.vestetamanho_text || null,
          plano: mappedPlan,
          status: 'Ativo',
          data_cadastro: c['Created Date'] || null
        };
      });

      const { error } = await supabase.from('clientes').upsert(upsertData, {
        onConflict: 'bubble_id'
      });

      if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);

      await refreshClientes();
      setSuccessMsg(`Sucesso! ${upsertData.length} clientes do Bubble.io foram sincronizados com o Supabase.`);
      setImportedClientes([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao integrar dados com o Supabase: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Integrar Grupos ao Supabase
  const handleSyncGrupos = async () => {
    if (importedGrupos.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const upsertData = importedGrupos.map((g) => ({
        bubble_id: g._id || g.id,
        periodo_text: g.periodo_text || g.title || 'Sem Nome',
        valor_number: g.valor_number !== undefined ? g.valor_number : null,
        valorcota_number: g.valorcota_number !== undefined ? g.valorcota_number : null,
        mesinicial_date: g.mesinicial_date || null,
        mesfinal_date: g.mesfinal_date || null,
        encerrado_boolean: g.encerrado_boolean !== undefined ? g.encerrado_boolean : false,
        created_at: g['Created Date'] || new Date().toISOString(),
        updated_at: g['Modified Date'] || new Date().toISOString()
      }));

      const { error } = await supabase.from('grupos').upsert(upsertData, {
        onConflict: 'bubble_id'
      });

      if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);

      await refreshGrupos();
      setSuccessMsg(`Sucesso! ${upsertData.length} grupos do Bubble.io foram sincronizados com o Supabase.`);
      setImportedGrupos([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao integrar dados com o Supabase: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Integrar Consórcios ao Supabase
  const handleSyncConsorcios = async () => {
    if (importedConsorcios.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Obter ids locais dos clientes e grupos por bubble_id
      const { data: dbClientes, error: cErr } = await supabase.from('clientes').select('id, bubble_id');
      if (cErr) throw new Error(`Erro ao buscar clientes do Supabase: ${cErr.message}`);

      const { data: dbGrupos, error: gErr } = await supabase.from('grupos').select('id, bubble_id');
      if (gErr) throw new Error(`Erro ao buscar grupos do Supabase: ${gErr.message}`);

      const clientMap = new Map<string, string>();
      dbClientes?.forEach((c) => {
        if (c.bubble_id) clientMap.set(c.bubble_id, c.id);
      });

      const groupMap = new Map<string, string>();
      dbGrupos?.forEach((g) => {
        if (g.bubble_id) groupMap.set(g.bubble_id, g.id);
      });

      const upsertData = importedConsorcios.map((c) => {
        const bubbleClient = c.cliente_custom_clientes || null;
        const bubbleGroup = c.grupo_custom_grupos || null;

        return {
          bubble_id: c._id || c.id,
          cliente_id: bubbleClient && clientMap.get(bubbleClient) || null,
          grupo_id: bubbleGroup && groupMap.get(bubbleGroup) || null,
          dataretirada_date: c.dataretirada_date || null,
          vencimentodia_number: c.vencimentodia_number !== undefined ? c.vencimentodia_number : null,
          cotano_number: c.cotano_number !== undefined ? c.cotano_number : null,
          mesretirada_text: (() => {
            if (c.mesretiradas_date) {
              try {
                const d = new Date(c.mesretiradas_date);
                const meses = [
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];
                const mesNome = meses[d.getUTCMonth()];
                const ano = d.getUTCFullYear();
                return `${mesNome}/${ano}`;
              } catch (e) {
                console.error('Erro ao converter mesretiradas_date:', e);
              }
            }
            
            const mes = c.mesretirada_option_meses;
            if (!mes) return null;
            
            const dateStr = c.dataretirada_date || c['Created Date'];
            if (!dateStr) return mes;
            try {
              const year = new Date(dateStr).getUTCFullYear();
              return `${mes}/${year}`;
            } catch {
              return mes;
            }
          })(),
          created_at: c['Created Date'] || new Date().toISOString(),
          updated_at: c['Modified Date'] || new Date().toISOString()
        };
      });

      const { error } = await supabase.from('consorcios').upsert(upsertData, {
        onConflict: 'bubble_id'
      });

      if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);

      await refreshConsorcios();
      setSuccessMsg(`Sucesso! ${upsertData.length} consórcios do Bubble.io foram sincronizados com o Supabase.`);
      setImportedConsorcios([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao integrar dados com o Supabase: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Integrar Pagamentos ao Supabase
  const handleSyncPagamentos = async () => {
    if (importedPagamentos.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Obter consórcios locais para mapear consorcio_id e grupo_id
      const { data: dbConsorcios, error: cErr } = await supabase
        .from('consorcios')
        .select('id, bubble_id, grupo_id');
      if (cErr) throw new Error(`Erro ao buscar consórcios do Supabase: ${cErr.message}`);

      const consorcioMap = new Map<string, { id: string; grupo_id: string }>();
      dbConsorcios?.forEach((c) => {
        if (c.bubble_id) {
          consorcioMap.set(c.bubble_id, { id: c.id, grupo_id: c.grupo_id });
        }
      });

      const upsertData = importedPagamentos.map((p) => {
        const bubbleConsorcio = p.consorcio_custom_consorcios || null;
        const consorcioInfo = bubbleConsorcio ? consorcioMap.get(bubbleConsorcio) : null;

        return {
          bubble_id: p._id || p.id,
          consorcio_id: consorcioInfo ? consorcioInfo.id : null,
          grupo_id: consorcioInfo ? consorcioInfo.grupo_id : null,
          datapagamento_date: p.datapagamento_date || null,
          mesano_text: p.mesano_text || null,
          valorpago_number: p.valorpago_number !== undefined ? p.valorpago_number : null,
          grupo_text: p.grupo_text || null,
          valor_parcela: p.valorpago_number !== undefined ? p.valorpago_number : null,
          data_vencimento: p.datapagamento_date || null,
          created_at: p['Created Date'] || new Date().toISOString(),
          updated_at: p['Modified Date'] || new Date().toISOString()
        };
      });

      const { error } = await supabase.from('consorcios_pagamentos').upsert(upsertData, {
        onConflict: 'bubble_id'
      });

      if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);

      await refreshConsorcios();
      setSuccessMsg(`Sucesso! ${upsertData.length} pagamentos do Bubble.io foram sincronizados com o Supabase.`);
      setImportedPagamentos([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao integrar dados com o Supabase: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Pegar cabeçalhos das chaves dinamicamente
  const getKeys = (list: any[]) => {
    if (!list || list.length === 0) return [];
    const keys = new Set<string>();
    list.forEach((item) => {
      Object.keys(item).forEach((k) => keys.add(k));
    });
    const arr = Array.from(keys);
    return arr.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower === 'id' || aLower === '_id') return -1;
      if (bLower === 'id' || bLower === '_id') return 1;
      if (aLower === 'name' || aLower === 'nome' || aLower === 'title' || aLower === 'titulo') return -1;
      if (bLower === 'name' || bLower === 'nome' || bLower === 'title' || bLower === 'titulo') return 1;
      return a.localeCompare(b);
    });
  };

  const getImportedList = () => {
    switch (activeImportType) {
      case 'clientes': return importedClientes;
      case 'grupos': return importedGrupos;
      case 'consorcios': return importedConsorcios;
      case 'pagamentos': return importedPagamentos;
      case 'receitas': return importedReceitas;
      default: return [];
    }
  };

  const currentList = getImportedList();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-left"
    >
      <div className="space-y-1">
        <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
          Configurações do Sistema
        </h1>
        <p className={`text-sm ${A.textMuted}`}>
          Gerencie as preferências da sua conta, conexões e integrações de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Menu de Configurações */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {[
            { id: 'importacao', label: 'Importação', icon: Database, desc: 'Importar tabelas do Bubble.io' },
            { id: 'geral', label: 'Geral', icon: SlidersHorizontal, desc: 'Configurações do sistema', disabled: true },
            { id: 'seguranca', label: 'Segurança', icon: Lock, desc: 'Controle de acessos', disabled: true }
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => !sec.disabled && setActiveSection(sec.id as any)}
                disabled={sec.disabled}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  sec.disabled
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : isActive
                    ? 'bg-brand-purple border-brand-purple text-white shadow-md shadow-brand-purple/20'
                    : `${A.card} ${A.bgHover} hover:border-brand-purple/30`
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-brand-purple/10 text-brand-purple'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isActive ? 'text-white' : A.textPrimary}`}>{sec.label}</p>
                  <p className={`text-[9px] mt-0.5 ${isActive ? 'text-purple-100' : A.textMuted}`}>{sec.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Painel da Seção Ativa */}
        <div className="lg:col-span-9">
          {activeSection === 'importacao' && (
            <div className={`border ${A.card} rounded-[24px] p-6 shadow-sm space-y-6`}>
              <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className={`font-bold text-xl ${A.textPrimary}`}>Central de Importação</h2>
                  <p className={`text-xs ${A.textMuted} mt-1`}>
                    Carregue dados diretamente da sua base Bubble.io para as tabelas do MundoFitness.
                  </p>
                </div>
              </div>

              {/* Seletor de Tipo de Importação */}
              <div className="flex flex-wrap gap-2 text-xs font-bold border-b pb-4 border-slate-200 dark:border-slate-700">
                {[
                  { id: 'clientes', label: 'Clientes' },
                  { id: 'grupos', label: 'Grupos' },
                  { id: 'consorcios', label: 'Consórcios' },
                  { id: 'pagamentos', label: 'Consórcios Pagamentos' },
                  { id: 'receitas', label: 'Receitas' }
                ].map((type) => {
                  const isActive = activeImportType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setActiveImportType(type.id);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`px-4 py-2.5 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0F172A] text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Inputs da API e Token */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`}>
                      Link da API do Bubble.io
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Globe size={16} />
                      </span>
                      <input
                        type="url"
                        placeholder={
                          activeImportType === 'clientes'
                            ? 'https://seu-app.bubbleapps.io/version-test/api/1.1/obj/cliente'
                            : activeImportType === 'grupos'
                            ? 'https://seu-app.bubbleapps.io/version-test/api/1.1/obj/grupo'
                            : activeImportType === 'consorcios'
                            ? 'https://seu-app.bubbleapps.io/version-test/api/1.1/obj/consorcio'
                            : activeImportType === 'pagamentos'
                            ? 'https://seu-app.bubbleapps.io/version-test/api/1.1/obj/consorcio_pagamento'
                            : 'https://seu-app.bubbleapps.io/version-test/api/1.1/obj/receita'
                        }
                        value={apiUrls[activeImportType] || ''}
                        onChange={(e) => handleUrlChange(activeImportType, e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${A.textMuted} flex items-center gap-1`}>
                      <Lock size={12} /> Token Privado (Private Key)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
                        <Lock size={16} />
                      </span>
                      <input
                        type={tokenVisibility[activeImportType] ? 'text' : 'password'}
                        placeholder="Chave secreta de autenticação do Bubble.io"
                        value={apiTokens[activeImportType] || ''}
                        onChange={(e) => handleTokenChange(activeImportType, e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleTokenVisibilityToggle(activeImportType)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-brand-purple transition-colors cursor-pointer"
                      >
                        {tokenVisibility[activeImportType] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleFetchFromBubble(activeImportType)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-5 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Buscando...
                      </>
                    ) : (
                      <>
                        <Database size={16} /> Ler Tabela no Bubble.io
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleLoadMockData(activeImportType)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 border ${A.border} ${A.bgHover} ${A.textPrimary} py-2.5 px-5 rounded-xl font-semibold transition-all active:scale-[0.98] cursor-pointer`}
                  >
                    <FileSpreadsheet size={16} className="text-brand-lime" /> Carregar Mock de Teste
                  </button>
                </div>
              </div>

              {/* Feedbacks */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-xs text-left leading-relaxed space-y-2 animate-fadeIn">
                  <p className="font-bold flex items-center gap-2">⚠️ Falha na Importação</p>
                  <p>{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs text-left font-medium animate-fadeIn">
                  <p className="flex items-center gap-2">✅ {successMsg}</p>
                </div>
              )}

              {/* Visualização de Registros Importados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-md ${A.textPrimary}`}>Registros Importados</h3>
                  {activeImportType === 'clientes' && currentList.length > 0 && (
                    <button
                      onClick={handleSyncClientes}
                      className="flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={14} /> Integrar ao Dashboard ({currentList.length})
                    </button>
                  )}
                  {activeImportType === 'grupos' && currentList.length > 0 && (
                    <button
                      onClick={handleSyncGrupos}
                      className="flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={14} /> Integrar ao Dashboard ({currentList.length})
                    </button>
                  )}
                  {activeImportType === 'consorcios' && currentList.length > 0 && (
                    <button
                      onClick={handleSyncConsorcios}
                      className="flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={14} /> Integrar ao Dashboard ({currentList.length})
                    </button>
                  )}
                  {activeImportType === 'pagamentos' && currentList.length > 0 && (
                    <button
                      onClick={handleSyncPagamentos}
                      className="flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={14} /> Integrar ao Dashboard ({currentList.length})
                    </button>
                  )}
                </div>

                <div className={`border ${A.border} rounded-2xl overflow-hidden`}>
                  {currentList.length === 0 ? (
                    <div className={`p-8 text-center text-xs ${A.textMuted}`}>
                      Nenhum registro carregado. Insira a API do Bubble ou clique em "Carregar Mock de Teste".
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[350px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`border-b ${A.border} ${A.tableHeader}`}>
                            {getKeys(currentList).map((k) => (
                              <th key={k} className="p-3 font-bold uppercase tracking-wider text-xs">
                                {k === '_id' || k === 'id' ? 'ID (Bubble)' : k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentList.map((item, idx) => {
                            const keys = getKeys(currentList);
                            return (
                              <tr key={item.id || item._id || idx} className={`border-b ${A.border} ${A.tableRowHover} transition-colors`}>
                                {keys.map((k) => {
                                  const val = item[k];
                                  let text = '';
                                  if (val == null) text = '-';
                                  else if (typeof val === 'object') text = JSON.stringify(val);
                                  else text = String(val);

                                  const isStatus = k.toLowerCase() === 'status' || k.toLowerCase() === 'situacao';
                                  const isPlan = k.toLowerCase() === 'plan' || k.toLowerCase() === 'plano';
                                  const isImportantText = ['name', 'nome', 'title', 'titulo', 'description', 'descricao'].includes(k.toLowerCase());

                                  if (isStatus) {
                                    const active = val === 'Ativo' || val === 'Pago' || val === 'Ativa';
                                    return (
                                      <td key={k} className="p-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          active ? 'bg-[#C0F62C]/20 text-[#6D9800]' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                          {text}
                                        </span>
                                      </td>
                                    );
                                  }

                                  if (isPlan) {
                                    return (
                                      <td key={k} className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          val === 'VIP'
                                            ? 'bg-purple-100 text-purple-700'
                                            : val === 'Premium'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}>
                                          {text}
                                        </span>
                                      </td>
                                    );
                                  }

                                  return (
                                    <td
                                      key={k}
                                      className={`p-3 ${isImportantText ? 'font-bold ' + A.textPrimary : 'opacity-80'} ${
                                        k === '_id' || k === 'id' ? 'font-mono text-[10px] opacity-60' : ''
                                      }`}
                                    >
                                      {text}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConfiguracoesTab;
