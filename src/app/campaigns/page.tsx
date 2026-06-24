"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Users, RefreshCw, X, Wand2, Lightbulb, Search, Filter, 
  Download, Sliders, CheckCircle, Save, Calendar, MessageSquare, Info, ShieldCheck, CheckCircle2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  const [waStatus, setWaStatus] = useState<"DISCONNECTED" | "QR_READY" | "AUTHENTICATED" | "LOADING">("LOADING");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [template, setTemplate] = useState("Olá {tudo bem?|como vai?}, {nome}! 🚀\n\nMe chamo Leo, falo da {nome_agencia}.\n\nEstava analisando o posicionamento da sua {segmento} no Google e notei que vocês têm {opções excelentes|um grande potencial|um serviço incrível} na região de {cidade}...");
  const [delayMin, setDelayMin] = useState(30);
  const [delayMax, setDelayMax] = useState(90);
  const [pauseOnUnavailable, setPauseOnUnavailable] = useState(true);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [shuffleContacts, setShuffleContacts] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data.status);
          setQrCode(data.qrCode);
        }
      } catch (err) {}
    };
    
    fetchStatus();
    
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/campaigns/list?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setCampaignsList(data.campaigns || []);
          setActiveCampaign(data.activeCampaign || null);
        }
      } catch (err) {}
    };
    fetchCampaigns();

    const interval = setInterval(() => {
      fetchStatus();
      fetchCampaigns();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    setWaStatus("LOADING");
    await fetch("/api/whatsapp/restart", { method: "POST" });
  };

  const handleLogout = async () => {
    setWaStatus("LOADING");
    await fetch("/api/whatsapp/logout", { method: "POST" });
  };

  const handleImport = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/leads/import");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setSelectedLeads((data.leads || []).map((l: any) => l.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const toggleLeadSelection = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(lId => lId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const handleStartCampaign = async () => {
    if (selectedLeads.length === 0) return alert("Selecione pelo menos 1 lead!");
    if (waStatus !== "AUTHENTICATED") return alert("Conecte o WhatsApp primeiro!");
    
    setIsStarting(true);
    try {
      let finalLeadIds = [...selectedLeads];
      if (shuffleContacts) {
        finalLeadIds = finalLeadIds.sort(() => Math.random() - 0.5);
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Campanha " + new Date().toLocaleDateString(),
          template,
          delayMin,
          delayMax,
          leadIds: finalLeadIds
        })
      });
      if (res.ok) {
        alert("Campanha enfileirada com sucesso! O robô vai processar em background.");
      } else {
        alert("Erro ao iniciar campanha.");
      }
    } catch (err) {
      alert("Erro interno.");
    } finally {
      setIsStarting(false);
    }
  };

  const handlePauseCampaign = async () => {
    if (!activeCampaign) return;
    setIsPausing(true);
    try {
      const res = await fetch("/api/campaigns/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: activeCampaign.id })
      });
      if (res.ok) {
        alert("Campanha pausada com sucesso!");
      } else {
        alert("Erro ao pausar campanha.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro interno ao pausar.");
    } finally {
      setIsPausing(false);
    }
  };

  const handleFormatPhones = async () => {
    if (selectedLeads.length === 0) return alert("Selecione os leads que deseja formatar!");
    setIsFormatting(true);
    try {
      const res = await fetch("/api/leads/format-phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeads })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Sucesso! ${data.updatedCount} números formatados com o padrão WhatsApp (+55...).`);
        handleImport(); // Atualiza a lista
      } else {
        alert("Erro ao formatar os números.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro interno.");
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#05090D] overflow-auto text-[#F5F7FA]">
      
      {/* Header */}
      <div className="px-6 py-6 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#13202C] relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#19E28F]/20 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-serif text-[34px] font-bold text-[#F5F7FA] leading-tight">Mensagens IA</h1>
          <p className="mt-1 text-sm text-[#A1AFBF]">
            Envie mensagens personalizadas em escala com WhatsApp para aumentar seu engajamento e fechar mais leads.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <Button onClick={handleImport} disabled={isLoadingLeads} variant="outline" className="border-[#24384A] bg-[#0A1118] text-[#F5F7FA] hover:bg-[#0E1822] h-10 rounded-lg text-[13px]">
            {isLoadingLeads ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Importar do CRM
          </Button>
          <Button className="bg-[linear-gradient(90deg,#19E28F,#11C777)] text-[#04110B] hover:opacity-90 font-bold h-10 rounded-lg text-[13px] border-0 shadow-[0_0_15px_rgba(25,226,143,0.2)]">
            <Plus className="w-4 h-4 mr-2" />
            Nova campanha
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-[14px]">
        
        {/* Left Column (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-[14px]">
          
          {/* Card: Conexão do WhatsApp */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-[#1B2B3A] flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#19E28F]" />
              <h3 className="font-serif text-[17px] font-bold text-white">Conexão do WhatsApp</h3>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-[120px] h-[120px] bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-[#19E28F] p-2 relative overflow-hidden">
                  {waStatus === "LOADING" ? (
                    <div className="flex items-center justify-center w-full h-full text-[#0A1118] text-[10px] font-bold">Carregando...</div>
                  ) : waStatus === "AUTHENTICATED" ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                       <CheckCircle className="w-10 h-10 text-[#19E28F] mb-1" />
                       <span className="text-[#0A1118] text-[10px] font-bold">Conectado</span>
                    </div>
                  ) : qrCode ? (
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] opacity-80" />
                  )}
                  {waStatus === "QR_READY" && !qrCode && (
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-5 h-5 text-[#19E28F] fill-[#19E28F]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-[13px] text-[#A1AFBF] leading-tight mb-2">
                    {waStatus === "AUTHENTICATED" ? "Seu WhatsApp está pronto para envios em massa!" : "Escaneie o QR Code para conectar sua sessão"}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-2 py-1 rounded-full w-fit mb-3 ${waStatus === "AUTHENTICATED" ? "text-[#19E28F] bg-[#19E28F]/10" : waStatus === "QR_READY" ? "text-[#FFD21E] bg-[#FFD21E]/10" : "text-[#A1AFBF] bg-[#A1AFBF]/10"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${waStatus === "AUTHENTICATED" ? "bg-[#19E28F]" : waStatus === "QR_READY" ? "bg-[#FFD21E] animate-pulse" : "bg-[#A1AFBF]"}`} />
                    {waStatus === "AUTHENTICATED" ? "Sessão Ativa" : waStatus === "QR_READY" ? "Aguardando Leitura" : "Desconectado"}
                  </div>
                  <div className="text-[11px] text-[#708090] space-y-1 w-full">
                    <div className="flex justify-between gap-4"><span className="uppercase">Status</span> <span className="text-[#A1AFBF]">{waStatus}</span></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={handleRestart} className="flex items-center justify-center h-9 rounded-[8px] bg-[#0A1118] border border-[#24384A] text-[#F5F7FA] text-[12px] font-medium hover:bg-[#1B2B3A] transition">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Novo QR
                </button>
                <button onClick={handleLogout} className="flex items-center justify-center h-9 rounded-[8px] border border-[#FF5A52]/40 text-[#FF5A52] text-[12px] font-medium hover:bg-[#FF5A52]/10 transition">
                  <X className="w-3.5 h-3.5 mr-1.5" /> Desconectar
                </button>
              </div>
            </div>
          </div>

          {/* Card: Mensagens com Spintax */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex-1 flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-[#1B2B3A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-[#2F8CFF]" />
                <h3 className="font-serif text-[17px] font-bold text-white">Mensagens com Spintax</h3>
              </div>
              <Badge className="bg-[#19E28F]/10 text-[#19E28F] hover:bg-[#19E28F]/20 text-[10px] uppercase font-bold cursor-pointer border-[#19E28F]/20">
                Gerar com IA
              </Badge>
            </div>
            <div className="p-5 flex flex-col flex-1 gap-4">
              <p className="text-[12px] text-[#A1AFBF] leading-relaxed">
                Use a sintaxe <code className="bg-[#1B2B3A] px-1 rounded text-[#2F8CFF]">{`{opção1|opção2|opção3}`}</code> para criar variações automáticas e personalizar suas mensagens.
              </p>
              
              <div className="bg-[#081018] border border-[#1B2B3A] rounded-lg p-3 text-[12px]">
                <span className="font-bold text-[#708090] mr-2">Exemplo:</span>
                <span className="text-[#A1AFBF]">
                  Olá <span className="text-[#19E28F]">{`{tudo bem?|como vai?}`}</span>, me chamo <span className="text-[#FFD21E]">{`{nome_agencia}`}</span> e vi que sua empresa atua com <span className="text-[#2F8CFF]">{`{segmento}`}</span>...
                </span>
              </div>

              <div className="relative flex-1 flex flex-col">
                <textarea 
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full flex-1 min-h-[160px] bg-[#081018] border border-[#24384A] rounded-xl p-3.5 text-[13px] text-[#F5F7FA] placeholder-[#708090] focus:outline-none focus:border-[#19E28F]/50 resize-none scrollbar-thin"
                  placeholder="Escreva sua mensagem com variações..."
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-[#708090] font-mono">
                  {template.length} caracteres
                </div>
              </div>

              <div className="text-[11px] text-[#708090]">
                Variáveis disponíveis: <span className="text-[#2F8CFF]">{`{nome}, {empresa}, {cargo}, {segmento}, {cidade}, {telefone}, {nome_agencia}`}</span>.
              </div>
            </div>
          </div>

        </div>

        {/* Center Column (xl:col-span-5) */}
        <div className="xl:col-span-5 flex flex-col gap-[14px]">
          
          {/* Card: Leads Selecionados */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-5 border-b border-[#1B2B3A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#19E28F]" />
                <h3 className="font-serif text-[17px] font-bold text-white">Leads Selecionados do CRM</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleFormatPhones} disabled={isFormatting || selectedLeads.length === 0} variant="outline" className="h-8 text-[12px] bg-[#0A1118] border-[#24384A] hover:bg-[#0E1822] text-[#A1AFBF]">
                  <Wand2 className={`w-3.5 h-3.5 mr-2 ${isFormatting ? 'animate-pulse text-[#19E28F]' : ''}`} /> {isFormatting ? "Formatando..." : "Formatar Números (WA)"}
                </Button>
                <Button variant="outline" className="h-8 text-[12px] bg-[#0A1118] border-[#24384A] hover:bg-[#0E1822] text-[#A1AFBF]">
                  <Download className="w-3.5 h-3.5 mr-2" /> Exportar lista
                </Button>
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="px-5 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-[#1B2B3A]/50">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#19E28F]/10 border border-[#19E28F]/30 text-[#19E28F] text-[12px] font-bold whitespace-nowrap">
                Todos <span className="bg-[#19E28F] text-[#05090D] px-1.5 py-0.5 rounded-md text-[10px]">{leads.length}</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-[#24384A] text-[#A1AFBF] hover:border-[#FFD21E]/50 text-[12px] font-medium whitespace-nowrap transition">
                <span className="w-2 h-2 rounded-full bg-[#FFD21E]" /> Novos <span className="text-[#708090]">45</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-[#24384A] text-[#A1AFBF] hover:border-[#2F8CFF]/50 text-[12px] font-medium whitespace-nowrap transition">
                <span className="w-2 h-2 rounded-full bg-[#2F8CFF]" /> Contatados <span className="text-[#708090]">98</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border border-[#24384A] text-[#A1AFBF] hover:border-[#D946EF]/50 text-[12px] font-medium whitespace-nowrap transition">
                <span className="w-2 h-2 rounded-full bg-[#D946EF]" /> Instagram <span className="text-[#708090]">35</span>
              </button>
            </div>

            {/* Search Row */}
            <div className="px-5 py-3 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#708090]" />
                <input 
                  type="text" 
                  className="w-full h-9 bg-[#081018] border border-[#24384A] rounded-lg pl-9 pr-4 text-[13px] text-white placeholder-[#708090] focus:border-[#19E28F]/50 focus:outline-none"
                  placeholder="Buscar por nome, empresa, cargo..."
                />
              </div>
              <button className="h-9 px-3 flex items-center justify-center rounded-lg border border-[#24384A] bg-[#0A1118] text-[#A1AFBF] hover:text-white hover:border-[#A1AFBF] transition">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto min-h-[220px]">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#0A1118] text-[#708090] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <div 
                        onClick={toggleAllLeads}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition ${selectedLeads.length > 0 && selectedLeads.length === leads.length ? "border-[#19E28F] bg-[#19E28F]/20" : "border-[#708090] bg-transparent"}`}
                      >
                        {selectedLeads.length > 0 && selectedLeads.length === leads.length && <Check className="w-3 h-3 text-[#19E28F]" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 font-bold">Nome</th>
                    <th className="px-4 py-3 font-bold">Empresa</th>
                    <th className="px-4 py-3 font-bold">Telefone</th>
                    <th className="px-4 py-3 font-bold text-center">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2B3A]">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#708090]">
                        Clique em "Importar do CRM" para carregar seus leads.
                      </td>
                    </tr>
                  ) : leads.map((lead, i) => {
                    const isSelected = selectedLeads.includes(lead.id);
                    return (
                      <tr key={lead.id} className="hover:bg-[#19E28F]/[0.02] transition group">
                        <td className="px-4 py-3">
                          <div 
                            onClick={() => toggleLeadSelection(lead.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition ${isSelected ? "border-[#19E28F] bg-[#19E28F]/20" : "border-[#708090] bg-transparent"}`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#19E28F]" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 min-w-[140px]">
                          <div className="font-bold text-[#F5F7FA] group-hover:text-[#19E28F] transition">{lead.name}</div>
                          <div className="text-[10px] text-[#708090] mt-0.5">{lead.category || "Empresa"}</div>
                        </td>
                        <td className="px-4 py-3 text-[#A1AFBF] min-w-[120px]">{lead.city || "-"}</td>
                        <td className="px-4 py-3 text-[#A1AFBF] min-w-[130px]">
                          <div className="flex items-center gap-1.5">
                            {lead.phone}
                            <MessageSquare className="w-3 h-3 text-[#19E28F]" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `#19E28F15`, color: "#19E28F", border: `1px solid #19E28F30` }}>
                            {lead.scoreLabel || "LEAD"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 border-t border-[#1B2B3A] flex flex-wrap items-center justify-between text-[11px] text-[#708090]">
              <span>Mostrando {leads.length} registros selecionados: {selectedLeads.length}</span>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1B2B3A]">&lt;</button>
                <button className="w-6 h-6 rounded bg-[#19E28F]/10 text-[#19E28F] font-bold flex items-center justify-center border border-[#19E28F]/20">1</button>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1B2B3A]">2</button>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1B2B3A]">3</button>
                <span>...</span>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1B2B3A]">36</button>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1B2B3A]">&gt;</button>
              </div>
            </div>
          </div>

          {/* Card: Configurações de Envio */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#1B2B3A]">
            {/* Variaveis */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FFD21E]" />
                <h4 className="font-serif font-bold text-[15px] text-white">Variáveis disponíveis</h4>
              </div>
              <p className="text-[12px] text-[#A1AFBF]">Clique para adicionar na mensagem:</p>
              <div className="flex flex-wrap gap-2">
                {["{nome}", "{empresa}", "{cargo}", "{segmento}", "{cidade}", "{telefone}"].map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setTemplate(t => t + " " + v)}
                    className="px-2.5 py-1 rounded-md bg-[#0A1118] border border-[#24384A] text-[#2F8CFF] text-[11px] font-mono hover:border-[#2F8CFF]/50 hover:bg-[#2F8CFF]/5 transition"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-4">
                <div className="p-3 rounded-lg bg-[#19E28F]/5 border border-[#19E28F]/20 flex gap-2 items-start text-[11px] text-[#A1AFBF]">
                  <Lightbulb className="w-4 h-4 text-[#19E28F] shrink-0 mt-0.5" />
                  <p>Dica: Use as variáveis acima para personalizar automaticamente cada mensagem com base nos dados do CRM.</p>
                </div>
              </div>
            </div>
            
            {/* Controles de Envio */}
            <div className="p-5 flex-1 flex flex-col gap-5">
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[12px] font-bold text-white">Delay dinâmico (Segundos)</label>
                  <span className="text-[11px] font-bold text-[#19E28F] bg-[#19E28F]/10 px-2 py-0.5 rounded-md border border-[#19E28F]/20">{delayMin}s a {delayMax}s</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] text-[#708090] uppercase font-bold tracking-wider">Mínimo</label>
                    <input 
                      type="number" 
                      min="10" max="300"
                      value={delayMin}
                      onChange={(e) => setDelayMin(Number(e.target.value))}
                      className="w-full h-9 bg-[#0A1118] border border-[#24384A] rounded-lg px-3 text-[13px] text-white focus:border-[#19E28F]/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] text-[#708090] uppercase font-bold tracking-wider">Máximo</label>
                    <input 
                      type="number" 
                      min="10" max="600"
                      value={delayMax}
                      onChange={(e) => setDelayMax(Number(e.target.value))}
                      className="w-full h-9 bg-[#0A1118] border border-[#24384A] rounded-lg px-3 text-[13px] text-white focus:border-[#19E28F]/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Pausar em números indisponíveis", state: pauseOnUnavailable, setState: setPauseOnUnavailable },
                  { label: "Parar ao receber resposta", state: stopOnReply, setState: setStopOnReply },
                  { label: "Embaralhar ordem dos contatos", state: shuffleContacts, setState: setShuffleContacts },
                ].map((toggle, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#A1AFBF]">{toggle.label}</span>
                    <div 
                      onClick={() => toggle.setState(!toggle.state)}
                      className={`w-8 h-4.5 rounded-full p-0.5 flex items-center cursor-pointer transition-all ${toggle.state ? 'bg-[#19E28F] border border-transparent justify-end shadow-[0_0_8px_rgba(25,226,143,0.2)]' : 'bg-[#0C141D] border border-[#30465C] justify-start'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full shadow-sm transition-all ${toggle.state ? 'bg-[#04110B]' : 'bg-[#8A9EB3]'}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-[#1B2B3A] flex gap-2 items-center text-[10px] text-[#A1AFBF]">
                <ShieldCheck className="w-4 h-4 text-[#19E28F] shrink-0" />
                <p>Envios seguros e humanizados respeitando os limites da plataforma.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-[14px]">
          
          {/* Card: Resumo da campanha */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-[#1B2B3A] flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#19E28F]" />
              <h3 className="font-serif text-[17px] font-bold text-white">Resumo da campanha</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
              {/* Metricas */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {(() => {
                  const isActive = activeCampaign && ["PENDING", "RUNNING", "PAUSED"].includes(activeCampaign.status);
                  const isCompleted = activeCampaign && activeCampaign.status === "COMPLETED";
                  const shouldShowCampaignStats = isActive || (isCompleted && selectedLeads.length === 0);

                  const displayLeadsCount = shouldShowCampaignStats ? activeCampaign.totalLeads : selectedLeads.length;
                  const displayPrevisao = shouldShowCampaignStats ? activeCampaign.totalLeads : displayLeadsCount;
                  const displayEnviadas = shouldShowCampaignStats ? activeCampaign.stats?.sent || 0 : 0;
                  const totalProcessed = shouldShowCampaignStats && activeCampaign.stats ? activeCampaign.stats.sent + activeCampaign.stats.failed : 0;
                  const displaySuccessEst = totalProcessed > 0
                    ? Math.round((activeCampaign.stats.sent / totalProcessed) * 100) + "%"
                    : (shouldShowCampaignStats ? "0%" : "100%");

                  const statusText = isActive 
                    ? (activeCampaign.status === "PAUSED" ? "Pausada" : "Em andamento") 
                    : (isCompleted && selectedLeads.length === 0 ? "Concluída" : "Pronta para envio");

                  return (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#A1AFBF] text-[10px] uppercase font-bold tracking-wider">
                          <Users className="w-3 h-3 text-[#19E28F]" /> Leads 
                        </div>
                        <div className="text-[24px] font-outfit font-extrabold text-white">{displayLeadsCount}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#A1AFBF] text-[10px] uppercase font-bold tracking-wider">
                          <MessageSquare className="w-3 h-3 text-[#19E28F]" /> Previsão
                        </div>
                        <div className="text-[24px] font-outfit font-extrabold text-white">{displayPrevisao}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#A1AFBF] text-[10px] uppercase font-bold tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-[#19E28F]" /> Sucesso Est.
                        </div>
                        <div className="text-[24px] font-outfit font-extrabold text-[#19E28F]">{displaySuccessEst}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#A1AFBF] text-[10px] uppercase font-bold tracking-wider">
                          <Info className="w-3 h-3 text-[#FFD21E]" /> Enviadas
                        </div>
                        <div className="text-[24px] font-outfit font-extrabold text-white">{displayEnviadas}</div>
                        <div className="text-[10px] text-[#FFD21E] font-medium leading-none">
                          {statusText}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Checklist */}
              <div className="bg-[#0A1118] border border-[#1B2B3A] rounded-xl p-4 space-y-3">
                {(() => {
                  const isActive = activeCampaign && ["PENDING", "RUNNING", "PAUSED"].includes(activeCampaign.status);
                  const isCompleted = activeCampaign && activeCampaign.status === "COMPLETED";
                  const shouldShowCampaignStats = isActive || (isCompleted && selectedLeads.length === 0);

                  return [
                    { label: "Validação de contatos", status: "Concluída", done: true },
                    { label: "Leads importados", status: "Concluída", done: true },
                    { label: "Mensagens validadas", status: "Concluída", done: true },
                    { 
                      label: shouldShowCampaignStats && isCompleted ? "Disparo finalizado" : (isActive ? "Disparando..." : "Configurações"), 
                      status: shouldShowCampaignStats && isCompleted ? "Concluída" : (isActive ? "Em andamento" : "Pendente"), 
                      done: shouldShowCampaignStats && isCompleted 
                    },
                  ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      {item.done ? <CheckCircle2 className="w-4 h-4 text-[#19E28F]" /> : <div className="w-4 h-4 rounded-full border-2 border-[#708090]" />}
                      <span className={item.done ? "text-[#F5F7FA]" : "text-[#A1AFBF]"}>{item.label}</span>
                    </div>
                    <span className={item.done ? "text-[#19E28F] font-medium text-[11px]" : "text-[#FFD21E] font-medium text-[11px]"}>
                      {item.status}
                    </span>
                  </div>
                ))})()}
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3">
                {activeCampaign && ["RUNNING", "PENDING"].includes(activeCampaign.status) ? (
                  <Button 
                    onClick={handlePauseCampaign}
                    disabled={isPausing}
                    className="w-full bg-transparent border border-[#FF5A52] text-[#FF5A52] hover:bg-[#FF5A52]/10 font-bold h-11 rounded-xl text-[14px] transition-colors"
                  >
                    {isPausing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />} 
                    {isPausing ? "Pausando..." : "Pausar Campanha"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartCampaign}
                    disabled={isStarting || selectedLeads.length === 0}
                    className="w-full bg-[linear-gradient(90deg,#19E28F,#11C777)] text-[#04110B] hover:opacity-90 font-bold h-11 rounded-xl text-[14px] border-0 shadow-[0_0_20px_rgba(25,226,143,0.25)]"
                  >
                    {isStarting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} 
                    {isStarting ? "Iniciando..." : `Iniciar Disparo (${selectedLeads.length})`}
                  </Button>
                )}
                <Button variant="outline" className="w-full bg-[#0A1118] border-[#24384A] hover:bg-[#0E1822] text-[#F5F7FA] font-bold h-11 rounded-xl text-[13px]">
                  <Save className="w-4 h-4 mr-2" /> Salvar rascunho
                </Button>
              </div>
            </div>
          </div>

          {/* Card: Campanhas Recentes */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] overflow-hidden shadow-sm flex flex-col flex-1">
            <div className="p-4 border-b border-[#1B2B3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#A1AFBF]" />
                <h3 className="font-serif text-[15px] font-bold text-white">Campanhas Recentes</h3>
              </div>
              <button className="text-[11px] text-[#2F8CFF] hover:underline font-medium">Ver todas</button>
            </div>
            <div className="flex-1 overflow-x-auto min-h-[160px]">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#0A1118] text-[#708090] uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Campanha</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 font-bold text-right">Menvs.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2B3A]">
                  {campaignsList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-[#A1AFBF]">Nenhuma campanha recente</td>
                    </tr>
                  ) : campaignsList.map((row, i) => {
                    const statusColors: any = {
                      "RUNNING": "#2F8CFF",
                      "COMPLETED": "#19E28F",
                      "PAUSED": "#FF9F1C",
                      "ERROR": "#FF5A52",
                      "PENDING": "#FFD21E"
                    };
                    const statusNames: any = {
                      "RUNNING": "Em andamento",
                      "COMPLETED": "Concluída",
                      "PAUSED": "Pausada",
                      "ERROR": "Erro",
                      "PENDING": "Pendente",
                      "DRAFT": "Rascunho"
                    };
                    const sc = statusColors[row.status] || "#A1AFBF";
                    const statusName = statusNames[row.status] || row.status;
                    const contactsCount = row._count?.contacts || row.totalLeads;

                    return (
                      <tr key={row.id} className="hover:bg-[#19E28F]/[0.02] transition">
                        <td className="px-4 py-3 font-medium text-[#F5F7FA] whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: `${sc}10`, color: sc, borderColor: `${sc}30` }}>
                            {statusName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[#A1AFBF] font-mono whitespace-nowrap">{row.totalSent}/{contactsCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Support Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#19E28F] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(25,226,143,0.4)] text-[#04110B] hover:scale-105 transition-transform z-50">
        <MessageSquare className="w-5 h-5 fill-[#04110B]" />
      </button>

    </div>
  );
}
