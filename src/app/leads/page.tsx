"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Check,
  Send,
  Loader2,
  MapPin,
  Star,
  ExternalLink,
  Copy
} from "lucide-react";
import { QuickStats } from "@/components/leads/quick-stats";
import { LeadCard } from "@/components/leads/lead-card";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";

interface Lead {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  neighborhood?: string;
  city?: string;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  businessStatus?: string;
  openingHours?: string;
  hasWebsite: boolean;
  websiteType: "NONE" | "OWN_DOMAIN" | "INSTAGRAM" | "FACEBOOK" | "LINKTREE" | "WHATSAPP" | "OTHER";
  score: number;
  scoreLabel: "COLD" | "MEDIUM" | "HOT";
  scoreReason?: string;
  crmStatus: "NEW" | "CONTACTED" | "REPLIED" | "MEETING" | "CLOSED" | "LOST" | "IGNORED";
  approachMessage?: string;
  dealValue?: number;
  createdAt: string;
}

export default function LeadsPage() {
  const router = useRouter();
  
  // Estados para dados
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCrmStatus, setSelectedCrmStatus] = useState("Todos");
  const [selectedScore, setSelectedScore] = useState("Todos");
  const [selectedWebType, setSelectedWebType] = useState("Todos");
  
  // Estado da View (Grid vs Table)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  
  // Seleção múltipla
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Estado do lead selecionado (Modal)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatingValue, setUpdatingValue] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(p => ({ ...p, page: 1 })); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Recarregar leads sempre que os filtros ou página mudarem
  const [stats, setStats] = useState({ totalLeads: 0, activeOpportunities: 0, conversionRate: "0.0" });

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedCrmStatus !== "Todos") params.append("crmStatus", selectedCrmStatus);
      if (selectedScore !== "Todos") params.append("scoreLabel", selectedScore);
      if (selectedWebType !== "Todos") {
        if (selectedWebType === "NONE") {
          params.append("hasWebsite", "false");
        } else {
          params.append("websiteType", selectedWebType);
        }
      }

      const response = await fetch(`/api/leads?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        if (data.pagination) setPagination(data.pagination);
        
        // Clear selection on page load
        setSelectedLeadIds(new Set());
      }
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/leads/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  };

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [debouncedSearch, selectedCrmStatus, selectedScore, selectedWebType, pagination.page, pagination.limit]);

  // Remover filtragem local
  const filteredLeads = leads;

  // Atualizar status do CRM no Modal
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crmStatus: newStatus }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, crmStatus: newStatus as any } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, crmStatus: newStatus as any } : null);
        }
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
        loadLeads(); // Refresh leads
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
    const lead = leads.find(l => l.id === id);
    if (lead?.phone && lead?.approachMessage) {
      const cleanPhone = lead.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lead.approachMessage)}`;
      window.open(url, "_blank");
    } else if (lead?.phone) {
       const cleanPhone = lead.phone.replace(/\D/g, "");
       const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
       window.open(`https://wa.me/${formattedPhone}`, "_blank");
    }
  };

  const handleOpenWhatsAppModal = () => {
    if (selectedLead?.id) {
       handleOpenWhatsAppFromCard(selectedLead.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050A0E] px-[20px] py-[22px] overflow-auto">
      <div className="w-full">
      {/* Quick Stats - Real Data */}
      <QuickStats 
        totalLeads={stats.totalLeads} 
        activeOpportunities={stats.activeOpportunities} 
        conversionRate={stats.conversionRate} 
      />

        <div className="mb-[14px]">
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="text-[18px] font-georgia font-bold text-[#F4F4F5]">
              Busca e Filtros
            </h2>
            <div className="flex bg-[#101217] border border-white/[0.075] rounded-[8px] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-[12px] font-medium rounded-[6px] transition-colors ${viewMode === "grid" ? "bg-[#20D66B]/20 text-[#20D66B]" : "text-[#A5A7AD] hover:text-white"}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-[12px] font-medium rounded-[6px] transition-colors ${viewMode === "table" ? "bg-[#20D66B]/20 text-[#20D66B]" : "text-[#A5A7AD] hover:text-white"}`}
              >
                Tabela
              </button>
            </div>
          </div>
          <div className="bg-[#0D0F14] border border-white/[0.075] rounded-[16px] p-[9px] flex items-center gap-[10px]">
            <div className="relative w-[545px]">
              <Search className="absolute left-[10px] top-[9px] h-3.5 w-3.5 text-[#A5A7AD]" />
              <input 
                placeholder="Pesquisar leads, empresas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[32px] bg-[#101217] border border-white/[0.075] rounded-[7px] pl-[30px] pr-[10px] text-[12px] text-white placeholder:text-[#A5A7AD] focus:outline-none focus:border-[#20D66B]/50 transition-colors"
              />
            </div>
            
            <Select value={selectedCrmStatus} onValueChange={(val) => setSelectedCrmStatus(val || "Todos")}>
              <SelectTrigger className="w-[118px] h-[32px] bg-[#101217] border border-white/[0.075] rounded-[7px] text-[12px] text-white focus:outline-none focus:border-[#20D66B]/50 transition-colors px-3 flex justify-between items-center">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#101217] border-white/[0.075] text-[#F4F4F5]">
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="NEW">Novo</SelectItem>
                <SelectItem value="CONTACTED">Contatado</SelectItem>
                <SelectItem value="REPLIED">Respondeu</SelectItem>
                <SelectItem value="MEETING">Reunião</SelectItem>
                <SelectItem value="CLOSED">Fechado</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
                <SelectItem value="IGNORED">Ignorado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedScore} onValueChange={(val) => setSelectedScore(val || "Todos")}>
              <SelectTrigger className="w-[118px] h-[32px] bg-[#101217] border border-white/[0.075] rounded-[7px] text-[12px] text-white focus:outline-none focus:border-[#20D66B]/50 transition-colors px-3 flex justify-between items-center">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent className="bg-[#101217] border-white/[0.075] text-[#F4F4F5]">
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="HOT">Quente (70+)</SelectItem>
                <SelectItem value="MEDIUM">Médio (40-69)</SelectItem>
                <SelectItem value="COLD">Frio (0-39)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedWebType} onValueChange={(val) => setSelectedWebType(val || "Todos")}>
              <SelectTrigger className="w-[118px] h-[32px] bg-[#101217] border border-white/[0.075] rounded-[7px] text-[12px] text-white focus:outline-none focus:border-[#20D66B]/50 transition-colors px-3 flex justify-between items-center">
                <SelectValue placeholder="Presença" />
              </SelectTrigger>
              <SelectContent className="bg-[#101217] border-white/[0.075] text-[#F4F4F5]">
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="NONE">Nenhum</SelectItem>
                <SelectItem value="OWN_DOMAIN">Site Próprio</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="LINKTREE">Linktree</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto w-[39px] h-[32px] bg-[#171A20] border border-white/10 rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[#202227] transition-colors">
              <Filter className="w-4 h-4 text-[#A5A7AD]" />
            </div>
          </div>
        </div>

        {selectedLeadIds.size > 0 && (
          <div className="mb-4 bg-[#20D66B]/10 border border-[#20D66B]/30 rounded-[12px] p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-[13px] font-medium text-[#20D66B]">
              {selectedLeadIds.size} lead(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Select onValueChange={(val) => {
                const ids = Array.from(selectedLeadIds);
                fetch("/api/leads/bulk-action", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "UPDATE_STATUS", leadIds: ids, payload: { crmStatus: val } })
                }).then(() => {
                  setSelectedLeadIds(new Set());
                  loadLeads();
                });
              }}>
                <SelectTrigger className="w-[140px] h-[32px] bg-[#101217] border-white/10 text-[12px]">
                  <SelectValue placeholder="Mudar Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#101217] border-white/10">
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="CONTACTED">Contatado</SelectItem>
                  <SelectItem value="REPLIED">Respondeu</SelectItem>
                  <SelectItem value="MEETING">Reunião</SelectItem>
                  <SelectItem value="CLOSED">Fechado</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                  <SelectItem value="IGNORED">Ignorado</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-[32px] text-[12px] bg-red-500/20 text-red-500 hover:bg-red-500/30"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir ${selectedLeadIds.size} lead(s)?`)) {
                    fetch("/api/leads/bulk-action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "DELETE", leadIds: Array.from(selectedLeadIds) })
                    }).then(() => {
                      setSelectedLeadIds(new Set());
                      loadLeads();
                    });
                  }
                }}
              >
                Excluir Selecionados
              </Button>
            </div>
          </div>
        )}

        {loading ? (
            <div className="py-24 text-center text-sm text-zinc-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-[#20D66B] animate-spin" />
              <span>Carregando leads...</span>
            </div>
        ) : filteredLeads.length === 0 ? (
            <div className="py-24 text-center text-[13px] text-zinc-500 bg-[#0A0D14] border border-white/[0.05] rounded-[16px]">
              Nenhum lead encontrado com os filtros selecionados.
            </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[2000px]:grid-cols-7 gap-[14px]">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    id={lead.id}
                    name={lead.name}
                    location={lead.neighborhood ? `${lead.neighborhood}, ${lead.city || ""}` : lead.city || "Região Não Informada"}
                    score={lead.score}
                    scoreLabel={lead.scoreLabel}
                    presenceType={lead.websiteType}
                    crmStatus={lead.crmStatus}
                    phone={lead.phone}
                    onCall={handleOpenWhatsAppFromCard}
                    onOpenProfile={(id) => setSelectedLead(leads.find(l => l.id === id) || null)}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-white/10 rounded-[12px] bg-[#0A0D14] overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#101217] border-b border-white/10 text-[#A5A7AD] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4 font-bold w-[50px]">
                        <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
                          } else {
                            setSelectedLeadIds(new Set());
                          }
                        }} checked={selectedLeadIds.size > 0 && selectedLeadIds.size === filteredLeads.length}/>
                      </th>
                      <th className="px-6 py-4 font-bold">Nome</th>
                      <th className="px-6 py-4 font-bold">Contato</th>
                      <th className="px-6 py-4 font-bold">Segmento</th>
                      <th className="px-6 py-4 font-bold text-center">Score</th>
                      <th className="px-6 py-4 font-bold">Status CRM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" checked={selectedLeadIds.has(lead.id)} onChange={(e) => {
                            const newSet = new Set(selectedLeadIds);
                            if (e.target.checked) newSet.add(lead.id);
                            else newSet.delete(lead.id);
                            setSelectedLeadIds(newSet);
                          }}/>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{lead.name}</td>
                        <td className="px-6 py-4 text-zinc-400">{lead.phone || "Sem telefone"}</td>
                        <td className="px-6 py-4 text-zinc-400">{lead.category || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-[11px] font-bold ${lead.scoreLabel === 'HOT' ? 'bg-[#20D66B]/20 text-[#20D66B]' : lead.scoreLabel === 'MEDIUM' ? 'bg-[#FFD21E]/20 text-[#FFD21E]' : 'bg-red-500/20 text-red-500'}`}>{lead.score}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{lead.crmStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Paginação */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[13px] text-zinc-400">
                Mostrando {Math.min(1 + (pagination.page - 1) * pagination.limit, pagination.total)} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} leads
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  className="bg-[#101217] border-white/10 hover:bg-[#1A1D24] text-white"
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  className="bg-[#101217] border-white/10 hover:bg-[#1A1D24] text-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}

      </div>
      
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
    </div>
  );
}
