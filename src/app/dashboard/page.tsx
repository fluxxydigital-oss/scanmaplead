import Link from "next/link";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateFilter } from "@/components/dashboard/date-filter";
import { AcquisitionChart, FunnelChart } from "@/components/dashboard/dashboard-charts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Flame,
  MessageSquare,
  ArrowRight,
  Sparkles,
  DollarSign,
  Lightbulb,
  Clock
} from "lucide-react";

export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await getMockUser();

  // Filtro de tempo
  const params = await searchParams;
  const daysFilter = params.days ? parseInt(params.days) : 30;
  const now = new Date();
  
  let dateFilter = {};
  let startDate = new Date(0); // Para "Todo o período"
  
  if (daysFilter && !isNaN(daysFilter)) {
    startDate = startOfDay(subDays(now, daysFilter));
    dateFilter = {
      createdAt: {
        gte: startDate,
      },
    };
  }

  // Métricas principais do período
  const totalLeads = await db.lead.count({ 
    where: { userId: user.id, ...dateFilter } 
  });
  
  const hotLeads = await db.lead.count({
    where: { userId: user.id, scoreLabel: "HOT", ...dateFilter },
  });

  const contactedLeads = await db.lead.count({
    where: {
      userId: user.id,
      crmStatus: { in: ["CONTACTED", "REPLIED", "MEETING", "CLOSED"] },
      ...dateFilter
    },
  });

  const repliedLeads = await db.lead.count({
    where: { userId: user.id, crmStatus: "REPLIED", ...dateFilter },
  });

  const meetingLeads = await db.lead.count({
    where: { userId: user.id, crmStatus: "MEETING", ...dateFilter },
  });

  const closedLeads = await db.lead.count({
    where: { userId: user.id, crmStatus: "CLOSED", ...dateFilter },
  });

  // Receita Projetada (soma de dealValue das negociações)
  const pipelineLeads = await db.lead.findMany({
    where: { 
      userId: user.id, 
      crmStatus: { in: ["MEETING", "REPLIED", "CLOSED"] },
      ...dateFilter 
    },
    select: { dealValue: true }
  });

  const projectedRevenue = pipelineLeads.reduce((acc, lead) => acc + (lead.dealValue || 0), 0);

  // Escaneamentos recentes
  const recentSearches = await db.search.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Insights Dinâmicos (Lógica básica)
  const insights = [];
  const uncontactedHotLeads = await db.lead.count({
    where: { userId: user.id, scoreLabel: "HOT", crmStatus: "NEW" }
  });
  
  if (uncontactedHotLeads > 0) {
    insights.push({
      type: "action",
      text: `Você tem ${uncontactedHotLeads} leads QUENTES parados no Funil esperando contato. Inicie a prospecção agora!`,
    });
  } else {
    insights.push({
      type: "tip",
      text: "Nenhuma oportunidade quente parada! Continue realizando novas buscas para alimentar seu pipeline.",
    });
  }

  // Gráfico de Evolução (Daily Leads)
  let dailyData: any[] = [];
  if (daysFilter && !isNaN(daysFilter)) {
    // Busca agrupada do Prisma
    const leadsByDate = await db.lead.groupBy({
      by: ['createdAt'],
      where: { userId: user.id, ...dateFilter },
      _count: { id: true }
    });

    // Criar um mapa de datas para preencher dias vazios
    const dateMap = new Map();
    const interval = eachDayOfInterval({ start: startDate, end: now });
    
    interval.forEach(day => {
      dateMap.set(format(day, 'yyyy-MM-dd'), 0);
    });

    leadsByDate.forEach(lead => {
      const dateKey = format(lead.createdAt, 'yyyy-MM-dd');
      if (dateMap.has(dateKey)) {
        dateMap.set(dateKey, dateMap.get(dateKey) + lead._count.id);
      }
    });

    dailyData = Array.from(dateMap.entries()).map(([dateStr, total]) => ({
      date: format(new Date(dateStr + 'T00:00:00'), 'dd MMM', { locale: ptBR }),
      total
    }));
  }

  // Gráfico de Funil
  const funnelData = [
    { name: "Qualificados", value: hotLeads, color: "#1A2B3A" },
    { name: "Abordados", value: contactedLeads, color: "#2F8CFF" },
    { name: "Em Negociação", value: meetingLeads + repliedLeads, color: "#FFB800" },
    { name: "Fechados", value: closedLeads, color: "#19E28F" },
  ];

  const getSearchStatusBadge = (status: string) => {
    switch (status) {
      case "FINISHED": return <Badge variant="secondary" className="bg-[#19E28F]/10 text-[#19E28F] border-[#19E28F]/20 text-[10px] py-0 px-1.5">Finalizada</Badge>;
      case "ERROR": return <Badge variant="secondary" className="bg-[#FF5A52]/10 text-[#FF5A52] border-[#FF5A52]/20 text-[10px] py-0 px-1.5">Erro</Badge>;
      case "CANCELLED": return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-[10px] py-0 px-1.5">Cancelada</Badge>;
      default: return <Badge variant="secondary" className="bg-[#2F8CFF]/10 text-[#2F8CFF] border-[#2F8CFF]/20 animate-pulse text-[10px] py-0 px-1.5">Em análise</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 px-6 py-4 overflow-y-auto">
      {/* 1. Header & Hero */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-outfit font-bold text-white">Painel Geral</h1>
        <DateFilter />
      </div>

      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0D1620] via-[#0A1017] to-[#05080D] border border-[#1A2B3A] p-6 flex flex-row items-center justify-between shadow-[0_4px_30px_rgba(5,8,13,0.5)] shrink-0">
        <div className="space-y-2 max-w-xl z-10">
          <Badge className="bg-[#19E28F]/10 text-[#19E28F] border border-[#19E28F]/20 px-2.5 py-1 font-bold text-xs uppercase flex items-center gap-1.5 w-fit">
            <Sparkles className="h-3 w-3 animate-pulse" />
            IA de Prospecção
          </Badge>
          <h2 className="text-2xl font-outfit font-bold text-white">
            Bem-vindo, <span className="text-[#19E28F]">{user.name?.split(' ')[0] || "Usuário"}</span>
          </h2>
          <p className="text-[#8FA1B5] text-sm leading-relaxed max-w-md">
            {uncontactedHotLeads > 0 
              ? `Você tem ${uncontactedHotLeads} Oportunidades Quentes aguardando contato no seu Pipeline.`
              : "Seu pipeline está limpo. Realize novas buscas para gerar mais oportunidades."}
          </p>
          {uncontactedHotLeads > 0 && (
            <div className="pt-2">
              <Link href="/pipeline">
                <Button className="bg-[#19E28F] text-[#04110B] hover:bg-[#14B874] text-xs font-bold rounded-xl h-9 px-4">
                  Ir para o Pipeline <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 w-64 h-64 rounded-full bg-[#19E28F]/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 rounded-full bg-[#2F8CFF]/5 blur-[80px] pointer-events-none" />
      </div>

      {/* 2. KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
        <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8FA1B5]">Leads Encontrados</span>
              <Users className="h-4 w-4 text-[#8FA1B5]" />
            </div>
            <div className="text-2xl font-outfit font-extrabold text-white">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8FA1B5]">Oportunidades Quentes</span>
              <Flame className="h-4 w-4 text-[#FF5A52]" />
            </div>
            <div className="text-2xl font-outfit font-extrabold text-[#FF5A52]">{hotLeads}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8FA1B5]">Taxa de Resposta</span>
              <MessageSquare className="h-4 w-4 text-[#2F8CFF]" />
            </div>
            <div className="text-2xl font-outfit font-extrabold text-white">
              {contactedLeads > 0 ? `${Math.round((repliedLeads / contactedLeads) * 100)}%` : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0A1017] border-[#19E28F]/20 rounded-[18px] shadow-[0_0_15px_rgba(25,226,143,0.05)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#19E28F]/5 to-transparent pointer-events-none" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#19E28F]">Receita Projetada</span>
              <DollarSign className="h-4 w-4 text-[#19E28F]" />
            </div>
            <div className="text-2xl font-outfit font-extrabold text-[#19E28F]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Charts & Analytics */}
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-3">
        
        {/* Esquerda: Gráfico de Evolução e Tarefas Recentes */}
        <div className="md:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px]">
            <CardHeader className="py-4 px-5 border-b border-[#1A2B3A]">
              <CardTitle className="text-sm font-outfit text-white">Cadência de Captação</CardTitle>
            </CardHeader>
            <CardContent className="px-1 py-0">
              {dailyData.length > 0 ? (
                <AcquisitionChart data={dailyData} />
              ) : (
                <div className="flex items-center justify-center text-xs text-[#8FA1B5]" style={{ height: 250 }}>
                  Selecione um período nos filtros para ver o gráfico.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px] flex-1 flex flex-col min-h-[300px]">
            <CardHeader className="py-4 px-5 border-b border-[#1A2B3A] flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-sm font-outfit text-white">Últimos Escaneamentos</CardTitle>
              <Link href="/leads">
                <span className="text-xs text-[#2F8CFF] hover:underline cursor-pointer">Ver todos</span>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1A2B3A] hover:bg-transparent">
                    <TableHead className="text-[#8FA1B5] text-xs h-9">Nicho</TableHead>
                    <TableHead className="text-[#8FA1B5] text-xs h-9">Local</TableHead>
                    <TableHead className="text-[#8FA1B5] text-xs h-9">Status</TableHead>
                    <TableHead className="text-[#8FA1B5] text-xs h-9 text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSearches.map((s) => (
                    <TableRow key={s.id} className="border-[#1A2B3A] hover:bg-transparent">
                      <TableCell className="text-white text-xs font-bold py-3">{s.niche}</TableCell>
                      <TableCell className="text-[#8FA1B5] text-xs py-3">{s.city}</TableCell>
                      <TableCell className="py-3">{getSearchStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-right py-3">
                        <Link href={`/searches/${s.id}/progress`}>
                          <Button size="sm" variant="ghost" className="text-xs text-[#2F8CFF] h-7 px-2 hover:bg-[#2F8CFF]/10">
                            Acompanhar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Direita: Funil e Insights */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px]">
            <CardHeader className="py-4 px-5 border-b border-[#1A2B3A]">
              <CardTitle className="text-sm font-outfit text-white">Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent className="px-1 py-0">
              <FunnelChart data={funnelData} />
            </CardContent>
          </Card>

          <Card className="bg-[#0A1017] border-[#1A2B3A] rounded-[18px] flex-1 flex flex-col min-h-[300px]">
            <CardHeader className="py-4 px-5 border-b border-[#1A2B3A] flex flex-row items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#FFB800]" />
              <CardTitle className="text-sm font-outfit text-white">Insights Dinâmicos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
              {insights.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-xl border space-y-1.5 ${
                  insight.type === 'action' 
                    ? 'bg-[#FF5A52]/5 border-[#FF5A52]/20' 
                    : 'bg-[#19E28F]/5 border-[#19E28F]/20'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold ${
                    insight.type === 'action' ? 'text-[#FF5A52]' : 'text-[#19E28F]'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    {insight.type === 'action' ? 'Ação Recomendada' : 'Boa Notícia'}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
