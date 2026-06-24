import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ExternalLink, MapPin, Send, Star, Loader2, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LeadDetailsModal({ 
  selectedLead, 
  setSelectedLead, 
  handleStatusChange, 
  updatingStatus, 
  handleCopyMessage, 
  copied, 
  handleOpenWhatsAppModal,
  handleValueChange,
  updatingValue
}: any) {
  const [localDealValue, setLocalDealValue] = useState("");

  useEffect(() => {
    if (selectedLead) {
      if (selectedLead.dealValue !== undefined && selectedLead.dealValue !== null && selectedLead.dealValue !== 0) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(selectedLead.dealValue);
        setLocalDealValue(formatted);
      } else {
        setLocalDealValue("");
      }
    }
  }, [selectedLead?.id, selectedLead?.dealValue]);

  if (!selectedLead) return null;

  return (
    <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
      <DialogContent className="bg-[#0F1116] border-white/10 text-zinc-100 sm:max-w-3xl w-full">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pr-6">
            <div>
              <Badge className="bg-[#20D66B]/10 text-[#20D66B] border border-[#20D66B]/20 mb-2">
                {selectedLead.category || "Empresa Local"}
              </Badge>
              <DialogTitle className="text-2xl font-bold text-white leading-tight">
                {selectedLead.name}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                {selectedLead.address}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Indicadores de Prospecção</h3>

            <div className="grid gap-3 grid-cols-2">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Google Avaliação</span>
                {selectedLead.rating ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="text-xl font-bold text-white">{selectedLead.rating.toFixed(1)}</span>
                    <span className="text-zinc-500 text-xs font-medium">
                      {selectedLead.reviewCount !== undefined && selectedLead.reviewCount !== null ? `(${selectedLead.reviewCount})` : ""}
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-500 text-xs block mt-2">Sem avaliação</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Pontuação da Oportunidade</span>
                <div className="mt-2 text-[24px] font-bold text-[#20D66B]">
                  {selectedLead.score}/100
                </div>
              </div>
            </div>

            {selectedLead.scoreReason && (
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Análise de Perfil</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedLead.scoreReason}</p>
              </div>
            )}

            <div className="grid gap-3 grid-cols-2">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Status Comercial</label>
                <Select
                  value={selectedLead.crmStatus}
                  disabled={updatingStatus}
                  onValueChange={(val) => handleStatusChange(selectedLead.id, val)}
                >
                  <SelectTrigger className="bg-[#101217] border-white/10 text-white h-9 text-[11px]">
                    <SelectValue placeholder="Selecione o status">
                      {
                        {
                          NEW: "Novo Lead",
                          CONTACTED: "Abordado",
                          REPLIED: "Respondeu",
                          MEETING: "Reunião Agendada",
                          CLOSED: "Contrato Fechado 🎉",
                          LOST: "Perdido",
                          IGNORED: "Ignorado"
                        }[selectedLead.crmStatus as string] || selectedLead.crmStatus
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#101217] border-white/10 text-white">
                    <SelectItem value="NEW">Novo Lead</SelectItem>
                    <SelectItem value="CONTACTED">Abordado</SelectItem>
                    <SelectItem value="REPLIED">Respondeu</SelectItem>
                    <SelectItem value="MEETING">Reunião Agendada</SelectItem>
                    <SelectItem value="CLOSED">Contrato Fechado 🎉</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                    <SelectItem value="IGNORED">Ignorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {handleValueChange && (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex justify-between items-center">
                    Valor da Negociação
                    {updatingValue && <Loader2 className="h-3 w-3 animate-spin text-[#20D66B]" />}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-[10px] text-zinc-500 text-[12px] font-bold">R$</span>
                    <Input
                      type="text"
                      disabled={updatingValue}
                      className="pl-8 bg-[#101217] border-white/10 text-white h-9 text-sm focus-visible:ring-[#20D66B]"
                      value={localDealValue}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (!val) {
                          setLocalDealValue("");
                          return;
                        }
                        const floatValue = parseFloat(val) / 100;
                        const formatted = new Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(floatValue);
                        setLocalDealValue(formatted);
                      }}
                      onBlur={() => {
                        if (!localDealValue) {
                          if (selectedLead.dealValue !== 0) handleValueChange?.(selectedLead.id, 0);
                          return;
                        }
                        const digits = localDealValue.replace(/\D/g, "");
                        const val = parseFloat(digits) / 100 || 0;
                        if (val !== selectedLead.dealValue) {
                          handleValueChange?.(selectedLead.id, val);
                        }
                      }}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {selectedLead.mapsUrl && (
                <a href={selectedLead.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-9 text-xs">
                    Google Maps
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </a>
              )}
              {selectedLead.website && (
                <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-9 text-xs">
                    Visitar Website
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Abordagem Customizada</span>
                {selectedLead.phone ? (
                  <span className="text-[10px] bg-[#20D66B]/10 text-[#20D66B] px-2 py-0.5 rounded font-mono font-bold">
                    WhatsApp Disponível
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                    Sem telefone celular
                  </span>
                )}
              </div>

              <div className="p-3 bg-[#0A0D11] border border-white/5 rounded-lg text-xs font-mono text-zinc-300 h-56 overflow-y-auto whitespace-pre-line leading-relaxed scrollbar-thin">
                {selectedLead.approachMessage || "Nenhuma mensagem gerada."}
              </div>
            </div>

            <div className="flex gap-2 mt-4 select-none">
              <Button
                variant="outline"
                onClick={handleCopyMessage}
                className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-10 flex-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-[#20D66B]" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copiar Texto
                  </>
                )}
              </Button>
              
              {selectedLead.phone && (
                <Button
                  onClick={handleOpenWhatsAppModal}
                  className="bg-[#20D66B] hover:bg-[#1CA854] text-[#05100A] font-bold h-10 flex-1 text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(32,214,107,0.15)]"
                >
                  <Send className="h-3.5 w-3.5 fill-[#05100A]" />
                  Enviar Whats
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-white/10 pt-4 flex sm:justify-end gap-2">
          <Button onClick={() => setSelectedLead(null)} className="bg-white/5 text-zinc-200 hover:bg-white/10 font-bold border border-white/10">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
