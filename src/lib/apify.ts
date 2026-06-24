import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export interface ApifyScrapedLead {
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
}

export async function runGoogleMapsScraperApify(
  query: string,
  maxLeads: number,
  onLog?: (level: "INFO" | "WARNING" | "ERROR", message: string) => void
): Promise<ApifyScrapedLead[]> {
  const log = (level: "INFO" | "WARNING" | "ERROR", msg: string) => {
    if (onLog) onLog(level, msg);
    console.log(`[APIFY ${level}] ${msg}`);
  };

  const bufferMaxLeads = maxLeads * 3; // Margem de gordura de 3x

  log("INFO", `Iniciando extração via Apify para: "${query}" (Alvo: ${maxLeads}, Margem: ${bufferMaxLeads})`);

  // Input do Actor compass/crawler-google-places
  const input = {
    searchStringsArray: [query],
    maxCrawledPlacesPerSearch: bufferMaxLeads,
    language: "pt-BR",
    countryCode: "br",
  };

  try {
    log("INFO", "Despachando execução para a nuvem da Apify (compass/crawler-google-places)...");
    
    // Chama o Actor e aguarda a finalização (isso pode levar alguns minutos dependendo da quantidade)
    const run = await apifyClient.actor("compass/crawler-google-places").call(input);

    log("INFO", `Execução concluída. ID: ${run.id}. Baixando resultados...`);

    // Busca os itens do dataset gerado
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    log("INFO", `Dataset baixado. Total de leads brutos encontrados: ${items.length}`);

    // Mapeia os resultados para o nosso formato interno
    const mappedLeads: ApifyScrapedLead[] = items.map((item: any) => {
      return {
        name: item.title || item.name || "Sem Nome",
        category: item.categoryName || item.category || "Desconhecida",
        rating: item.totalScore || item.rating || null,
        reviewCount: item.reviewsCount || null,
        address: item.address || item.street || "",
        neighborhood: item.neighborhood || "",
        city: item.city || "",
        phone: item.phone || item.phoneUnformatted || "",
        website: item.website || "",
        mapsUrl: item.url || "",
        businessStatus: item.permanentlyClosed ? "Fechado" : "Aberto",
      };
    });

    return mappedLeads;
  } catch (error: any) {
    log("ERROR", `Falha na execução do Apify: ${error.message}`);
    throw error;
  }
}
