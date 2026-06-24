import React from "react";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { Phone, Mail } from "lucide-react";

export interface LeadCardProps {
  id: string;
  name: string;
  location: string;
  score: number;
  scoreLabel: string;
  presenceType: string;
  crmStatus: string;
  phone?: string;
  onCall?: (id: string) => void;
  onOpenProfile?: (id: string) => void;
}

export function LeadCard({
  id,
  name,
  location,
  score,
  scoreLabel,
  presenceType,
  crmStatus,
  phone,
  onCall,
  onOpenProfile,
}: LeadCardProps) {
  
  // Helpers para formatar a label da presença digital
  const getPresenceLabel = (type: string) => {
    switch (type) {
      case "NONE": return "Nenhum";
      case "INSTAGRAM": return "Instagram";
      case "FACEBOOK": return "Facebook";
      case "LINKTREE": return "Linktree";
      case "WHATSAPP": return "WhatsApp";
      case "OWN_DOMAIN": return "Site Próprio";
      default: return "Site Próprio";
    }
  };

  // Helpers para formatar badge de CRM
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#2377C9]/20 border-[#2377C9]/75 text-[#67B7FF] text-[11px] font-semibold leading-tight">Novo</span>;
      case "CONTACTED": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#B34DDB]/20 border-[#B34DDB]/75 text-[#E06BFF] text-[11px] font-semibold leading-tight">Contatado</span>;
      case "REPLIED": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#C79822]/20 border-[#C79822]/70 text-[#F2C14E] text-[11px] font-semibold leading-tight">Respondeu</span>;
      case "MEETING": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#B34DDB]/20 border-[#B34DDB]/75 text-[#E06BFF] text-[11px] font-semibold leading-tight">Reunião</span>;
      case "CLOSED": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#20D66B]/18 border-[#20D66B]/70 text-[#20D66B] text-[11px] font-semibold leading-tight">Fechado</span>;
      case "LOST": return <span className="px-2 py-0.5 rounded-[4px] border bg-[#C84C64]/18 border-[#C84C64]/70 text-[#FF7A93] text-[11px] font-semibold leading-tight">Perdido</span>;
      case "IGNORED": return <span className="px-2 py-0.5 rounded-[4px] border bg-zinc-800 border-zinc-700 text-zinc-400 text-[11px] font-semibold leading-tight">Ignorado</span>;
      default: return <span className="px-2 py-0.5 rounded-[4px] border bg-[#C79822]/20 border-[#C79822]/70 text-[#F2C14E] text-[11px] font-semibold leading-tight">{status}</span>;
    }
  };

  return (
    <div className="bg-[linear-gradient(180deg,#121318_0%,#0E1015_100%)] border border-white/[0.075] rounded-[14px] p-[12px] shadow-[0_14px_36px_rgba(0,0,0,0.23)] transition-all duration-180 hover:-translate-y-[2px] hover:border-[#20D66B]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] flex flex-col group">
      
      {/* Header */}
      <div className="mb-[11px]">
        <h3 className="text-[16px] font-bold text-[#F4F4F5] whitespace-nowrap overflow-hidden text-ellipsis leading-tight tracking-tight">
          {name}
        </h3>
        <p className="text-[12px] text-[#8F939B] mt-[2px] whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
          {location}
        </p>
      </div>

      {/* Score Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center mb-[4px]">
        <ScoreGauge score={score} size={120} strokeWidth={8} />
      </div>

      {/* Meta Row */}
      <div className="grid grid-cols-2 gap-[10px] mt-[5px]">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[#A5A7AD] leading-none">Presença</span>
          <span className="text-[12px] font-semibold text-[#F4F4F5] leading-none">
            {getPresenceLabel(presenceType)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[11px] text-[#A5A7AD] leading-none">Status</span>
          <div className="mt-[-2px]">
            {getStatusBadge(crmStatus)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-[45px_45px_1fr] gap-[6px] mt-[14px]">
        <button
          onClick={() => onCall?.(id)}
          disabled={!phone}
          className="h-[26px] bg-[#202227] border border-white/[0.08] rounded-[6px] flex items-center justify-center text-[#E5E7EB] hover:bg-[#2A2C32] hover:border-white/[0.15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed group/btn"
          title={phone ? "WhatsApp / Ligar" : "Sem telefone"}
        >
          <Phone className="w-[12px] h-[12px] group-hover/btn:text-[#20D66B] transition-colors" />
        </button>
        <button
          className="h-[26px] bg-[#202227] border border-white/[0.08] rounded-[6px] flex items-center justify-center text-[#E5E7EB] hover:bg-[#2A2C32] hover:border-white/[0.15] transition-colors group/btn"
          title="Enviar E-mail"
        >
          <Mail className="w-[12px] h-[12px] group-hover/btn:text-[#2377C9] transition-colors" />
        </button>
        <button
          onClick={() => onOpenProfile?.(id)}
          className="h-[26px] bg-[#202227] border border-white/[0.08] rounded-[6px] flex items-center justify-center text-[#E5E7EB] text-[12px] font-semibold hover:bg-[#2A2C32] hover:border-white/[0.15] hover:text-white transition-colors"
        >
          Abrir Perfil
        </button>
      </div>

    </div>
  );
}
