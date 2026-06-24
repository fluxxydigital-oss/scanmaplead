import db from "../db";
import { runGoogleMapsScraperApify } from "../apify";
import { calculateLeadScore, classifyWebsite, generateApproachMessage, isRelevantCategory } from "../utils/leads";

let isSearching = false;

export const startSearchWorker = () => {
  console.log("[SEARCH WORKER] Escutando novas buscas via Polling DB...");
  
  // Checa buscas pendentes a cada 5 segundos
  setInterval(async () => {
    if (isSearching) return; // Processar fila indiana

    try {
      const search = await db.search.findFirst({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" }
      });

      if (!search) return;

      isSearching = true;
      await processSearchJob(search.id);
    } catch (err) {
      console.error("[SEARCH WORKER] Erro no polling:", err);
    } finally {
      isSearching = false;
    }
  }, 5000);
};

async function processSearchJob(searchId: string) {
  console.log(`[SEARCH WORKER] Iniciando processamento do job para Search ID: ${searchId}`);
  
  const search = await db.search.findUnique({ where: { id: searchId } });
  if (!search) {
    console.error(`[SEARCH WORKER] Busca ${searchId} não encontrada no banco.`);
    return;
  }

  if (search.status === "CANCELLED" || search.status === "FINISHED" || search.status === "ERROR") {
    console.log(`[SEARCH WORKER] Job ignorado: A busca ${searchId} já está no status ${search.status}.`);
    return;
  }

  await db.search.update({
    where: { id: searchId },
    data: {
      status: "STARTING_BROWSER",
      startedAt: new Date(),
    },
  });

  await db.searchLog.create({
    data: {
      searchId,
      level: "INFO",
      message: "Scraper iniciando processo na nuvem...",
    },
  });

  try {
    const query = search.query;
    const maxLeads = search.maxLeads;

    const onProgress = async (current: number, total: number, message: string) => {
      await db.search.update({
        where: { id: searchId },
        data: {
          totalFound: total,
          totalSaved: current,
          status: "SAVING_LEADS",
        },
      });
    };

    const onLog = async (level: "INFO" | "WARNING" | "ERROR", message: string) => {
      await db.searchLog.create({
        data: {
          searchId,
          level,
          message,
        },
      });
    };

    await db.search.update({
      where: { id: searchId },
      data: { status: "SEARCHING_MAPS" },
    });

    const shouldCancel = async () => {
      const currentSearch = await db.search.findUnique({
        where: { id: searchId },
        select: { status: true },
      });
      return currentSearch?.status === "CANCELLED";
    };

    const filterCallback = (leadData: any) => {
      const scoreResult = calculateLeadScore(leadData, search.niche);
      const websiteType = classifyWebsite(leadData.website);
      
      if (!isRelevantCategory(leadData.category, search.niche)) return false;
      
      if (search.digitalStatus === "com-site" && websiteType !== "OWN_DOMAIN") return false;
      if (search.digitalStatus === "sem-site" && websiteType === "OWN_DOMAIN") return false;

      if (search.minScore) {
        if (search.minScore === "<50" && scoreResult.value >= 50) return false;
        if (search.minScore === "50" && scoreResult.value < 50) return false;
        if (search.minScore === "70" && scoreResult.value < 70) return false;
      }
      
      leadData._scoreResult = scoreResult;
      leadData._websiteType = websiteType;
      
      return true;
    };

    const onLeadSaved = async (leadData: any) => {
      const approachMessage = generateApproachMessage({
        name: leadData.name,
        city: leadData.city || search.city,
        rating: leadData.rating,
        reviewCount: leadData.reviewCount,
        website: leadData.website,
      });

      const addressKey = leadData.address || "Endereço Não Informado";
      
      await db.lead.upsert({
        where: {
          userId_name_address: {
            userId: search.userId,
            name: leadData.name,
            address: addressKey,
          },
        },
        create: {
          userId: search.userId,
          searchId,
          name: leadData.name,
          category: leadData.category,
          rating: leadData.rating,
          reviewCount: leadData.reviewCount,
          address: addressKey,
          neighborhood: leadData.neighborhood,
          city: leadData.city || search.city,
          phone: leadData.phone,
          website: leadData.website,
          mapsUrl: leadData.mapsUrl,
          businessStatus: leadData.businessStatus,
          openingHours: leadData.openingHours,
          hasWebsite: leadData._websiteType === "OWN_DOMAIN",
          websiteType: leadData._websiteType,
          score: leadData._scoreResult.value,
          scoreLabel: leadData._scoreResult.label,
          scoreReason: leadData._scoreResult.reason,
          approachMessage,
        },
        update: {
          category: leadData.category,
          rating: leadData.rating,
          reviewCount: leadData.reviewCount,
          neighborhood: leadData.neighborhood,
          city: leadData.city || search.city,
          phone: leadData.phone,
          website: leadData.website,
          mapsUrl: leadData.mapsUrl,
          businessStatus: leadData.businessStatus,
          openingHours: leadData.openingHours,
          hasWebsite: leadData._websiteType === "OWN_DOMAIN",
          websiteType: leadData._websiteType,
          score: leadData._scoreResult.value,
          scoreLabel: leadData._scoreResult.label,
          scoreReason: leadData._scoreResult.reason,
          approachMessage,
        },
      });
    };

    let rawLeads: any[] = [];
    if (search.platform === "INSTAGRAM") {
      onLog("WARNING", "Busca de Instagram não implementada.");
    } else {
      rawLeads = await runGoogleMapsScraperApify(query, maxLeads, onLog);
    }

    let savedCount = 0;
    const seenKeys = new Set<string>();

    for (const leadData of rawLeads) {
      if (await shouldCancel()) break;

      if (filterCallback(leadData)) {
        const addressKey = leadData.address || "Endereço Não Informado";
        const deduplicationKey = `${leadData.name}-${addressKey}`;

        if (seenKeys.has(deduplicationKey)) continue;
        seenKeys.add(deduplicationKey);

        await onLeadSaved(leadData);
        savedCount++;
        await onProgress(savedCount, search.maxLeads, `Lead salvo: ${leadData.name}`);

        if (savedCount >= search.maxLeads) {
          onLog("INFO", `Alvo de ${search.maxLeads} leads únicos atingido!`);
          break;
        }
      }
    }

    if (await shouldCancel()) return;

    await db.search.update({
      where: { id: searchId },
      data: {
        status: "FINISHED",
        finishedAt: new Date(),
      },
    });

    await db.searchLog.create({
      data: {
        searchId,
        level: "INFO",
        message: `Busca concluída com sucesso! ${savedCount} leads únicos processados.`,
      },
    });

    console.log(`[SEARCH WORKER] Busca ${searchId} concluída.`);

  } catch (err: any) {
    console.error(`[SEARCH WORKER] Erro no job da busca ${searchId}:`, err);
    
    const checkSearch = await db.search.findUnique({
      where: { id: searchId },
      select: { status: true },
    });

    if (checkSearch?.status === "CANCELLED") {
      console.log(`[SEARCH WORKER] Busca ${searchId} abortada pelo usuário.`);
      return;
    }

    await db.search.update({
      where: { id: searchId },
      data: {
        status: "ERROR",
        errorMessage: err.message,
        finishedAt: new Date(),
      },
    });

    await db.searchLog.create({
      data: {
        searchId,
        level: "ERROR",
        message: `Falha geral na execução: ${err.message}`,
      },
    });
  }
}

export default startSearchWorker;
