import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Download,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface DashboardTabProps {
  A: any;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ A }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold tracking-tight ${A.textPrimary}`}>
            Dashboard
          </h1>
          <p className={`text-sm ${A.textMuted}`}>
            Observe suas vendas e indicadores de forma simplificada.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto text-xs font-semibold">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`}>
            <Calendar size={14} /> 01- 31 Dezembro 2024
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`}>
            <Download size={14} /> Exportar
          </button>
          <button className="p-2.5 rounded-xl bg-brand-purple text-white hover:bg-brand-purpleDark shadow-md shadow-brand-purple/15 transition-all">
            <RefreshCw size={14} />
          </button>
          <button className={`p-2.5 rounded-xl border ${A.card} ${A.bgHover} shadow-sm transition-all`}>
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-7 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[360px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>Cash flow</h3>
            </div>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`}>
              <ArrowUpRight size={16} className={A.textMuted} />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <div>
              <p className={`text-xs ${A.textMuted} font-medium`}>
                Saldo disponível na carteira
              </p>
              <h4 className="text-3xl font-bold mt-1 text-brand-purple">
                $16,000.00
              </h4>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-brand-blue/10 text-brand-blue">
              +456
            </span>
            <span className="flex items-center gap-1 text-emerald-500 font-bold text-sm ml-auto">
              ↑ 2.03%
            </span>
          </div>
          <div className="mt-6 flex-1 relative flex items-center justify-center h-[180px] w-full">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 500 180"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C0F62C" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M 90 35 C 130 35, 130 65, 175 65"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="12"
              />
              <path
                d="M 90 90 C 130 90, 130 65, 175 65"
                fill="none"
                stroke="url(#limeGrad)"
                strokeWidth="10"
              />
              <path
                d="M 90 90 C 130 90, 130 115, 175 115"
                fill="none"
                stroke="url(#limeGrad)"
                strokeWidth="8"
              />
              <path
                d="M 90 145 C 130 145, 130 65, 175 65"
                fill="none"
                stroke="url(#blueGrad)"
                strokeWidth="10"
              />
              <path
                d="M 90 145 C 130 145, 130 115, 175 115"
                fill="none"
                stroke="url(#blueGrad)"
                strokeWidth="14"
              />
              <path
                d="M 270 65 C 310 65, 310 35, 355 35"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="15"
              />
              <path
                d="M 270 65 C 310 65, 310 90, 355 90"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="8"
              />
              <path
                d="M 270 115 C 310 115, 310 90, 355 90"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="8"
              />
              <path
                d="M 270 115 C 310 115, 310 145, 355 145"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="16"
              />
            </svg>
            <div className="absolute left-0 w-[95px] flex flex-col justify-between h-full py-1 text-[9px] font-bold text-white z-10">
              <div className="bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20">
                <p>Licenses</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$5,000</span>
                  <span className="text-rose-200">-0.2%</span>
                </div>
              </div>
              <div className="bg-[#A3E635] text-slate-900 rounded-lg p-1.5 shadow-sm border border-[#A3E635]/20">
                <p>Subscriptions</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$3,200</span>
                  <span className="text-emerald-700 font-bold">+0.1%</span>
                </div>
              </div>
              <div className="bg-brand-blue rounded-lg p-1.5 shadow-sm border border-brand-blue/20">
                <p>Hardware</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$7,500</span>
                  <span className="text-emerald-200">+0.1%</span>
                </div>
              </div>
            </div>
            <div className="absolute left-[180px] w-[95px] flex flex-col justify-around h-full py-6 text-[9px] font-bold text-white z-10">
              <div className="bg-brand-purple/90 rounded-lg p-1.5 shadow-sm border border-brand-purple/35">
                <p>Operating Systems</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$4,000</span>
                  <span className="text-rose-200">-0.2%</span>
                </div>
              </div>
              <div className="bg-brand-purple/95 rounded-lg p-1.5 shadow-sm border border-brand-purple/40">
                <p>Data Management</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$6,000</span>
                  <span className="text-emerald-200">+0.1%</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 w-[95px] flex flex-col justify-between h-full py-1 text-[9px] font-bold text-white z-10">
              <div className="bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20">
                <p>Windows Server</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$2,500</span>
                  <span className="text-emerald-200">+0.1%</span>
                </div>
              </div>
              <div className="bg-[#334155] rounded-lg p-1.5 shadow-sm border border-slate-600">
                <p>Linux Support</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$1,500</span>
                  <span className="text-emerald-200">+0.1%</span>
                </div>
              </div>
              <div className="bg-brand-purple rounded-lg p-1.5 shadow-sm border border-brand-purple/20">
                <p>Office Packages</p>
                <div className="flex justify-between items-center mt-1 text-[8px] opacity-90">
                  <span>$3,500</span>
                  <span className="text-emerald-200">+0.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-5 border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[360px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                Travel expenses
              </h3>
            </div>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`}>
              <ArrowUpRight size={16} className={A.textMuted} />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <div>
              <p className={`text-xs ${A.textMuted} font-medium`}>
                Despesas de viagem por destino
              </p>
              <h4 className="text-3xl font-bold mt-1 text-[#06B6D4]">
                $8,200.00
              </h4>
            </div>
          </div>
          <div className="mt-6 flex-1 relative flex items-center justify-center h-[180px] w-full">
            {/* Mapa-Múndi minimalista em SVG */}
            <svg
              className="w-full h-full text-slate-300 dark:text-slate-700"
              viewBox="0 0 200 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 20 20 L 50 15 L 70 30 L 90 20 L 110 35 L 140 25 L 170 35 L 180 20 L 190 35 L 175 60 L 150 55 L 140 70 L 110 65 L 100 80 L 80 75 L 60 85 L 40 75 L 30 65 Z"
                fill="currentColor"
                className="opacity-40"
              />
              <circle
                cx="120"
                cy="38"
                r="3"
                className="fill-brand-purple animate-ping"
              />
              <circle
                cx="120"
                cy="38"
                r="2.5"
                className="fill-brand-purple"
              />
            </svg>
            <div className="absolute top-[8px] right-[16px] bg-slate-950 text-white rounded-lg p-1.5 text-[8px] shadow-lg leading-tight z-10 border border-slate-800">
              <p className="font-bold">China</p>
              <p className="text-brand-lime">$1,500</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                Transfer history
              </h3>
            </div>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`}>
              <ArrowUpRight size={16} className={A.textMuted} />
            </button>
          </div>
          <p className={`text-xs ${A.textMuted} mt-1`}>
            Monitor how your money is being utilized
          </p>
          <div className="mt-4 flex-1 flex items-center justify-center relative">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="12"
                strokeDasharray="75.4 251.2"
                strokeDashoffset="0"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#C0F62C"
                strokeWidth="12"
                strokeDasharray="45.2 251.2"
                strokeDashoffset="-75.4"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="12"
                strokeDasharray="32.6 251.2"
                strokeDashoffset="-120.6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1E293B"
                strokeWidth="12"
                strokeDasharray="42.7 251.2"
                strokeDashoffset="-153.2"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="12"
                strokeDasharray="55.3 251.2"
                strokeDashoffset="-195.9"
              />
              <text
                x="50"
                y="53"
                textAnchor="middle"
                className={`fill-current text-[8px] font-bold ${A.textPrimary}`}
              >
                Resumo
              </text>
            </svg>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-[9px] font-bold ${A.textPrimary}`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-purple" /> 30%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-lime" /> 18%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /> 13%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" /> 17%
              </div>
            </div>
          </div>
        </div>

        <div className={`border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>Revenue</h3>
            </div>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`}>
              <ArrowUpRight size={16} className={A.textMuted} />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-brand-purple">$16,000.00</h4>
            <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded">
              +456
            </span>
            <span className="text-[10px] text-emerald-500 font-bold ml-auto">
              ↑ 2.03%
            </span>
          </div>
          <div className="mt-4 flex-1 h-28 relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="20" x2="200" y2="20" stroke="#F1F5F9" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="200" y2="50" stroke="#F1F5F9" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="200" y2="80" stroke="#F1F5F9" strokeWidth="0.5" />
              <rect x="15" y="45" width="10" height="55" rx="2" fill="#E2E8F0" />
              <rect x="35" y="35" width="10" height="65" rx="2" fill="#E2E8F0" />
              <rect x="55" y="60" width="10" height="40" rx="2" fill="#E2E8F0" />
              <rect x="75" y="25" width="10" height="75" rx="2" fill="#E2E8F0" />
              <rect x="95" y="50" width="10" height="50" rx="2" fill="#E2E8F0" />
              <rect x="115" y="15" width="10" height="85" rx="2" fill="#7C3AED" />
              <rect x="135" y="40" width="10" height="60" rx="2" fill="#E2E8F0" />
              <rect x="155" y="30" width="10" height="70" rx="2" fill="#E2E8F0" />
            </svg>
            <div className="absolute top-[2px] left-[102px] bg-slate-900 text-white rounded px-1.5 py-0.5 text-[8px] font-bold shadow-md">
              $27,632
            </div>
          </div>
        </div>

        <div className={`border ${A.card} rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className={A.textMuted} />
              <h3 className={`font-bold text-lg ${A.textPrimary}`}>
                Salary funnel analytics
              </h3>
            </div>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center ${A.bgHover} transition-all`}>
              <ArrowUpRight size={16} className={A.textMuted} />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-brand-purple">$16,000.00</h4>
            <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded">
              +456
            </span>
            <span className="text-[10px] text-emerald-500 font-bold ml-auto">
              ↑ 2.03%
            </span>
          </div>
          <div className="mt-4 flex-1 flex flex-col justify-center h-28 relative">
            <svg
              className="w-full h-16"
              viewBox="0 0 200 50"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
                  <stop offset="25%" stopColor="#7C3AED" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
                  <stop offset="75%" stopColor="#7C3AED" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 0 0 C 40 5, 80 15, 200 20 L 200 30 C 80 35, 40 45, 0 50 Z"
                fill="url(#funnelGrad)"
              />
            </svg>
            <div className={`flex justify-between mt-1 text-[9px] font-bold px-1 ${A.textPrimary}`}>
              <span>100%</span>
              <span>72%</span>
              <span>46%</span>
              <span>24%</span>
              <span>10%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardTab;
