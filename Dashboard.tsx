import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import * as p from 'react/jsx-runtime';
import {
  LayoutDashboard as GA,
  Users as kh,
  FolderHeart as ou,
  DollarSign as MA,
  ChevronLeft as nv,
  ChevronRight as sv,
  Sun as cj,
  Moon as QA,
  Settings as aj,
  ArrowUp as vA,
  ArrowDown as hA,
  ArrowUpDown as mA,
  Search as Ja,
  Plus as Ms,
  Briefcase as Ch,
  ArrowLeft as tv,
  ArrowUpRight as Qi,
  Bell as xA,
  Calendar as SA,
  CircleAlert as jA,
  CircleCheck as iv,
  CircleX as kA,
  Database as av,
  Download as UA,
  EyeOff as Au,
  Eye as ju,
  FileSpreadsheet as $A,
  Globe as HA,
  Lock as ur,
  LogOut as YA,
  Mail as Nh,
  MessageSquare as JA,
  Phone as ej,
  RefreshCw as rv,
  Shirt as lj,
  SlidersHorizontal as lv,
  TrendingUp as uu,
  UserPlus as fj,
  User as mj,
  X as vj
} from 'lucide-react';

const L = React;
const un = React;
const Ut = motion;
const on = supabase;
const wl = AnimatePresence;


    const Sk = ({
        onLogout: n
    }) => {
        const [t, i] = L.useState("dashboard"), [r, o] = L.useState(!1), [u, c] = L.useState(!1), [f, m] = L.useState(""), [g, v] = L.useState("importacao"), [b, x] = L.useState("clientes"), [_, T] = L.useState({
            clientes: "https://mundofitness.app.br/version-test/api/1.1/obj/Clientes",
            grupos: "https://mundofitness.app.br/version-test/api/1.1/obj/Grupos",
            consorcios: "https://mundofitness.app.br/version-test/api/1.1/obj/Consorcios",
            pagamentos: "",
            receitas: ""
        }), [C, O] = L.useState({
            clientes: "",
            grupos: "764f84d372e616198a92baedc311a736",
            consorcios: "764f84d372e616198a92baedc311a736",
            pagamentos: "",
            receitas: ""
        }), [k, $] = L.useState({
            clientes: !1,
            grupos: !1,
            consorcios: !1,
            pagamentos: !1,
            receitas: !1
        }), [M, q] = L.useState([]), [Q, te] = L.useState([]), [F, W] = L.useState([]), [ae, re] = L.useState([]), [Ee, Ae] = L.useState([]), [nt, Je] = L.useState([]), [Oe, P] = L.useState(null), [J, se] = L.useState(""), [ye, Se] = L.useState(""), [j, z] = L.useState(!1), [ee, X] = L.useState(null), [fe, ge] = L.useState(null), [De, dt] = L.useState(!1), [Ge, jn] = L.useState(""), [$s, ls] = L.useState(""), [oa, Zt] = L.useState(""), [Ai, ua] = L.useState("Premium"), [yr, Ps] = L.useState(""), [os, us] = L.useState(""), [cs, ca] = L.useState(""), [vr, vt] = L.useState(""), [br, Vs] = L.useState(""), [In, Kn] = L.useState("Ativo"), [da, ji] = L.useState(null), [Ci, nc] = L.useState([]), [zt, Bt] = L.useState([]), [Tt, Et] = L.useState("ativos"), [cgf, scgf] = L.useState("ativos"), [ha, Hl] = L.useState(""), [fa, Ni] = L.useState(""), [pa, ds] = L.useState(!1), [hn, hs] = L.useState(null), [Cn, ki] = L.useState(""), [Hs, fs] = L.useState(""), [Nn, Ri] = L.useState(""), [qs, Gs] = L.useState(""), [Is, ps] = L.useState(""), [kn, Ks] = L.useState(!1), [ms, Yn] = L.useState("mesinicial_date"), [We, Ot] = L.useState("desc"), [bt, Qt] = L.useState(1), [Oi, ql] = L.useState(null), [Rn, Mi] = L.useState(null), [Fn, gs] = L.useState("asc"), Ys = S => {
            Rn === S ? gs(K => K === "asc" ? "desc" : "asc") : (Mi(S), gs("asc")), Qt(1)
        },
        // Nossos novos estados limpos para Consórcios e Pagamentos
        [selectedConsorcioId, setSelectedConsorcioId] = L.useState<string | null>(null),
        [selectedPagamentos, setSelectedPagamentos] = L.useState<any[]>([]),
        
        // Filtro de mês e ano (padrão abre no mês atual)
        [filterMonth, setFilterMonth] = L.useState<number>(new Date().getMonth()),
        [filterYear, setFilterYear] = L.useState<number>(new Date().getFullYear()),
        [isFilterActive, setIsFilterActive] = L.useState<boolean>(true),
        [showFilterCalendarPopover, setShowFilterCalendarPopover] = L.useState<boolean>(false),
        
        // Modais de Parcelas
        [showGerarParcelasModal, setShowGerarParcelasModal] = L.useState<boolean>(false),
        [newParcelasQtde, setNewParcelasQtde] = L.useState<number>(10),
        [newParcelasValor, setNewParcelasValor] = L.useState<string>(""),
        [newParcelasMesInicial, setNewParcelasMesInicial] = L.useState<string>(""),
        [isGeneratingParcelas, setIsGeneratingParcelas] = L.useState<boolean>(false),
        
        [showBaixarParcelaModal, setShowBaixarParcelaModal] = L.useState<boolean>(false),
        [selectedParcela, setSelectedParcela] = L.useState<any | null>(null),
        [valorpagoInput, setValorpagoInput] = L.useState(""),
        [datapagamentoInput, setDatapagamentoInput] = L.useState(""),
        [isUpdatingParcela, setIsUpdatingParcela] = L.useState<boolean>(false),

        // Exclusão de Parcela
        [showDeleteParcelaConfirmModal, setShowDeleteParcelaConfirmModal] = L.useState<boolean>(false),
        [parcelaToDelete, setParcelaToDelete] = L.useState<any | null>(null);

        // Carregar pagamentos do consórcio selecionado
        L.useEffect(() => {
            if (!selectedConsorcioId) {
                setSelectedPagamentos([]);
                return;
            }
            const fetchPagamentos = async () => {
                try {
                    const { data, error } = await supabase
                        .from('consorcios_pagamentos')
                        .select('*')
                        .eq('consorcio_id', selectedConsorcioId);
                    if (error) throw error;
                    setSelectedPagamentos(data || []);
                } catch (err) {
                    console.error('Erro ao buscar pagamentos:', err);
                }
            };
            fetchPagamentos();
        }, [selectedConsorcioId]);

        // Limpar seleção de consórcio quando mudar o grupo selecionado
        L.useEffect(() => {
            setSelectedConsorcioId(null);
        }, [Oe]); // Oe é selectedGrupoId

        const formatCurrencyPTBR = (val: string | number) => {
            const clean = String(val).replace(/\D/g, '');
            if (!clean) return '';
            const num = parseFloat(clean) / 100;
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(num);
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
                
                // Obter dia de vencimento do consórcio selecionado
                const consorcio = nt.find(c => c.id === selectedConsorcioId); // nt é consorciosList
                const vencimentoDia = consorcio?.vencimentodia_number || 10;
                const grupo = zt.find(g => g.id === Oe); // zt é gruposList, Oe é selectedGrupoId

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
                        grupo_id: Oe,
                        grupo_text: grupo?.periodo_text || "",
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

                // Recarrega pagamentos
                const { data, error: fetchErr } = await supabase
                    .from('consorcios_pagamentos')
                    .select('*')
                    .eq('consorcio_id', selectedConsorcioId);
                if (fetchErr) throw fetchErr;
                setSelectedPagamentos(data || []);
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

                // Recarrega pagamentos
                const { data, error: fetchErr } = await supabase
                    .from('consorcios_pagamentos')
                    .select('*')
                    .eq('consorcio_id', selectedConsorcioId);
                if (fetchErr) throw fetchErr;
                setSelectedPagamentos(data || []);
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

                // Recarrega pagamentos
                const { data, error: fetchErr } = await supabase
                    .from('consorcios_pagamentos')
                    .select('*')
                    .eq('consorcio_id', selectedConsorcioId);
                if (fetchErr) throw fetchErr;
                setSelectedPagamentos(data || []);
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

                // Recarrega pagamentos
                const { data, error: fetchErr } = await supabase
                    .from('consorcios_pagamentos')
                    .select('*')
                    .eq('consorcio_id', selectedConsorcioId);
                if (fetchErr) throw fetchErr;
                setSelectedPagamentos(data || []);
                setShowDeleteParcelaConfirmModal(false);
                setParcelaToDelete(null);
            } catch (err: any) {
                console.error('Erro ao excluir parcela:', err);
                alert('Erro ao excluir parcela: ' + err.message);
            }
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

        const sortedPagamentos = L.useMemo(() => {
            return [...selectedPagamentos].sort((a, b) => {
                const dateA = a.data_vencimento ? new Date(a.data_vencimento) : (a.datapagamento_date ? new Date(a.datapagamento_date) : new Date(0));
                const dateB = b.data_vencimento ? new Date(b.data_vencimento) : (b.datapagamento_date ? new Date(b.datapagamento_date) : new Date(0));
                return dateA.getTime() - dateB.getTime();
            });
        }, [selectedPagamentos]);

        const getFullMonthName = (monthIdx: number) => {
            return ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][monthIdx];
        };

        const fn = un.useMemo(() => {

            const S = fa.toLowerCase().trim(),
                K = f.toLowerCase().trim();
            let Y = Ci;
            return Oi && (Y = Y.filter(Z => {
                const de = Z.vestetamanho ? String(Z.vestetamanho).toUpperCase().trim() : "";
                return (["PP", "P", "M", "G", "GG", "XG", "XGG"].includes(de) ? de : "Não Informado") === Oi
            })), !S && !K ? Y : Y.filter(Z => {
                const de = Z.name ? Z.name.toLowerCase() : "",
                    le = Z.email ? Z.email.toLowerCase() : "",
                    be = Z.phone ? Z.phone.toLowerCase() : "",
                    je = Z.phone ? Z.phone.replace(/\D/g, "") : "",
                    ve = Z.endereco ? Z.endereco.toLowerCase() : "",
                    Pe = Z.outrasinformacoes ? Z.outrasinformacoes.toLowerCase() : "";
                if (S) {
                    const Fe = S.replace(/\D/g, "");
                    if (!(de.includes(S) || be.includes(S) || Fe && je.includes(Fe) || ve.includes(S) || Pe.includes(S))) return !1
                }
                return !(K && !(de.includes(K) || le.includes(K) || be.includes(K) || ve.includes(K) || Pe.includes(K)))
            })
        }, [Ci, fa, f, Oi]), On = un.useMemo(() => Rn ? [...fn].sort((S, K) => {
            let Y = S[Rn],
                Z = K[Rn];
            if (Y == null && (Y = ""), Z == null && (Z = ""), Rn === "data_cadastro" || Rn === "datanascimento") {
                const de = Y ? new Date(Y).getTime() : 0,
                    le = Z ? new Date(Z).getTime() : 0;
                return Fn === "asc" ? de - le : le - de
            }
            return typeof Y == "string" && typeof Z == "string" ? Fn === "asc" ? Y.localeCompare(Z, "pt-BR") : Z.localeCompare(Y, "pt-BR") : Y < Z ? Fn === "asc" ? -1 : 1 : Y > Z ? Fn === "asc" ? 1 : -1 : 0
        }) : fn, [fn, Rn, Fn]), et = 14, pn = Math.ceil(On.length / et);
        un.useEffect(() => {
            bt > pn && pn > 0 && Qt(pn)
        }, [On.length, pn, bt]);
        const xr = un.useMemo(() => {
                const S = (bt - 1) * et;
                return On.slice(S, S + et)
            }, [On, bt]),
            mn = un.useMemo(() => {
                const S = {
                    PP: 0,
                    P: 0,
                    M: 0,
                    G: 0,
                    GG: 0,
                    XG: 0,
                    XGG: 0,
                    "Não Informado": 0
                };
                Ci.forEach(Y => {
                    const Z = Y.vestetamanho ? String(Y.vestetamanho).toUpperCase().trim() : "",
                        de = ["PP", "P", "M", "G", "GG", "XG", "XGG"].includes(Z) ? Z : "Não Informado";
                    S[de]++
                });
                const K = Ci.length;
                return {
                    stats: S,
                    total: K
                }
            }, [Ci]),
            ys = un.useMemo(() => {
                const S = ha.toLowerCase().trim();
                return [...zt.filter(Y => {
                    if (!(Tt === "todos" ? !0 : Tt === "ativos" ? !Y.encerrado_boolean : Y.encerrado_boolean)) return !1;
                    if (!S) return !0;
                    const de = Y.periodo_text ? Y.periodo_text.toLowerCase() : "",
                        le = Y.valorcota_number ? String(Y.valorcota_number) : "",
                        be = Y.valor_number ? String(Y.valor_number) : "",
                        je = Y.valorcota_number ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        }).format(Y.valorcota_number).toLowerCase() : "",
                        ve = Y.valor_number ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        }).format(Y.valor_number).toLowerCase() : "";
                    return de.includes(S) || le.includes(S) || be.includes(S) || je.includes(S) || ve.includes(S)
                })].sort((Y, Z) => {
                    let de = Y[ms],
                        le = Z[ms];
                    if (de == null && (de = ""), le == null && (le = ""), ms === "mesinicial_date" || ms === "mesfinal_date") {
                        const be = de ? new Date(de).getTime() : 0,
                            je = le ? new Date(le).getTime() : 0;
                        return We === "asc" ? be - je : je - be
                    }
                    return typeof de == "string" && typeof le == "string" ? We === "asc" ? de.localeCompare(le, "pt-BR") : le.localeCompare(de, "pt-BR") : de < le ? We === "asc" ? -1 : 1 : de > le ? We === "asc" ? 1 : -1 : 0
                })
            }, [zt, Tt, ha, ms, We]),
            sc = S => {
                if (!S) return "Não retirado";
                try {
                    const K = new Date(S),
                        D = String(K.getUTCDate()).padStart(2, "0"),
                        Y = String(K.getUTCMonth() + 1).padStart(2, "0"),
                        Z = K.getUTCFullYear();
                    return `${D}/${Y}/${Z}`
                } catch {
                    return "Não retirado"
                }
            },
            Mn = un.useMemo(() => zt.filter(S => cgf === "todos" ? !0 : cgf === "ativos" ? !S.encerrado_boolean : S.encerrado_boolean), [zt, cgf]),
            ma = un.useMemo(() => {
                const S = J.toLowerCase().trim();
                return S ? Mn.filter(K => (K.periodo_text || "").toLowerCase().includes(S)) : Mn
            }, [Mn, J]);
        un.useEffect(() => {
            Mn.length > 0 ? (!Oe || !Mn.some(S => S.id === Oe)) && P(Mn[0].id) : P(null)
        }, [Mn, Oe]);
        const ga = un.useMemo(() => Oe ? nt.filter(S => S.grupo_id === Oe) : [], [nt, Oe]),
            Di = un.useMemo(() => {
                const S = ye.toLowerCase().trim();
                const res = S ? ga.filter(K => {
                    var le;
                    const Y = (((le = K.clientes) == null ? void 0 : le.nome) || "").toLowerCase(),
                        Z = K.cotano_number ? String(K.cotano_number) : "",
                        de = K.vencimentodia_number ? String(K.vencimentodia_number) : "";
                    return Y.includes(S) || Z.includes(S) || de.includes(S)
                }) : ga;
                return [...res].sort((a, b) => {
                    var leA, leB;
                    const nameA = (((leA = a.clientes) == null ? void 0 : leA.nome) || "").toLowerCase();
                    const nameB = (((leB = b.clientes) == null ? void 0 : leB.nome) || "").toLowerCase();
                    return nameA.localeCompare(nameB, 'pt-BR');
                });
            }, [ga, ye]),
            ya = () => {
                const S = [];
                let Y = Math.max(1, bt - 2),
                    Z = Math.min(pn, Y + 5 - 1);
                Z - Y + 1 < 5 && (Y = Math.max(1, Z - 5 + 1));
                for (let de = Y; de <= Z; de++) S.push(de);
                return S
            },
            Lt = (S, K) => {
                const Y = Rn === S;
                return p.jsx("th", {
                    onClick: () => Ys(S),
                    className: `p-4 font-semibold uppercase tracking-wider text-xs cursor-pointer select-none ${A.bgHover} transition-colors`,
                    children: p.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [p.jsx("span", {
                            children: K
                        }), p.jsx("span", {
                            className: "text-slate-400",
                            children: Y ? Fn === "asc" ? p.jsx(vA, {
                                size: 14,
                                className: "text-brand-purple"
                            }) : p.jsx(hA, {
                                size: 14,
                                className: "text-brand-purple"
                            }) : p.jsx(mA, {
                                size: 14,
                                className: "opacity-40 hover:opacity-100 transition-opacity"
                            })
                        })]
                    })
                })
            },
            Ht = S => {
                if (!S) return "";
                const K = new Date(S);
                if (isNaN(K.getTime())) return "";
                const Y = new Date,
                    Z = K.getUTCFullYear(),
                    de = K.getUTCMonth(),
                    le = K.getUTCDate();
                let be = Y.getFullYear() - Z;
                const je = Y.getMonth() - de;
                return (je < 0 || je === 0 && Y.getDate() < le) && be--, be >= 0 ? ` (${be} anos)` : ""
            },
            va = async () => {
                try {
                    const {
                        data: S,
                        error: K
                    } = await on.from("clientes").select("*").order("nome", {
                        ascending: !0
                    });
                    if (K) {
                        console.error("Erro ao buscar clientes do Supabase:", K);
                        return
                    }
                    if (S) {
                        const Y = S.map(Z => ({
                            id: Z.id,
                            bubble_id: Z.bubble_id,
                            name: Z.nome,
                            phone: Z.celular || "(00) 00000-0000",
                            email: Z.email || "",
                            plan: Z.plano || "Básico",
                            status: Z.status || "Ativo",
                            endereco: Z.endereco,
                            datanascimento: Z.datanascimento,
                            outrasinformacoes: Z.outrasinformacoes,
                            vestetamanho: Z.vestetamanho,
                            data_cadastro: Z.data_cadastro
                        }));
                        nc(Y)
                    }
                } catch (S) {
                    console.error("Erro de conexão com o Supabase:", S)
                }
            }, wr = async () => {
                try {
                    const {
                        data: S,
                        error: K
                    } = await on.from("grupos").select("*").order("mesinicial_date", {
                        ascending: !1
                    });
                    if (K) {
                        console.error("Erro ao buscar grupos do Supabase:", K);
                        return
                    }
                    S && Bt(S)
                } catch (S) {
                    console.error("Erro de conexão com o Supabase:", S)
                }
            }, ba = async () => {
                try {
                    const {
                        data: S,
                        error: K
                    } = await on.from("consorcios").select(`
          *,
          clientes (nome, outrasinformacoes),
          grupos (periodo_text, valorcota_number, encerrado_boolean)
        `).order("created_at", {
                        ascending: !1
                    });
                    if (K) {
                        console.error("Erro ao buscar consórcios do Supabase:", K);
                        return
                    }
                    S && Je(S)
                } catch (S) {
                    console.error("Erro de conexão com o Supabase:", S)
                }
            };
        un.useEffect(() => {
            va(), wr(), ba()
        }, []);
        const Gl = async S => {
            if (S.preventDefault(), !!Ge) try {
                if (da) {
                    const {
                        error: K
                    } = await on.from("clientes").update({
                        nome: Ge,
                        celular: $s || null,
                        email: oa || null,
                        plano: Ai,
                        status: In,
                        endereco: yr || null,
                        datanascimento: os ? os + "T00:00:00Z" : null,
                        outrasinformacoes: vr || null,
                        vestetamanho: br || null,
                        data_cadastro: cs ? cs + "T00:00:00Z" : null
                    }).eq("id", da);
                    if (K) {
                        alert("Erro ao atualizar cliente no Supabase: " + K.message);
                        return
                    }
                } else {
                    const {
                        error: K
                    } = await on.from("clientes").insert([{
                        nome: Ge,
                        celular: $s || null,
                        email: oa || null,
                        plano: Ai,
                        status: In,
                        endereco: yr || null,
                        datanascimento: os ? os + "T00:00:00Z" : null,
                        outrasinformacoes: vr || null,
                        vestetamanho: br || null,
                        data_cadastro: cs ? cs + "T00:00:00Z" : new Date().toISOString()
                    }]);
                    if (K) {
                        alert("Erro ao salvar cliente no Supabase: " + K.message);
                        return
                    }
                }
                await va(), jn(""), ls(""), Zt(""), Ps(""), us(""), ca(""), vt(""), Vs(""), Kn("Ativo"), ji(null), dt(!1)
            } catch (K) {
                console.error(K), alert("Erro inesperado: " + K.message)
            }
        }, xa = S => {
            ji(S.id), jn(S.name || ""), ls(S.phone === "(00) 00000-0000" || S.phone === "(00)00000-0000" ? "" : S.phone || ""), Zt(S.email || ""), ua(S.plan || "Premium"), Ps(S.endereco || ""), us(S.datanascimento ? S.datanascimento.substring(0, 10) : ""), ca(S.data_cadastro ? S.data_cadastro.substring(0, 10) : ""), vt(S.outrasinformacoes || ""), Vs(S.vestetamanho || ""), Kn(S.status || "Ativo"), dt(!0)
        }, ic = S => {
            hs(S.id), ki(S.periodo_text || ""), fs(S.valor_number !== null && S.valor_number !== void 0 ? String(S.valor_number) : ""), Ri(S.valorcota_number !== null && S.valorcota_number !== void 0 ? String(S.valorcota_number) : ""), Gs(S.mesinicial_date ? S.mesinicial_date.substring(0, 10) : ""), ps(S.mesfinal_date ? S.mesfinal_date.substring(0, 10) : ""), Ks(S.encerrado_boolean || !1), ds(!0)
        }, qt = async S => {
            if (S.preventDefault(), !!Cn) try {
                if (hn) {
                    const {
                        error: K
                    } = await on.from("grupos").update({
                        periodo_text: Cn,
                        valor_number: Hs ? parseFloat(Hs) : null,
                        valorcota_number: Nn ? parseFloat(Nn) : null,
                        mesinicial_date: qs ? qs + "T00:00:00Z" : null,
                        mesfinal_date: Is ? Is + "T00:00:00Z" : null,
                        encerrado_boolean: kn,
                        updated_at: new Date().toISOString()
                    }).eq("id", hn);
                    if (K) {
                        alert("Erro ao atualizar grupo no Supabase: " + K.message);
                        return
                    }
                } else {
                    const {
                        error: K
                    } = await on.from("grupos").insert([{
                        periodo_text: Cn,
                        valor_number: Hs ? parseFloat(Hs) : null,
                        valorcota_number: Nn ? parseFloat(Nn) : null,
                        mesinicial_date: qs ? qs + "T00:00:00Z" : null,
                        mesfinal_date: Is ? Is + "T00:00:00Z" : null,
                        encerrado_boolean: kn,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);
                    if (K) {
                        alert("Erro ao salvar grupo no Supabase: " + K.message);
                        return
                    }
                }
                await wr(), ki(""), fs(""), Ri(""), Gs(""), ps(""), Ks(!1), hs(null), ds(!1)
            } catch (K) {
                console.error(K), alert("Erro inesperado: " + K.message)
            }
        }, _r = S => {
            const Y = S.target.value.replace(/\D/g, "");
            let Z = Y;
            Y.length > 2 && (Z = `(${Y.slice(0,2)}) ${Y.slice(2)}`), Y.length > 7 && (Z = `(${Y.slice(0,2)}) ${Y.slice(2,7)}-${Y.slice(7,11)}`), ls(Z)
        }, Il = async S => {
            const K = _[S],
                Y = C[S];
            if (!K) {
                X("Por favor, informe a URL da API do Bubble.io.");
                return
            }
            z(!0), X(null), ge(null);
            try {
                const Z = {
                    Accept: "application/json"
                };
                Y && (Z.Authorization = `Bearer ${Y}`);
                let de = [],
                    le = 0;
                const be = 100;
                let je = !0;
                for (; je;) {
                    const Pe = K.includes("?") ? "&" : "?",
                        Fe = `${K}${Pe}cursor=${le}&limit=${be}`,
                        Xn = await fetch(Fe, {
                            method: "GET",
                            headers: Z
                        });
                    if (!Xn.ok) throw new Error(`Erro na API (${Xn.status}): ${Xn.statusText}`);
                    const st = await Xn.json();
                    let Wt = [];
                    if (st && st.response && Array.isArray(st.response.results)) Wt = st.response.results;
                    else if (st && Array.isArray(st.results)) Wt = st.results;
                    else if (Array.isArray(st)) Wt = st;
                    else if (st && typeof st == "object") {
                        const Xs = Object.values(st).find(Dn => Array.isArray(Dn));
                        Xs ? Wt = Xs : Wt = [st]
                    }
                    if (Wt.length === 0) {
                        je = !1;
                        break
                    }
                    de = [...de, ...Wt], st && st.response && typeof st.response.remaining == "number" ? st.response.remaining === 0 ? je = !1 : le += Wt.length : Wt.length < be ? je = !1 : le += Wt.length
                }
                if (de.length === 0) {
                    X("Nenhum dado retornado ou formato não suportado."), z(!1);
                    return
                }
                const ve = de.map((Pe, Fe) => !Pe._id && !Pe.id ? {
                    _id: `id_${Fe}_${Date.now()}`,
                    ...Pe
                } : Pe);
                S === "clientes" ? q(ve) : S === "grupos" ? te(ve) : S === "consorcios" ? W(ve) : S === "pagamentos" ? re(ve) : S === "receitas" && Ae(ve), ge(`Sucesso! ${de.length} registros lidos da API do Bubble.io.`)
            } catch (Z) {
                console.error(Z), X("Erro de conexão/CORS: Não foi possível acessar o Bubble.io. Certifique-se de que a URL está correta, que o token privado é válido, e que as configurações de CORS do seu app permitem a origem atual.")
            } finally {
                z(!1)
            }
        }, Sr = S => {
            z(!0), X(null), ge(null), setTimeout(() => {
                S === "clientes" ? q([{
                    id: "b1",
                    name: "Mariana Souza (Bubble)",
                    phone: "(11) 99999-1111",
                    email: "mariana.souza@bubble.io",
                    plan: "VIP",
                    status: "Ativo",
                    "Created Date": "2024-11-29T14:29:29.687Z"
                }, {
                    id: "b2",
                    name: "Roberto Costa (Bubble)",
                    phone: "(21) 98888-2222",
                    email: "roberto.costa@bubble.io",
                    plan: "Premium",
                    status: "Ativo",
                    "Created Date": "2024-11-29T14:30:39.925Z"
                }, {
                    id: "b3",
                    name: "Clara Mendes (Bubble)",
                    phone: "(31) 97777-3333",
                    email: "clara.mendes@bubble.io",
                    plan: "Básico",
                    status: "Inativo",
                    "Created Date": "2024-11-29T14:33:25.548Z"
                }, {
                    id: "b4",
                    name: "Julio Nogueira (Bubble)",
                    phone: "(81) 96666-4444",
                    email: "julio.nogueira@bubble.io",
                    plan: "Premium",
                    status: "Ativo",
                    "Created Date": "2024-11-29T14:36:52.343Z"
                }, {
                    id: "b5",
                    name: "Beatriz Lima (Bubble)",
                    phone: "(11) 95555-5555",
                    email: "beatriz.lima@bubble.io",
                    plan: "VIP",
                    status: "Ativo",
                    "Created Date": "2024-11-29T14:43:10.736Z"
                }]) : S === "grupos" ? te([{
                    id: "g1",
                    title: "Bubble Crossfit A",
                    members: 12,
                    time: "06:00",
                    status: "Ativo"
                }, {
                    id: "g2",
                    title: "Bubble Fit Dance",
                    members: 25,
                    time: "18:00",
                    status: "Ativo"
                }, {
                    id: "g3",
                    title: "Bubble Pilates Funcional",
                    members: 8,
                    time: "14:00",
                    status: "Ativo"
                }, {
                    id: "g4",
                    title: "Bubble Musculação Avançada",
                    members: 30,
                    time: "20:00",
                    status: "Lotado"
                }]) : S === "consorcios" ? W([{
                    _id: "c1",
                    "Created Date": "2024-11-29T18:14:57.292Z",
                    "Modified Date": "2026-03-13T22:14:42.475Z",
                    celularcliente_text: "99137-2680",
                    cliente_custom_clientes: "1732890804508x969608427584356400",
                    dataretirada_date: "2026-03-12T03:00:00.000Z",
                    grupo_custom_grupos: "1732903495089x440403736550441000",
                    nomecliente_text: "TALYTA DE PAULA PIQUI",
                    outrasinformacoescliente_text: "CONSÓRCIO 9 X 66,66",
                    valorretirada__number: 24,
                    vencimentodia_number: 10,
                    vestetamanhocliente_text: "G",
                    valormesgrupo_number: 60,
                    mesretirada_option_meses: "Janeiro",
                    cotano_number: 119
                }, {
                    _id: "c2",
                    "Created Date": "2024-11-30T10:00:00.000Z",
                    "Modified Date": "2026-03-13T22:14:42.475Z",
                    celularcliente_text: "98888-2222",
                    cliente_custom_clientes: "invalid_bubble_id_for_test",
                    dataretirada_date: null,
                    grupo_custom_grupos: "1732903495089x440403736550441000",
                    nomecliente_text: "EDITE ARRUDA GUIMARÃES",
                    outrasinformacoescliente_text: "PREFEITURA MUNICIPAL DE ARAGUARI",
                    valorretirada__number: 24,
                    vencimentodia_number: 15,
                    vestetamanhocliente_text: "G",
                    valormesgrupo_number: 60,
                    mesretirada_option_meses: "Fevereiro",
                    cotano_number: 120
                }]) : S === "pagamentos" ? re([{
                    id: "p1",
                    clientName: "Mariana Souza (Bubble)",
                    consorcioTitle: "Consórcio Bubble Esteiras",
                    quota: "Parcela 3/10",
                    value: "R$ 1.200,00",
                    dueDate: "10/07/2026",
                    status: "Pago"
                }, {
                    id: "p2",
                    clientName: "Roberto Costa (Bubble)",
                    consorcioTitle: "Consórcio Bubble Halteres",
                    quota: "Parcela 2/12",
                    value: "R$ 375,00",
                    dueDate: "15/07/2026",
                    status: "Pendente"
                }, {
                    id: "p3",
                    clientName: "Beatriz Lima (Bubble)",
                    consorcioTitle: "Consórcio Bubble Esteiras",
                    quota: "Parcela 1/10",
                    value: "R$ 1.200,00",
                    dueDate: "10/06/2026",
                    status: "Pago"
                }]) : S === "receitas" && Ae([{
                    id: "r1",
                    description: "Mensalidade Mariana (Bubble)",
                    category: "Mensalidade",
                    value: "R$ 150,00",
                    date: "24/06/2026",
                    type: "Entrada"
                }, {
                    id: "r2",
                    description: "Venda Whey Protein (Bubble)",
                    category: "Venda de Produto",
                    value: "R$ 220,00",
                    date: "23/06/2026",
                    type: "Entrada"
                }, {
                    id: "r3",
                    description: "Venda Creatina Pura (Bubble)",
                    category: "Venda de Produto",
                    value: "R$ 110,00",
                    date: "22/06/2026",
                    type: "Entrada"
                }]), z(!1), ge(`Sucesso! Carregados dados simulados de teste para a aba ${S}.`)
            }, 800)
        }, Fs = async () => {
            if (M.length !== 0) {
                z(!0), X(null), ge(null);
                try {
                    const {
                        data: S,
                        error: K
                    } = await on.from("grupos").select("bubble_id, periodo_text");
                    if (K) throw new Error(`Erro ao buscar grupos do Supabase: ${K.message}`);
                    const Y = new Map;
                    S == null || S.forEach(le => {
                        le.bubble_id && Y.set(le.bubble_id, le.periodo_text)
                    });
                    const Z = M.map(le => {
                            const be = le.grupo_list_custom_grupos && le.grupo_list_custom_grupos.length > 0 ? le.grupo_list_custom_grupos[0] : le.grupo_custom || le.grupo || le.grupo_text || le.Grupo || null,
                                je = be ? Y.get(be) || le.plan || le.plano || "Básico" : le.plan || le.plano || "Básico";
                            return {
                                bubble_id: le._id,
                                nome: le.nome_text || "Sem nome",
                                celular: le.celular_text || null,
                                endereco: le.endereco_text || null,
                                datanascimento: le.datanascimento_date || null,
                                outrasinformacoes: le.outrasinformacoes_text || null,
                                vestetamanho: le.vestetamanho_text || null,
                                plano: je,
                                status: "Ativo",
                                data_cadastro: le["Created Date"] || null
                            }
                        }),
                        {
                            error: de
                        } = await on.from("clientes").upsert(Z, {
                            onConflict: "bubble_id"
                        });
                    if (de) throw new Error(`Erro ao salvar no Supabase: ${de.message}`);
                    await va(), ge(`Sucesso! ${Z.length} clientes do Bubble.io foram sincronizados com o Supabase.`), q([])
                } catch (S) {
                    console.error(S), X(`Erro ao integrar dados com o Supabase: ${S.message}`)
                } finally {
                    z(!1)
                }
            }
        }, Kl = async () => {
            if (Q.length !== 0) {
                z(!0), X(null), ge(null);
                try {
                    const S = Q.map(Y => ({
                            bubble_id: Y._id || Y.id,
                            periodo_text: Y.periodo_text || null,
                            valor_number: Y.valor_number !== void 0 ? Y.valor_number : null,
                            valorcota_number: Y.valorcota_number !== void 0 ? Y.valorcota_number : null,
                            mesinicial_date: Y.mesinicial_date || null,
                            mesfinal_date: Y.mesfinal_date || null,
                            encerrado_boolean: Y.encerrado_boolean !== void 0 ? Y.encerrado_boolean : !1,
                            created_at: Y["Created Date"] || new Date().toISOString(),
                            updated_at: Y["Modified Date"] || new Date().toISOString()
                        })),
                        {
                            error: K
                        } = await on.from("grupos").upsert(S, {
                            onConflict: "bubble_id"
                        });
                    if (K) throw new Error(`Erro ao salvar no Supabase: ${K.message}`);
                    await wr(), ge(`Sucesso! ${S.length} grupos do Bubble.io foram sincronizados com o Supabase.`), te([])
                } catch (S) {
                    console.error(S), X(`Erro ao integrar dados com o Supabase: ${S.message}`)
                } finally {
                    z(!1)
                }
            }
        }, Yl = async () => {
            if (F.length !== 0) {
                z(!0), X(null), ge(null);
                try {
                    const {
                        data: S,
                        error: K
                    } = await on.from("clientes").select("id, bubble_id");
                    if (K) throw new Error(`Erro ao buscar clientes do Supabase: ${K.message}`);
                    const {
                        data: Y,
                        error: Z
                    } = await on.from("grupos").select("id, bubble_id");
                    if (Z) throw new Error(`Erro ao buscar grupos do Supabase: ${Z.message}`);
                    const de = new Map;
                    S == null || S.forEach(ve => {
                        ve.bubble_id && de.set(ve.bubble_id, ve.id)
                    });
                    const le = new Map;
                    Y == null || Y.forEach(ve => {
                        ve.bubble_id && le.set(ve.bubble_id, ve.id)
                    });
                    const be = F.map(ve => {
                            const Pe = ve.cliente_custom_clientes || null,
                                Fe = ve.grupo_custom_grupos || null;
                            return {
                                bubble_id: ve._id || ve.id,
                                cliente_id: Pe && de.get(Pe) || null,
                                grupo_id: Fe && le.get(Fe) || null,
                                dataretirada_date: ve.dataretirada_date || null,
                                vencimentodia_number: ve.vencimentodia_number !== void 0 ? ve.vencimentodia_number : null,
                                cotano_number: ve.cotano_number !== void 0 ? ve.cotano_number : null,
                                mesretirada_text: (() => {
                                    if (ve.mesretiradas_date) {
                                        try {
                                            const d = new Date(ve.mesretiradas_date);
                                            const meses = [
                                                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                                            ];
                                            const mesNome = meses[d.getUTCMonth()];
                                            const ano = d.getUTCFullYear();
                                            return `${mesNome}/${ano}`;
                                        } catch (e) {
                                            console.error("Erro ao converter mesretiradas_date:", e);
                                        }
                                    }
                                    const mes = ve.mesretirada_option_meses;
                                    if (!mes) return null;
                                    const dateStr = ve.dataretirada_date || ve["Created Date"];
                                    if (!dateStr) return mes;
                                    try {
                                        const year = new Date(dateStr).getUTCFullYear();
                                        return `${mes}/${year}`;
                                    } catch {
                                        return mes;
                                    }
                                })(),
                                created_at: ve["Created Date"] || new Date().toISOString(),
                                updated_at: ve["Modified Date"] || new Date().toISOString()
                            }
                        }),
                        {
                            error: je
                        } = await on.from("consorcios").upsert(be, {
                            onConflict: "bubble_id"
                        });
                    if (je) throw new Error(`Erro ao salvar no Supabase: ${je.message}`);
                    await ba(), ge(`Sucesso! ${be.length} consórcios do Bubble.io foram sincronizados com o Supabase.`), W([])
                } catch (S) {
                    console.error(S), X(`Erro ao integrar dados com o Supabase: ${S.message}`)
                } finally {
                    z(!1)
                }
            }
        }, A = r ? {
            bg: "bg-[#0B0F19] text-slate-100",
            card: "bg-slate-800 border-slate-700",
            textPrimary: "text-slate-100",
            textMuted: "text-slate-400",
            border: "border-slate-700",
            bgLight: "bg-slate-900",
            bgHover: "hover:bg-slate-800",
            inputText: "bg-slate-800 text-slate-100 border-slate-700 focus:ring-brand-purple",
            tableHeader: "bg-slate-900 text-slate-400",
            tableRowHover: "hover:bg-slate-800/50"
        } : {
            bg: "bg-neutralLight text-textPrimary",
            card: "bg-white border-borderGray",
            textPrimary: "text-textPrimary",
            textMuted: "text-textMuted",
            border: "border-borderGray",
            bgLight: "bg-slate-50",
            bgHover: "hover:bg-slate-100",
            inputText: "bg-white text-textPrimary border-slate-200 focus:ring-brand-purple",
            tableHeader: "bg-slate-50 text-textMuted",
            tableRowHover: "hover:bg-slate-50/50"
        }, ac = [{
            id: "dashboard",
            label: "Dashboard",
            icon: GA
        }, {
            id: "clientes",
            label: "Clientes",
            icon: kh
        }, {
            id: "grupos",
            label: "Grupos",
            icon: ou
        }, {
            id: "consorcios",
            label: "Consórcios",
            icon: MA
        }];
        return p.jsxs("div", {
            className: `flex h-screen overflow-hidden ${A.bg} transition-colors duration-300 font-sans`,
            children: [p.jsxs("div", {
                className: `relative flex flex-col justify-between py-6 border-r ${A.border} ${r?"bg-[#0F172A]":"bg-white"} z-30 transition-all duration-300 ${u?"w-64 px-4 items-stretch":"w-20 md:w-24 px-2 items-center"}`,
                children: [p.jsx("button", {
                    onClick: () => c(!u),
                    className: `absolute -right-3.5 top-[104px] -translate-y-1/2 z-50 w-7 h-7 flex items-center justify-center rounded-full border ${A.border} ${r?"bg-[#1E293B] text-slate-300 hover:text-brand-lime border-slate-700":"bg-white text-slate-600 hover:text-brand-purple border-slate-200"} shadow-md transition-all cursor-pointer active:scale-95`,
                    title: u ? "Recolher Menu" : "Expandir Menu",
                    children: u ? p.jsx(nv, {
                        size: 14
                    }) : p.jsx(sv, {
                        size: 14
                    })
                }), p.jsxs("div", {
                    className: "flex flex-col gap-6 w-full",
                    children: [p.jsx("div", {
                        className: `flex items-center ${u?"justify-start px-2":"justify-center"} w-full border-b ${A.border} pb-6`,
                        children: p.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [p.jsx("div", {
                                className: "w-14 h-14 rounded-full overflow-hidden border border-brand-purple shadow-md cursor-pointer flex items-center justify-center flex-shrink-0",
                                children: p.jsx("img", {
                                    src: "/import/logomundo.png",
                                    alt: "MundoFitness Logo",
                                    className: "object-cover w-full h-full"
                                })
                            }), u && p.jsxs("div", {
                                className: "flex flex-col text-left",
                                children: [p.jsx("span", {
                                    className: "font-extrabold text-[18pt] tracking-tight leading-none bg-gradient-to-r from-blue-600 via-brand-purple to-pink-500 bg-clip-text text-transparent",
                                    children: "MUNDO"
                                }), p.jsx("span", {
                                    className: "font-black text-[18pt] tracking-wide leading-none mt-1 bg-gradient-to-r from-blue-600 via-brand-purple to-pink-500 bg-clip-text text-transparent",
                                    children: "FITNESS"
                                })]
                            })]
                        })
                    }), p.jsx("nav", {
                        className: `flex flex-col gap-3 mt-4 ${u?"w-full":""}`,
                        children: ac.map(S => {
                            const K = S.icon,
                                Y = t === S.id;
                            return p.jsxs("button", {
                                onClick: () => i(S.id),
                                title: u ? void 0 : S.label,
                                className: `relative flex items-center transition-all ${u?"w-full gap-3 text-left hover:text-brand-purple":"justify-center"}`,
                                children: [p.jsx("div", {
                                    className: `w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${Y?"bg-brand-purple text-white shadow-lg shadow-brand-purple/20":`${A.textMuted} ${A.bgHover} hover:text-brand-purple`}`,
                                    children: p.jsx(K, {
                                        size: 20
                                    })
                                }), u && p.jsx("span", {
                                    className: `font-semibold text-sm transition-colors ${Y?"text-brand-purple":`${A.textMuted}`}`,
                                    children: S.label
                                })]
                            }, S.id)
                        })
                    })]
                }), p.jsxs("div", {
                    className: `flex flex-col gap-3 w-full ${u?"px-1":"items-center"}`,
                    children: [p.jsxs("button", {
                        onClick: () => o(!r),
                        className: `relative flex items-center transition-all ${u?"w-full gap-3 text-left hover:text-brand-purple":"justify-center"}`,
                        title: u ? void 0 : r ? "Modo Claro" : "Modo Escuro",
                        children: [p.jsx("div", {
                            className: `w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${A.textMuted} ${A.bgHover} hover:text-brand-purple`,
                            children: r ? p.jsx(cj, {
                                size: 20,
                                className: "text-brand-lime"
                            }) : p.jsx(QA, {
                                size: 20
                            })
                        }), u && p.jsx("span", {
                            className: `font-semibold text-sm transition-colors ${A.textMuted}`,
                            children: r ? "Modo Claro" : "Modo Escuro"
                        })]
                    }), p.jsxs("button", {
                        onClick: () => i("configuracoes"),
                        className: `relative flex items-center transition-all ${u?"w-full gap-3 text-left hover:text-brand-purple":"justify-center"}`,
                        title: u ? void 0 : "Configurações",
                        children: [p.jsx("div", {
                            className: `w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${t==="configuracoes"?"bg-brand-purple text-white shadow-lg shadow-brand-purple/20":`${A.textMuted} ${A.bgHover} hover:text-brand-purple`}`,
                            children: p.jsx(aj, {
                                size: 20
                            })
                        }), u && p.jsx("span", {
                            className: `font-semibold text-sm transition-colors ${t==="configuracoes"?"text-brand-purple":`${A.textMuted}`}`,
                            children: "Configurações"
                        })]
                    }), p.jsxs("button", {
                        onClick: n,
                        className: `relative flex items-center transition-all ${u?"w-full gap-3 text-left hover:text-rose-600":"justify-center"}`,
                        title: u ? void 0 : "Sair",
                        children: [p.jsx("div", {
                            className: "w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 bg-rose-50 text-rose-500 hover:bg-rose-100 shadow-sm",
                            children: p.jsx(YA, {
                                size: 20
                            })
                        }), u && p.jsx("span", {
                            className: "font-semibold text-sm transition-colors text-rose-500 hover:text-rose-600",
                            children: "Sair"
                        })]
                    })]
                })]
            }), p.jsxs("div", {
                className: "flex-1 flex flex-col h-full overflow-hidden",
                children: [p.jsxs("header", {
                    className: `h-20 border-b ${A.border} ${r?"bg-[#0B0F19]/50":"bg-white/80"} backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-20`,
                    children: [p.jsxs("div", {
                        className: "relative w-64 md:w-80",
                        children: [p.jsx("span", {
                            className: "absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]",
                            children: p.jsx(Ja, {
                                size: 18
                            })
                        }), p.jsx("input", {
                            type: "text",
                            value: f,
                            onChange: S => m(S.target.value),
                            placeholder: "Pesquisar...",
                            className: `w-full pl-10 pr-4 py-2 text-sm rounded-full border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all`
                        })]
                    }), p.jsxs("div", {
                        className: "flex items-center gap-4",
                        children: [p.jsx("button", {
                            className: `p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all`,
                            children: p.jsx(JA, {
                                size: 18
                            })
                        }), p.jsxs("button", {
                            className: `p-2.5 rounded-full ${A.bgHover} ${A.textMuted} hover:text-brand-purple transition-all relative`,
                            children: [p.jsx(xA, {
                                size: 18
                            }), p.jsx("span", {
                                className: "absolute top-1 right-1 w-2 h-2 bg-brand-purple rounded-full"
                            })]
                        }), p.jsx("div", {
                            className: `h-6 w-px ${A.border}`
                        }), p.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [p.jsx("img", {
                                src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                                alt: "Avatar Noah Miles",
                                className: "w-10 h-10 rounded-full object-cover border border-brand-purple"
                            }), p.jsxs("div", {
                                className: "hidden lg:block text-left",
                                children: [p.jsx("p", {
                                    className: `text-sm font-bold leading-none ${A.textPrimary}`,
                                    children: "Noah Miles"
                                }), p.jsx("p", {
                                    className: `text-[10px] mt-0.5 ${A.textMuted}`,
                                    children: "Euclid Avenue, CA"
                                })]
                            })]
                        })]
                    })]
                }), p.jsx("main", {
                    className: "flex-1 overflow-y-auto p-6 md:p-8 space-y-6",
                    children: p.jsxs(wl, {
                        mode: "wait",
                        children: [t === "dashboard" && p.jsxs(Ut.div, {
                            initial: {
                                opacity: 0,
                                y: 15
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -15
                            },
                            transition: {
                                duration: .4
                            },
                            className: "space-y-6",
                            children: [p.jsxs("div", {
                                className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
                                children: [p.jsxs("div", {
                                    className: "space-y-1",
                                    children: [p.jsx("h1", {
                                        className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                        children: "Dashboard"
                                    }), p.jsx("p", {
                                        className: `text-sm ${A.textMuted}`,
                                        children: "Observe suas vendas e indicadores de forma simplificada."
                                    })]
                                }), p.jsxs("div", {
                                    className: "flex items-center gap-3 self-start md:self-auto text-xs font-semibold",
                                    children: [p.jsxs("button", {
                                        className: `flex items-center gap-2 px-4 py-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`,
                                        children: [p.jsx(SA, {
                                            size: 14
                                        }), " 01- 31 Dezembro 2024"]
                                    }), p.jsxs("button", {
                                        className: `flex items-center gap-2 px-4 py-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`,
                                        children: [p.jsx(UA, {
                                            size: 14
                                        }), " Exportar"]
                                    }), p.jsx("button", {
                                        className: "p-2.5 rounded-xl bg-brand-purple text-white hover:bg-brand-purpleDark shadow-md shadow-brand-purple/15 transition-all",
                                        children: p.jsx(rv, {
                                            size: 14
                                        })
                                    }), p.jsx("button", {
                                        className: `p-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`,
                                        children: p.jsx(lv, {
                                            size: 14
                                        })
                                    })]
                                })]
                            }), p.jsxs("div", {
                                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                                children: [p.jsxs("div", {
                                    className: `lg:col-span-7 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[360px]`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(uu, {
                                                size: 18,
                                                className: A.textMuted
                                            }), p.jsx("h3", {
                                                className: `font-bold text-lg ${A.textPrimary}`,
                                                children: "Cash flow"
                                            })]
                                        }), p.jsx("button", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 16,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4 flex items-baseline gap-4",
                                        children: [p.jsxs("div", {
                                            children: [p.jsx("p", {
                                                className: `text-xs ${A.textMuted} font-medium`,
                                                children: "Saldo disponível na carteira"
                                            }), p.jsx("h4", {
                                                className: "text-3xl font-bold mt-1 text-brand-purple",
                                                children: "$16,000.00"
                                            })]
                                        }), p.jsx("span", {
                                            className: "text-xs font-semibold px-2 py-1 rounded bg-brand-blue/10 text-brand-blue",
                                            children: "+456"
                                        }), p.jsx("span", {
                                            className: "flex items-center gap-1 text-emerald-500 font-bold text-sm ml-auto",
                                            children: "↑ 2.03%"
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-6 flex-1 relative flex items-center justify-center h-[180px] w-full",
                                        children: [p.jsxs("svg", {
                                            className: "absolute inset-0 w-full h-full pointer-events-none",
                                            viewBox: "0 0 500 180",
                                            preserveAspectRatio: "none",
                                            children: [p.jsxs("defs", {
                                                children: [p.jsxs("linearGradient", {
                                                    id: "purpleGrad",
                                                    x1: "0%",
                                                    y1: "0%",
                                                    x2: "100%",
                                                    y2: "0%",
                                                    children: [p.jsx("stop", {
                                                        offset: "0%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.3"
                                                    }), p.jsx("stop", {
                                                        offset: "100%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.3"
                                                    })]
                                                }), p.jsxs("linearGradient", {
                                                    id: "limeGrad",
                                                    x1: "0%",
                                                    y1: "0%",
                                                    x2: "100%",
                                                    y2: "0%",
                                                    children: [p.jsx("stop", {
                                                        offset: "0%",
                                                        stopColor: "#C0F62C",
                                                        stopOpacity: "0.4"
                                                    }), p.jsx("stop", {
                                                        offset: "100%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.3"
                                                    })]
                                                }), p.jsxs("linearGradient", {
                                                    id: "blueGrad",
                                                    x1: "0%",
                                                    y1: "0%",
                                                    x2: "100%",
                                                    y2: "0%",
                                                    children: [p.jsx("stop", {
                                                        offset: "0%",
                                                        stopColor: "#06B6D4",
                                                        stopOpacity: "0.4"
                                                    }), p.jsx("stop", {
                                                        offset: "100%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.3"
                                                    })]
                                                })]
                                            }), p.jsx("path", {
                                                d: "M 90 35 C 130 35, 130 65, 175 65",
                                                fill: "none",
                                                stroke: "url(#purpleGrad)",
                                                strokeWidth: "12"
                                            }), p.jsx("path", {
                                                d: "M 90 90 C 130 90, 130 65, 175 65",
                                                fill: "none",
                                                stroke: "url(#limeGrad)",
                                                strokeWidth: "10"
                                            }), p.jsx("path", {
                                                d: "M 90 90 C 130 90, 130 115, 175 115",
                                                fill: "none",
                                                stroke: "url(#limeGrad)",
                                                strokeWidth: "8"
                                            }), p.jsx("path", {
                                                d: "M 90 145 C 130 145, 130 65, 175 65",
                                                fill: "none",
                                                stroke: "url(#blueGrad)",
                                                strokeWidth: "10"
                                            }), p.jsx("path", {
                                                d: "M 90 145 C 130 145, 130 115, 175 115",
                                                fill: "none",
                                                stroke: "url(#blueGrad)",
                                                strokeWidth: "14"
                                            }), p.jsx("path", {
                                                d: "M 270 65 C 310 65, 310 35, 355 35",
                                                fill: "none",
                                                stroke: "url(#purpleGrad)",
                                                strokeWidth: "15"
                                            }), p.jsx("path", {
                                                d: "M 270 65 C 310 65, 310 90, 355 90",
                                                fill: "none",
                                                stroke: "url(#purpleGrad)",
                                                strokeWidth: "8"
                                            }), p.jsx("path", {
                                                d: "M 270 115 C 310 115, 310 90, 355 90",
                                                fill: "none",
                                                stroke: "url(#purpleGrad)",
                                                strokeWidth: "8"
                                            }), p.jsx("path", {
                                                d: "M 270 115 C 310 115, 310 145, 355 145",
                                                fill: "none",
                                                stroke: "url(#purpleGrad)",
                                                strokeWidth: "16"
                                            })]
                                        }), p.jsxs("div", {
                                            className: "absolute left-0 w-[95px] flex flex-col justify-between h-full py-1 text-[9px] font-bold text-white z-10",
                                            children: [p.jsxs("div", {
                                                className: "bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20",
                                                children: [p.jsx("p", {
                                                    children: "Licenses"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$5,000"
                                                    }), p.jsx("span", {
                                                        className: "text-rose-200",
                                                        children: "-0.2%"
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "bg-[#A3E635] text-slate-900 rounded-lg p-1.5 shadow-sm border border-[#A3E635]/20",
                                                children: [p.jsx("p", {
                                                    children: "Subscriptions"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$3,200"
                                                    }), p.jsx("span", {
                                                        className: "text-emerald-700 font-bold",
                                                        children: "+0.1%"
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "bg-brand-blue rounded-lg p-1.5 shadow-sm border border-brand-blue/20",
                                                children: [p.jsx("p", {
                                                    children: "Hardware"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$7,500"
                                                    }), p.jsx("span", {
                                                        className: "text-emerald-200",
                                                        children: "+0.1%"
                                                    })]
                                                })]
                                            })]
                                        }), p.jsxs("div", {
                                            className: "absolute left-[180px] w-[95px] flex flex-col justify-around h-full py-6 text-[9px] font-bold text-white z-10",
                                            children: [p.jsxs("div", {
                                                className: "bg-brand-purple/90 rounded-lg p-1.5 shadow-sm border border-brand-purple/35",
                                                children: [p.jsx("p", {
                                                    children: "Operating Systems"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$4,000"
                                                    }), p.jsx("span", {
                                                        className: "text-rose-200",
                                                        children: "-0.2%"
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "bg-brand-purple/95 rounded-lg p-1.5 shadow-sm border border-brand-purple/40",
                                                children: [p.jsx("p", {
                                                    children: "Data Management"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$6,000"
                                                    }), p.jsx("span", {
                                                        className: "text-emerald-200",
                                                        children: "+0.1%"
                                                    })]
                                                })]
                                            })]
                                        }), p.jsxs("div", {
                                            className: "absolute right-0 w-[95px] flex flex-col justify-between h-full py-1 text-[9px] font-bold text-white z-10",
                                            children: [p.jsxs("div", {
                                                className: "bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20",
                                                children: [p.jsx("p", {
                                                    children: "Windows Server"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$2,500"
                                                    }), p.jsx("span", {
                                                        className: "text-emerald-200",
                                                        children: "+0.1%"
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "bg-[#334155] rounded-lg p-1.5 shadow-sm border border-slate-600",
                                                children: [p.jsx("p", {
                                                    children: "Linux Support"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$1,500"
                                                    }), p.jsx("span", {
                                                        className: "text-emerald-200",
                                                        children: "+0.1%"
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20",
                                                children: [p.jsx("p", {
                                                    children: "Cloud Solutions"
                                                }), p.jsxs("div", {
                                                    className: "flex justify-between items-center mt-1 text-[8px] opacity-90",
                                                    children: [p.jsx("span", {
                                                        children: "$6,000"
                                                    }), p.jsx("span", {
                                                        className: "text-rose-200",
                                                        children: "-0.2%"
                                                    })]
                                                })]
                                            })]
                                        })]
                                    })]
                                }), p.jsxs("div", {
                                    className: `lg:col-span-5 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[360px]`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(kh, {
                                                size: 18,
                                                className: A.textMuted
                                            }), p.jsx("h3", {
                                                className: `font-bold text-lg ${A.textPrimary}`,
                                                children: "Travel expenses by country 1"
                                            })]
                                        }), p.jsx("button", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 16,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsxs("div", {
                                        className: "flex gap-1.5 mt-4 text-[10px] font-bold",
                                        children: [p.jsx("span", {
                                            className: "px-2.5 py-1 rounded-full bg-slate-900 text-white cursor-pointer hover:opacity-90",
                                            children: "All"
                                        }), p.jsx("span", {
                                            className: `px-2.5 py-1 rounded-full ${A.bgLight} ${A.textMuted} cursor-pointer hover:text-brand-purple`,
                                            children: "Europe"
                                        }), p.jsx("span", {
                                            className: `px-2.5 py-1 rounded-full ${A.bgLight} ${A.textMuted} cursor-pointer hover:text-brand-purple`,
                                            children: "Asia"
                                        }), p.jsx("span", {
                                            className: `px-2.5 py-1 rounded-full ${A.bgLight} ${A.textMuted} cursor-pointer hover:text-brand-purple`,
                                            children: "North America"
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4 grid grid-cols-12 gap-4 items-center",
                                        children: [p.jsxs("div", {
                                            className: "col-span-5 space-y-3",
                                            children: [p.jsxs("div", {
                                                children: [p.jsx("p", {
                                                    className: `text-[10px] ${A.textMuted} font-semibold uppercase tracking-wider`,
                                                    children: "Total balance"
                                                }), p.jsx("h5", {
                                                    className: `text-xl font-bold mt-0.5 ${A.textPrimary}`,
                                                    children: "$8,560"
                                                })]
                                            }), p.jsx("div", {
                                                className: "text-[10px] space-y-2",
                                                children: [{
                                                    name: "USA",
                                                    value: "$2,500"
                                                }, {
                                                    name: "France",
                                                    value: "$1,500"
                                                }, {
                                                    name: "Ukrainian",
                                                    value: "$890"
                                                }, {
                                                    name: "Italy",
                                                    value: "$600"
                                                }, {
                                                    name: "Brasil",
                                                    value: "$80"
                                                }].map((S, K) => p.jsxs("div", {
                                                    className: "flex justify-between items-center",
                                                    children: [p.jsx("span", {
                                                        className: A.textMuted,
                                                        children: S.name
                                                    }), p.jsx("span", {
                                                        className: `font-bold ${A.textPrimary}`,
                                                        children: S.value
                                                    })]
                                                }, K))
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-7 relative h-36 flex items-center justify-center",
                                            children: [p.jsxs("svg", {
                                                className: "w-full h-full text-slate-200 fill-current",
                                                viewBox: "0 0 160 100",
                                                children: [p.jsx("path", {
                                                    d: "M 10 20 Q 20 15, 30 25 T 45 30 T 40 40 T 15 35 Z",
                                                    className: "opacity-40"
                                                }), p.jsx("path", {
                                                    d: "M 35 45 Q 40 55, 45 65 T 48 85 T 40 70 Z",
                                                    className: "opacity-40"
                                                }), p.jsx("path", {
                                                    d: "M 70 45 Q 85 45, 90 55 T 85 75 T 72 65 Z",
                                                    className: "opacity-40"
                                                }), p.jsx("path", {
                                                    d: "M 70 20 Q 80 15, 90 25 T 85 35 T 75 30 Z",
                                                    className: "opacity-70 fill-brand-purple/40"
                                                }), p.jsx("path", {
                                                    d: "M 95 20 Q 120 15, 140 25 T 145 45 T 115 50 T 100 35 Z",
                                                    className: "opacity-80 fill-brand-purple/60"
                                                }), p.jsx("path", {
                                                    d: "M 130 65 Q 140 65, 145 75 T 135 80 Z",
                                                    className: "opacity-40"
                                                }), p.jsx("circle", {
                                                    cx: "120",
                                                    cy: "38",
                                                    r: "3",
                                                    className: "fill-brand-purple animate-ping"
                                                }), p.jsx("circle", {
                                                    cx: "120",
                                                    cy: "38",
                                                    r: "2.5",
                                                    className: "fill-brand-purple"
                                                })]
                                            }), p.jsxs("div", {
                                                className: "absolute top-[8px] right-[16px] bg-slate-950 text-white rounded-lg p-1.5 text-[8px] shadow-lg leading-tight z-10 border border-slate-800",
                                                children: [p.jsx("p", {
                                                    className: "font-bold",
                                                    children: "China"
                                                }), p.jsx("p", {
                                                    className: "text-brand-lime",
                                                    children: "$1,500"
                                                })]
                                            })]
                                        })]
                                    })]
                                })]
                            }), p.jsxs("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                children: [p.jsxs("div", {
                                    className: `border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(uu, {
                                                size: 18,
                                                className: A.textMuted
                                            }), p.jsx("h3", {
                                                className: `font-bold text-lg ${A.textPrimary}`,
                                                children: "Transfer history"
                                            })]
                                        }), p.jsx("button", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 16,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsx("p", {
                                        className: `text-xs ${A.textMuted} mt-1`,
                                        children: "Monitor how your money is being utilized"
                                    }), p.jsxs("div", {
                                        className: "mt-4 flex-1 flex items-center justify-center relative",
                                        children: [p.jsxs("svg", {
                                            className: "w-32 h-32",
                                            viewBox: "0 0 100 100",
                                            children: [p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#E2E8F0",
                                                strokeWidth: "12"
                                            }), p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#7C3AED",
                                                strokeWidth: "12",
                                                strokeDasharray: "75.4 251.2",
                                                strokeDashoffset: "0"
                                            }), p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#C0F62C",
                                                strokeWidth: "12",
                                                strokeDasharray: "45.2 251.2",
                                                strokeDashoffset: "-75.4"
                                            }), p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#06B6D4",
                                                strokeWidth: "12",
                                                strokeDasharray: "32.6 251.2",
                                                strokeDashoffset: "-120.6"
                                            }), p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#1E293B",
                                                strokeWidth: "12",
                                                strokeDasharray: "42.7 251.2",
                                                strokeDashoffset: "-153.2"
                                            }), p.jsx("circle", {
                                                cx: "50",
                                                cy: "50",
                                                r: "40",
                                                fill: "none",
                                                stroke: "#94A3B8",
                                                strokeWidth: "12",
                                                strokeDasharray: "55.3 251.2",
                                                strokeDashoffset: "-195.9"
                                            }), p.jsx("text", {
                                                x: "50",
                                                y: "53",
                                                textAnchor: "middle",
                                                className: `fill-current text-[8px] font-bold ${A.textPrimary}`,
                                                children: "Resumo"
                                            })]
                                        }), p.jsxs("div", {
                                            className: `absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-[9px] font-bold ${A.textPrimary}`,
                                            children: [p.jsxs("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [p.jsx("span", {
                                                    className: "w-2.5 h-2.5 rounded-full bg-brand-purple"
                                                }), " 30%"]
                                            }), p.jsxs("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [p.jsx("span", {
                                                    className: "w-2.5 h-2.5 rounded-full bg-brand-lime"
                                                }), " 18%"]
                                            }), p.jsxs("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [p.jsx("span", {
                                                    className: "w-2.5 h-2.5 rounded-full bg-brand-blue"
                                                }), " 13%"]
                                            }), p.jsxs("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [p.jsx("span", {
                                                    className: "w-2.5 h-2.5 rounded-full bg-[#1E293B]"
                                                }), " 17%"]
                                            })]
                                        })]
                                    })]
                                }), p.jsxs("div", {
                                    className: `border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(uu, {
                                                size: 18,
                                                className: A.textMuted
                                            }), p.jsx("h3", {
                                                className: `font-bold text-lg ${A.textPrimary}`,
                                                children: "Revenue"
                                            })]
                                        }), p.jsx("button", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 16,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-2 flex items-baseline gap-2",
                                        children: [p.jsx("h4", {
                                            className: "text-xl font-bold text-brand-purple",
                                            children: "$16,000.00"
                                        }), p.jsx("span", {
                                            className: "text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded",
                                            children: "+456"
                                        }), p.jsx("span", {
                                            className: "text-[10px] text-emerald-500 font-bold ml-auto",
                                            children: "↑ 2.03%"
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4 flex-1 h-28 relative",
                                        children: [p.jsxs("svg", {
                                            className: "w-full h-full",
                                            viewBox: "0 0 200 100",
                                            preserveAspectRatio: "none",
                                            children: [p.jsx("line", {
                                                x1: "0",
                                                y1: "20",
                                                x2: "200",
                                                y2: "20",
                                                stroke: "#F1F5F9",
                                                strokeWidth: "0.5"
                                            }), p.jsx("line", {
                                                x1: "0",
                                                y1: "50",
                                                x2: "200",
                                                y2: "50",
                                                stroke: "#F1F5F9",
                                                strokeWidth: "0.5"
                                            }), p.jsx("line", {
                                                x1: "0",
                                                y1: "80",
                                                x2: "200",
                                                y2: "80",
                                                stroke: "#F1F5F9",
                                                strokeWidth: "0.5"
                                            }), p.jsx("rect", {
                                                x: "15",
                                                y: "45",
                                                width: "10",
                                                height: "55",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "35",
                                                y: "35",
                                                width: "10",
                                                height: "65",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "55",
                                                y: "60",
                                                width: "10",
                                                height: "40",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "75",
                                                y: "25",
                                                width: "10",
                                                height: "75",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "95",
                                                y: "50",
                                                width: "10",
                                                height: "50",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "115",
                                                y: "15",
                                                width: "10",
                                                height: "85",
                                                rx: "2",
                                                fill: "#7C3AED"
                                            }), p.jsx("rect", {
                                                x: "135",
                                                y: "40",
                                                width: "10",
                                                height: "60",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            }), p.jsx("rect", {
                                                x: "155",
                                                y: "30",
                                                width: "10",
                                                height: "70",
                                                rx: "2",
                                                fill: "#E2E8F0"
                                            })]
                                        }), p.jsx("div", {
                                            className: "absolute top-[2px] left-[102px] bg-slate-900 text-white rounded px-1.5 py-0.5 text-[8px] font-bold shadow-md",
                                            children: "$27,632"
                                        })]
                                    })]
                                }), p.jsxs("div", {
                                    className: `border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(uu, {
                                                size: 18,
                                                className: A.textMuted
                                            }), p.jsx("h3", {
                                                className: `font-bold text-lg ${A.textPrimary}`,
                                                children: "Salary funnel analytics"
                                            })]
                                        }), p.jsx("button", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 16,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-2 flex items-baseline gap-2",
                                        children: [p.jsx("h4", {
                                            className: "text-xl font-bold text-brand-purple",
                                            children: "$16,000.00"
                                        }), p.jsx("span", {
                                            className: "text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded",
                                            children: "+456"
                                        }), p.jsx("span", {
                                            className: "text-[10px] text-emerald-500 font-bold ml-auto",
                                            children: "↑ 2.03%"
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4 flex-1 flex flex-col justify-center h-28 relative",
                                        children: [p.jsxs("svg", {
                                            className: "w-full h-16",
                                            viewBox: "0 0 200 50",
                                            preserveAspectRatio: "none",
                                            children: [p.jsx("defs", {
                                                children: p.jsxs("linearGradient", {
                                                    id: "funnelGrad",
                                                    x1: "0%",
                                                    y1: "0%",
                                                    x2: "100%",
                                                    y2: "0%",
                                                    children: [p.jsx("stop", {
                                                        offset: "0%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.9"
                                                    }), p.jsx("stop", {
                                                        offset: "25%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.75"
                                                    }), p.jsx("stop", {
                                                        offset: "50%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.6"
                                                    }), p.jsx("stop", {
                                                        offset: "75%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.45"
                                                    }), p.jsx("stop", {
                                                        offset: "100%",
                                                        stopColor: "#7C3AED",
                                                        stopOpacity: "0.2"
                                                    })]
                                                })
                                            }), p.jsx("path", {
                                                d: "M 0 0 C 40 5, 80 15, 200 20 L 200 30 C 80 35, 40 45, 0 50 Z",
                                                fill: "url(#funnelGrad)"
                                            })]
                                        }), p.jsxs("div", {
                                            className: `flex justify-between mt-1 text-[9px] font-bold px-1 ${A.textPrimary}`,
                                            children: [p.jsx("span", {
                                                children: "100%"
                                            }), p.jsx("span", {
                                                children: "72%"
                                            }), p.jsx("span", {
                                                children: "46%"
                                            }), p.jsx("span", {
                                                children: "24%"
                                            }), p.jsx("span", {
                                                children: "10%"
                                            })]
                                        })]
                                    })]
                                })]
                            })]
                        }, "dashboard"), t === "clientes" && p.jsxs(Ut.div, {
                            initial: {
                                opacity: 0,
                                y: 15
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -15
                            },
                            transition: {
                                duration: .4
                            },
                            className: "space-y-6",
                            children: [p.jsxs("div", {
                                className: "flex justify-between items-center",
                                children: [p.jsxs("div", {
                                    className: "space-y-1",
                                    children: [p.jsx("h1", {
                                        className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                        children: "Gerenciamento de Clientes"
                                    }), p.jsx("p", {
                                        className: `text-sm ${A.textMuted}`,
                                        children: "Consulte, edite ou crie novos clientes da academia."
                                    })]
                                }), p.jsxs("button", {
                                    onClick: () => {
                                        jn(""), ls(""), Zt(""), Ps(""), us(""), vt(""), Vs(""), Kn("Ativo"), ji(null), dt(!0)
                                    },
                                    className: "flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-4 rounded-xl font-semibold shadow-md shadow-brand-purple/15 transition-all active:scale-[0.98]",
                                    children: [p.jsx(Ms, {
                                        size: 18
                                    }), " Novo Cliente"]
                                })]
                            }), p.jsxs("div", {
                                className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-4 select-none",
                                children: [p.jsxs(Ut.div, {
                                    whileHover: {
                                        y: -4
                                    },
                                    onClick: () => {
                                        ql(null), Qt(1)
                                    },
                                    className: `border cursor-pointer ${Oi===null?"border-brand-purple ring-2 ring-brand-purple/20 bg-purple-50/20 dark:bg-[#7C3AED]/5":A.card} rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden`,
                                    title: "Mostrar todos os tamanhos",
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [p.jsxs("div", {
                                            className: "flex items-center gap-2",
                                            children: [p.jsx(kh, {
                                                size: 16,
                                                className: "text-brand-purple"
                                            }), p.jsx("span", {
                                                className: `text-xs font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Total"
                                            })]
                                        }), p.jsx("div", {
                                            className: `w-7 h-7 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                            children: p.jsx(Qi, {
                                                size: 14,
                                                className: A.textMuted
                                            })
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4",
                                        children: [p.jsx("h4", {
                                            className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                            children: mn.total
                                        }), p.jsx("p", {
                                            className: `text-[10px] ${A.textMuted} font-medium mt-1`,
                                            children: "Clientes ativos e inativos"
                                        })]
                                    }), p.jsx("div", {
                                        className: "w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden",
                                        children: p.jsx("div", {
                                            className: "bg-brand-purple h-full rounded-full w-full"
                                        })
                                    })]
                                }), [{
                                    size: "PP",
                                    label: "Tamanho PP",
                                    colorClass: "text-cyan-500",
                                    barBg: "bg-cyan-500",
                                    barHover: "hover:border-cyan-500/30",
                                    activeStyle: "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/5"
                                }, {
                                    size: "P",
                                    label: "Tamanho P",
                                    colorClass: "text-emerald-500",
                                    barBg: "bg-emerald-500",
                                    barHover: "hover:border-emerald-500/30",
                                    activeStyle: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                                }, {
                                    size: "M",
                                    label: "Tamanho M",
                                    colorClass: "text-[#A3E635]",
                                    barBg: "bg-[#A3E635]",
                                    barHover: "hover:border-[#A3E635]/30",
                                    activeStyle: "border-[#A3E635] ring-2 ring-[#A3E635]/20 bg-[#A3E635]/5"
                                }, {
                                    size: "G",
                                    label: "Tamanho G",
                                    colorClass: "text-brand-purple",
                                    barBg: "bg-brand-purple",
                                    barHover: "hover:border-brand-purple/30",
                                    activeStyle: "border-brand-purple ring-2 ring-brand-purple/20 bg-purple-500/5 dark:bg-[#7C3AED]/5"
                                }, {
                                    size: "GG",
                                    label: "Tamanho GG",
                                    colorClass: "text-blue-500",
                                    barBg: "bg-blue-500",
                                    barHover: "hover:border-blue-500/30",
                                    activeStyle: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5"
                                }, {
                                    size: "XG",
                                    label: "Tamanho XG",
                                    colorClass: "text-rose-500",
                                    barBg: "bg-rose-500",
                                    barHover: "hover:border-rose-500/30",
                                    activeStyle: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5"
                                }, {
                                    size: "XGG",
                                    label: "Tamanho XGG",
                                    colorClass: "text-amber-500",
                                    barBg: "bg-amber-500",
                                    barHover: "hover:border-amber-500/30",
                                    activeStyle: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
                                }, {
                                    size: "Não Informado",
                                    label: "Sem Tamanho",
                                    colorClass: "text-slate-400",
                                    barBg: "bg-slate-400",
                                    barHover: "hover:border-slate-400/30",
                                    activeStyle: "border-slate-400 ring-2 ring-slate-400/20 bg-slate-400/5"
                                }].map(S => {
                                    const K = mn.stats[S.size] || 0,
                                        Y = mn.total > 0 ? Math.round(K / mn.total * 100) : 0,
                                        Z = Oi === S.size;
                                    return p.jsxs(Ut.div, {
                                        whileHover: {
                                            y: -4
                                        },
                                        onClick: () => {
                                            ql(de => de === S.size ? null : S.size), Qt(1)
                                        },
                                        className: `border cursor-pointer ${Z?S.activeStyle:`${A.card} ${S.barHover}`} rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden`,
                                        title: `Filtrar por tamanho ${S.size==="Não Informado"?"Não Informado":S.size}`,
                                        children: [p.jsxs("div", {
                                            className: "flex items-center justify-between",
                                            children: [p.jsxs("div", {
                                                className: "flex items-center gap-2",
                                                children: [p.jsx(lj, {
                                                    size: 16,
                                                    className: S.colorClass
                                                }), p.jsx("span", {
                                                    className: `text-xs font-bold uppercase tracking-wider ${A.textMuted}`,
                                                    children: S.size === "Não Informado" ? "N/I" : S.size
                                                })]
                                            }), p.jsx("div", {
                                                className: `w-7 h-7 rounded-full flex items-center justify-center ${A.bgHover} transition-all`,
                                                children: p.jsx(Qi, {
                                                    size: 14,
                                                    className: A.textMuted
                                                })
                                            })]
                                        }), p.jsxs("div", {
                                            className: "mt-4",
                                            children: [p.jsx("h4", {
                                                className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                                children: K
                                            }), p.jsxs("p", {
                                                className: `text-[10px] ${A.textMuted} font-medium mt-1`,
                                                children: [Y, "% do total"]
                                            })]
                                        }), p.jsx("div", {
                                            className: "w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden",
                                            children: p.jsx("div", {
                                                className: `${S.barBg} h-full rounded-full transition-all duration-500`,
                                                style: {
                                                    width: `${Y}%`
                                                }
                                            })
                                        })]
                                    }, S.size)
                                })]
                            }), p.jsx(wl, {
                                children: De && p.jsxs(Ut.div, {
                                    initial: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    animate: {
                                        height: "auto",
                                        opacity: 1
                                    },
                                    exit: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    className: `border ${A.card} rounded-[24px] p-6 overflow-hidden shadow-inner`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between gap-4 mb-6 pb-2",
                                        children: [p.jsxs("h3", {
                                            className: `font-bold text-lg flex items-center gap-2 ${A.textPrimary}`,
                                            children: [p.jsx(fj, {
                                                className: "text-brand-purple",
                                                size: 20
                                            }), " ", da ? `Editar Cliente: ${Ge}` : "Cadastrar Novo Cliente"]
                                        }), p.jsxs("div", {
                                            className: "flex items-center gap-2.5",
                                            children: [p.jsx("span", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Status"
                                            }), p.jsx("button", {
                                                type: "button",
                                                onClick: () => Kn(S => S === "Ativo" ? "Inativo" : "Ativo"),
                                                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${In==="Ativo"?"bg-brand-purple":"bg-slate-200 dark:bg-slate-700"}`,
                                                title: `Alterar status para ${In==="Ativo"?"Inativo":"Ativo"}`,
                                                children: p.jsx("span", {
                                                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${In==="Ativo"?"translate-x-6":"translate-x-1"}`
                                                })
                                            }), p.jsx("span", {
                                                className: `text-sm font-bold transition-colors duration-200 ${In==="Ativo"?"text-brand-purple":"text-slate-400 dark:text-slate-500"}`,
                                                children: In
                                            })]
                                        })]
                                    }), p.jsxs("form", {
                                        onSubmit: Gl,
                                        className: "grid grid-cols-1 md:grid-cols-12 gap-4 items-end",
                                        children: [p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Nome"
                                            }), p.jsx("input", {
                                                type: "text",
                                                required: !0,
                                                placeholder: "Nome do cliente",
                                                value: Ge,
                                                onChange: S => jn(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Telefone/WhatsApp"
                                            }), p.jsx("input", {
                                                type: "text",
                                                placeholder: "(00) 00000-0000",
                                                maxLength: 15,
                                                value: $s,
                                                onChange: _r,
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "E-mail"
                                            }), p.jsx("input", {
                                                type: "email",
                                                placeholder: "email@exemplo.com",
                                                value: oa,
                                                onChange: S => Zt(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-6 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Endereço"
                                            }), p.jsx("input", {
                                                type: "text",
                                                placeholder: "Rua, número, bairro",
                                                value: yr,
                                                onChange: S => Ps(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-3 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Data de Nascimento"
                                            }), p.jsx("input", {
                                                type: "date",
                                                value: os,
                                                onChange: S => us(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-3 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Data de Cadastro"
                                            }), p.jsx("input", {
                                                type: "date",
                                                value: cs,
                                                onChange: S => ca(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-3 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Tamanho (Roupa)"
                                            }), p.jsx("input", {
                                                type: "text",
                                                placeholder: "Ex: M, GG, P, 42...",
                                                value: br,
                                                onChange: S => Vs(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-3 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Plano"
                                            }), p.jsxs("select", {
                                                value: Ai,
                                                onChange: S => ua(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`,
                                                children: [p.jsx("option", {
                                                    value: "Básico",
                                                    children: "Básico"
                                                }), p.jsx("option", {
                                                    value: "Premium",
                                                    children: "Premium"
                                                }), p.jsx("option", {
                                                    value: "VIP",
                                                    children: "VIP"
                                                }), zt.filter(S => S.periodo_text).map(S => p.jsx("option", {
                                                    value: S.periodo_text,
                                                    children: S.periodo_text
                                                }, S.id))]
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-6 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Outras Informações"
                                            }), p.jsx("input", {
                                                type: "text",
                                                placeholder: "Informações adicionais...",
                                                value: vr,
                                                onChange: S => vt(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 flex justify-end gap-2 mt-2",
                                            children: [p.jsx("button", {
                                                type: "button",
                                                onClick: () => {
                                                    jn(""), ls(""), Zt(""), Ps(""), us(""), ca(""), vt(""), Vs(""), Kn("Ativo"), ji(null), dt(!1)
                                                },
                                                className: `px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`,
                                                children: "Cancelar"
                                            }), p.jsx("button", {
                                                type: "submit",
                                                className: "bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md",
                                                children: "Salvar"
                                            })]
                                        })]
                                    })]
                                })
                            }), p.jsxs("div", {
                                className: `flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-[24px] border ${A.card} shadow-sm transition-all`,
                                children: [p.jsxs("div", {
                                    className: "relative w-full md:w-[480px]",
                                    children: [p.jsx("span", {
                                        className: "absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400",
                                        children: p.jsx(Ja, {
                                            size: 18
                                        })
                                    }), p.jsx("input", {
                                        type: "text",
                                        value: fa,
                                        onChange: S => {
                                            Ni(S.target.value), Qt(1)
                                        },
                                        placeholder: "Buscar por nome, celular, endereço ou informações...",
                                        className: `w-full pl-11 pr-10 py-3 text-sm rounded-2xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm`
                                    }), fa && p.jsx("button", {
                                        onClick: () => {
                                            Ni(""), Qt(1)
                                        },
                                        className: "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-brand-purple transition-colors cursor-pointer",
                                        title: "Limpar busca",
                                        children: p.jsx(Ms, {
                                            size: 18,
                                            className: "rotate-45"
                                        })
                                    })]
                                }), p.jsxs("div", {
                                    className: "flex flex-wrap items-center gap-2 text-xs font-bold",
                                    children: [p.jsx("span", {
                                        className: `${A.textMuted} mr-1`,
                                        children: "Campos de busca:"
                                    }), p.jsx("span", {
                                        className: "px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20",
                                        children: "Nome"
                                    }), p.jsx("span", {
                                        className: "px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20",
                                        children: "Celular"
                                    }), p.jsx("span", {
                                        className: "px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20",
                                        children: "Endereço"
                                    }), p.jsx("span", {
                                        className: "px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20",
                                        children: "Informações"
                                    })]
                                })]
                            }), p.jsxs("div", {
                                className: `border ${A.card} rounded-[24px] overflow-hidden shadow-sm`,
                                children: [p.jsx("div", {
                                    className: "overflow-x-auto",
                                    children: p.jsxs("table", {
                                        className: "w-full text-left border-collapse text-sm",
                                        children: [p.jsx("thead", {
                                            children: p.jsxs("tr", {
                                                className: `border-b ${A.border} ${A.tableHeader}`,
                                                children: [Lt("name", "Cliente"), p.jsx("th", {
                                                    className: "p-4 font-semibold uppercase tracking-wider text-xs",
                                                    children: "Celular"
                                                }), p.jsx("th", {
                                                    className: "p-4 font-semibold uppercase tracking-wider text-xs",
                                                    children: "E-mail"
                                                }), Lt("plan", "Plano"), Lt("datanascimento", "Nascimento"), Lt("data_cadastro", "Cadastro"), p.jsx("th", {
                                                    className: "p-4 font-semibold uppercase tracking-wider text-xs text-center",
                                                    children: "Tamanho"
                                                }), Lt("endereco", "Endereço"), p.jsx("th", {
                                                    className: "p-4 font-semibold uppercase tracking-wider text-xs",
                                                    children: "Informações"
                                                }), p.jsx("th", {
                                                    className: "p-4 font-semibold uppercase tracking-wider text-xs",
                                                    children: "Status"
                                                })]
                                            })
                                        }), p.jsx("tbody", {
                                            children: xr.length === 0 ? p.jsx("tr", {
                                                children: p.jsx("td", {
                                                    colSpan: 10,
                                                    className: "p-12 text-center text-slate-500 dark:text-slate-400",
                                                    children: p.jsxs("div", {
                                                        className: "flex flex-col items-center justify-center gap-2 max-w-sm mx-auto",
                                                        children: [p.jsx("div", {
                                                            className: "p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                                            children: p.jsx(Ja, {
                                                                size: 28
                                                            })
                                                        }), p.jsx("span", {
                                                            className: "font-bold text-base mt-2 text-slate-800 dark:text-slate-200",
                                                            children: "Nenhum cliente encontrado"
                                                        }), p.jsx("span", {
                                                            className: "text-xs opacity-75",
                                                            children: "Nenhum registro corresponds aos filtros de busca atuais. Tente digitar outro termo."
                                                        })]
                                                    })
                                                })
                                            }) : xr.map(S => {
                                                const K = da === S.id;
                                                return p.jsxs("tr", {
                                                    onClick: () => xa(S),
                                                    className: `group border-b ${A.border} ${A.tableRowHover} transition-colors cursor-pointer ${K?"bg-purple-100/30 dark:bg-purple-950/20 border-purple-300/30":"hover:bg-purple-50/10 dark:hover:bg-[#1E1B4B]/10"}`,
                                                    title: "Clique para editar este cliente",
                                                    children: [p.jsx("td", {
                                                        className: `p-4 font-bold ${A.textPrimary}`,
                                                        children: p.jsxs("div", {
                                                            className: "flex items-center justify-between gap-2",
                                                            children: [p.jsx("span", {
                                                                children: S.name
                                                            }), p.jsx("span", {
                                                                className: "text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-brand-purple transition-all duration-200",
                                                                children: p.jsxs("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    width: "13",
                                                                    height: "13",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2.5",
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    className: "lucide lucide-pencil",
                                                                    children: [p.jsx("path", {
                                                                        d: "M12 20h9"
                                                                    }), p.jsx("path", {
                                                                        d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                                                                    })]
                                                                })
                                                            })]
                                                        })
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs font-semibold ${A.textPrimary}`,
                                                        children: S.phone
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs ${A.textPrimary}`,
                                                        children: S.email || "-"
                                                    }), p.jsx("td", {
                                                        className: "p-4 text-xs",
                                                        children: p.jsx("span", {
                                                            className: `px-2.5 py-1 rounded-full text-[10px] font-bold ${S.plan==="VIP"?"bg-purple-100 text-purple-700":S.plan==="Premium"?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-700"}`,
                                                            children: S.plan
                                                        })
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs ${A.textPrimary}`,
                                                        children: S.datanascimento ? `${new Date(S.datanascimento).toLocaleDateString("pt-BR",{timeZone:"UTC"})}${Ht(S.datanascimento)}` : "-"
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs ${A.textPrimary}`,
                                                        children: S.data_cadastro ? new Date(S.data_cadastro).toLocaleDateString("pt-BR") : "-"
                                                    }), p.jsx("td", {
                                                        className: "p-4 text-xs font-bold text-center",
                                                        children: p.jsx("span", {
                                                            className: "px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 text-[10px]",
                                                            children: S.vestetamanho || "-"
                                                        })
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs max-w-[180px] truncate ${A.textPrimary}`,
                                                        title: S.endereco,
                                                        children: S.endereco || "-"
                                                    }), p.jsx("td", {
                                                        className: `p-4 text-xs max-w-[180px] truncate ${A.textPrimary}`,
                                                        title: S.outrasinformacoes,
                                                        children: S.outrasinformacoes || "-"
                                                    }), p.jsx("td", {
                                                        className: "p-4",
                                                        children: p.jsxs("span", {
                                                            className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${S.status==="Ativo"?"bg-[#C0F62C]/20 text-[#6D9800]":"bg-rose-100 text-rose-700"}`,
                                                            children: [p.jsx("span", {
                                                                className: `w-1.5 h-1.5 rounded-full ${S.status==="Ativo"?"bg-brand-lime":"bg-rose-500"}`
                                                            }), S.status]
                                                        })
                                                    })]
                                                }, S.id)
                                            })
                                        })]
                                    })
                                }), pn > 1 && p.jsxs("div", {
                                    className: "flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-200 bg-[#f1f5f9]",
                                    children: [p.jsxs("div", {
                                        className: "text-xs text-slate-500 font-semibold",
                                        children: ["Exibindo ", p.jsx("span", {
                                            className: "font-bold text-slate-900",
                                            children: Math.min((bt - 1) * et + 1, fn.length)
                                        }), " a", " ", p.jsx("span", {
                                            className: "font-bold text-slate-900",
                                            children: Math.min(bt * et, fn.length)
                                        }), " de", " ", p.jsx("span", {
                                            className: "font-bold text-slate-900",
                                            children: fn.length
                                        }), " clientes"]
                                    }), p.jsxs("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [p.jsx("button", {
                                            onClick: () => Qt(S => Math.max(S - 1, 1)),
                                            disabled: bt === 1,
                                            className: `p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer ${bt===1?"opacity-40 cursor-not-allowed text-slate-400":"text-brand-purple hover:border-brand-purple active:scale-95"}`,
                                            title: "Página Anterior",
                                            children: p.jsx(nv, {
                                                size: 16
                                            })
                                        }), ya().map(S => p.jsx("button", {
                                            onClick: () => Qt(S),
                                            className: `w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${bt===S?"bg-brand-purple border-brand-purple text-white shadow-md shadow-brand-purple/20":"border-slate-200 bg-white text-slate-600 hover:text-brand-purple hover:border-brand-purple active:scale-95"}`,
                                            children: S
                                        }, S)), p.jsx("button", {
                                            onClick: () => Qt(S => Math.min(S + 1, pn)),
                                            disabled: bt === pn,
                                            className: `p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer ${bt===pn?"opacity-40 cursor-not-allowed text-slate-400":"text-brand-purple hover:border-brand-purple active:scale-95"}`,
                                            title: "Próxima Página",
                                            children: p.jsx(sv, {
                                                size: 16
                                            })
                                        })]
                                    })]
                                })]
                            })]
                        }, "clientes"), t === "grupos" && p.jsxs(Ut.div, {
                            initial: {
                                opacity: 0,
                                y: 15
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -15
                            },
                            transition: {
                                duration: .4
                            },
                            className: "space-y-6",
                            children: [p.jsxs("div", {
                                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                                children: [p.jsxs("div", {
                                    className: "space-y-1",
                                    children: [p.jsx("h1", {
                                        className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                        children: "Grupos de Consórcios"
                                    }), p.jsx("p", {
                                        className: `text-sm ${A.textMuted}`,
                                        children: "Monitore e organize os grupos de consórcios da MundoFitness."
                                    })]
                                }), p.jsxs("div", {
                                    className: "flex flex-wrap items-center gap-3 self-start sm:self-auto",
                                    children: [zt.length > 0 && p.jsxs("div", {
                                        className: `flex items-center gap-1 p-1 rounded-full border ${r?"bg-slate-800 border-slate-700":"bg-white border-slate-200"} shadow-sm`,
                                        children: [p.jsx("button", {
                                            type: "button",
                                            onClick: () => Et("todos"),
                                            className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${Tt==="todos"?"bg-brand-purple text-white shadow-md shadow-brand-purple/20":r?"text-slate-400 hover:text-slate-200":"text-slate-500 hover:text-slate-800"}`,
                                            children: "Todos"
                                        }), p.jsx("button", {
                                            type: "button",
                                            onClick: () => Et("ativos"),
                                            className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${Tt==="ativos"?"bg-brand-purple text-white shadow-md shadow-brand-purple/20":r?"text-slate-400 hover:text-slate-200":"text-slate-500 hover:text-slate-800"}`,
                                            children: "Ativos"
                                        }), p.jsx("button", {
                                            type: "button",
                                            onClick: () => Et("encerrados"),
                                            className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${Tt==="encerrados"?"bg-black text-white shadow-md":r?"text-slate-400 hover:text-slate-200":"text-slate-500 hover:text-slate-800"}`,
                                            children: "Encerrados"
                                        })]
                                    }), p.jsxs("button", {
                                        onClick: () => {
                                            ki(""), fs(""), Ri(""), Gs(""), ps(""), Ks(!1), hs(null), ds(!0)
                                        },
                                        className: "flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-4 rounded-xl font-semibold shadow-md shadow-brand-purple/15 transition-all active:scale-[0.98] cursor-pointer",
                                        children: [p.jsx(Ms, {
                                            size: 18
                                        }), " Novo Grupo"]
                                    })]
                                })]
                            }), p.jsx(wl, {
                                children: pa && p.jsxs(Ut.div, {
                                    initial: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    animate: {
                                        height: "auto",
                                        opacity: 1
                                    },
                                    exit: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    className: `border ${A.card} rounded-[24px] p-6 overflow-hidden shadow-inner`,
                                    children: [p.jsxs("div", {
                                        className: "flex items-center justify-between gap-4 mb-6 pb-2",
                                        children: [p.jsxs("h3", {
                                            className: `font-bold text-lg flex items-center gap-2 ${A.textPrimary}`,
                                            children: [p.jsx(ou, {
                                                className: "text-brand-purple",
                                                size: 20
                                            }), " ", hn ? `Editar Grupo: ${Cn}` : "Cadastrar Novo Grupo"]
                                        }), p.jsxs("div", {
                                            className: "flex items-center gap-2.5",
                                            children: [p.jsx("span", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Status"
                                            }), p.jsx("button", {
                                                type: "button",
                                                onClick: () => Ks(S => !S),
                                                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${kn?"bg-slate-200 dark:bg-slate-700":"bg-emerald-500"}`,
                                                title: `Alterar status para ${kn?"Ativo":"Encerrado"}`,
                                                children: p.jsx("span", {
                                                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${kn?"translate-x-1":"translate-x-6"}`
                                                })
                                            }), p.jsx("span", {
                                                className: `text-sm font-bold transition-colors duration-200 ${kn?"text-slate-400 dark:text-slate-500":"text-emerald-500"}`,
                                                children: kn ? "Encerrado" : "Ativo"
                                            })]
                                        })]
                                    }), p.jsxs("form", {
                                        onSubmit: qt,
                                        className: "grid grid-cols-1 md:grid-cols-12 gap-4 items-end",
                                        children: [p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Período (Nome/Descrição)"
                                            }), p.jsx("input", {
                                                type: "text",
                                                required: !0,
                                                placeholder: "Ex: Grupo A - Manhã",
                                                value: Cn,
                                                onChange: S => ki(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Valor da Cota (R$)"
                                            }), p.jsx("input", {
                                                type: "number",
                                                step: "0.01",
                                                required: !0,
                                                placeholder: "0,00",
                                                value: Nn,
                                                onChange: S => Ri(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-4 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Valor Mensal (R$)"
                                            }), p.jsx("input", {
                                                type: "number",
                                                step: "0.01",
                                                required: !0,
                                                placeholder: "0,00",
                                                value: Hs,
                                                onChange: S => fs(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-6 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Mês Inicial"
                                            }), p.jsx("input", {
                                                type: "date",
                                                value: qs,
                                                onChange: S => Gs(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 md:col-span-6 space-y-1",
                                            children: [p.jsx("label", {
                                                className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                children: "Mês Final"
                                            }), p.jsx("input", {
                                                type: "date",
                                                value: Is,
                                                onChange: S => ps(S.target.value),
                                                className: `w-full p-2.5 rounded-xl border outline-none text-sm font-medium ${A.inputText}`
                                            })]
                                        }), p.jsxs("div", {
                                            className: "col-span-12 flex justify-end gap-2 mt-2",
                                            children: [p.jsx("button", {
                                                type: "button",
                                                onClick: () => {
                                                    ki(""), fs(""), Ri(""), Gs(""), ps(""), Ks(!1), hs(null), ds(!1)
                                                },
                                                className: `px-4 py-2 rounded-xl text-sm font-bold ${A.bgHover} transition-all`,
                                                children: "Cancelar"
                                            }), p.jsx("button", {
                                                type: "submit",
                                                className: "bg-brand-purple hover:bg-brand-purpleDark text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer",
                                                children: "Salvar"
                                            })]
                                        })]
                                    })]
                                })
                            }), zt.length > 0 && p.jsxs("div", {
                                className: `flex flex-col xl:flex-row gap-4 items-center justify-between p-5 rounded-[24px] border ${A.card} shadow-sm transition-all`,
                                children: [p.jsxs("div", {
                                    className: "relative w-full xl:w-[420px]",
                                    children: [p.jsx("span", {
                                        className: "absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400",
                                        children: p.jsx(Ja, {
                                            size: 18
                                        })
                                    }), p.jsx("input", {
                                        type: "text",
                                        value: ha,
                                        onChange: S => Hl(S.target.value),
                                        placeholder: "Buscar por período, cota ou valor mensal...",
                                        className: `w-full pl-11 pr-10 py-3 text-sm rounded-2xl border ${A.inputText} outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm`
                                    }), ha && p.jsx("button", {
                                        onClick: () => Hl(""),
                                        className: "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-brand-purple transition-colors cursor-pointer",
                                        title: "Limpar busca",
                                        children: p.jsx(Ms, {
                                            size: 18,
                                            className: "rotate-45"
                                        })
                                    })]
                                }), p.jsxs("div", {
                                    className: "flex flex-wrap items-center gap-4 text-xs font-bold w-full xl:w-auto xl:justify-end",
                                    children: [p.jsxs("div", {
                                        className: "flex items-center gap-2",
                                        children: [p.jsx("span", {
                                            className: A.textMuted,
                                            children: "Ordenar por:"
                                        }), p.jsxs("select", {
                                            value: ms,
                                            onChange: S => Yn(S.target.value),
                                            className: `p-2 rounded-xl border outline-none text-xs font-bold cursor-pointer transition-all ${A.inputText}`,
                                            children: [p.jsx("option", {
                                                value: "periodo_text",
                                                children: "Nome período"
                                            }), p.jsx("option", {
                                                value: "mesinicial_date",
                                                children: "Data Início"
                                            }), p.jsx("option", {
                                                value: "mesfinal_date",
                                                children: "Data término"
                                            })]
                                        })]
                                    }), p.jsxs("div", {
                                        className: "flex items-center gap-2",
                                        children: [p.jsx("span", {
                                            className: A.textMuted,
                                            children: "Ordem:"
                                        }), p.jsxs("select", {
                                            value: We,
                                            onChange: S => Ot(S.target.value),
                                            className: `p-2 rounded-xl border outline-none text-xs font-bold cursor-pointer transition-all ${A.inputText}`,
                                            children: [p.jsx("option", {
                                                value: "asc",
                                                children: "Ascendente"
                                            }), p.jsx("option", {
                                                value: "desc",
                                                children: "Descendente"
                                            })]
                                        })]
                                    })]
                                })]
                            }), zt.length === 0 ? p.jsx("div", {
                                className: `p-12 text-center border ${A.card} rounded-[24px] shadow-sm`,
                                children: p.jsxs("div", {
                                    className: "flex flex-col items-center justify-center gap-2 max-w-sm mx-auto",
                                    children: [p.jsx("div", {
                                        className: "p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                        children: p.jsx(ou, {
                                            size: 28
                                        })
                                    }), p.jsx("span", {
                                        className: `font-bold text-base mt-2 ${A.textPrimary}`,
                                        children: "Nenhum grupo cadastrado"
                                    }), p.jsx("span", {
                                        className: `text-xs ${A.textMuted}`,
                                        children: "Acesse as Configurações > Importação para carregar os grupos do Bubble.io."
                                    })]
                                })
                            }) : ys.length === 0 ? p.jsx("div", {
                                className: `p-12 text-center border ${A.card} rounded-[24px] shadow-sm`,
                                children: p.jsxs("div", {
                                    className: "flex flex-col items-center justify-center gap-2 max-w-sm mx-auto",
                                    children: [p.jsx("div", {
                                        className: "p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                        children: p.jsx(ou, {
                                            size: 28
                                        })
                                    }), p.jsxs("span", {
                                        className: `font-bold text-base mt-2 ${A.textPrimary}`,
                                        children: ["Nenhum grupo ", Tt === "ativos" ? "ativo" : "encerrado", " encontrado"]
                                    }), p.jsxs("span", {
                                        className: `text-xs ${A.textMuted}`,
                                        children: ["Atualmente não existem grupos de consórcios ", Tt === "ativos" ? "ativos" : "encerrados", " cadastrados."]
                                    })]
                                })
                            }) : p.jsx("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                children: ys.map(S => p.jsxs("div", {
                                    onClick: () => ic(S),
                                    className: `border-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${hn===S.id?"border-brand-purple ring-2 ring-brand-purple/20":S.encerrado_boolean?"border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600":"border-brand-purple/70 hover:border-brand-purple"} ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-44`,
                                    title: "Clique para editar este grupo",
                                    children: [p.jsxs("div", {
                                        className: "flex justify-between items-start",
                                        children: [p.jsx("h3", {
                                            className: `font-bold text-lg leading-tight ${A.textPrimary}`,
                                            children: S.periodo_text || "Período não definido"
                                        }), p.jsx("span", {
                                            className: `px-2 py-0.5 rounded text-xs font-bold ${S.encerrado_boolean?"bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300":"bg-emerald-100 text-emerald-700"}`,
                                            children: S.encerrado_boolean ? "Encerrado" : "Ativo"
                                        })]
                                    }), p.jsxs("div", {
                                        className: "mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold",
                                        children: [p.jsxs("div", {
                                            children: [p.jsx("p", {
                                                className: A.textMuted,
                                                children: "Valor da Cota"
                                            }), p.jsx("p", {
                                                className: "text-sm font-bold text-brand-purple",
                                                children: new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL"
                                                }).format(S.valorcota_number || 0)
                                            })]
                                        }), p.jsxs("div", {
                                            children: [p.jsx("p", {
                                                className: A.textMuted,
                                                children: "Valor Mensal"
                                            }), p.jsx("p", {
                                                className: `text-sm font-bold ${A.textPrimary}`,
                                                children: new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL"
                                                }).format(S.valor_number || 0)
                                            })]
                                        }), p.jsxs("div", {
                                            children: [p.jsx("p", {
                                                className: A.textMuted,
                                                children: "Início"
                                            }), p.jsx("p", {
                                                className: `text-[10px] font-medium ${A.textPrimary}`,
                                                children: S.mesinicial_date ? new Date(S.mesinicial_date).toLocaleDateString("pt-BR", {
                                                    timeZone: "UTC"
                                                }) : "-"
                                            })]
                                        }), p.jsxs("div", {
                                            children: [p.jsx("p", {
                                                className: A.textMuted,
                                                children: "Término"
                                            }), p.jsx("p", {
                                                className: `text-[10px] font-medium ${A.textPrimary}`,
                                                children: S.mesfinal_date ? new Date(S.mesfinal_date).toLocaleDateString("pt-BR", {
                                                    timeZone: "UTC"
                                                }) : "-"
                                            })]
                                        })]
                                    })]
                                }, S.id))
                            })]
                        }, "grupos"), t === "consorcios" && p.jsxs(Ut.div, {
                            initial: {
                                opacity: 0,
                                y: 15
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -15
                            },
                            transition: {
                                duration: .4
                            },
                            className: "space-y-6",
                            children: [
                                // Cabeçalho com Título e Filtro de Mês/Ano
                                p.jsxs("div", {
                                    className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 text-left w-full",
                                    children: [
                                        p.jsxs("div", {
                                            className: "space-y-1",
                                            children: [
                                                p.jsx("h1", {
                                                    className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                                    children: "Consórcios"
                                                }),
                                                p.jsx("p", {
                                                    className: `text-sm ${A.textMuted}`,
                                                    children: "Visualize e gerencie as cotas de consórcios dos clientes"
                                                })
                                            ]
                                        }),
                                        // Filtro de Mês e Ano
                                        p.jsxs("div", {
                                            className: "relative inline-block",
                                            children: [
                                                p.jsxs("button", {
                                                    onClick: () => setShowFilterCalendarPopover(!showFilterCalendarPopover),
                                                    className: `flex items-center gap-2.5 px-4 py-2 text-xs font-semibold rounded-full border ${A.border} ${A.card} ${A.bgHover} ${A.textPrimary} transition-all shadow-sm cursor-pointer`,
                                                    children: [
                                                        p.jsx(SA, { size: 14, className: "text-[#64748B] flex-shrink-0" }),
                                                        p.jsx("span", {
                                                            className: A.textPrimary,
                                                            children: isFilterActive ? p.jsxs(p.Fragment, {
                                                                children: [
                                                                    p.jsx("span", { className: "text-brand-purple font-bold", children: `01 - ${new Date(filterYear, filterMonth + 1, 0).getDate()} ` }),
                                                                    `${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][filterMonth]} ${filterYear}`
                                                                ]
                                                            }) : "Todos os Períodos"
                                                        }),
                                                        p.jsx("svg", {
                                                            className: `w-4 h-4 ml-1 text-slate-400 transition-transform ${showFilterCalendarPopover ? "rotate-180" : ""}`,
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            children: p.jsx("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: "2",
                                                                d: "M19 9l-7 7-7-7"
                                                            })
                                                        })
                                                    ]
                                                }),
                                                showFilterCalendarPopover && p.jsx("div", {
                                                    className: "fixed inset-0 z-40 cursor-default",
                                                    onClick: () => setShowFilterCalendarPopover(false)
                                                }),
                                                showFilterCalendarPopover && p.jsxs(Ut.div, {
                                                    initial: { opacity: 0, y: 10 },
                                                    animate: { opacity: 1, y: 0 },
                                                    exit: { opacity: 0, y: 10 },
                                                    className: `absolute right-0 mt-2 w-72 p-4 rounded-[20px] border ${A.border} ${A.card} shadow-xl z-50 text-left space-y-4`,
                                                    children: [
                                                        // Seleção de Ano
                                                        p.jsxs("div", {
                                                            className: "flex items-center justify-between border-b border-dashed pb-2 border-slate-200 dark:border-slate-700/50",
                                                            children: [
                                                                p.jsx("button", {
                                                                    type: "button",
                                                                    onClick: () => setFilterYear(y => y - 1),
                                                                    className: `p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`,
                                                                    children: p.jsx(nv, { size: 16 })
                                                                }),
                                                                p.jsx("span", { className: `font-bold text-sm ${A.textPrimary}`, children: filterYear }),
                                                                p.jsx("button", {
                                                                    type: "button",
                                                                    onClick: () => setFilterYear(y => y + 1),
                                                                    className: `p-1.5 rounded-lg ${A.bgHover} ${A.textPrimary} transition-all`,
                                                                    children: p.jsx(sv, { size: 16 })
                                                                })
                                                            ]
                                                        }),
                                                        // Grade de Meses
                                                        p.jsx("div", {
                                                            className: "grid grid-cols-3 gap-1.5",
                                                            children: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((mName, mIdx) => {
                                                                const isSelected = isFilterActive && filterMonth === mIdx;
                                                                return p.jsx("button", {
                                                                    key: mName,
                                                                    type: "button",
                                                                    onClick: () => {
                                                                        setFilterMonth(mIdx);
                                                                        setIsFilterActive(true);
                                                                        setShowFilterCalendarPopover(false);
                                                                    },
                                                                    className: `py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isSelected ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" : `border border-transparent ${A.bgHover} ${A.textPrimary}`}`,
                                                                    children: mName
                                                                }, mName);
                                                            })
                                                        }),
                                                        // Opção Limpar Filtro
                                                        p.jsx("button", {
                                                            type: "button",
                                                            onClick: () => {
                                                                setIsFilterActive(false);
                                                                setShowFilterCalendarPopover(false);
                                                            },
                                                            className: `w-full py-2 text-center text-xs font-bold rounded-xl border border-dashed ${A.border} text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all cursor-pointer`,
                                                            children: "Todos os Períodos"
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                // Grid Principal de 3 Colunas (Grupos, Clientes, Pagamentos)
                                p.jsxs("div", {
                                    className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left",
                                    children: [
                                        // COLUNA 1: Grupos (size 3)
                                        p.jsxs("div", {
                                            className: "col-span-12 lg:col-span-3 space-y-4",
                                            children: [
                                                p.jsxs("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        p.jsxs("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                p.jsx("h2", {
                                                                    className: `font-bold text-base whitespace-nowrap ${A.textPrimary}`,
                                                                    children: cgf === "todos" ? "Todos os Grupos" : cgf === "ativos" ? "Grupos Ativos" : "Grupos Encerrados"
                                                                }),
                                                                p.jsx("span", {
                                                                    className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex-shrink-0",
                                                                    children: ma.length
                                                                })
                                                            ]
                                                        }),
                                                        p.jsxs("div", {
                                                            className: `flex items-center gap-0.5 p-0.5 rounded-full border ${r ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`,
                                                            children: [
                                                                p.jsx("button", {
                                                                    type: "button",
                                                                    onClick: () => scgf("todos"),
                                                                    className: `px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 cursor-pointer ${cgf === "todos" ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" : r ? "text-slate-400 hover:text-slate-200" : "text-[#64748B] hover:text-[#0F172A]"}`,
                                                                    children: "Todos"
                                                                }),
                                                                p.jsx("button", {
                                                                    type: "button",
                                                                    onClick: () => scgf("ativos"),
                                                                    className: `px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 cursor-pointer ${cgf === "ativos" ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" : r ? "text-slate-400 hover:text-slate-200" : "text-[#64748B] hover:text-[#0F172A]"}`,
                                                                    children: "Ativos"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                p.jsxs("div", {
                                                    className: "relative",
                                                    children: [
                                                        p.jsx("span", {
                                                            className: "absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400",
                                                            children: p.jsx(Ja, { size: 16 })
                                                        }),
                                                        p.jsx("input", {
                                                            type: "text",
                                                            value: J,
                                                            onChange: S => se(S.target.value),
                                                            placeholder: "Buscar grupo...",
                                                            className: `w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                        }),
                                                        J && p.jsx("button", {
                                                            onClick: () => se(""),
                                                            className: "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-brand-purple cursor-pointer",
                                                            children: p.jsx(Ms, { size: 16, className: "rotate-45" })
                                                        })
                                                    ]
                                                }),
                                                p.jsx("div", {
                                                    className: "space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 min-h-[300px]",
                                                    children: ma.length === 0 ? p.jsxs("div", {
                                                        className: `p-8 text-center border ${A.card} rounded-[24px] shadow-sm`,
                                                        children: [
                                                            p.jsx("span", {
                                                                className: `block font-bold text-sm ${A.textPrimary}`,
                                                                children: cgf === "todos" ? "Nenhum grupo" : cgf === "ativos" ? "Nenhum grupo ativo" : "Nenhum grupo encerrado"
                                                            }),
                                                            p.jsx("span", {
                                                                className: `block text-xs ${A.textMuted} mt-1`,
                                                                children: "Nenhum grupo corresponde à busca."
                                                            })
                                                        ]
                                                    }) : ma.map(S => {
                                                        const isSelected = Oe === S.id;
                                                        const clientCount = nt.filter(Z => Z.grupo_id === S.id).length;
                                                        return p.jsxs(Ut.div, {
                                                            onClick: () => P(S.id),
                                                            whileHover: { scale: 1.01 },
                                                            tabIndex: 0,
                                                            onKeyDown: (e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    P(S.id);
                                                                }
                                                            },
                                                            className: `border-2 cursor-pointer transition-all duration-200 px-3 py-[16px] mx-[6px] rounded-[24px] flex flex-col gap-1.5 bg-[#ffffff] focus:outline-none ${isSelected ? "border-brand-purple ring-2 ring-brand-purple/20" : "border-[#dfdfdf] hover:border-brand-purple focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"}`,
                                                            children: [
                                                                p.jsxs("div", {
                                                                    className: "flex justify-between items-start",
                                                                    children: [
                                                                        p.jsx("h3", {
                                                                            className: "font-bold text-sm leading-snug text-[#0F172A]",
                                                                            children: S.periodo_text || "Sem nome"
                                                                        }),
                                                                        p.jsx("span", {
                                                                            className: `px-2 py-0.5 rounded text-[10px] font-bold ${S.encerrado_boolean ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`,
                                                                            children: S.encerrado_boolean ? "Encerrado" : "Ativo"
                                                                        })
                                                                    ]
                                                                }),
                                                                p.jsxs("div", {
                                                                    className: "mt-1.5 flex flex-col gap-1.5",
                                                                    children: [
                                                                        p.jsxs("div", {
                                                                            className: "flex items-center gap-1.5 text-xs font-semibold text-[#64748B] border-b border-dashed border-[#dfdfdf] pb-1.5",
                                                                            children: [
                                                                                p.jsx("span", { children: "Total Clientes:" }),
                                                                                p.jsx("span", { className: "font-bold text-[#0F172A]", children: clientCount })
                                                                            ]
                                                                        }),
                                                                        p.jsxs("div", {
                                                                            className: "grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-semibold",
                                                                            children: [
                                                                                p.jsxs("div", {
                                                                                    children: [
                                                                                        p.jsx("p", { className: "text-[#64748B] text-[10px] uppercase tracking-wider", children: "Valor Cota" }),
                                                                                        p.jsx("p", { className: "text-xs font-bold text-brand-purple", children: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(S.valorcota_number || 0) })
                                                                                    ]
                                                                                }),
                                                                                p.jsxs("div", {
                                                                                    children: [
                                                                                        p.jsx("p", { className: "text-[#64748B] text-[10px] uppercase tracking-wider", children: "Valor Mensal" }),
                                                                                        p.jsx("p", { className: "text-xs font-bold text-[#0F172A]", children: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(S.valor_number || 0) })
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }, S.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        // COLUNA 2: Clientes do Grupo (size 5)
                                        p.jsxs("div", {
                                            className: "col-span-12 lg:col-span-5 space-y-4",
                                            children: [
                                                (() => {
                                                    const activeGroup = zt.find(K => K.id === Oe);
                                                    return p.jsxs(p.Fragment, {
                                                        children: [
                                                            p.jsxs("div", {
                                                                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                                                                children: [
                                                                    p.jsxs("div", {
                                                                        children: [
                                                                            p.jsx("h2", {
                                                                                className: `font-bold text-base ${A.textPrimary}`,
                                                                                children: activeGroup ? `Clientes: ${activeGroup.periodo_text}` : "Clientes do Grupo"
                                                                            }),
                                                                            p.jsx("p", {
                                                                                className: `text-xs ${A.textMuted}`,
                                                                                children: activeGroup ? "Clientes participantes deste grupo." : "Selecione um grupo."
                                                                            })
                                                                        ]
                                                                    }),
                                                                    Oe && p.jsxs("div", {
                                                                        className: "relative w-full sm:w-[200px]",
                                                                        children: [
                                                                            p.jsx("span", {
                                                                                className: "absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400",
                                                                                children: p.jsx(Ja, { size: 16 })
                                                                            }),
                                                                            p.jsx("input", {
                                                                                type: "text",
                                                                                value: ye,
                                                                                onChange: K => Se(K.target.value),
                                                                                placeholder: "Buscar...",
                                                                                className: `w-full pl-10 pr-9 py-2 text-xs rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                                            }),
                                                                            ye && p.jsx("button", {
                                                                                onClick: () => Se(""),
                                                                                className: "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-brand-purple cursor-pointer",
                                                                                children: p.jsx(Ms, { size: 16, className: "rotate-45" })
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            p.jsx("div", {
                                                                className: `border ${A.card} rounded-[24px] overflow-hidden shadow-sm`,
                                                                children: p.jsx("div", {
                                                                    className: "overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]",
                                                                    children: p.jsxs("table", {
                                                                        className: "w-full text-left border-collapse text-sm",
                                                                        children: [
                                                                            p.jsx("thead", {
                                                                                children: p.jsxs("tr", {
                                                                                    className: `border-b ${A.border} ${A.tableHeader}`,
                                                                                    children: [
                                                                                        p.jsx("th", { className: "p-3 font-semibold uppercase tracking-wider text-[10px] text-center w-20", children: "Nº Cota" }),
                                                                                        p.jsx("th", { className: "p-3 font-semibold uppercase tracking-wider text-[10px]", children: "Cliente" })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            p.jsx("tbody", {
                                                                                children: Oe ? Di.length === 0 ? p.jsx("tr", {
                                                                                    children: p.jsx("td", {
                                                                                        colSpan: 2,
                                                                                        className: "p-12 text-center text-slate-500 dark:text-slate-400",
                                                                                        children: p.jsxs("div", {
                                                                                            className: "flex flex-col items-center justify-center gap-2 max-w-sm mx-auto",
                                                                                            children: [
                                                                                                p.jsx("div", {
                                                                                                    className: "p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                                                                                    children: p.jsx(Ch, { size: 24 })
                                                                                                }),
                                                                                                p.jsx("span", { className: "font-bold text-xs mt-2 text-slate-800 dark:text-slate-200", children: "Nenhum cliente" })
                                                                                            ]
                                                                                        })
                                                                                    })
                                                                                }) : Di.map((K, Y) => {
                                                                                    var Z;
                                                                                    const isSelected = selectedConsorcioId === K.id;
                                                                                    return p.jsxs("tr", {
                                                                                        onClick: () => {
                                                                                            setSelectedConsorcioId(K.id);
                                                                                            setSelectedPagamentos([]);
                                                                                            const clientName = K.clientes?.nome || "";
                                                                                            setValorpagoInput(clientName); // Temporariamente guardado no estado cs/ca!
                                                                                            ca(clientName);
                                                                                        },
                                                                                        className: `border-b ${A.border} ${A.tableRowHover} cursor-pointer transition-colors ${isSelected ? "bg-brand-purple/5" : ""}`,
                                                                                        children: [
                                                                                            p.jsx("td", {
                                                                                                className: `p-3 text-xs font-bold text-center align-middle ${A.textPrimary}`,
                                                                                                children: K.cotano_number ? String(K.cotano_number).padStart(2, "0") : "-"
                                                                                            }),
                                                                                            p.jsxs("td", {
                                                                                                className: `p-3 ${A.textPrimary} align-middle`,
                                                                                                children: [
                                                                                                    p.jsxs("div", {
                                                                                                        className: "flex items-center gap-2 font-bold text-xs",
                                                                                                        children: [
                                                                                                            p.jsx(Ch, { className: "text-brand-purple flex-shrink-0", size: 14 }),
                                                                                                            ((Z = K.clientes) == null ? void 0 : Z.nome) || "Sem Cliente"
                                                                                                        ]
                                                                                                    }),
                                                                                                    p.jsxs("div", {
                                                                                                        className: "flex flex-col gap-0.5 mt-1 pl-[20px]",
                                                                                                        children: [
                                                                                                            ((Z = K.clientes) == null ? void 0 : Z.outrasinformacoes) && p.jsx("div", {
                                                                                                                className: "mb-0.5",
                                                                                                                children: p.jsx("span", {
                                                                                                                    className: "text-[10px] font-bold bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#7c3aed] px-2 py-0.5 rounded border border-[#7c3aed]/20",
                                                                                                                    children: (Z = K.clientes) == null ? void 0 : Z.outrasinformacoes
                                                                                                                })
                                                                                                            }),
                                                                                                            p.jsxs("div", {
                                                                                                                className: "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-semibold text-[#64748B]",
                                                                                                                children: [
                                                                                                                    p.jsxs("span", { children: [p.jsx("span", { className: "font-medium", children: "Retirada: " }), p.jsx("span", { className: "text-brand-purple font-bold", children: sc(K.dataretirada_date) })] }),
                                                                                                                    p.jsx("span", { className: "text-[#dfdfdf]", children: "•" }),
                                                                                                                    p.jsxs("span", { children: [p.jsx("span", { className: "font-medium", children: "Venc: " }), p.jsx("span", { className: "text-[#0f172a] font-bold", children: K.vencimentodia_number ? `Dia ${K.vencimentodia_number}` : "-" })] }),
                                                                                                                    K.mesretirada_text && p.jsxs(p.Fragment, {
                                                                                                                        children: [
                                                                                                                            p.jsx("span", { className: "text-[#dfdfdf]", children: "•" }),
                                                                                                                            p.jsxs("span", { children: [p.jsx("span", { className: "font-medium", children: "Mês Ret.: " }), p.jsx("span", { className: "text-brand-purple font-bold", children: K.mesretirada_text })] })
                                                                                                                        ]
                                                                                                                    })
                                                                                                                ]
                                                                                                            })
                                                                                                        ]
                                                                                                    })
                                                                                                ]
                                                                                            })
                                                                                        ]
                                                                                    }, K.id || Y);
                                                                                }) : p.jsx("tr", {
                                                                                    children: p.jsx("td", {
                                                                                        colSpan: 2,
                                                                                        className: "p-12 text-center text-slate-500 dark:text-slate-400",
                                                                                        children: p.jsxs("div", {
                                                                                            className: "flex flex-col items-center justify-center gap-2 max-w-sm mx-auto",
                                                                                            children: [
                                                                                                p.jsx("div", {
                                                                                                    className: "p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                                                                                    children: p.jsx(Ch, { size: 28 })
                                                                                                }),
                                                                                                p.jsx("span", {
                                                                                                    className: "font-bold text-base mt-2 text-slate-800 dark:text-slate-200",
                                                                                                    children: "Selecione um grupo"
                                                                                                }),
                                                                                                p.jsx("span", {
                                                                                                    className: "text-xs opacity-75",
                                                                                                    children: "Escolha um dos grupos ativos na coluna ao lado para visualizar os clientes."
                                                                                                })
                                                                                            ]
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        ]
                                                                    })
                                                                })
                                                            })
                                                        ]
                                                    });
                                                })()
                                            ]
                                        }),
                                        // COLUNA 3: Histórico de Pagamentos e Totais (size 4)
                                        p.jsxs("div", {
                                            className: "col-span-12 lg:col-span-4 space-y-4",
                                            children: [
                                                (() => {
                                                    const payments = selectedPagamentos || [];
                                                    const totalPago = payments.filter(item => !!item.datapagamento_date).reduce((acc, curr) => acc + (curr.valorpago_number !== null ? curr.valorpago_number : curr.valor_parcela || 0), 0);
                                                    const totalAPagar = payments.filter(item => !item.datapagamento_date).reduce((acc, curr) => acc + (curr.valor_parcela || 0), 0);
                                                    const saldo = totalPago - totalAPagar;
                                                    const totalPagoCount = payments.filter(item => !!item.datapagamento_date).length;
                                                    const totalAPagarCount = payments.filter(item => !item.datapagamento_date).length;

                                                    return p.jsxs(p.Fragment, {
                                                        children: [
                                                            // Cabeçalho do Histórico
                                                            p.jsxs("div", {
                                                                className: "flex items-center justify-between gap-1",
                                                                children: [
                                                                    p.jsxs("div", {
                                                                        className: "truncate",
                                                                        children: [
                                                                            p.jsxs("h2", {
                                                                                className: `font-bold text-sm ${A.textPrimary} flex items-center flex-wrap gap-1.5 truncate`,
                                                                                children: cs ? [
                                                                                    "Histórico: ",
                                                                                    p.jsx("span", {
                                                                                        style: { backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7C3AED", fontSize: "12px" },
                                                                                        className: "px-2 py-0.5 rounded-full font-bold inline-block border border-[#7C3AED]/20 truncate max-w-[120px]",
                                                                                        children: cs
                                                                                    })
                                                                                ] : "Histórico de Pagamentos"
                                                                            }),
                                                                            p.jsx("p", {
                                                                                className: `text-[10px] ${A.textMuted}`,
                                                                                children: cs ? "Pagamentos da cota" : "Selecione uma cota."
                                                                            })
                                                                        ]
                                                                    }),
                                                                    selectedConsorcioId && p.jsxs("button", {
                                                                        onClick: () => {
                                                                            const activeGroup = zt.find(g => g.id === Oe);
                                                                            const valMensal = activeGroup?.valor_number || 0;
                                                                            setNewParcelasValor(formatCurrencyPTBR(valMensal * 100));
                                                                            setNewParcelasQtde(10);
                                                                            const d = new Date();
                                                                            setNewParcelasMesInicial(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
                                                                            setShowGerarParcelasModal(true);
                                                                        },
                                                                        className: "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-lg transition-all shadow-sm shadow-brand-purple/10 flex-shrink-0 cursor-pointer",
                                                                        children: [
                                                                            p.jsx(SA, { size: 12 }),
                                                                            "Gerar Parcelas"
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            // Tabela de Parcelas
                                                            p.jsx("div", {
                                                                className: `border ${A.card} rounded-[24px] overflow-hidden shadow-sm`,
                                                                children: p.jsx("div", {
                                                                    className: "overflow-x-auto overflow-y-auto max-h-[calc(100vh-360px)] min-h-[180px]",
                                                                    children: selectedConsorcioId ? sortedPagamentos.length === 0 ? p.jsx("div", {
                                                                        className: `p-8 text-center text-xs ${A.textMuted}`,
                                                                        children: "Nenhuma parcela registrada. Clique em 'Gerar Parcelas' acima."
                                                                    }) : p.jsxs("table", {
                                                                        className: "w-full text-left border-collapse text-xs",
                                                                        children: [
                                                                            p.jsx("thead", {
                                                                                children: p.jsxs("tr", {
                                                                                    className: `border-b ${A.border} ${A.tableHeader}`,
                                                                                    children: [
                                                                                        p.jsx("th", { className: "p-2 font-semibold uppercase tracking-wider text-[9px]", children: "Ref" }),
                                                                                        p.jsx("th", { className: "p-2 font-semibold uppercase tracking-wider text-[9px]", children: "A Pagar" }),
                                                                                        p.jsx("th", { className: "p-2 font-semibold uppercase tracking-wider text-[9px]", children: "Pago" }),
                                                                                        p.jsx("th", { className: "p-2 font-semibold uppercase tracking-wider text-[9px] text-right", children: "Ações" })
                                                                                    ]
                                                                                })
                                                                            }),
                                                                            p.jsx("tbody", {
                                                                                children: sortedPagamentos.map((item, idx) => {
                                                                                    const isPaid = !!item.datapagamento_date;
                                                                                    const isOverdue = !isPaid && item.data_vencimento && new Date(item.data_vencimento).getTime() < new Date().setHours(0,0,0,0);
                                                                                    
                                                                                    const valParcelaFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor_parcela || 0);
                                                                                    const valPagoFormatted = item.valorpago_number !== null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valorpago_number || 0) : "-";
                                                                                    
                                                                                    return p.jsxs("tr", {
                                                                                        onClick: () => {
                                                                                            setSelectedParcela(item);
                                                                                            setValorpagoInput(item.valorpago_number !== null ? formatCurrencyPTBR(item.valorpago_number * 100) : formatCurrencyPTBR((item.valor_parcela || 0) * 100));
                                                                                            setDatapagamentoInput(item.datapagamento_date ? item.datapagamento_date.substring(0, 10) : new Date().toISOString().substring(0, 10));
                                                                                            setShowBaixarParcelaModal(true);
                                                                                        },
                                                                                        className: `border-b ${A.border} ${A.tableRowHover} cursor-pointer text-[10px] transition-colors`,
                                                                                        children: [
                                                                                            p.jsxs("td", {
                                                                                                className: `p-2 font-bold ${A.textPrimary} flex items-center gap-1`,
                                                                                                children: [
                                                                                                    item.mesano_text || "-",
                                                                                                    isOverdue && p.jsx("span", {
                                                                                                        className: "w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0",
                                                                                                        title: "Atrasado"
                                                                                                    })
                                                                                                ]
                                                                                            }),
                                                                                            p.jsx("td", { className: "p-2 font-bold text-[#7c3aed]", children: valParcelaFormatted }),
                                                                                            p.jsx("td", {
                                                                                                className: `p-2 ${isPaid ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-semibold text-slate-400 dark:text-slate-500"}`,
                                                                                                children: valPagoFormatted
                                                                                            }),
                                                                                            p.jsx("td", {
                                                                                                className: "p-2 text-right",
                                                                                                children: p.jsx("button", {
                                                                                                    onClick: (e) => {
                                                                                                        e.stopPropagation();
                                                                                                        setParcelaToDelete(item);
                                                                                                        setShowDeleteParcelaConfirmModal(true);
                                                                                                    },
                                                                                                    className: `p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-rose-600 transition-all cursor-pointer`,
                                                                                                    title: "Excluir Parcela",
                                                                                                    children: p.jsx(Trash2, { size: 12 })
                                                                                                })
                                                                                            })
                                                                                        ]
                                                                                    }, item.id || idx);
                                                                                })
                                                                            })
                                                                        ]
                                                                    }) : p.jsx("div", {
                                                                        className: `p-8 text-center text-xs ${A.textMuted}`,
                                                                        children: "Selecione uma cota para ver os pagamentos."
                                                                    })
                                                                })
                                                            }),
                                                            // Cards de Totais
                                                            selectedConsorcioId && p.jsxs("div", {
                                                                className: "grid grid-cols-3 gap-2 mt-4",
                                                                children: [
                                                                    // Card 1: A Pagar
                                                                    p.jsxs(Ut.div, {
                                                                        whileHover: { y: -3, scale: 1.01 },
                                                                        className: "relative overflow-hidden p-3 border border-[#dfdfdf] bg-[#ffffff] rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 text-left",
                                                                        children: [
                                                                            p.jsxs("div", {
                                                                                className: "flex justify-between items-start z-10 gap-1",
                                                                                children: [
                                                                                    p.jsx("span", { className: "text-[9px] xl:text-[10px] tracking-wider font-bold text-[#64748B] uppercase truncate", children: "A Pagar" }),
                                                                                    p.jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 flex-shrink-0", children: p.jsx(SA, { size: 12 }) })
                                                                                ]
                                                                            }),
                                                                            p.jsx("div", {
                                                                                className: "my-1.5 z-10",
                                                                                children: p.jsx("span", { className: "text-sm sm:text-base xl:text-lg font-bold tracking-tight text-[#0F172A] block truncate", children: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalAPagar) })
                                                                            }),
                                                                            p.jsxs("div", {
                                                                                className: "flex items-center gap-1 text-[9px] font-bold text-amber-600 z-10 truncate",
                                                                                children: [
                                                                                    p.jsx(SA, { size: 10 }),
                                                                                    p.jsx("span", { className: "truncate", children: `${totalAPagarCount} aberta${totalAPagarCount === 1 ? "" : "s"}` })
                                                                                ]
                                                                            }),
                                                                            p.jsx(SA, { size: 64, className: "absolute -right-2 -bottom-2 text-amber-500/5 pointer-events-none z-0" })
                                                                        ]
                                                                    }),
                                                                    // Card 2: Pagos
                                                                    p.jsxs(Ut.div, {
                                                                        whileHover: { y: -3, scale: 1.01 },
                                                                        className: "relative overflow-hidden p-3 border border-[#dfdfdf] bg-[#ffffff] rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 text-left",
                                                                        children: [
                                                                            p.jsxs("div", {
                                                                                className: "flex justify-between items-start z-10 gap-1",
                                                                                children: [
                                                                                    p.jsx("span", { className: "text-[9px] xl:text-[10px] tracking-wider font-bold text-[#64748B] uppercase truncate", children: "Pagos" }),
                                                                                    p.jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 flex-shrink-0", children: p.jsx(iv, { size: 12 }) })
                                                                                ]
                                                                            }),
                                                                            p.jsx("div", {
                                                                                className: "my-1.5 z-10",
                                                                                children: p.jsx("span", { className: "text-sm sm:text-base xl:text-lg font-bold tracking-tight text-[#0F172A] block truncate", children: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPago) })
                                                                            }),
                                                                            p.jsxs("div", {
                                                                                className: "flex items-center gap-1 text-[9px] font-bold text-emerald-600 z-10 truncate",
                                                                                children: [
                                                                                    p.jsx(iv, { size: 10 }),
                                                                                    p.jsx("span", { className: "truncate", children: `${totalPagoCount} paga${totalPagoCount === 1 ? "" : "s"}` })
                                                                                ]
                                                                            }),
                                                                            p.jsx(iv, { size: 64, className: "absolute -right-2 -bottom-2 text-emerald-500/5 pointer-events-none z-0" })
                                                                        ]
                                                                    }),
                                                                    // Card 3: Saldo
                                                                    p.jsxs(Ut.div, {
                                                                        whileHover: { y: -3, scale: 1.01 },
                                                                        className: "relative overflow-hidden p-3 border border-[#dfdfdf] bg-[#ffffff] rounded-[20px] shadow-sm flex flex-col justify-between h-[110px] transition-all duration-200 text-left",
                                                                        children: [
                                                                            p.jsxs("div", {
                                                                                className: "flex justify-between items-start z-10 gap-1",
                                                                                children: [
                                                                                    p.jsx("span", { className: "text-[9px] xl:text-[10px] tracking-wider font-bold text-[#64748B] uppercase truncate", children: "Saldo" }),
                                                                                    p.jsx("div", {
                                                                                        className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${saldo >= 0 ? "bg-cyan-50 text-cyan-600" : "bg-rose-50 text-rose-600"}`,
                                                                                        children: saldo >= 0 ? p.jsx(Qi, { size: 12 }) : p.jsx(hA, { size: 12 })
                                                                                    })
                                                                                ]
                                                                            }),
                                                                            p.jsx("div", {
                                                                                className: "my-1.5 z-10",
                                                                                children: p.jsx("span", { className: "text-sm sm:text-base xl:text-lg font-bold tracking-tight text-[#0F172A] block truncate", children: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldo) })
                                                                            }),
                                                                            p.jsxs("div", {
                                                                                className: `flex items-center gap-1 text-[9px] font-bold z-10 truncate ${saldo >= 0 ? "text-cyan-600" : "text-rose-600"}`,
                                                                                children: [
                                                                                    saldo >= 0 ? p.jsx(Qi, { size: 10 }) : p.jsx(hA, { size: 10 }),
                                                                                    p.jsx("span", { className: "truncate", children: saldo >= 0 ? "Positivo" : "Devedor" })
                                                                                ]
                                                                            }),
                                                                            saldo >= 0 ? p.jsx(Qi, { size: 64, className: "absolute -right-2 -bottom-2 text-cyan-500/5 pointer-events-none z-0" }) : p.jsx(hA, { size: 64, className: "absolute -right-2 -bottom-2 text-rose-500/5 pointer-events-none z-0" })
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    });
                                                })()
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }, "consorcios"), t === "configuracoes" && p.jsxs(Ut.div, {

                            initial: {
                                opacity: 0,
                                y: 15
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -15
                            },
                            transition: {
                                duration: .4
                            },
                            className: "space-y-6 text-left",
                            children: [p.jsxs("div", {
                                className: "space-y-1",
                                children: [p.jsx("h1", {
                                    className: `text-3xl font-bold tracking-tight ${A.textPrimary}`,
                                    children: "Configurações do Sistema"
                                }), p.jsx("p", {
                                    className: `text-sm ${A.textMuted}`,
                                    children: "Gerencie as preferências da sua conta, conexões e integrações de dados."
                                })]
                            }), p.jsxs("div", {
                                className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
                                children: [p.jsx("div", {
                                    className: "lg:col-span-3 flex flex-col gap-2",
                                    children: [{
                                        id: "importacao",
                                        label: "Importação",
                                        icon: av,
                                        desc: "Importar tabelas do Bubble.io"
                                    }, {
                                        id: "geral",
                                        label: "Geral",
                                        icon: lv,
                                        desc: "Configurações do sistema",
                                        disabled: !0
                                    }, {
                                        id: "seguranca",
                                        label: "Segurança",
                                        icon: ur,
                                        desc: "Controle de acessos",
                                        disabled: !0
                                    }].map(S => {
                                        const K = S.icon,
                                            Y = g === S.id;
                                        return p.jsxs("button", {
                                            onClick: () => !S.disabled && v(S.id),
                                            disabled: S.disabled,
                                            className: `flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${S.disabled?"opacity-40 cursor-not-allowed border-transparent":Y?"bg-brand-purple border-brand-purple text-white shadow-md shadow-brand-purple/20":`${A.card} ${A.bgHover} hover:border-brand-purple/30`}`,
                                            children: [p.jsx("div", {
                                                className: `p-2 rounded-xl ${Y?"bg-white/20 text-white":"bg-brand-purple/10 text-brand-purple"}`,
                                                children: p.jsx(K, {
                                                    size: 18
                                                })
                                            }), p.jsxs("div", {
                                                children: [p.jsx("p", {
                                                    className: `text-xs font-bold ${Y?"text-white":A.textPrimary}`,
                                                    children: S.label
                                                }), p.jsx("p", {
                                                    className: `text-[9px] mt-0.5 ${Y?"text-purple-100":A.textMuted}`,
                                                    children: S.desc
                                                })]
                                            })]
                                        }, S.id)
                                    })
                                }), p.jsx("div", {
                                    className: "lg:col-span-9",
                                    children: g === "importacao" && p.jsxs("div", {
                                        className: `border ${A.card} rounded-[24px] p-6 shadow-sm space-y-6`,
                                        children: [p.jsx("div", {
                                            className: "border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-200 dark:border-slate-700",
                                            children: p.jsxs("div", {
                                                children: [p.jsx("h2", {
                                                    className: `font-bold text-xl ${A.textPrimary}`,
                                                    children: "Central de Importação"
                                                }), p.jsx("p", {
                                                    className: `text-xs ${A.textMuted} mt-1`,
                                                    children: "Carregue dados diretamente da sua base Bubble.io para as tabelas do MundoFitness."
                                                })]
                                            })
                                        }), p.jsx("div", {
                                            className: "flex flex-wrap gap-2 text-xs font-bold border-b pb-4 border-slate-200 dark:border-slate-700",
                                            children: [{
                                                id: "clientes",
                                                label: "Clientes"
                                            }, {
                                                id: "grupos",
                                                label: "Grupos"
                                            }, {
                                                id: "consorcios",
                                                label: "Consórcios"
                                            }, {
                                                id: "pagamentos",
                                                label: "Consórcios Pagamentos"
                                            }, {
                                                id: "receitas",
                                                label: "Receitas"
                                            }].map(S => {
                                                const K = b === S.id;
                                                return p.jsx("button", {
                                                    onClick: () => {
                                                        x(S.id), X(null), ge(null)
                                                    },
                                                    className: `px-4 py-2.5 rounded-full transition-all cursor-pointer ${K?"bg-[#0F172A] text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm":"bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`,
                                                    children: S.label
                                                }, S.id)
                                            })
                                        }), p.jsxs("div", {
                                            className: "space-y-4",
                                            children: [p.jsxs("div", {
                                                className: "flex flex-col gap-4",
                                                children: [p.jsxs("div", {
                                                    className: "space-y-1.5 text-left",
                                                    children: [p.jsx("label", {
                                                        className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted}`,
                                                        children: "Link da API do Bubble.io"
                                                    }), p.jsxs("div", {
                                                        className: "relative",
                                                        children: [p.jsx("span", {
                                                            className: "absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]",
                                                            children: p.jsx(HA, {
                                                                size: 16
                                                            })
                                                        }), p.jsx("input", {
                                                            type: "url",
                                                            placeholder: b === "clientes" ? "https://seu-app.bubbleapps.io/version-test/api/1.1/obj/cliente" : b === "grupos" ? "https://seu-app.bubbleapps.io/version-test/api/1.1/obj/grupo" : b === "consorcios" ? "https://seu-app.bubbleapps.io/version-test/api/1.1/obj/consorcio" : b === "pagamentos" ? "https://seu-app.bubbleapps.io/version-test/api/1.1/obj/consorcio_pagamento" : "https://seu-app.bubbleapps.io/version-test/api/1.1/obj/receita",
                                                            value: _[b],
                                                            onChange: S => T({
                                                                ..._,
                                                                [b]: S.target.value
                                                            }),
                                                            className: `w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`
                                                        })]
                                                    })]
                                                }), p.jsxs("div", {
                                                    className: "space-y-1.5 text-left",
                                                    children: [p.jsxs("label", {
                                                        className: `text-[10px] font-bold uppercase tracking-wider ${A.textMuted} flex items-center gap-1`,
                                                        children: [p.jsx(ur, {
                                                            size: 12
                                                        }), " Token Privado (Private Key)"]
                                                    }), p.jsxs("div", {
                                                        className: "relative",
                                                        children: [p.jsx("span", {
                                                            className: "absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]",
                                                            children: p.jsx(ur, {
                                                                size: 16
                                                            })
                                                        }), p.jsx("input", {
                                                            type: k[b] ? "text" : "password",
                                                            placeholder: "Chave secreta de autenticação do Bubble.io",
                                                            value: C[b],
                                                            onChange: S => O({
                                                                ...C,
                                                                [b]: S.target.value
                                                            }),
                                                            className: `w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none font-medium transition-all ${A.inputText}`
                                                        }), p.jsx("button", {
                                                            type: "button",
                                                            onClick: () => $({
                                                                ...k,
                                                                [b]: !k[b]
                                                            }),
                                                            className: "absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-brand-purple transition-colors cursor-pointer",
                                                            children: k[b] ? p.jsx(Au, {
                                                                size: 16
                                                            }) : p.jsx(ju, {
                                                                size: 16
                                                            })
                                                        })]
                                                    })]
                                                })]
                                            }), p.jsxs("div", {
                                                className: "flex flex-wrap gap-3",
                                                children: [p.jsx("button", {
                                                    onClick: () => Il(b),
                                                    disabled: j,
                                                    className: `flex items-center gap-2 bg-brand-purple hover:bg-brand-purpleDark text-white py-2.5 px-5 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer ${j?"opacity-50 cursor-not-allowed":""}`,
                                                    children: j ? p.jsxs(p.Fragment, {
                                                        children: [p.jsx(rv, {
                                                            size: 16,
                                                            className: "animate-spin"
                                                        }), " Buscando..."]
                                                    }) : p.jsxs(p.Fragment, {
                                                        children: [p.jsx(av, {
                                                            size: 16
                                                        }), " Ler Tabela no Bubble.io"]
                                                    })
                                                }), p.jsxs("button", {
                                                    onClick: () => Sr(b),
                                                    disabled: j,
                                                    className: `flex items-center gap-2 border ${A.border} ${A.bgHover} ${A.textPrimary} py-2.5 px-5 rounded-xl font-semibold transition-all active:scale-[0.98] cursor-pointer`,
                                                    children: [p.jsx($A, {
                                                        size: 16,
                                                        className: "text-brand-lime"
                                                    }), " Carregar Mock de Teste"]
                                                })]
                                            })]
                                        }), ee && p.jsxs("div", {
                                            className: "p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-xs text-left leading-relaxed space-y-2",
                                            children: [p.jsx("p", {
                                                className: "font-bold flex items-center gap-2",
                                                children: "⚠️ Falha na Importação"
                                            }), p.jsx("p", {
                                                children: ee
                                            })]
                                        }), fe && p.jsx("div", {
                                            className: "p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs text-left font-medium",
                                            children: p.jsxs("p", {
                                                className: "flex items-center gap-2",
                                                children: ["✅ ", fe]
                                            })
                                        }), p.jsxs("div", {
                                            className: "space-y-3",
                                            children: [p.jsxs("div", {
                                                className: "flex items-center justify-between",
                                                children: [p.jsx("h3", {
                                                    className: `font-bold text-md ${A.textPrimary}`,
                                                    children: "Registros Importados"
                                                }), b === "clientes" && M.length > 0 && p.jsxs("button", {
                                                    onClick: Fs,
                                                    className: "flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm",
                                                    children: [p.jsx(Ms, {
                                                        size: 14
                                                    }), " Integrar ao Dashboard (", M.length, ")"]
                                                }), b === "grupos" && Q.length > 0 && p.jsxs("button", {
                                                    onClick: Kl,
                                                    className: "flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm",
                                                    children: [p.jsx(Ms, {
                                                        size: 14
                                                    }), " Integrar ao Dashboard (", Q.length, ")"]
                                                }), b === "consorcios" && F.length > 0 && p.jsxs("button", {
                                                    onClick: Yl,
                                                    className: "flex items-center gap-1.5 bg-[#C0F62C] hover:bg-[#A3D61B] text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm",
                                                    children: [p.jsx(Ms, {
                                                        size: 14
                                                    }), " Integrar ao Dashboard (", F.length, ")"]
                                                })]
                                            }), p.jsx("div", {
                                                className: `border ${A.border} rounded-2xl overflow-hidden`,
                                                children: (() => {
                                                    const S = () => {
                                                            switch (b) {
                                                                case "clientes":
                                                                    return M;
                                                                case "grupos":
                                                                    return Q;
                                                                case "consorcios":
                                                                    return F;
                                                                case "pagamentos":
                                                                    return ae;
                                                                case "receitas":
                                                                    return Ee;
                                                                default:
                                                                    return []
                                                            }
                                                        },
                                                        K = de => {
                                                            if (!de || de.length === 0) return [];
                                                            const le = new Set;
                                                            de.forEach(je => {
                                                                Object.keys(je).forEach(ve => {
                                                                    le.add(ve)
                                                                })
                                                            });
                                                            const be = Array.from(le);
                                                            return be.sort((je, ve) => {
                                                                const Pe = je.toLowerCase(),
                                                                    Fe = ve.toLowerCase();
                                                                return Pe === "id" || Pe === "_id" ? -1 : Fe === "id" || Fe === "_id" ? 1 : Pe === "name" || Pe === "nome" || Pe === "title" || Pe === "titulo" ? -1 : Fe === "name" || Fe === "nome" || Fe === "title" || Fe === "titulo" ? 1 : je.localeCompare(ve)
                                                            }), be
                                                        },
                                                        Y = S();
                                                    if (Y.length === 0) return p.jsx("div", {
                                                        className: `p-8 text-center text-xs ${A.textMuted}`,
                                                        children: 'Nenhum registro carregado. Insira a API do Bubble ou clique em "Carregar Mock de Teste".'
                                                    });
                                                    const Z = K(Y);
                                                    return p.jsx("div", {
                                                        className: "overflow-x-auto max-h-[350px]",
                                                        children: p.jsxs("table", {
                                                            className: "w-full text-left border-collapse text-xs",
                                                            children: [p.jsx("thead", {
                                                                children: p.jsx("tr", {
                                                                    className: `border-b ${A.border} ${A.tableHeader}`,
                                                                    children: Z.map(de => p.jsx("th", {
                                                                        className: "p-3 font-bold uppercase tracking-wider text-xs",
                                                                        children: de === "_id" || de === "id" ? "ID (Bubble)" : de
                                                                    }, de))
                                                                })
                                                            }), p.jsx("tbody", {
                                                                children: Y.map((de, le) => p.jsx("tr", {
                                                                    className: `border-b ${A.border} ${A.tableRowHover} transition-colors`,
                                                                    children: Z.map(be => {
                                                                        const je = de[be];
                                                                        let ve = "";
                                                                        je == null ? ve = "-" : typeof je == "object" ? ve = JSON.stringify(je) : ve = String(je);
                                                                        const Pe = be.toLowerCase() === "status" || be.toLowerCase() === "situacao",
                                                                            Fe = be.toLowerCase() === "plan" || be.toLowerCase() === "plano",
                                                                            Xn = ["name", "nome", "title", "titulo", "description", "descricao"].includes(be.toLowerCase());
                                                                        if (Pe) {
                                                                            const st = je === "Ativo" || je === "Pago" || je === "Ativa";
                                                                            return p.jsx("td", {
                                                                                className: "p-3",
                                                                                children: p.jsx("span", {
                                                                                    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${st?"bg-[#C0F62C]/20 text-[#6D9800]":"bg-rose-100 text-rose-700"}`,
                                                                                    children: ve
                                                                                })
                                                                            }, be)
                                                                        }
                                                                        return Fe ? p.jsx("td", {
                                                                            className: "p-3",
                                                                            children: p.jsx("span", {
                                                                                className: `px-2 py-0.5 rounded-full text-[9px] font-bold ${je==="VIP"?"bg-purple-100 text-purple-700":je==="Premium"?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-700"}`,
                                                                                children: ve
                                                                            })
                                                                        }, be) : p.jsx("td", {
                                                                            className: `p-3 ${Xn?"font-bold "+A.textPrimary:"opacity-80"} ${be==="_id"||be==="id"?"font-mono text-[10px] opacity-60":""}`,
                                                                            children: ve
                                                                        }, be)
                                                                    })
                                                                }, de.id || de._id || le))
                                                            })]
                                                        })
                                                    })
                                                })()
                                            })]
                                        })]
                                    })
                                })]
                            })]
                        }, "configuracoes"),
                        
                        // Modais de Consórcios
                        showGerarParcelasModal && p.jsx("div", {
                            className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                            children: p.jsxs(motion.div, {
                                initial: { scale: 0.95, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                className: `${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`,
                                children: [
                                    p.jsxs("div", {
                                        className: "flex justify-between items-center mb-4",
                                        children: [
                                            p.jsx("h3", { className: `text-lg font-bold ${A.textPrimary}`, children: "Gerar Parcelas" }),
                                            p.jsx("button", {
                                                type: "button",
                                                onClick: () => setShowGerarParcelasModal(false),
                                                className: `p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`,
                                                children: p.jsx(Ms, { size: 16, className: "rotate-45" })
                                            })
                                        ]
                                    }),
                                    p.jsxs("form", {
                                        onSubmit: handleGerarParcelasSubmit,
                                        className: "space-y-4",
                                        children: [
                                            p.jsxs("div", {
                                                className: "space-y-1",
                                                children: [
                                                    p.jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Valor da Parcela" }),
                                                    p.jsx("input", {
                                                        type: "text",
                                                        required: true,
                                                        value: newParcelasValor,
                                                        onChange: (e) => setNewParcelasValor(formatCurrencyPTBR(e.target.value)),
                                                        className: `w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                    })
                                                ]
                                            }),
                                            p.jsxs("div", {
                                                className: "grid grid-cols-2 gap-4",
                                                children: [
                                                    p.jsxs("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            p.jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Quantidade" }),
                                                            p.jsx("input", {
                                                                type: "number",
                                                                required: true,
                                                                min: 1,
                                                                max: 60,
                                                                value: newParcelasQtde,
                                                                onChange: (e) => setNewParcelasQtde(parseInt(e.target.value) || 10),
                                                                className: `w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                            })
                                                        ]
                                                    }),
                                                    p.jsxs("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            p.jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Mês de Início" }),
                                                            p.jsx("input", {
                                                                type: "month",
                                                                required: true,
                                                                value: newParcelasMesInicial,
                                                                onChange: (e) => setNewParcelasMesInicial(e.target.value),
                                                                className: `w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            p.jsxs("div", {
                                                className: "flex justify-end gap-3 pt-2",
                                                children: [
                                                    p.jsx("button", {
                                                        type: "button",
                                                        onClick: () => setShowGerarParcelasModal(false),
                                                        className: `px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`,
                                                        children: "Cancelar"
                                                    }),
                                                    p.jsx("button", {
                                                        type: "submit",
                                                        disabled: isGeneratingParcelas,
                                                        className: "px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer",
                                                        children: isGeneratingParcelas ? "Gerando..." : "Gerar"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        }),
                        showBaixarParcelaModal && selectedParcela && p.jsx("div", {
                            className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                            children: p.jsxs(motion.div, {
                                initial: { scale: 0.95, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                className: `${A.card} w-full max-w-md p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-left`,
                                children: [
                                    p.jsxs("div", {
                                        className: "flex justify-between items-center mb-4",
                                        children: [
                                            p.jsxs("h3", {
                                                className: `text-lg font-bold ${A.textPrimary}`,
                                                children: [selectedParcela.datapagamento_date ? "Estornar ou Editar" : "Baixar Parcela", " (", selectedParcela.mesano_text, ")"]
                                            }),
                                            p.jsx("button", {
                                                type: "button",
                                                onClick: () => setShowBaixarParcelaModal(false),
                                                className: `p-1 rounded-lg ${A.bgHover} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`,
                                                children: p.jsx(Ms, { size: 16, className: "rotate-45" })
                                            })
                                        ]
                                    }),
                                    p.jsxs("form", {
                                        onSubmit: handleBaixarParcelasSubmit,
                                        className: "space-y-4",
                                        children: [
                                            p.jsxs("div", {
                                                className: "space-y-1",
                                                children: [
                                                    p.jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Valor Pago" }),
                                                    p.jsx("input", {
                                                        type: "text",
                                                        required: true,
                                                        value: valorpagoInput,
                                                        onChange: (e) => setValorpagoInput(formatCurrencyPTBR(e.target.value)),
                                                        className: `w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                    })
                                                ]
                                            }),
                                            p.jsxs("div", {
                                                className: "space-y-1",
                                                children: [
                                                    p.jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Data de Pagamento" }),
                                                    p.jsx("input", {
                                                        type: "date",
                                                        required: true,
                                                        value: datapagamentoInput,
                                                        onChange: (e) => setDatapagamentoInput(e.target.value),
                                                        className: `w-full px-4 py-2.5 text-sm rounded-xl border ${A.inputText} outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all shadow-sm`
                                                    })
                                                ]
                                            }),
                                            p.jsxs("div", {
                                                className: "flex justify-between items-center pt-2 gap-2",
                                                children: [
                                                    selectedParcela.datapagamento_date ? p.jsx("button", {
                                                        type: "button",
                                                        onClick: handleEstornarPagamento,
                                                        disabled: isUpdatingParcela,
                                                        className: "px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer",
                                                        children: "Estornar"
                                                    }) : p.jsx("div", {}),
                                                    p.jsxs("div", {
                                                        className: "flex gap-2",
                                                        children: [
                                                            p.jsx("button", {
                                                                type: "button",
                                                                onClick: () => setShowBaixarParcelaModal(false),
                                                                className: `px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`,
                                                                children: "Cancelar"
                                                            }),
                                                            p.jsx("button", {
                                                                type: "submit",
                                                                disabled: isUpdatingParcela,
                                                                className: "px-4 py-2 text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-xl transition-all shadow-md shadow-brand-purple/10 disabled:opacity-50 cursor-pointer",
                                                                children: isUpdatingParcela ? "Gravando..." : "Confirmar"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        }),
                        showDeleteParcelaConfirmModal && parcelaToDelete && p.jsx("div", {
                            className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                            children: p.jsxs(motion.div, {
                                initial: { scale: 0.95, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                className: `${A.card} w-full max-w-sm p-6 rounded-[24px] shadow-2xl border ${A.border} relative text-center`,
                                children: [
                                    p.jsx("div", {
                                        className: "w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4",
                                        children: p.jsx(Trash2, { size: 24 })
                                    }),
                                    p.jsx("h3", { className: `text-lg font-bold ${A.textPrimary} mb-2`, children: "Excluir Parcela?" }),
                                    p.jsxs("p", {
                                        className: `text-xs ${A.textMuted} mb-6`,
                                        children: [
                                            "Tem certeza que deseja excluir permanentemente a parcela de referência ",
                                            p.jsx("span", { className: "font-bold text-slate-800 dark:text-slate-200", children: parcelaToDelete.mesano_text }),
                                            "? Esta ação não poderá ser desfeita."
                                        ]
                                    }),
                                    p.jsxs("div", {
                                        className: "flex justify-center gap-3",
                                        children: [
                                            p.jsx("button", {
                                                type: "button",
                                                onClick: () => setShowDeleteParcelaConfirmModal(false),
                                                className: `px-4 py-2 text-xs font-bold rounded-xl border ${A.border} ${A.textPrimary} ${A.bgHover} transition-all cursor-pointer`,
                                                children: "Cancelar"
                                            }),
                                            p.jsx("button", {
                                                type: "button",
                                                onClick: executeDeleteParcela,
                                                className: "px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer",
                                                children: "Excluir"
                                            })
                                        ]
                                    })
                                ]
                            })
                        })]

                    })
                })]
            })]
        })
};

export default Sk;
