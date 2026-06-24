"use client";

import {
  Calendar,
  Download,
  Users,
  Handshake,
  TrendingUp,
  Landmark,
  User,
  MoreVertical,
  Phone,
  Mail,
  FileText,
  MessageCircle,
} from "lucide-react";

import { useState, useEffect } from "react";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";

const COLUMNS_DEF = [
  { id: "NEW", title: "Novo Lead", color: "#19E28F" },
  { id: "CONTACTED", title: "Qualificação", color: "#2F8CFF" },
  { id: "REPLIED", title: "Apresentação", color: "#FFD21E" },
  { id: "MEETING", title: "Negociação", color: "#FF9F1C" },
  { id: "CLOSED", title: "Fechado (Ganho)", color: "#19E28F" },
  { id: "LOST", title: "Perdido (Rejeitado)", color: "#FF4D4D" },
];

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 0} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  return `${Math.floor(hours / 24)} dias atrás`;
}

export default function PipelinePage() {
  const [boardData, setBoardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingValue, setUpdatingValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const fetchPipeline = async () => {
    try {
      const res = await fetch("/api/pipeline");
      const leads = await res.json();
      
      const cols = COLUMNS_DEF.map(def => ({
        id: def.id,
        title: def.title,
        color: def.color,
        count: 0,
        value: 0,
        cards: [] as any[]
      }));

      leads.forEach((lead: any) => {
        const col = cols.find(c => c.id === lead.crmStatus);
        if (col) {
          col.count++;
          col.value += lead.dealValue || 0;
          col.cards.push({
            id: lead.id,
            business: lead.name,
            segment: `${lead.category || "Sem categoria"} • ${lead.city || "Sem cidade"}`,
            score: lead.score,
            initial: lead.name.substring(0, 2).toUpperCase(),
            time: timeAgo(lead.createdAt),
            tag: lead.crmStatus === "CLOSED" ? "Ganho" : undefined,
            dealValue: lead.dealValue || 0,
            fullLead: lead // Store full lead for modal
          });
        }
      });

      setBoardData(cols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  // Modal actions
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crmStatus: newStatus }),
      });
      fetchPipeline(); // Refresh board
      if (selectedLead) {
        setSelectedLead({ ...selectedLead, crmStatus: newStatus });
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleValueChange = async (leadId: string, newValue: number) => {
    setUpdatingValue(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/value`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealValue: newValue }),
      });
      if (res.ok) {
        fetchPipeline(); // Refresh board
        if (selectedLead) {
          setSelectedLead({ ...selectedLead, dealValue: newValue });
        }
      } else {
        console.error("Falha ao atualizar no backend");
      }
    } catch (err) {
      console.error("Erro ao atualizar valor:", err);
    } finally {
      setUpdatingValue(false);
    }
  };

  const handleCopyMessage = () => {
    if (selectedLead?.approachMessage) {
      navigator.clipboard.writeText(selectedLead.approachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWhatsAppFromCard = (id: string) => {
    let targetLead = selectedLead;
    if (!targetLead) {
      // Find lead in board if not selected
      for (const col of boardData) {
        const c = col.cards.find((c: any) => c.id === id);
        if (c) targetLead = c.fullLead;
      }
    }
    
    if (targetLead?.phone && targetLead?.approachMessage) {
      const cleanPhone = targetLead.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(targetLead.approachMessage)}`;
      window.open(url, "_blank");
    } else if (targetLead?.phone) {
       const cleanPhone = targetLead.phone.replace(/\D/g, "");
       const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
       window.open(`https://wa.me/${formattedPhone}`, "_blank");
    }
  };

  const handleOpenWhatsAppModal = () => {
    if (selectedLead?.id) {
       handleOpenWhatsAppFromCard(selectedLead.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, cardIndex: number, colIndex: number) => {
    e.dataTransfer.setData("cardIndex", cardIndex.toString());
    e.dataTransfer.setData("colIndex", colIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetColIndex: number) => {
    e.preventDefault();
    const sourceColIndex = parseInt(e.dataTransfer.getData("colIndex"), 10);
    const cardIndex = parseInt(e.dataTransfer.getData("cardIndex"), 10);

    if (sourceColIndex === targetColIndex) return;

    // Clone the board data to avoid direct mutation
    const newBoard = boardData.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    const targetCol = newBoard[targetColIndex];
    const cardToMove = newBoard[sourceColIndex].cards[cardIndex];
    
    // Update value aggregates
    newBoard[sourceColIndex].value -= cardToMove.dealValue;
    targetCol.value += cardToMove.dealValue;
    
    // Add 'Ganho' tag if moved to the last column, remove otherwise
    if (targetCol.id === "CLOSED") {
      cardToMove.tag = "Ganho";
    } else {
      delete cardToMove.tag;
    }

    // Remove from source
    newBoard[sourceColIndex].cards.splice(cardIndex, 1);
    newBoard[sourceColIndex].count -= 1;

    // Add to target
    newBoard[targetColIndex].cards.unshift(cardToMove);
    newBoard[targetColIndex].count += 1;

    setBoardData(newBoard);

    // Call API
    try {
      await fetch("/api/pipeline/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: cardToMove.id,
          status: targetCol.id
        })
      });
    } catch (err) {
      console.error(err);
      fetchPipeline(); // revert UI on error
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ["Nome da Empresa", "Segmento", "Score", "Status", "Data", "Valor"]
    ];

    boardData.forEach(col => {
      col.cards.forEach((card: any) => {
        rows.push([
          `"${card.business}"`,
          `"${card.segment}"`,
          card.score.toString(),
          `"${col.title}"`,
          `"${card.time}"`,
          card.dealValue.toString()
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(e => e.join(",")).join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "pipeline.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metricas Dinamicas
  const totalLeads = boardData.reduce((acc, col) => acc + col.count, 0);
  const totalValue = boardData.reduce((acc, col) => acc + col.value, 0);
  const wonCol = boardData.find(c => c.id === "CLOSED");
  const wonLeads = wonCol ? wonCol.count : 0;
  const meetingCol = boardData.find(c => c.id === "MEETING");
  const meetingLeads = meetingCol ? meetingCol.count : 0;
  
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#05090D] px-7 py-7 pb-24 text-[#F5F7FA]">
      <LeadDetailsModal 
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        handleStatusChange={handleStatusChange}
        updatingStatus={updatingStatus}
        handleCopyMessage={handleCopyMessage}
        copied={copied}
        handleOpenWhatsAppModal={handleOpenWhatsAppModal}
        handleValueChange={handleValueChange}
        updatingValue={updatingValue}
      />
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-serif text-[36px] font-bold tracking-tight text-white">
            Pipeline <span className="text-[#19E28F]">Comercial</span>
          </h1>
          <p className="mt-1 text-[14px] text-[#A1AFBF]">
            Acompanhe o funil de vendas e gerencie o progresso dos seus leads até o fechamento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex h-[38px] items-center gap-2 rounded-lg border border-[#1B2B3A] bg-[#0A1118] px-4 text-[13px] font-medium text-[#A1AFBF] transition hover:border-[#24384A] hover:text-white">
            <User className="h-4 w-4" />
            Todos os responsáveis
          </button>
          <button className="flex h-[38px] items-center gap-2 rounded-lg border border-[#1B2B3A] bg-[#0A1118] px-4 text-[13px] font-medium text-[#A1AFBF] transition hover:border-[#24384A] hover:text-white">
            <Calendar className="h-4 w-4" />
            Este mês
          </button>
          <button onClick={handleExportCSV} className="flex h-[38px] items-center gap-2 rounded-lg border border-[#24384A] bg-[#0C141D] px-4 text-[13px] font-bold text-white transition hover:bg-[#101A24]">
            <Download className="h-4 w-4 text-[#19E28F]" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Leads no Funil", value: totalLeads.toString(), desc: "Total na pipeline", icon: Users, color: "#19E28F" },
          { label: "Negociações Ativas", value: meetingLeads.toString(), desc: "Em andamento", icon: Handshake, color: "#2F8CFF" },
          { label: "Taxa de Conversão", value: `${conversionRate}%`, desc: "Ganhos / Total", icon: TrendingUp, color: "#FFD21E" },
          { label: "Receita Previsível", value: formatCurrency(totalValue), desc: "Valor total do funil", icon: Landmark, color: "#FF9F1C" },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
            >
              <div
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#050A10]"
                style={{ boxShadow: `0 0 20px ${metric.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: metric.color }} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#A1AFBF]">{metric.label}</p>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-outfit text-[24px] font-bold text-white">{metric.value}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#708090]">
                  <span className={metric.desc.includes("+") ? "text-[#19E28F]" : ""}>{metric.desc.split(" ")[0]}</span>{" "}
                  {metric.desc.split(" ").slice(1).join(" ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Kanban + Right Panel */}
      <div className="flex flex-1 flex-col gap-[20px] lg:flex-row">
        
        {/* Left Column (Kanban + Funnel) */}
        <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
          
          {/* Kanban Board */}
          <div className="flex flex-1 gap-[12px] overflow-x-auto pb-2 scrollbar-thin scrollbar-track-[#05090D] scrollbar-thumb-[#1B2B3A]">
            {boardData.map((col, colIndex) => (
              <div
                key={col.title}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colIndex)}
                className="flex flex-1 min-w-[260px] flex-col rounded-[14px] border border-[rgba(70,110,145,0.24)] bg-[#0B141D] p-[14px] transition-colors hover:border-[rgba(70,110,145,0.35)]"
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="text-[14px] font-bold text-white">{col.title}</h3>
                  </div>
                  <span className="flex h-[20px] items-center justify-center rounded-full bg-[rgba(25,226,143,0.18)] px-2 text-[11px] font-bold text-[#19E28F]">
                    {col.count}
                  </span>
                </div>
                <div className="mb-3 text-[13px] font-medium text-[#A1AFBF]">{formatCurrency(col.value)}</div>

                {/* Cards Container */}
                <div className="flex flex-col gap-3">
                  {col.cards.map((card: any, cardIndex: number) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cardIndex, colIndex)}
                      onClick={() => setSelectedLead(card.fullLead)}
                      className="group relative flex cursor-grab flex-col gap-3 rounded-xl border border-white/5 bg-[#0C141D] p-4 transition hover:border-white/10 active:cursor-grabbing hover:-translate-y-0.5 shadow-sm hover:shadow-[0_8px_20px_rgba(25,226,143,0.05)]"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="line-clamp-1 pr-4 text-[14px] font-bold text-white">{card.business}</h4>
                        <button className="text-[#708090] opacity-0 transition group-hover:opacity-100 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mb-3 text-[11px] leading-[15px] text-[#A1AFBF]">{card.segment}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-[rgba(25,226,143,0.16)] px-2 py-0.5 text-[10px] font-bold text-[#19E28F]">
                            Score {card.score}
                          </span>
                          {card.tag && (
                            <span className="rounded-full bg-[rgba(25,226,143,0.16)] px-2 py-0.5 text-[10px] font-bold text-[#19E28F]">
                              {card.tag}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#1B2B3A]/50 pt-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B2B3A] text-[9px] font-bold text-white">
                          {card.initial}
                        </div>
                        <span className="text-[10px] font-medium text-[#708090]">{card.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 text-left text-[12px] font-bold text-[#2F8CFF] hover:underline">
                  + Ver todos os {col.count} leads
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Conversion Card */}
          <div className="rounded-2xl border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-5">
            <h3 className="mb-4 font-serif text-[18px] font-bold text-white">Conversões do Funil</h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              
              <div className="flex shrink-0 items-center gap-3 pr-6">
                <div className="relative flex h-[46px] w-[46px] items-center justify-center">
                  <svg className="h-[46px] w-[46px] -rotate-90">
                    <circle cx="23" cy="23" r="20" fill="none" stroke="#162432" strokeWidth="4" />
                    <circle cx="23" cy="23" r="20" fill="none" stroke="#19E28F" strokeLinecap="round" strokeWidth="4" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 - 0.328 * (2 * Math.PI * 20)} />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#A1AFBF]">Taxa de Conversão Geral</p>
                  <p className="font-outfit text-[22px] font-bold text-white">32.8%</p>
                  <p className="text-[10px] text-[#19E28F]">+5.6% vs mês anterior</p>
                </div>
              </div>

              {[
                { label: "Novo Lead → Qualificação", val: "85.7%", desc: "28 leads" },
                { label: "Qualificação → Apresentação", val: "66.7%", desc: "16 leads" },
                { label: "Apresentação → Negociação", val: "62.5%", desc: "10 leads" },
                { label: "Negociação → Fechado", val: "60.0%", desc: "6 leads" },
              ].map((conv, i) => (
                <div key={i} className="flex shrink-0 items-center gap-5 border-l border-[#1B2B3A] pl-5">
                  <div>
                    <p className="text-[11px] font-medium text-[#A1AFBF]">{conv.label}</p>
                    <p className="font-outfit text-[22px] font-bold text-white">{conv.val}</p>
                    <p className="text-[10px] text-[#708090]">{conv.desc}</p>
                  </div>
                  {i < 3 && <div className="text-[#A1AFBF]">→</div>}
                </div>
              ))}

              <div className="flex shrink-0 items-center gap-5 border-l border-[#1B2B3A] pl-5">
                <div>
                  <p className="text-[11px] font-medium text-[#A1AFBF]">Tempo Médio do Ciclo</p>
                  <p className="font-outfit text-[22px] font-bold text-white">18 dias</p>
                  <p className="text-[10px] text-[#19E28F]">-2 dias vs mês anterior</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Support Floating Button */}
      <button
        type="button"
        className="fixed bottom-6 right-8 z-50 flex h-[48px] items-center justify-center gap-2.5 rounded-full border border-[#12D889]/40 bg-[linear-gradient(90deg,rgba(18,216,137,0.85),rgba(10,191,120,0.9))] px-5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(18,216,137,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,216,137,0.4)]"
      >
        <MessageCircle className="h-5 w-5" />
        Suporte
      </button>

    </div>
  );
}
