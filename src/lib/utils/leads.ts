import { WebsiteType, ScoreLabel } from "@/generated/client/client";

export function classifyWebsite(url?: string): WebsiteType {
  if (!url) return "NONE";

  const normalized = url.toLowerCase().trim();

  if (normalized.includes("instagram.com")) return "INSTAGRAM";
  if (normalized.includes("facebook.com")) return "FACEBOOK";
  if (normalized.includes("linktr.ee") || normalized.includes("linktree")) return "LINKTREE";
  if (normalized.includes("wa.me") || normalized.includes("whatsapp.com") || normalized.includes("whatsapp")) return "WHATSAPP";

  return "OWN_DOMAIN";
}
export function isRelevantCategory(category: string | undefined, niche: string): boolean {
  if (!category) return true;

  const normalizedCategory = category.toLowerCase().trim();

  // Blacklist de pontos de interesse e marcos geográficos (que poluem a busca)
  const blacklist = [
    "praia", "parque", "monumento", "igreja", "governo", "prefeitura",
    "escola pública", "convento", "local histórico", "atração turística",
    "mirante", "lagoa", "ilha", "museu", "teatro", "ponto de ônibus",
    "ponto de táxi", "estação", "aeroporto", "delegacia", "bombeiros",
    "hospital público", "condomínio", "edifício", "praça", "rua",
    "bairro", "cidade", "estado", "país", "cep", "cemitério"
  ];

  if (blacklist.some(word => normalizedCategory.includes(word))) {
    return false;
  }

  return true;
}

export interface LeadScoreResult {
  value: number;
  label: ScoreLabel;
  reason: string;
}

export function calculateLeadScore(
  lead: {
    website?: string;
    rating?: number;
    reviewCount?: number;
    phone?: string;
  },
  niche: string
): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  const websiteType = classifyWebsite(lead.website);

  // 1. Presença digital
  if (websiteType === "NONE") {
    score += 30;
    reasons.push("Não possui site cadastrado.");
  } else if (websiteType === "INSTAGRAM") {
    score += 25;
    reasons.push("Usa Instagram como presença digital principal.");
  } else if (websiteType === "FACEBOOK") {
    score += 20;
    reasons.push("Usa Facebook como site principal.");
  } else if (websiteType === "LINKTREE") {
    score += 15;
    reasons.push("Usa Linktree / agregador de links ao invés de site próprio.");
  } else {
    score += 10;
    reasons.push("Possui site ou domínio próprio.");
  }

  // 2. Relevância comercial
  if (lead.rating && lead.rating >= 4.5) {
    score += 15;
    reasons.push("Possui excelente avaliação no Google.");
  }

  if (lead.reviewCount && lead.reviewCount >= 100) {
    score += 20;
    reasons.push("Possui alto volume de avaliações (demanda local comprovada).");
  } else if (lead.reviewCount && lead.reviewCount >= 50) {
    score += 15;
    reasons.push("Possui volume relevante de avaliações.");
  } else if (lead.reviewCount && lead.reviewCount >= 20) {
    score += 10;
    reasons.push("Possui avaliações suficientes.");
  }

  // 3. Facilidade de contato
  if (lead.phone) {
    score += 15;
    reasons.push("Possui telefone disponível.");

    // Checar se o telefone se parece com celular no Brasil (ex: DDD + 9 dígitos, totalizando 11 dígitos, ou contendo o dígito 9 inicial)
    // Limpar caracteres não numéricos
    const cleanPhone = lead.phone.replace(/\D/g, "");
    // Celulares no Brasil têm 11 dígitos (incluindo DDD) e começam com o dígito 9 após o DDD, ex: 219xxxxxxxx
    const isMobile = cleanPhone.length === 11 && cleanPhone.substring(2, 3) === "9";
    if (isMobile) {
      score += 10;
      reasons.push("Telefone parece celular / WhatsApp.");
    }
  }

  // 4. Nichos Quentes
  const hotNiches = [
    "clínica de estética",
    "estética",
    "barbearia",
    "salão de beleza",
    "dentista",
    "odontologia",
    "imobiliária",
    "restaurante",
    "pet shop",
    "oficina",
    "academia",
    "clínica médica",
    "escola particular",
    "advogado",
    "advocacia",
    "contabilidade",
    "arquiteto",
    "arquitetura",
    "energia solar",
    "agência",
    "marketing",
    "consultoria",
    "corretor",
  ];

  if (hotNiches.some((item) => niche.toLowerCase().includes(item))) {
    score += 10;
    reasons.push("Nicho com alta propensão para compra de site.");
  }

  // Limitar pontuação máxima em 100
  score = Math.min(score, 100);

  // Classificar label
  let label: ScoreLabel = "COLD";
  if (score >= 70) label = "HOT";
  else if (score >= 40) label = "MEDIUM";

  return {
    value: score,
    label,
    reason: reasons.join(" "),
  };
}

export function generateApproachMessage(lead: {
  name: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  website?: string;
}): string {
  const websiteType = classifyWebsite(lead.website);
  const companyName = lead.name;
  const city = lead.city || "sua região";
  const rating = lead.rating ? lead.rating.toFixed(1) : "N/A";
  const reviews = lead.reviewCount || 0;

  if (websiteType === "NONE" || websiteType === "INSTAGRAM" || websiteType === "FACEBOOK" || websiteType === "LINKTREE") {
    // Abordagem para quem NÃO tem site próprio
    return `Oi, tudo bem?\n\nEncontrei a *${companyName}* pesquisando negócios locais em *${city}* e vi que vocês têm uma boa presença no Google, com *${reviews}* avaliações e nota *${rating}*.\n\nTambém percebi que vocês ainda não têm um site próprio profissional, ou usam apenas uma rede social como principal presença online.\n\nHoje, um site simples e bem construído poderia ajudar a passar mais confiança, apresentar melhor os serviços e facilitar o contato de novos clientes pelo WhatsApp.\n\nFiz uma ideia rápida de como isso poderia ficar para vocês.\n\nPosso te mandar?`;
  } else {
    // Abordagem para quem já tem site próprio
    return `Oi, tudo bem?\n\nEncontrei a *${companyName}* pesquisando negócios locais em *${city}* e vi que vocês já têm uma boa reputação no Google.\n\nTambém dei uma olhada na presença digital de vocês e acredito que existe espaço para melhorar a forma como os serviços são apresentados e como os clientes chegam até o WhatsApp.\n\nFiz uma ideia rápida de melhoria visual e comercial para vocês.\n\nPosso te mandar?`;
  }
}
