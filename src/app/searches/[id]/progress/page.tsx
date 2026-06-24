"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Globe,
  Camera,
  MapPin,
  MessageCircle,
  PieChart,
  Search,
  ShieldCheck,
  Star,
  Target,
  Users,
  XCircle,
  Zap,
  Loader2,
  StopCircle,
} from "lucide-react";

interface SearchLog {
  id: string;
  level: "INFO" | "WARNING" | "ERROR";
  message: string;
  createdAt: string;
}

interface PartialLead {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  phone?: string;
  website?: string;
  hasWebsite: boolean;
  websiteType: "NONE" | "OWN_DOMAIN" | "INSTAGRAM" | "FACEBOOK" | "LINKTREE" | "WHATSAPP" | "OTHER";
  score: number;
  scoreLabel: "COLD" | "MEDIUM" | "HOT";
}

interface SearchProgress {
  id: string;
  niche: string;
  city: string;
  neighborhood?: string;
  query: string;
  maxLeads: number;
  status:
    | "PENDING"
    | "STARTING_BROWSER"
    | "SEARCHING_MAPS"
    | "COLLECTING_CARDS"
    | "OPENING_PLACES"
    | "SAVING_LEADS"
    | "FINISHED"
    | "ERROR"
    | "CANCELLED";
  totalFound: number;
  totalSaved: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  logs: SearchLog[];
  leads: PartialLead[];
}

export default function SearchProgressPage() {
  const params = useParams();
  const router = useRouter();
  const searchId = params?.id as string;

  const [data, setData] = useState<SearchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [addingToPipeline, setAddingToPipeline] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddToPipeline = async () => {
    if (!data) return;
    setAddingToPipeline(true);
    try {
      const res = await fetch("/api/leads/pipeline/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchId: data.id,
          leadIds: Array.from(selectedLeads),
        }),
      });
      if (res.ok) {
        router.push("/pipeline");
      } else {
        const result = await res.json();
        alert(result.error || "Erro ao adicionar ao pipeline.");
      }
    } catch (err) {
      alert("Erro ao enviar solicitação.");
    } finally {
      setAddingToPipeline(false);
    }
  };

  const handleToggleLead = (leadId: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (data?.leads && selectedLeads.size === data.leads.length && data.leads.length > 0) {
      setSelectedLeads(new Set());
    } else if (data?.leads) {
      setSelectedLeads(new Set(data.leads.map(l => l.id)));
    }
  };

  // Polling
  useEffect(() => {
    if (!searchId) return;
    let intervalId: NodeJS.Timeout;

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/searches/${searchId}/progress?t=${Date.now()}`);
        if (!response.ok) throw new Error("Erro ao buscar progresso.");
        const progressData: SearchProgress = await response.json();
        setData(progressData);

        if (["FINISHED", "ERROR", "CANCELLED"].includes(progressData.status)) {
          clearInterval(intervalId);
        }
      } catch (err: any) {
        console.error(err);
        setError("Erro ao se conectar com a API de progresso.");
        clearInterval(intervalId);
      }
    };

    fetchProgress();
    intervalId = setInterval(fetchProgress, 2000);

    return () => clearInterval(intervalId);
  }, [searchId]);

  // Update timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    const updateTime = () => {
      if (!data?.startedAt) return;
      
      const start = new Date(data.startedAt).getTime();
      const end = ["FINISHED", "ERROR", "CANCELLED"].includes(data.status) && data.finishedAt
        ? new Date(data.finishedAt).getTime()
        : Date.now();
        
      const diffMs = Math.max(0, end - start);
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setElapsedTime(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateTime();
    if (data && !["FINISHED", "ERROR", "CANCELLED"].includes(data.status)) {
      timerId = setInterval(updateTime, 1000);
    }
    
    return () => clearInterval(timerId);
  }, [data?.startedAt, data?.finishedAt, data?.status]);

  const handleCancel = async () => {
    if (!window.confirm("Deseja cancelar o escaneamento? O robô encerrará em breve.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/searches/${searchId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const result = await res.json();
        alert(result.error || "Erro ao cancelar.");
      }
    } catch (err) {
      alert("Erro ao enviar solicitação de cancelamento.");
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#05090D] p-10 text-[#F5F7FA]">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Erro de Conexão</h2>
          <p className="text-[#A1AFBF]">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-full bg-[#19E28F] px-6 py-2 font-bold text-[#04110B]">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#05090D] p-10 text-[#F5F7FA]">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#19E28F] mb-4" />
          <span className="text-sm font-medium text-[#A1AFBF]">Acessando satélite de dados...</span>
        </div>
      </div>
    );
  }

  const isRunning = !["FINISHED", "ERROR", "CANCELLED"].includes(data.status);
  const progressPercent = data.status === "FINISHED" ? 100 : (data.maxLeads > 0 ? Math.min(Math.round((data.totalSaved / data.maxLeads) * 100), 100) : 0);
  
  const avgScore = data.leads.length > 0 ? Math.round(data.leads.reduce((acc, l) => acc + l.score, 0) / data.leads.length) : 0;
  const validContacts = data.leads.filter(l => l.phone).length;
  const leadsWithSite = data.leads.filter(l => l.hasWebsite).length;
  const leadsWithoutSite = data.leads.length - leadsWithSite;
  const leadsScore50 = data.leads.filter(l => l.score >= 50).length;

  // Timeline Logic
  const getStepStatus = (stepIndex: number) => {
    if (data.status === "ERROR" || data.status === "CANCELLED") return "error";
    if (data.status === "FINISHED") return "done";
    
    const stepsMapping = {
      "PENDING": -1,
      "STARTING_BROWSER": 0,
      "SEARCHING_MAPS": 0,
      "COLLECTING_CARDS": 1,
      "OPENING_PLACES": 2,
      "SAVING_LEADS": 3,
    };
    
    const currentStep = stepsMapping[data.status as keyof typeof stepsMapping] ?? -1;
    if (stepIndex < currentStep) return "done";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  const getScoreBadgeColor = (label: string, isTextOnly = false) => {
    if (label === "HOT") return isTextOnly ? "#19E28F" : { bg: "rgba(25,226,143,0.14)", c: "#19E28F" };
    if (label === "MEDIUM") return isTextOnly ? "#FFD21E" : { bg: "rgba(255,210,30,0.14)", c: "#FFD21E" };
    return isTextOnly ? "#FF4D4F" : { bg: "rgba(255,77,79,0.14)", c: "#FF4D4F" };
  };

  const colors = ["#1D4ED8", "#D8B56D", "#214859", "#1B2A1F", "#7C3AED", "#DB2777"];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.leads.length / itemsPerPage);
  const paginatedLeads = data.leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#05090D] px-7 py-7 pb-24 text-[#F5F7FA]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {isRunning ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#19E28F]/20 bg-[rgba(25,226,143,0.12)] px-3 py-1 text-[12px] font-bold text-[#19E28F]">
              <span className="flex h-2 w-2 rounded-full bg-[#19E28F] animate-pulse"></span>
              Varredura Ativa
            </div>
          ) : data.status === "FINISHED" ? (
            <div className="mb-4 inline-flex items-center rounded-full bg-[rgba(25,226,143,0.12)] px-3 py-1 text-[12px] font-bold text-[#19E28F]">
              Escaneamento concluído
            </div>
          ) : (
            <div className="mb-4 inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-[12px] font-bold text-red-500">
              Escaneamento interrompido
            </div>
          )}
          <h1 className="font-serif text-[30px] font-bold text-white max-w-[700px] leading-tight">
            Pesquisa: <span className="text-[#19E28F] font-sans">"{data.niche}"</span> em {data.neighborhood ? `${data.neighborhood}, ` : ""}{data.city}
          </h1>
          <p className="mt-2 text-[13px] text-[#708090]">
            ID: {data.id} | Query: {data.query}
          </p>
        </div>

        {isRunning && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2 text-[13px] font-bold text-red-400 transition-colors hover:bg-red-950/40"
          >
            <StopCircle className="h-4 w-4" /> Cancelar Busca
          </button>
        )}
      </div>

      {/* Success/Progress Summary Card */}
      <div className="mb-6 flex flex-col justify-between gap-6 rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6 lg:flex-row lg:items-center">
        
        <div className="flex items-center gap-5">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[rgba(25,226,143,0.1)] border border-[#19E28F]/20">
            {isRunning ? (
              <Loader2 className="h-7 w-7 text-[#19E28F] animate-spin" />
            ) : data.status === "FINISHED" ? (
              <CheckCircle className="h-7 w-7 text-[#19E28F]" />
            ) : (
              <XCircle className="h-7 w-7 text-red-500" />
            )}
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-white">
              {isRunning ? "Coletando contatos..." : data.status === "FINISHED" ? "Escaneamento finalizado com sucesso" : "Busca não finalizada"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#A1AFBF]">
              {isRunning ? "O robô está navegando e extraindo dados agora." : "As etapas foram finalizadas."}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 w-[200px] sm:w-[300px] rounded-full bg-[#1A2734] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#19E28F] shadow-[0_0_10px_#19E28F] transition-all duration-1000 ease-in-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#A1AFBF]">{progressPercent}% concluído</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 sm:grid-cols-4 lg:gap-x-10 pl-0 lg:pl-8 lg:border-l border-[#1B2B3A]">
          {[
            { label: "Leads extraídos", value: data.leads.length.toString(), icon: Users },
            { label: "Tempo da busca", value: elapsedTime, icon: Clock },
            { label: "Score médio", value: avgScore.toString(), icon: Star },
            { label: "Contatos válidos", value: validContacts.toString(), icon: ShieldCheck },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i}>
                <div className="flex items-center gap-2 text-[#A1AFBF]">
                  <Icon className="h-4 w-4 text-[#19E28F]" />
                  <span className="text-[12px] font-medium">{metric.label}</span>
                </div>
                <div className="mt-1 font-outfit text-[24px] font-bold text-white">{metric.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex flex-1 flex-col gap-[20px] xl:flex-row">
        
        {/* Left Column: Results List */}
        <div className="flex min-w-0 flex-1 flex-col rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-[#1B2B3A] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19E28F]/10 text-[#19E28F]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-[18px] font-bold text-white">Leads Capturados</h3>
                <p className="text-[12px] text-[#A1AFBF]">{data.leads.length} na lista</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {data.leads.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center text-[#708090]">
                {isRunning ? (
                  <>
                    <Search className="mb-4 h-8 w-8 animate-pulse text-[#19E28F]/50" />
                    <p className="text-[13px]">Buscando os primeiros leads...</p>
                  </>
                ) : (
                  <>
                    <XCircle className="mb-4 h-8 w-8 text-[#A1AFBF]/50" />
                    <p className="text-[13px]">Nenhum lead encontrado.</p>
                  </>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#0A1118] text-[11px] uppercase tracking-wider text-[#708090]">
                  <tr>
                    <th className="px-6 py-4 font-bold w-[60px]">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-[#24384A] bg-[#0C141D] checked:border-[#19E28F] checked:bg-[#19E28F] hover:border-[#19E28F]/50 transition-all checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20viewBox=%220%200%2014%2014%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M11.6666%203.5L5.24992%209.91667L2.33325%207%22%20stroke=%22%2305090D%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
                          checked={data.leads.length > 0 && selectedLeads.size === data.leads.length}
                          onChange={handleToggleAll}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-4 font-bold">Lead</th>
                    <th className="px-6 py-4 font-bold">Categoria</th>
                    <th className="px-6 py-4 font-bold">Contato</th>
                    <th className="px-6 py-4 font-bold">Presença Digital</th>
                    <th className="px-6 py-4 font-bold text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(70,110,145,0.18)]">
                  {paginatedLeads.map((row, i) => {
                    const firstLetter = row.name.charAt(0).toUpperCase();
                    const bgColor = colors[i % colors.length];
                    const hasSite = row.hasWebsite;
                    const badgeScore = getScoreBadgeColor(row.scoreLabel) as any;
                    const isSelected = selectedLeads.has(row.id);

                    return (
                      <tr key={row.id} className={`group transition-colors h-[74px] ${isSelected ? "bg-[rgba(25,226,143,0.06)]" : "hover:bg-[rgba(25,226,143,0.04)]"}`}>
                        <td className="px-6 py-4 w-[60px]">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-[#24384A] bg-[#0A1118] checked:border-[#19E28F] checked:bg-[#19E28F] hover:border-[#19E28F]/50 transition-all checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20viewBox=%220%200%2014%2014%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M11.6666%203.5L5.24992%209.91667L2.33325%207%22%20stroke=%22%2305090D%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
                              checked={isSelected}
                              onChange={() => handleToggleLead(row.id)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 min-w-[260px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-bold text-white" style={{ backgroundColor: bgColor }}>
                              {firstLetter}
                            </div>
                            <div>
                              {row.website ? (
                                <a href={row.website} target="_blank" rel="noopener noreferrer" className="font-bold text-white group-hover:text-[#19E28F] transition-colors hover:underline cursor-pointer">
                                  {row.name}
                                </a>
                              ) : (
                                <p className="font-bold text-white group-hover:text-[#19E28F] transition-colors">{row.name}</p>
                              )}
                              <div className="flex items-center gap-1 text-[11px] text-[#708090] mt-0.5">
                                <MapPin className="h-3 w-3" /> {data.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#A1AFBF]">{row.category || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-white">
                            {row.phone || <span className="text-[#708090]">Sem telefone</span>}
                            {row.phone && <MessageCircle className="h-3.5 w-3.5 text-[#19E28F]" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {row.website ? (
                            <a href={row.website} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-[12px] font-medium cursor-pointer hover:underline ${row.websiteType === 'OWN_DOMAIN' ? 'text-[#19E28F] hover:text-[#11C777]' : 'text-[#A1AFBF] hover:text-white'}`}>
                              {row.websiteType === 'INSTAGRAM' ? (
                                <Camera className="h-4 w-4" />
                              ) : row.websiteType === 'FACEBOOK' ? (
                                <Globe className="h-4 w-4" />
                              ) : (
                                <Globe className="h-4 w-4" />
                              )}
                              {row.websiteType === 'INSTAGRAM' ? 'Ver Instagram' : 
                               row.websiteType === 'FACEBOOK' ? 'Ver Facebook' : 
                               row.websiteType === 'OWN_DOMAIN' ? 'Possui site' : 'Acessar link'}
                            </a>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#FF4D4F]">
                              <XCircle className="h-4 w-4" /> Sem link
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-bold min-w-[60px]" style={{ backgroundColor: badgeScore.bg, color: badgeScore.c }}>
                            {row.score}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#1B2B3A] p-4 bg-[#0A1118]">
                <div className="text-[12px] text-[#708090]">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} até {Math.min(currentPage * itemsPerPage, data.leads.length)} de {data.leads.length} leads
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded border border-[#24384A] px-3 py-1 text-[12px] text-[#A1AFBF] disabled:opacity-50 hover:bg-[#1B2B3A]"
                  >
                    Anterior
                  </button>
                  <span className="text-[12px] text-white">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded border border-[#24384A] px-3 py-1 text-[12px] text-[#A1AFBF] disabled:opacity-50 hover:bg-[#1B2B3A]"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Steps, Actions, Summary */}
        <div className="flex w-full shrink-0 flex-col gap-[20px] xl:w-[440px]">
          
          {/* Etapas da busca */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#19E28F]" />
                <h3 className="font-serif text-[17px] font-bold text-white">Rastreamento</h3>
              </div>
              {!isRunning && data.status === "FINISHED" && (
                <span className="rounded-full bg-[rgba(25,226,143,0.12)] px-2.5 py-0.5 text-[10px] font-bold text-[#19E28F]">Concluído</span>
              )}
            </div>

            <div className="relative border-l border-[#19E28F]/30 ml-3 space-y-6">
              {[
                { title: "Busca no Google Maps", desc: "Localizando empresas locais", id: 0 },
                { title: "Acesso aos Cards", desc: "Varrendo painéis de informações", id: 1 },
                { title: "Coleta e Extração", desc: "Salvando contatos e sites", id: 2 },
                { title: "Score Final", desc: "Atribuindo qualidade do lead", id: 3 },
              ].map((step) => {
                const stepStatus = getStepStatus(step.id);
                return (
                  <div key={step.id} className="relative pl-6">
                    <div className={`absolute -left-[11px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full ring-4 ring-[#0C141D] transition-colors duration-500
                      ${stepStatus === "done" ? "bg-[#19E28F]" : stepStatus === "active" ? "bg-[#2F8CFF]" : "bg-[#1B2B3A]"}
                    `}>
                      {stepStatus === "done" && <Check className="h-3 w-3 text-[#04110B] stroke-[3]" />}
                      {stepStatus === "active" && <Loader2 className="h-3 w-3 text-white animate-spin stroke-[3]" />}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-[13px] font-bold transition-colors ${stepStatus === "pending" ? "text-[#708090]" : "text-white"}`}>{step.title}</p>
                        <p className={`mt-0.5 text-[11px] transition-colors ${stepStatus === "pending" ? "text-[#1B2B3A]" : "text-[#A1AFBF]"}`}>{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Próximas ações */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-[17px] font-bold text-white">
              <Zap className="h-5 w-5 text-[#19E28F]" /> Opções Rápidas
            </h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToPipeline}
                disabled={addingToPipeline}
                className="flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#19E28F,#11C777)] px-6 text-[14px] font-bold text-[#04110B] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(25,226,143,0.3)] disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
              >
                {addingToPipeline ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {selectedLeads.size > 0 ? `Adicionar ${selectedLeads.size} ao Pipeline` : "Adicionar todos ao Pipeline"} <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/searches/new" className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#223345] bg-[#0B1118] px-6 text-[14px] font-bold text-[#F5F7FA] transition-colors hover:bg-[#101A24]">
                <Search className="h-4 w-4" /> Iniciar Nova Busca
              </Link>
            </div>
          </div>

          {/* Resumo inteligente */}
          <div className="flex-1 flex flex-col rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <h3 className="mb-5 flex items-center gap-2 font-serif text-[17px] font-bold text-white">
              <PieChart className="h-5 w-5 text-[#19E28F]" /> Inteligência do Scan
            </h3>
            
            <div className="grid grid-cols-2 flex-1 gap-4">
              {[
                { l: "Leads com site", v: leadsWithSite, ic: Globe, c: "#19E28F", bg: "rgba(25,226,143,0.06)" },
                { l: "Leads sem site", v: leadsWithoutSite, ic: XCircle, c: "#FF4D4F", bg: "rgba(255,77,79,0.06)" },
                { l: "Leads com Instagram", v: 0, ic: Camera, c: "#D946EF", bg: "rgba(217,70,239,0.06)" },
                { l: "Oportunidades quentes", v: leadsScore50, ic: Star, c: "#FFD21E", bg: "rgba(255,210,30,0.06)" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-[#1B2B3A] bg-[#081018] p-4 text-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: item.bg }}>
                    <item.ic className="h-5 w-5" style={{ color: item.c }} />
                  </div>
                  <div>
                    <p className="font-outfit text-[22px] font-bold leading-none text-white">{item.v}</p>
                    <p className="mt-1.5 text-[11px] text-[#A1AFBF] leading-tight">{item.l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
