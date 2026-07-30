import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { DashboardContext } from '../DashboardContext';
import {
  FolderHeart,
  Users,
  Trophy,
  Search,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  X,
  Volume2,
  VolumeX,
  Award,
  Crown,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';

// Nomes dos meses em Português (capitalizados)
const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Utilitário para formatar mês/ano a partir de uma data inicial e um deslocamento (offset)
const getMonthDetails = (baseDateStr: string | undefined, monthOffset: number) => {
  let date: Date;
  if (baseDateStr) {
    const parsed = new Date(baseDateStr);
    date = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    date = new Date();
  }

  // Ajustar para o 1º dia do mês
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const targetDate = new Date(Date.UTC(year, month + monthOffset, 1, 12, 0, 0));
  const monthName = MESES_PT[targetDate.getUTCMonth()];
  const targetYear = targetDate.getUTCFullYear();

  return {
    text: `${monthName}/${targetYear}`,
    date: targetDate,
    monthName,
    year: targetYear
  };
};

// Sintetizador de Áudio (Web Audio API) para Efeitos Sonoros
class RaffleSoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Som de tick da roleta
  playTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // Som de Fanfarra / Vitória
  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.09 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.09);
        osc.stop(this.ctx!.currentTime + i * 0.09 + 0.5);
      });
    } catch {}
  }
}

const soundFX = new RaffleSoundFX();

const SorteioTab: React.FC = () => {
  const ctx = useContext(DashboardContext)!;
  const { A, gruposList, consorciosList, refreshConsorcios } = ctx;

  // Estados de Seleção e Busca
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  const [grupoSearchTerm, setGrupoSearchTerm] = useState('');
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');

  // Efeitos e Áudio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados do Sorteio
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [winnerConsorcio, setWinnerConsorcio] = useState<any | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Modal de Conclusão do Grupo
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Canvas de Confetes
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Atualiza preferência de som
  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Grupos filtrados e ordenados
  const filteredGrupos = useMemo(() => {
    const term = grupoSearchTerm.toLowerCase().trim();
    return gruposList.filter((g) => {
      if (g.encerrado_boolean) return false; // apenas grupos ativos
      if (!term) return true;
      const pText = g.periodo_text ? g.periodo_text.toLowerCase() : '';
      return pText.includes(term);
    });
  }, [gruposList, grupoSearchTerm]);

  // Seleciona automaticamente o 1º grupo ativo se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedGrupoId && filteredGrupos.length > 0) {
      setSelectedGrupoId(filteredGrupos[0].id);
    }
  }, [filteredGrupos, selectedGrupoId]);

  // Grupo selecionado atual
  const selectedGrupo = useMemo(() => {
    return gruposList.find((g) => g.id === selectedGrupoId) || null;
  }, [gruposList, selectedGrupoId]);

  // Todos os consórcios do grupo selecionado
  const consorciosDoGrupo = useMemo(() => {
    if (!selectedGrupoId) return [];
    return consorciosList
      .filter((c) => c.grupo_id === selectedGrupoId)
      .sort((a, b) => {
        const cotaA = a.cotano_number ?? 99999;
        const cotaB = b.cotano_number ?? 99999;
        return cotaA - cotaB;
      });
  }, [consorciosList, selectedGrupoId]);

  // Consórcios filtrados para exibição na lista de clientes
  const filteredConsorcios = useMemo(() => {
    const term = clienteSearchTerm.toLowerCase().trim();
    if (!term) return consorciosDoGrupo;
    return consorciosDoGrupo.filter((c) => {
      const nome = c.clientes?.nome ? c.clientes.nome.toLowerCase() : '';
      const cota = c.cotano_number ? String(c.cotano_number) : '';
      const mes = c.mesretirada_text ? c.mesretirada_text.toLowerCase() : '';
      return nome.includes(term) || cota.includes(term) || mes.includes(term);
    });
  }, [consorciosDoGrupo, clienteSearchTerm]);

  // Participantes já sorteados e pendentes
  const consorciosSorteados = useMemo(() => {
    return consorciosDoGrupo.filter((c) => c.mesretirada_text !== null && c.mesretirada_text !== undefined && c.mesretirada_text !== '');
  }, [consorciosDoGrupo]);

  // Consórcios sorteados ordenados cronologicamente pela data do mês de retirada
  const consorciosSorteadosOrdenadosPorMes = useMemo(() => {
    return [...consorciosSorteados].sort((a, b) => {
      const timeA = a.dataretirada_date ? new Date(a.dataretirada_date).getTime() : 0;
      const timeB = b.dataretirada_date ? new Date(b.dataretirada_date).getTime() : 0;
      return timeA - timeB;
    });
  }, [consorciosSorteados]);

  const consorciosPendentes = useMemo(() => {
    return consorciosDoGrupo.filter((c) => !c.mesretirada_text);
  }, [consorciosDoGrupo]);

  // Mês a ser sorteado nesta etapa
  const proximoMesDetails = useMemo(() => {
    if (!selectedGrupo) return null;
    const drawnCount = consorciosSorteados.length;
    return getMonthDetails(selectedGrupo.mesinicial_date, drawnCount);
  }, [selectedGrupo, consorciosSorteados.length]);

  // Efeito de Confetes em Canvas HTML5
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 100,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: (Math.random() - 0.7) * 16,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let startTime = performance.now();
    const duration = 3800; // 3.8s

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.3; // gravidade
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // EXECUTAR SORTEIO MANUAL DA ETAPA
  const handleStartDraw = async () => {
    if (isSpinning || consorciosPendentes.length === 0 || !proximoMesDetails) return;

    setIsSpinning(true);
    setSpinProgress(0);
    setWinnerConsorcio(null);
    setShowWinnerModal(false);

    const candidates = [...consorciosPendentes];
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const chosenWinner = candidates[winnerIndex];

    let currentStep = 0;
    const totalSteps = 45; // total de giros
    let speed = 50; // velocidade inicial em ms

    const runSpinStep = () => {
      currentStep++;
      const progressPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setSpinProgress(progressPct);

      const randomIndex = Math.floor(Math.random() * candidates.length);
      setCurrentDisplayIndex(randomIndex);
      soundFX.playTick();

      if (currentStep < totalSteps) {
        // Desaceleração física exponencial
        if (currentStep > totalSteps - 15) {
          speed += 25;
        } else if (currentStep > totalSteps - 25) {
          speed += 12;
        }
        setTimeout(runSpinStep, speed);
      } else {
        setSpinProgress(100);
        // Final do giro: Seleciona o vencedor oficial e anexa o mês sorteado
        const winnerWithMonth = {
          ...chosenWinner,
          mesretirada_text: proximoMesDetails.text,
          dataretirada_date: proximoMesDetails.date.toISOString()
        };
        setCurrentDisplayIndex(candidates.findIndex((c) => c.id === chosenWinner.id));
        setWinnerConsorcio(winnerWithMonth);
        setIsSpinning(false);

        // Salvar no Supabase
        saveWinnerToSupabase(chosenWinner, proximoMesDetails.text, proximoMesDetails.date);
      }
    };

    runSpinStep();
  };

  // Salvar no Supabase e acionar efeitos
  const saveWinnerToSupabase = async (winner: any, mesText: string, mesDate: Date) => {
    try {
      const { error } = await supabase
        .from('consorcios')
        .update({
          mesretirada_text: mesText,
          dataretirada_date: mesDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', winner.id);

      if (error) {
        alert('Erro ao registrar sorteio no Supabase: ' + error.message);
        return;
      }

      await refreshConsorcios();

      // Som e Confete
      soundFX.playWin();
      triggerConfetti();
      setShowWinnerModal(true);

      // Verificar se este foi o último cliente sorteado do grupo!
      if (consorciosPendentes.length <= 1) {
        // Após fechar ou dar o feedback, abre a mensagem final de conclusão
        setTimeout(() => {
          setShowFinalModal(true);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado ao salvar sorteio: ' + err.message);
    }
  };

  // Resetar todos os sorteios do grupo
  const handleResetGroupDraws = async () => {
    if (!selectedGrupoId) return;

    try {
      const { error } = await supabase
        .from('consorcios')
        .update({
          mesretirada_text: null,
          dataretirada_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('grupo_id', selectedGrupoId);

      if (error) {
        alert('Erro ao resetar sorteios: ' + error.message);
        return;
      }

      await refreshConsorcios();
      setShowResetConfirmModal(false);
      setShowFinalModal(false);
      setWinnerConsorcio(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado ao resetar sorteios: ' + err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 relative text-left"
    >
      {/* Canvas Invisível para Confetes */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Header Superior da Tela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple">
              <Trophy size={24} />
            </span>
            <h1 className={`text-3xl font-extrabold tracking-tight ${A.textPrimary}`}>
              Sorteio de Consórcios
            </h1>
          </div>
          <p className={`text-sm ${A.textMuted}`}>
            Selecione um grupo, visualize os participantes e execute o sorteio sequencial manual mês a mês.
          </p>
        </div>

        {/* Controles Globais (Som & Status) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-brand-purple dark:text-purple-300 shadow-sm'
                : `${A.card} ${A.border} ${A.textMuted}`
            }`}
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Efeitos Sonoros: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* GRID DE 3 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA 1: Grupos de Consórcio (3 colunas lg) */}
        <div className={`lg:col-span-3 border ${A.card} rounded-[24px] p-5 shadow-sm space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h2 className={`font-bold text-base flex items-center gap-2 ${A.textPrimary}`}>
              <FolderHeart className="text-brand-purple" size={18} />
              1. Grupos
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-brand-purple dark:text-purple-300">
              {filteredGrupos.length} Ativos
            </span>
          </div>

          {/* Campo de Busca de Grupos */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={grupoSearchTerm}
              onChange={(e) => setGrupoSearchTerm(e.target.value)}
              placeholder="Buscar grupo..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {grupoSearchTerm && (
              <button
                onClick={() => setGrupoSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista de Grupos */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredGrupos.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Nenhum grupo ativo encontrado.
              </div>
            ) : (
              filteredGrupos.map((g) => {
                const isSelected = selectedGrupoId === g.id;
                const totalInGroup = consorciosList.filter((c) => c.grupo_id === g.id).length;
                const drawnInGroup = consorciosList.filter(
                  (c) => c.grupo_id === g.id && c.mesretirada_text
                ).length;
                const isComplete = totalInGroup > 0 && drawnInGroup === totalInGroup;

                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      if (isSpinning) return;
                      setSelectedGrupoId(g.id);
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-purple bg-brand-purple/5 shadow-md ring-2 ring-brand-purple/20'
                        : `${A.border} hover:border-brand-purple/50 ${A.bgHover}`
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-sm leading-tight ${A.textPrimary}`}>
                        {g.periodo_text || 'Sem nome'}
                      </h3>
                      {isComplete ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 size={12} /> Concluído
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-brand-purple text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {drawnInGroup}/{totalInGroup} Sorteados
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                      <span className="text-brand-purple font-bold">
                        {g.valorcota_number ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(g.valorcota_number) : 'R$ 0,00'}
                      </span>
                      <span className={`text-[10px] ${A.textMuted}`}>
                        Início: {g.mesinicial_date ? new Date(g.mesinicial_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </span>
                    </div>

                    {/* Barra de Progresso do Grupo */}
                    <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isComplete ? 'bg-emerald-500' : 'bg-brand-purple'
                        }`}
                        style={{ width: `${totalInGroup > 0 ? (drawnInGroup / totalInGroup) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA 2: Palco Principal do Sorteio & Interatividade (5 colunas lg) */}
        <div className={`lg:col-span-5 border ${A.card} rounded-[24px] p-6 shadow-md space-y-6 flex flex-col justify-between min-h-[640px]`}>
          <div>
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-500 animate-bounce" size={20} />
                <h2 className={`font-bold text-lg ${A.textPrimary}`}>
                  2. Arena de Sorteio
                </h2>
              </div>

              {consorciosSorteados.length > 0 && (
                <button
                  onClick={() => setShowResetConfirmModal(true)}
                  disabled={isSpinning}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                  title="Resetar todos os sorteios deste grupo"
                >
                  <RotateCcw size={13} /> Resetar Grupo
                </button>
              )}
            </div>

            {/* Banner do Mês Alvo */}
            {selectedGrupo && proximoMesDetails && consorciosPendentes.length > 0 && (
              <div className="mt-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-purple-200">
                      Mês Alvo a ser Sorteado ({consorciosSorteados.length + 1}ª Etapa)
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-amber-300 mt-1 tracking-tight flex items-center gap-3 drop-shadow-md">
                      <Calendar size={32} className="text-amber-400 flex-shrink-0" />
                      {proximoMesDetails.text}
                    </h3>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block text-xs font-black px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                      {consorciosPendentes.length} Participantes Elegíveis
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PALCO DA ROLETA / SLOT MACHINE */}
            <div className="mt-6 flex flex-col items-center justify-center">
              {!selectedGrupo ? (
                <div className="text-center py-16 space-y-2">
                  <FolderHeart size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className={`font-bold text-sm ${A.textPrimary}`}>Nenhum grupo selecionado</p>
                  <p className={`text-xs ${A.textMuted}`}>Selecione um grupo de consórcio na coluna 1 para começar.</p>
                </div>
              ) : consorciosPendentes.length === 0 ? (
                /* Todos já Sorteados! */
                <div className="text-center py-10 px-4 space-y-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl w-full">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-pulse">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${A.textPrimary}`}>Grupo 100% Sorteado!</h3>
                    <p className={`text-xs ${A.textMuted} mt-1`}>
                      Todos os {consorciosDoGrupo.length} participantes já receberam seus respectivos meses de retirada.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFinalModal(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Award size={16} /> Ver Resumo de Conclusão
                  </button>
                </div>
              ) : (
                /* ROLETA 3D DE SORTEIO COM ÁREA EXPANDIDA */
                <div className="w-full space-y-6">
                  <div className="relative w-full h-72 md:h-80 rounded-[32px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-8 flex flex-col items-center justify-center border-4 border-purple-500/50 shadow-2xl overflow-hidden">
                    
                    {/* Efeito Glow da Roleta */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 transition-opacity duration-300 ${
                      isSpinning ? 'opacity-100 blur-lg animate-pulse' : 'opacity-20'
                    }`} />

                    {/* Indicador Ponteiro de Sorteio */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)]" />
                    </div>

                    {/* Conteúdo Dinâmico da Roleta */}
                    <AnimatePresence mode="wait">
                      {isSpinning ? (
                        <motion.div
                          key="spinning"
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: [0.95, 1.08, 0.95], opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 0.12 }}
                          className="relative z-10 text-center space-y-3 px-4 w-full"
                        >
                          <span className="inline-block text-xs font-black uppercase tracking-widest text-amber-400 animate-pulse px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
                            ⚡ SORTEANDO PARCELA... ⚡
                          </span>
                          <h4 className="text-3xl md:text-5xl font-black text-white tracking-wide break-words drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">
                            {consorciosPendentes[currentDisplayIndex]?.clientes?.nome || '...'}
                          </h4>
                          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-sm border border-amber-400/40 shadow-lg">
                            Cota #{consorciosPendentes[currentDisplayIndex]?.cotano_number || '-'}
                          </div>
                        </motion.div>
                      ) : winnerConsorcio ? (
                        <motion.div
                          key="winner"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="relative z-10 text-center space-y-3 px-4 w-full"
                        >
                          <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-1 rounded-full border border-amber-400/30">
                            <Crown size={18} className="text-amber-400" /> GANHADOR DO MÊS!
                          </span>
                          <h4 className="text-3xl md:text-5xl font-black text-white tracking-wide break-words drop-shadow-[0_4px_16px_rgba(251,191,36,0.4)] leading-tight">
                            {winnerConsorcio.clientes?.nome || 'Ganhador'}
                          </h4>
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <span className="px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-sm shadow-xl">
                              Cota #{winnerConsorcio.cotano_number}
                            </span>
                            <span className="px-4 py-1 rounded-full bg-emerald-500 text-white font-black text-sm shadow-xl">
                              {winnerConsorcio.mesretirada_text}
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          className="relative z-10 text-center space-y-3 px-4"
                        >
                          <span className="text-xs font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                            PRONTO PARA O SORTEIO
                          </span>
                          <h4 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                            Sorteio do Mês: <span className="text-amber-300 font-black">{proximoMesDetails?.text}</span>
                          </h4>
                          <p className="text-sm font-semibold text-purple-200">
                            {consorciosPendentes.length} participantes aguardando sorteio neste grupo
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Barra de Progresso do Sorteio em Tempo Real */}
                    {isSpinning && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent border-0 flex flex-col gap-1.5 z-30">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-white">
                          <span className="text-white flex items-center gap-1.5 drop-shadow-md">
                            <Sparkles size={14} className="text-white animate-spin" /> REALIZANDO SORTEIO...
                          </span>
                          <span className="text-white font-black text-xs drop-shadow-md">{spinProgress}%</span>
                        </div>
                        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/30 backdrop-blur-sm shadow-inner">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                            style={{ width: `${spinProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLE MANUAL DISPARADO PELO USUÁRIO */}
          {selectedGrupo && consorciosPendentes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleStartDraw}
                disabled={isSpinning}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-98 cursor-pointer ${
                  isSpinning
                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-purple via-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-brand-purple/30 ring-4 ring-brand-purple/20'
                }`}
              >
                {isSpinning ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>GIRANDO ROLETA...</span>
                  </>
                ) : (
                  <>
                    <Play size={20} className="fill-current" />
                    <span>SORTEAR MÊS: {proximoMesDetails?.text?.toUpperCase()}</span>
                  </>
                )}
              </button>
              <p className={`text-[11px] text-center ${A.textMuted}`}>
                Cada clique dispara manualmente o sorteio do próximo mês da sequência.
              </p>
            </div>
          )}
        </div>

        {/* COLUNA 3: Lista de Clientes do Grupo Selecionado (4 colunas lg) */}
        <div className={`lg:col-span-4 border ${A.card} rounded-[24px] p-5 shadow-sm space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className={`font-bold text-base flex items-center gap-2 ${A.textPrimary}`}>
                <Users className="text-brand-purple" size={18} />
                3. Clientes do Grupo
              </h2>
              <p className={`text-[11px] ${A.textMuted}`}>
                {selectedGrupo ? selectedGrupo.periodo_text : 'Nenhum grupo selecionado'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-brand-purple dark:text-purple-300">
              {consorciosDoGrupo.length} Participantes
            </span>
          </div>

          {/* Campo de Busca de Clientes */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={clienteSearchTerm}
              onChange={(e) => setClienteSearchTerm(e.target.value)}
              placeholder="Buscar por cliente ou cota..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {clienteSearchTerm && (
              <button
                onClick={() => setClienteSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista de Participantes */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredConsorcios.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Nenhum participante vinculado a este grupo.
              </div>
            ) : (
              filteredConsorcios.map((c) => {
                const isDrawn = Boolean(c.mesretirada_text);
                const isCurrentWinner = winnerConsorcio?.id === c.id;

                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrentWinner
                        ? 'border-amber-400 bg-amber-500/10 shadow-md ring-2 ring-amber-400/40'
                        : isDrawn
                        ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-500/5'
                        : `${A.border} ${A.card}`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isDrawn
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-brand-purple/10 text-brand-purple'
                      }`}>
                        {c.cotano_number ?? '#'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs break-words ${A.textPrimary}`}>
                          {c.clientes?.nome || 'Cliente Desconhecido'}
                        </p>
                        <p className={`text-[10px] ${A.textMuted}`}>
                          Cota: <span className="font-semibold">{c.cotano_number || '-'}</span>
                          {c.clientes?.celular ? ` • ${c.clientes.celular}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Badge de Mês / Status */}
                    <div>
                      {isDrawn ? (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 size={11} /> {c.mesretirada_text}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Aguardando
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CELEBRAÇÃO DO GANHADOR (INDIVIDUAL) */}
      <AnimatePresence>
        {showWinnerModal && winnerConsorcio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWinnerModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg md:max-w-xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white border-2 border-amber-400/50 rounded-[32px] p-7 shadow-2xl z-10 text-center space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-400/20 to-transparent pointer-events-none" />

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-400/30">
                <Trophy size={40} />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  🎉 PARABÉNS AO SORTEADO! 🎉
                </span>
                <h3 className="text-[28px] md:text-[32px] font-black text-white mt-1.5 leading-tight break-words">
                  {winnerConsorcio.clientes?.nome}
                </h3>
                <p className="text-sm text-purple-200 mt-1">
                  Cota N° <span className="font-bold text-amber-300">#{winnerConsorcio.cotano_number}</span>
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/25 via-purple-600/30 to-indigo-900/40 border-2 border-amber-400/60 shadow-xl text-center space-y-1.5 relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 relative z-10">
                  MÊS SORTEADO
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide uppercase drop-shadow-[0_4px_12px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2.5 relative z-10 mt-1">
                  <Calendar size={26} className="text-amber-400 flex-shrink-0" />
                  <span className="truncate">{winnerConsorcio.mesretirada_text || proximoMesDetails?.text}</span>
                </div>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer"
              >
                PROSSEGUIR PARA O PRÓXIMO SORTEIO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL FINAL DE CONCLUSÃO DE TODOS OS CLIENTES DO GRUPO */}
      <AnimatePresence>
        {showFinalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinalModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="relative w-full max-w-5xl md:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 text-white border-2 border-emerald-400/60 rounded-[36px] p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6"
            >
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-200 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-400/40 animate-pulse">
                <Crown size={42} />
              </div>

              <div className="space-y-2 max-w-2xl mx-auto">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  🏆 GRUPO 100% CONCLUÍDO! 🏆
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white">
                  Sorteio Finalizado com Sucesso!
                </h3>
                <p className="text-sm text-slate-300">
                  Todos os <span className="font-bold text-emerald-300">{consorciosDoGrupo.length} clientes</span> do grupo{' '}
                  <span className="font-bold text-white">"{selectedGrupo?.periodo_text}"</span> foram devidamente sorteados e registrados.
                </p>
              </div>

              {/* GRID DE CLIENTES (Ordenados cronologicamente pelo mês de retirada) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 p-5 rounded-3xl bg-white/5 border border-white/10 text-left">
                {consorciosSorteadosOrdenadosPorMes.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-white/10 border border-white/10 flex flex-col justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                        #{c.cotano_number}
                      </span>
                      <p className="font-bold text-xs text-slate-100 break-words leading-tight flex-1">
                        {c.clientes?.nome || 'Cliente'}
                      </p>
                    </div>
                    <div className="self-end pt-1">
                      <span className="inline-block text-[11px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        {c.mesretirada_text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowFinalModal(false)}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  OK, FECHAR RESUMO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMAÇÃO DE RESET */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md ${A.card} border ${A.border} rounded-[28px] p-6 shadow-2xl z-10 space-y-5 text-left`}
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-3 rounded-full bg-rose-500/10">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${A.textPrimary}`}>Resetar Sorteios?</h3>
                  <p className={`text-xs ${A.textMuted}`}>Esta ação limpará todos os meses de retirada deste grupo.</p>
                </div>
              </div>

              <p className={`text-xs ${A.textMuted}`}>
                Tem certeza que deseja apagar o registro de sorteio dos{' '}
                <span className="font-bold text-rose-500">{consorciosSorteados.length} clientes</span> sorteados no grupo{' '}
                <span className={`font-bold ${A.textPrimary}`}>"{selectedGrupo?.periodo_text}"</span>?
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirmModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${A.bgHover} ${A.textMuted}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetGroupDraws}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Sim, Resetar Grupo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SorteioTab;
