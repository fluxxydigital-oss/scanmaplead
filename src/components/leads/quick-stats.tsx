import React from "react";
import { Users2, Briefcase, TrendingUp } from "lucide-react";

interface QuickStatsProps {
  totalLeads: number;
  activeOpportunities: number;
  conversionRate: string;
}

export function QuickStats({ totalLeads, activeOpportunities, conversionRate }: QuickStatsProps) {
  return (
    <div className="mb-[24px]">
      <h2 className="text-[18px] font-georgia font-bold text-[#F4F4F5] mb-[12px]">
        Estatísticas Rápidas
      </h2>
      <div className="grid grid-cols-3 gap-[16px]">
        {/* Card 1 */}
        <div className="bg-[linear-gradient(180deg,#111318_0%,#0E1015_100%)] border border-white/[0.075] rounded-[15px] p-[18px] flex items-center justify-between shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[46px] h-[46px] rounded-[12px] bg-[#20D66B]/15 flex items-center justify-center text-[#20D66B]">
              <Users2 className="w-[20px] h-[20px]" />
            </div>
            <div>
              <span className="text-[12px] text-[#A5A7AD] block mb-[2px]">Total de Leads</span>
              <span className="text-[28px] font-bold text-[#F4F4F5] leading-none tracking-tight">{totalLeads}</span>
            </div>
          </div>
          <div className="bg-[#20D66B]/20 text-[#20D66B] px-[8px] py-[4px] rounded-[6px] text-[11px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Total
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[linear-gradient(180deg,#111318_0%,#0E1015_100%)] border border-white/[0.075] rounded-[15px] p-[18px] flex items-center justify-between shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[46px] h-[46px] rounded-[12px] bg-[#B34DDB]/15 flex items-center justify-center text-[#B34DDB]">
              <Briefcase className="w-[20px] h-[20px]" />
            </div>
            <div>
              <span className="text-[12px] text-[#A5A7AD] block mb-[2px]">Oportunidades Ativas</span>
              <span className="text-[28px] font-bold text-[#F4F4F5] leading-none tracking-tight">{activeOpportunities}</span>
            </div>
          </div>
          <div className="bg-[#B34DDB]/20 text-[#D26BFF] px-[8px] py-[4px] rounded-[6px] text-[11px] font-bold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Em andamento
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[linear-gradient(180deg,#111318_0%,#0E1015_100%)] border border-white/[0.075] rounded-[15px] p-[18px] flex items-center justify-between shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[46px] h-[46px] rounded-[12px] bg-[#20D66B]/15 flex items-center justify-center text-[#20D66B]">
              <TrendingUp className="w-[20px] h-[20px]" />
            </div>
            <div>
              <span className="text-[12px] text-[#A5A7AD] block mb-[2px]">Taxa de Conversão</span>
              <span className="text-[28px] font-bold text-[#F4F4F5] leading-none tracking-tight">{conversionRate}%</span>
            </div>
          </div>
          <div className="bg-[#20D66B]/20 text-[#20D66B] px-[8px] py-[4px] rounded-[6px] text-[11px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Ganhos
          </div>
        </div>
      </div>
    </div>
  );
}
