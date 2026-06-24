"use client";

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
} from "lucide-react";
import { useParams } from "next/navigation";

export default function SearchResultsPage() {
  const params = useParams();
  const id = params?.id || "cmqctbhl0002wcuoxaxnjaj";

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#05090D] px-7 py-7 pb-24 text-[#F5F7FA]">
      
      {/* Header with Map Background */}
      <div className="relative mb-6 flex flex-col justify-end overflow-hidden rounded-[20px] bg-[linear-gradient(90deg,#05090D_40%,#081613)] p-8 shadow-inner shadow-[#1B2B3A]/10">
        
        {/* Fake Tech Map Background SVG */}
        <div className="absolute inset-y-0 right-0 w-[600px] opacity-40 mix-blend-screen pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 L80,20 L150,90 L220,40 L350,110 L400,80" fill="none" stroke="#19E28F" strokeWidth="1" strokeOpacity="0.3"/>
            <path d="M50,180 L120,120 L200,160 L280,70 L380,150" fill="none" stroke="#19E28F" strokeWidth="1" strokeOpacity="0.3"/>
            <path d="M100,0 L180,60 L140,140 L250,190" fill="none" stroke="#19E28F" strokeWidth="1" strokeOpacity="0.2"/>
            
            {/* Dots */}
            <circle cx="80" cy="20" r="2" fill="#19E28F" opacity="0.6"/>
            <circle cx="150" cy="90" r="3" fill="#19E28F" opacity="0.8"/>
            <circle cx="220" cy="40" r="2" fill="#19E28F" opacity="0.6"/>
            <circle cx="350" cy="110" r="4" fill="#19E28F" opacity="1">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="120" cy="120" r="2" fill="#19E28F" opacity="0.5"/>
            <circle cx="280" cy="70" r="5" fill="#19E28F" opacity="0.9">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="250" cy="190" r="2" fill="#19E28F" opacity="0.6"/>

            {/* Map Pin */}
            <g transform="translate(275, 45)">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#19E28F" transform="scale(0.8) translate(-12, -12)"/>
              <circle cx="0" cy="0" r="20" fill="url(#glowGradient)" opacity="0.4" />
            </g>

            <defs>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#19E28F" stopOpacity="1" />
                <stop offset="100%" stopColor="#19E28F" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full bg-[rgba(25,226,143,0.12)] px-3 py-1 text-[12px] font-bold text-[#19E28F]">
              Escaneamento concluído
            </div>
            <h1 className="font-serif text-[30px] font-bold text-white max-w-[700px] leading-tight">
              Pesquisa: <span className="text-[#19E28F] font-sans">"Imobiliária"</span> em Niterói, Rio de Janeiro
            </h1>
            <p className="mt-2 text-[13px] text-[#708090]">
              ID: {id} | Query: Imobiliária em Niterói - Rio de Janeiro
            </p>
          </div>
        </div>
      </div>

      {/* Success Summary Card */}
      <div className="mb-6 flex flex-col justify-between gap-6 rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6 lg:flex-row lg:items-center">
        
        <div className="flex items-center gap-5">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[rgba(25,226,143,0.1)] border border-[#19E28F]/20">
            <CheckCircle className="h-7 w-7 text-[#19E28F]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-white">Escaneamento finalizado com sucesso</h2>
            <p className="mt-0.5 text-[13px] text-[#A1AFBF]">Todas as etapas foram concluídas e os leads foram coletados.</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 w-[200px] sm:w-[300px] rounded-full bg-[#1A2734]">
                <div className="h-full w-full rounded-full bg-[#19E28F] shadow-[0_0_10px_#19E28F]" />
              </div>
              <span className="text-[11px] font-bold text-[#A1AFBF]">100% concluído</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 sm:grid-cols-4 lg:gap-x-10 pl-0 lg:pl-8 lg:border-l border-[#1B2B3A]">
          {[
            { label: "Leads encontrados", value: "10", icon: Users },
            { label: "Tempo da busca", value: "02:14", icon: Clock },
            { label: "Score médio", value: "48", icon: Star },
            { label: "Contatos válidos", value: "7", icon: ShieldCheck },
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
                <h3 className="font-serif text-[18px] font-bold text-white">Resultados encontrados</h3>
                <p className="text-[12px] text-[#A1AFBF]">10 leads coletados</p>
              </div>
            </div>
            
            <button className="flex h-[36px] items-center gap-2 rounded-lg border border-[#223345] bg-[#0B1118] px-4 text-[12px] font-medium text-[#F5F7FA] hover:bg-[#101A24]">
              Ordenar por: Score (maior)
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#0A1118] text-[11px] uppercase tracking-wider text-[#708090]">
                <tr>
                  <th className="px-6 py-4 font-bold">Pos</th>
                  <th className="px-6 py-4 font-bold">Lead</th>
                  <th className="px-6 py-4 font-bold">Categoria</th>
                  <th className="px-6 py-4 font-bold">Contato</th>
                  <th className="px-6 py-4 font-bold">Presença Digital</th>
                  <th className="px-6 py-4 font-bold text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(70,110,145,0.18)]">
                {[
                  { pos: 1, name: "Grupo Imóveis", loc: "Niterói, RJ", avatar: { text: "GRUPO IMÓVEIS", bg: "#F5F7FA", textC: "#0A1118" }, cat: "Imobiliária", phone: "(21) 2622-0155", status: { l: "Possui site", ic: Globe, c: "#19E28F" }, score: { v: 75, c: "#19E28F", bg: "rgba(25,226,143,0.14)" } },
                  { pos: 2, name: "Luis Imóveis Barravento", loc: "Niterói, RJ", avatar: { text: "L", bg: "#1D4ED8", textC: "#FFFFFF", isLetter: true }, cat: "Imobiliária", phone: "(21) 2608-0489", status: { l: "Possui site", ic: Globe, c: "#19E28F" }, score: { v: 70, c: "#19E28F", bg: "rgba(25,226,143,0.14)" } },
                  { pos: 3, name: "Imobiliária Jacarandá", loc: "Niterói, RJ", avatar: { icon: "home", bg: "#F5F7FA", icC: "#FF4D4F" }, cat: "Imobiliária", phone: "(21) 3500-7923", status: { l: "Instagram", ic: Camera, c: "#D946EF" }, score: { v: 60, c: "#FFD21E", bg: "rgba(255,210,30,0.14)" } },
                  { pos: 4, name: "Henrique Santos Corretor", loc: "Niterói, RJ", avatar: { icon: "house", bg: "#D8B56D", icC: "#FFFFFF" }, cat: "Imobiliária", phone: "(21) 9696-1234", status: { l: "Possui site", ic: Globe, c: "#19E28F" }, score: { v: 55, c: "#FFD21E", bg: "rgba(255,210,30,0.14)" } },
                  { pos: 5, name: "Marchipp Imóveis", loc: "Niterói, RJ", avatar: { text: "M", bg: "#214859", textC: "#FFFFFF", isLetter: true }, cat: "Imobiliária", phone: "(21) 9725-6140", status: { l: "Instagram", ic: Camera, c: "#D946EF" }, score: { v: 50, c: "#FFD21E", bg: "rgba(255,210,30,0.14)" } },
                  { pos: 6, name: "SelfsDin", loc: "Niterói, RJ", avatar: { text: "S", bg: "#1B2A1F", textC: "#D8C98B", isLetter: true }, cat: "Imobiliária", phone: "(21) 3179-5700", status: { l: "Sem site", ic: XCircle, c: "#FF4D4F" }, score: { v: 35, c: "#FF9F1C", bg: "rgba(255,159,28,0.14)" } },
                ].map((row, i) => (
                  <tr key={i} className="group transition-colors hover:bg-[rgba(25,226,143,0.04)] h-[74px]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#19E28F] text-[11px] font-bold text-[#04110B]">
                        {row.pos}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full overflow-hidden text-[9px] font-bold leading-tight text-center px-1" style={{ backgroundColor: row.avatar.bg, color: row.avatar.textC || row.avatar.icC }}>
                          {row.avatar.isLetter ? (
                            <span className="text-[18px]">{row.avatar.text}</span>
                          ) : row.avatar.text ? (
                            row.avatar.text
                          ) : (
                            <MapPin className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-[#19E28F] transition-colors">{row.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-[#708090] mt-0.5">
                            <MapPin className="h-3 w-3" /> {row.loc}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#A1AFBF]">{row.cat}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-white">
                        {row.phone}
                        <MessageCircle className="h-3.5 w-3.5 text-[#19E28F]" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: row.status.c }}>
                        <row.status.ic className="h-4 w-4" />
                        {row.status.l}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-bold min-w-[60px]" style={{ backgroundColor: row.score.bg, color: row.score.c }}>
                        {row.score.v}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#1B2B3A] p-4 text-center">
            <button className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#19E28F] hover:underline">
              Ver todos os 10 leads <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Steps, Actions, Summary */}
        <div className="flex w-full shrink-0 flex-col gap-[20px] xl:w-[440px]">
          
          {/* Etapas da busca */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#19E28F]" />
                <h3 className="font-serif text-[17px] font-bold text-white">Etapas da busca</h3>
              </div>
              <span className="rounded-full bg-[rgba(25,226,143,0.12)] px-2.5 py-0.5 text-[10px] font-bold text-[#19E28F]">Concluído</span>
            </div>

            <div className="relative border-l border-[#19E28F]/30 ml-3 space-y-6">
              {[
                { title: "Busca no Google Maps", desc: "Termo pesquisado em Niterói, RJ", t: "00:00" },
                { title: "Captura de contatos", desc: "Telefones e dados coletados", t: "00:48" },
                { title: "Análise de presença digital", desc: "Sites e redes sociais verificados", t: "01:31" },
                { title: "Pontuação dos leads", desc: "Score de qualidade atribuído", t: "02:14" },
              ].map((step, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[11px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#19E28F] ring-4 ring-[#0C141D]">
                    <Check className="h-3 w-3 text-[#04110B] stroke-[3]" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-white">{step.title}</p>
                      <p className="mt-0.5 text-[11px] text-[#A1AFBF]">{step.desc}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[#708090]">{step.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas ações */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-[17px] font-bold text-white">
              <Zap className="h-5 w-5 text-[#19E28F]" /> Próximas ações
            </h3>
            <div className="flex flex-col gap-3">
              <button className="flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#19E28F,#11C777)] px-6 text-[14px] font-bold text-[#04110B] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(25,226,143,0.3)]">
                Ver Leads Coletados <ArrowRight className="h-4 w-4" />
              </button>
              <button className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#223345] bg-[#0B1118] px-6 text-[14px] font-bold text-[#F5F7FA] transition-colors hover:bg-[#101A24]">
                <Search className="h-4 w-4" /> Iniciar Nova Busca
              </button>
            </div>
          </div>

          {/* Resumo inteligente */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <h3 className="mb-5 flex items-center gap-2 font-serif text-[17px] font-bold text-white">
              <PieChart className="h-5 w-5 text-[#19E28F]" /> Resumo inteligente
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { l: "Leads com site", v: 4, ic: Globe, c: "#19E28F", bg: "rgba(25,226,143,0.06)" },
                { l: "Leads sem site", v: 3, ic: XCircle, c: "#FF4D4F", bg: "rgba(255,77,79,0.06)" },
                { l: "Leads com Instagram", v: 2, ic: Camera, c: "#D946EF", bg: "rgba(217,70,239,0.06)" },
                { l: "Leads com score ≥ 50", v: 5, ic: Star, c: "#FFD21E", bg: "rgba(255,210,30,0.06)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[12px] border border-[#1B2B3A] bg-[#081018] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: item.bg }}>
                    <item.ic className="h-4 w-4" style={{ color: item.c }} />
                  </div>
                  <div>
                    <p className="font-outfit text-[18px] font-bold leading-none text-white">{item.v}</p>
                    <p className="mt-1 text-[10px] text-[#A1AFBF] leading-tight">{item.l}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 text-[12px] text-[#FFD21E] bg-[rgba(255,210,30,0.06)] p-3 rounded-lg border border-[#FFD21E]/20">
              <Zap className="h-4 w-4 shrink-0" />
              <p>Melhores oportunidades acima de score 50.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
