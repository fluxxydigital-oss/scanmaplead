"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle2,
  Clock,
  Crosshair,
  Database,
  Info,
  Lightbulb,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchFormSchema = z.object({
  niche: z.string().min(2, "O nicho deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  maxLeads: z.string(),
  minScore: z.string().optional(),
  digitalStatus: z.string().optional(),
  orderBy: z.string().optional(),
  platform: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const fieldClass =
  "h-[38px] w-full rounded-[8px] border-[#263847] bg-[#081018]/95 px-4 text-[13px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-[#7C8998] focus-visible:border-[#12D889] focus-visible:ring-0";

const selectTriggerClass =
  "h-[38px] w-full rounded-[8px] border-[#263847] bg-[#081018]/95 px-4 text-[13px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-[#12D889]";

const panelClass =
  "rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,rgba(13,22,32,0.94),rgba(8,16,24,0.96))] py-0 shadow-[0_18px_55px_rgba(0,0,0,0.34)]";

export default function NewSearchPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      niche: "",
      state: "",
      city: "",
      neighborhood: "",
      maxLeads: "20",
      minScore: "todos",
      digitalStatus: "todos",
      orderBy: "score",
      platform: "MAPS",
    },
  });

  const niche = watch("niche");
  const state = watch("state");
  const maxLeads = watch("maxLeads");
  const neighborhood = watch("neighborhood");
  const minScore = watch("minScore");
  const digitalStatus = watch("digitalStatus");
  const orderBy = watch("orderBy");
  const platform = watch("platform");

  const updateValue = (field: keyof SearchFormValues) => (value: string | null) => {
    if (value !== null) {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onSubmit = async (data: SearchFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: data.niche,
          state: data.state,
          city: data.city || undefined,
          neighborhood: data.neighborhood || undefined,
          maxLeads: parseInt(data.maxLeads, 10),
          minScore: data.minScore !== "todos" ? data.minScore : undefined,
          digitalStatus: data.digitalStatus !== "todos" ? data.digitalStatus : undefined,
          orderBy: data.orderBy,
          platform: data.platform,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.activeSearchId) {
          setError(
            `Você já possui uma busca em andamento. [Clique aqui para acompanhá-la](/searches/${result.activeSearchId}/progress)`
          );
        } else {
          setError(result.error || "Erro ao iniciar o escaneamento.");
        }
        setLoading(false);
        return;
      }

      router.push(`/searches/${result.id}/progress`);
    } catch (err) {
      console.error(err);
      setError("Erro de rede ao tentar conectar com a API.");
      setLoading(false);
    }
  };

  const handleQuickSearch = (chipText: string) => {
    if (chipText.includes("odontológicas")) {
      setValue("niche", "Clínicas odontológicas");
      setValue("state", "São Paulo");
      setValue("city", "São Paulo");
      setValue("neighborhood", "Jardins");
    } else if (chipText.includes("Nutricionistas")) {
      setValue("niche", "Nutricionistas");
      setValue("state", "Ceará");
      setValue("city", "Fortaleza");
      setValue("neighborhood", "Aldeota");
    } else if (chipText.includes("Salões de beleza")) {
      setValue("niche", "Salão de beleza");
      setValue("state", "Rio de Janeiro");
      setValue("city", "Rio de Janeiro");
      setValue("neighborhood", "Ipanema");
    } else if (chipText.includes("Academias")) {
      setValue("niche", "Academias");
      setValue("state", "Minas Gerais");
      setValue("city", "Belo Horizonte");
      setValue("neighborhood", "Savassi");
    }
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#05090D] pb-3">
      <section className="relative h-[146px] shrink-0 overflow-hidden border-b border-[#162432] px-10 py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_77%_38%,rgba(18,216,137,0.22),transparent_22%),linear-gradient(90deg,#05090D_0%,#05090D_38%,rgba(6,19,22,0.94)_67%,rgba(5,9,13,0.98)_100%)]" />
        <div className="absolute right-0 top-0 h-full w-[56%] opacity-90">
          <svg className="h-full w-full" viewBox="0 0 760 210" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="heroGlow" cx="0" cy="0" r="1" gradientTransform="matrix(170 0 0 170 520 82)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#12D889" stopOpacity=".58" />
                <stop offset="1" stopColor="#12D889" stopOpacity="0" />
              </radialGradient>
              <filter id="pinGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="760" height="210" fill="url(#heroGlow)" />
            {Array.from({ length: 11 }).map((_, index) => (
              <path
                key={`grid-h-${index}`}
                d={`M35 ${28 + index * 15} C170 ${index * 9} 314 ${index * 18} 720 ${20 + index * 15}`}
                stroke="#12D889"
                strokeOpacity=".09"
              />
            ))}
            {Array.from({ length: 13 }).map((_, index) => (
              <path
                key={`grid-v-${index}`}
                d={`M${80 + index * 48} 210 C${130 + index * 28} 150 ${180 + index * 21} 66 ${245 + index * 13} 0`}
                stroke="#12D889"
                strokeOpacity=".09"
              />
            ))}
            <path d="M102 132 L186 110 L274 126 L348 84 L432 104 L526 68 L650 94" stroke="#12D889" strokeOpacity=".35" />
            {[102, 186, 274, 348, 432, 526, 650].map((x, index) => (
              <circle key={x} cx={x} cy={[132, 110, 126, 84, 104, 68, 94][index]} r={3} fill="#12D889" opacity=".8" />
            ))}
            <g transform="translate(466 54)" filter="url(#pinGlow)">
              <ellipse cx="48" cy="92" rx="76" ry="28" stroke="#12D889" strokeOpacity=".45" />
              <ellipse cx="48" cy="92" rx="50" ry="18" stroke="#12D889" strokeOpacity=".6" />
              <path d="M48 0C22 0 0 21 0 48c0 38 48 84 48 84s48-46 48-84C96 21 74 0 48 0Z" fill="url(#heroGlow)" stroke="#12D889" strokeWidth="3" />
              <circle cx="48" cy="47" r="22" fill="#081018" stroke="#64F5C2" strokeWidth="7" />
            </g>
            <path d="M610 0 C690 35 720 105 740 210" stroke="#12D889" strokeOpacity=".28" />
            <path d="M640 0 C718 45 746 116 760 198" stroke="#12D889" strokeOpacity=".22" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[560px]">
          <h1 className="font-serif text-[38px] font-bold leading-none text-white">Nova Busca</h1>
          <p className="mt-3 max-w-[520px] text-[15px] leading-6 text-[#C3CCD8]">
            Configure os parâmetros da sua busca no Google Maps e encontre negócios com alto potencial de oportunidade.
          </p>
        </div>
      </section>

      <div className="relative z-10 flex flex-1 flex-col gap-[14px] px-10 py-[14px]">
        <Card className={`${panelClass} min-h-[100px] shrink-0`}>
          <CardContent className="grid h-full grid-cols-1 items-center gap-4 px-6 py-3 min-[1400px]:grid-cols-[minmax(360px,1fr)_1px_1.42fr] min-[1400px]:gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#12D889]/18 text-[#12D889] shadow-[0_0_30px_rgba(18,216,137,0.12)]">
                <Target className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h2 className="font-outfit text-[17px] font-bold text-white">Como funciona?</h2>
                <p className="mt-1.5 max-w-[520px] text-[12px] leading-[18px] text-[#B7C1CD]">
                  Nosso sistema utiliza automação inteligente para escanear o Google Maps, coletar dados públicos e identificar oportunidades de negócio para você.
                </p>
              </div>
            </div>

            <div className="hidden h-[62px] w-px bg-[#263847] min-[1400px]:block" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Busca Inteligente",
                  text: "Varredura automática no Google Maps",
                  icon: Search,
                },
                {
                  title: "Dados Relevantes",
                  text: "Coleta de informações públicas do negócio",
                  icon: Database,
                },
                {
                  title: "Leads Qualificados",
                  text: "Score de oportunidade e análise de potencial",
                  icon: TrendingUp,
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-center gap-3">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] border border-[#263847] bg-[#081018] text-[#12D889]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-white">{feature.title}</h3>
                      <p className="mt-1 text-[11px] leading-4 text-[#9AA8B8]">{feature.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid flex-1 gap-[16px] min-[1400px]:grid-cols-[minmax(620px,1fr)_480px]">
          <Card className={`${panelClass}`}>
            <CardContent className="h-full p-5">
              <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <Crosshair className="h-5 w-5 text-[#12D889]" />
                  <h2 className="font-serif text-[23px] font-bold text-white">Parâmetros da Busca</h2>
                </div>

                {error && (
                  <div className="mb-4 rounded-[10px] border border-[#FF4D4F]/25 bg-[#FF4D4F]/10 p-3 text-xs leading-relaxed text-[#FF8A8C]">
                    {error.includes("]/progress") ? (
                      <span>
                        Você já possui uma busca em andamento.{" "}
                        <Link
                          href={error.match(/\/searches\/[a-zA-Z0-9-]+\/progress/)?.[0] || "#"}
                          className="font-bold text-white underline hover:text-[#12D889]"
                        >
                          Clique aqui para acompanhá-la
                        </Link>
                        .
                      </span>
                    ) : (
                      <span>{error}</span>
                    )}
                  </div>
                )}

                <div className="mb-4 space-y-1.5">
                  <Label className="text-[13px] font-bold text-white">Fonte de Dados</Label>
                  <Select value={platform} onValueChange={updateValue("platform")}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Google Maps" />
                    </SelectTrigger>
                    <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                      <SelectItem value="MAPS">Google Maps (Empresas Locais)</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram (Profissionais e Serviços)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">Nicho de Atividade</Label>
                    <Select value={niche} onValueChange={updateValue("niche")}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Ex: Clínica odontológica, Restaurante..." />
                      </SelectTrigger>
                      <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Saúde e Bem-estar</SelectLabel>
                          <SelectItem value="Dentista">Dentista</SelectItem>
                          <SelectItem value="Clínicas odontológicas">Clínicas odontológicas</SelectItem>
                          <SelectItem value="Clínicas médicas">Clínicas médicas</SelectItem>
                          <SelectItem value="Clínicas de estética">Clínicas de estética</SelectItem>
                          <SelectItem value="Dermatologistas">Dermatologistas</SelectItem>
                          <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                          <SelectItem value="Psicólogos">Psicólogos</SelectItem>
                          <SelectItem value="Nutricionistas">Nutricionistas</SelectItem>
                          <SelectItem value="Ginecologistas">Ginecologistas</SelectItem>
                          <SelectItem value="Pediatras">Pediatras</SelectItem>
                          <SelectItem value="Ortopedistas">Ortopedistas</SelectItem>
                          <SelectItem value="Oftalmologistas">Oftalmologistas</SelectItem>
                          <SelectItem value="Cardiologistas">Cardiologistas</SelectItem>
                          <SelectItem value="Terapeutas holísticos">Terapeutas holísticos</SelectItem>
                          <SelectItem value="Acupuntura">Acupuntura</SelectItem>
                          <SelectItem value="Estúdios de pilates">Estúdios de pilates</SelectItem>
                          <SelectItem value="Academias">Academias</SelectItem>
                          <SelectItem value="Estúdios de yoga">Estúdios de yoga</SelectItem>
                          <SelectItem value="Personal trainers">Personal trainers</SelectItem>
                          <SelectItem value="Boxes de crossfit">Boxes de crossfit</SelectItem>
                          <SelectItem value="Spa & day spa">Spa & day spa</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Beleza e cuidados pessoais</SelectLabel>
                          <SelectItem value="Salões de beleza">Salões de beleza</SelectItem>
                          <SelectItem value="Barbearias">Barbearias</SelectItem>
                          <SelectItem value="Manicure e pedicure">Manicure e pedicure</SelectItem>
                          <SelectItem value="Depilação a laser">Depilação a laser</SelectItem>
                          <SelectItem value="Micropigmentação">Micropigmentação</SelectItem>
                          <SelectItem value="Extensão de cílios">Extensão de cílios</SelectItem>
                          <SelectItem value="Cabeleireiros">Cabeleireiros</SelectItem>
                          <SelectItem value="Design de sobrancelhas">Design de sobrancelhas</SelectItem>
                          <SelectItem value="Harmonização facial">Harmonização facial</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Automotivo e serviços técnicos</SelectLabel>
                          <SelectItem value="Oficinas mecânicas">Oficinas mecânicas</SelectItem>
                          <SelectItem value="Auto centers">Auto centers</SelectItem>
                          <SelectItem value="Lava-rápido">Lava-rápido</SelectItem>
                          <SelectItem value="Funilaria e pintura">Funilaria e pintura</SelectItem>
                          <SelectItem value="Auto elétrica">Auto elétrica</SelectItem>
                          <SelectItem value="Borracharia">Borracharia</SelectItem>
                          <SelectItem value="Dedetizadoras">Dedetizadoras</SelectItem>
                          <SelectItem value="Climatização e ar condicionado">Climatização e ar condicionado</SelectItem>
                          <SelectItem value="Assistência técnica celular">Assistência técnica celular</SelectItem>
                          <SelectItem value="Assistência eletrodomésticos">Assistência eletrodomésticos</SelectItem>
                          <SelectItem value="Chaveiros">Chaveiros</SelectItem>
                          <SelectItem value="Vidraçarias">Vidraçarias</SelectItem>
                          <SelectItem value="Marmorarias">Marmorarias</SelectItem>
                          <SelectItem value="Marcenarias">Marcenarias</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Casa e serviços domésticos</SelectLabel>
                          <SelectItem value="Encanadores">Encanadores</SelectItem>
                          <SelectItem value="Eletricistas">Eletricistas</SelectItem>
                          <SelectItem value="Pintores residenciais">Pintores residenciais</SelectItem>
                          <SelectItem value="Serralherias">Serralherias</SelectItem>
                          <SelectItem value="Jardinagem e paisagismo">Jardinagem e paisagismo</SelectItem>
                          <SelectItem value="Limpeza pós-obra">Limpeza pós-obra</SelectItem>
                          <SelectItem value="Diaristas">Diaristas</SelectItem>
                          <SelectItem value="Lavanderias">Lavanderias</SelectItem>
                          <SelectItem value="Mudanças e fretes">Mudanças e fretes</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Pet e veterinária</SelectLabel>
                          <SelectItem value="Pet shops">Pet shops</SelectItem>
                          <SelectItem value="Clínicas veterinárias">Clínicas veterinárias</SelectItem>
                          <SelectItem value="Banho e tosa">Banho e tosa</SelectItem>
                          <SelectItem value="Hotel para cães">Hotel para cães</SelectItem>
                          <SelectItem value="Adestramento canino">Adestramento canino</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Alto ticket e B2B</SelectLabel>
                          <SelectItem value="Advogados">Advogados</SelectItem>
                          <SelectItem value="Contabilidade">Contabilidade</SelectItem>
                          <SelectItem value="Corretoras de seguros">Corretoras de seguros</SelectItem>
                          <SelectItem value="Imobiliárias">Imobiliárias</SelectItem>
                          <SelectItem value="Corretores de imóveis">Corretores de imóveis</SelectItem>
                          <SelectItem value="Consultoras">Consultoras</SelectItem>
                          <SelectItem value="Arquitetos">Arquitetos</SelectItem>
                          <SelectItem value="Designers de interiores">Designers de interiores</SelectItem>
                          <SelectItem value="Energia solar">Energia solar</SelectItem>
                          <SelectItem value="Corretores de plano de saúde">Corretores de plano de saúde</SelectItem>
                          <SelectItem value="Agências de marketing">Agências de marketing</SelectItem>
                          <SelectItem value="Consultorias empresariais">Consultorias empresariais</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Educação e cursos</SelectLabel>
                          <SelectItem value="Escolas de idiomas">Escolas de idiomas</SelectItem>
                          <SelectItem value="Cursos profissionalizantes">Cursos profissionalizantes</SelectItem>
                          <SelectItem value="Cursos preparatórios">Cursos preparatórios</SelectItem>
                          <SelectItem value="Autoescolas">Autoescolas</SelectItem>
                          <SelectItem value="Escolas de música">Escolas de música</SelectItem>
                          <SelectItem value="Escolas de dança">Escolas de dança</SelectItem>
                          <SelectItem value="Escolas infantis">Escolas infantis</SelectItem>
                          <SelectItem value="Reforço escolar">Reforço escolar</SelectItem>
                          <SelectItem value="Psicopedagogos">Psicopedagogos</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Eventos e fotografia</SelectLabel>
                          <SelectItem value="Buffets e eventos">Buffets e eventos</SelectItem>
                          <SelectItem value="Fotógrafos">Fotógrafos</SelectItem>
                          <SelectItem value="Filmagem de eventos">Filmagem de eventos</SelectItem>
                          <SelectItem value="Decoração de eventos">Decoração de eventos</SelectItem>
                          <SelectItem value="DJs">DJs</SelectItem>
                          <SelectItem value="Cerimonialistas">Cerimonialistas</SelectItem>
                          <SelectItem value="Banda e música ao vivo">Banda e música ao vivo</SelectItem>
                          <SelectItem value="Locação de salões">Locação de salões</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Gastronomia e hospitalidade</SelectLabel>
                          <SelectItem value="Restaurantes">Restaurantes</SelectItem>
                          <SelectItem value="Pizzarias">Pizzarias</SelectItem>
                          <SelectItem value="Hamburguerias">Hamburguerias</SelectItem>
                          <SelectItem value="Lanchonetes">Lanchonetes</SelectItem>
                          <SelectItem value="Cafeterias">Cafeterias</SelectItem>
                          <SelectItem value="Confeitarias">Confeitarias</SelectItem>
                          <SelectItem value="Padarias">Padarias</SelectItem>
                          <SelectItem value="Sorveterias">Sorveterias</SelectItem>
                          <SelectItem value="Açaí e açaiteria">Açaí e açaiteria</SelectItem>
                          <SelectItem value="Pousadas">Pousadas</SelectItem>
                          <SelectItem value="Hotéis">Hotéis</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[#12D889] font-bold">Comércio e varejo</SelectLabel>
                          <SelectItem value="Lojas de roupas">Lojas de roupas</SelectItem>
                          <SelectItem value="Lojas de calçados">Lojas de calçados</SelectItem>
                          <SelectItem value="Óticas">Óticas</SelectItem>
                          <SelectItem value="Joalherias">Joalherias</SelectItem>
                          <SelectItem value="Floriculturas">Floriculturas</SelectItem>
                          <SelectItem value="Papelarias">Papelarias</SelectItem>
                          <SelectItem value="Lojas de material de construção">Lojas de material de construção</SelectItem>
                          <SelectItem value="Lojas de móveis">Lojas de móveis</SelectItem>
                          <SelectItem value="Lojas de bebidas">Lojas de bebidas</SelectItem>
                          <SelectItem value="Supermercados de bairro">Supermercados de bairro</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.niche && <p className="text-[10px] text-[#FF4D4F]">{errors.niche.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">
                      Estado <span className="text-[#FF4D4F]">*</span>
                    </Label>
                    <Select value={state} onValueChange={updateValue("state")}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Ex: São Paulo" />
                      </SelectTrigger>
                      <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                        <SelectItem value="Acre">Acre</SelectItem>
                        <SelectItem value="Alagoas">Alagoas</SelectItem>
                        <SelectItem value="Amapá">Amapá</SelectItem>
                        <SelectItem value="Amazonas">Amazonas</SelectItem>
                        <SelectItem value="Bahia">Bahia</SelectItem>
                        <SelectItem value="Ceará">Ceará</SelectItem>
                        <SelectItem value="Distrito Federal">Distrito Federal</SelectItem>
                        <SelectItem value="Espírito Santo">Espírito Santo</SelectItem>
                        <SelectItem value="Goiás">Goiás</SelectItem>
                        <SelectItem value="Maranhão">Maranhão</SelectItem>
                        <SelectItem value="Mato Grosso">Mato Grosso</SelectItem>
                        <SelectItem value="Mato Grosso do Sul">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="Minas Gerais">Minas Gerais</SelectItem>
                        <SelectItem value="Pará">Pará</SelectItem>
                        <SelectItem value="Paraíba">Paraíba</SelectItem>
                        <SelectItem value="Paraná">Paraná</SelectItem>
                        <SelectItem value="Pernambuco">Pernambuco</SelectItem>
                        <SelectItem value="Piauí">Piauí</SelectItem>
                        <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                        <SelectItem value="Rio Grande do Norte">Rio Grande do Norte</SelectItem>
                        <SelectItem value="Rio Grande do Sul">Rio Grande do Sul</SelectItem>
                        <SelectItem value="Rondônia">Rondônia</SelectItem>
                        <SelectItem value="Roraima">Roraima</SelectItem>
                        <SelectItem value="Santa Catarina">Santa Catarina</SelectItem>
                        <SelectItem value="São Paulo">São Paulo</SelectItem>
                        <SelectItem value="Sergipe">Sergipe</SelectItem>
                        <SelectItem value="Tocantins">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-[10px] text-[#FF4D4F]">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">Cidade</Label>
                    <Input className={fieldClass} placeholder="Ex: Jundiaí, Centro, Tatuapé..." {...register("city")} />
                    {errors.city && <p className="text-[10px] text-[#FF4D4F]">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">Bairro (opcional)</Label>
                    <Input className={fieldClass} placeholder="Ex: Jardins, Centro, Tatuapé..." {...register("neighborhood")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">Quantidade de Leads</Label>
                    <Select value={maxLeads} onValueChange={updateValue("maxLeads")}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                      <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                        <SelectItem value="10">10 Leads</SelectItem>
                        <SelectItem value="20">20 Leads</SelectItem>
                        <SelectItem value="50">50 Leads</SelectItem>
                        <SelectItem value="100">100 Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-between text-[13px] font-bold text-white">
                      <span>Score mínimo</span>
                      <span title="Score mínimo de oportunidade">
                        <Info className="h-4 w-4 text-[#9AA8B8]" />
                      </span>
                    </Label>
                    <Select value={minScore} onValueChange={updateValue("minScore")}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Selecione o score mínimo" />
                      </SelectTrigger>
                      <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="<50">50 - Frio</SelectItem>
                        <SelectItem value="50">50 + Morno</SelectItem>
                        <SelectItem value="70">70 + Quente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {platform === "MAPS" && (
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-bold text-white">Status Digital</Label>
                      <Select value={digitalStatus} onValueChange={updateValue("digitalStatus")}>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="com-site">Com Site</SelectItem>
                          <SelectItem value="sem-site">Sem Site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-white">Ordenar por</Label>
                    <Select value={orderBy} onValueChange={updateValue("orderBy")}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Melhor Score" />
                      </SelectTrigger>
                      <SelectContent className="border-[#1B2B3A] bg-[#0D1620] text-white">
                        <SelectItem value="score">Melhor Score</SelectItem>
                        <SelectItem value="nota">Melhor Avaliação</SelectItem>
                        <SelectItem value="reviews">Mais Avaliados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-auto pt-5 flex flex-col gap-5">
                  <div className="flex min-h-[52px] items-center gap-3 rounded-[8px] border border-[#163A5F] bg-[#2F8CFF]/8 px-4 text-[13px] leading-5 text-[#B7C1CD]">
                    <Info className="h-5 w-5 shrink-0 text-[#2F8CFF]" />
                    <span>A busca pode levar alguns minutos dependendo da quantidade de resultados. Você poderá acompanhar o progresso em tempo real.</span>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset()}
                      className="h-[40px] w-[184px] rounded-[8px] border-[#2A3A4A] bg-[#0A1118] text-[13px] font-bold text-[#F5F7FA] hover:bg-[#0D1620] hover:text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Limpar campos
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-[40px] w-[280px] rounded-[8px] border-0 bg-[linear-gradient(90deg,#12D889,#0ABF78)] text-[13px] font-extrabold text-[#03110B] shadow-[0_0_24px_rgba(18,216,137,0.2)] hover:opacity-95"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando Varredura...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4 fill-[#03110B] stroke-[0]" />
                          Iniciar Varredura
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="flex flex-col gap-4">
            <Card className={`${panelClass}`}>
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-[#FFD21E]" />
                  <h3 className="font-serif text-[19px] font-bold text-white">Dicas para Melhores Resultados</h3>
                </div>
                <div className="space-y-4">
                  {[
                    "Use bairros em cidades grandes (ex: Moema, São Paulo).",
                    "Nichos específicos geram leads mais qualificados.",
                    "Score mínimo 70+ foca apenas nas oportunidades quentes.",
                    "Empresas 'Sem Site' são ótimas para venda de Landing Pages.",
                    "Alto ticket (Advogados, Imobiliárias) costumam fechar mais rápido.",
                    "Alta quantidade de avaliações = negócio com alto faturamento.",
                    "Selecione menos leads por vez (ex: 10 ou 20) para testes rápidos.",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-3 text-[13px] text-[#D5DDE7]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12D889]" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={`${panelClass}`}>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#12D889]" />
                    <h3 className="font-serif text-[18px] font-bold text-white">Histórico de Buscas Rápidas</h3>
                  </div>
                  <Link href="/leads">
                    <Button variant="outline" className="h-8 rounded-[8px] border-[#263847] bg-transparent px-4 text-xs text-[#D9E1EA] hover:bg-[#0D1620] hover:text-white">
                      Ver todas
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Clínicas odontológicas - SP",
                    "Nutricionistas - Fortaleza",
                    "Salões de beleza - RJ",
                    "Academias - Belo Horizonte",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickSearch(chip)}
                      className="h-[30px] rounded-full border border-[#2A3A4A] bg-[#081018]/70 px-3 text-left text-[12px] font-medium text-[#D5DDE7] transition hover:border-[#12D889] hover:text-white"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          </aside>
        </div>
      </div>
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
