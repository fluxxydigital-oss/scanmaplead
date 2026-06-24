import db from "../db";
import { whatsappService } from "../whatsapp/client";
import { parseSpintax } from "../spintax";

const activeCampaigns = new Set<string>();

export const startCampaignWorker = () => {
  console.log("[CAMPAIGN WORKER] Escutando campanhas ativas via Polling DB...");
  
  setInterval(async () => {
    try {
      const campaigns = await db.campaign.findMany({ where: { status: "RUNNING" } });
      
      for (const campaign of campaigns) {
        if (!activeCampaigns.has(campaign.id)) {
          activeCampaigns.add(campaign.id);
          processCampaignAsync(campaign.id).catch(err => {
            console.error(`[CAMPAIGN WORKER] Erro fatal no processamento da campanha ${campaign.id}`, err);
            activeCampaigns.delete(campaign.id);
          });
        }
      }
    } catch (err) {
      console.error("[CAMPAIGN WORKER] Erro no polling de campanhas:", err);
    }
  }, 10000); // Checa a cada 10 seg
};

async function processCampaignAsync(campaignId: string) {
  console.log(`[CAMPAIGN] Iniciando loop para a campanha: ${campaignId}`);
  try {
    while (true) {
      const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign || campaign.status !== "RUNNING") {
        console.log(`[CAMPAIGN] Campanha ${campaignId} pausada ou não encontrada.`);
        activeCampaigns.delete(campaignId);
        return;
      }

      const nextContact = await db.campaignContact.findFirst({
        where: { campaignId, status: "PENDING" },
        include: { lead: true }
      });

      if (!nextContact) {
        await db.campaign.update({
          where: { id: campaignId },
          data: { status: "COMPLETED" }
        });
        console.log(`[CAMPAIGN] Campanha ${campaignId} finalizada. Nenhuma pendência.`);
        activeCampaigns.delete(campaignId);
        return;
      }

      if (whatsappService.status !== "AUTHENTICATED") {
        console.error(`[CAMPAIGN] WhatsApp desconectado. Pausando campanha ${campaignId}.`);
        await db.campaign.update({
          where: { id: campaignId },
          data: { status: "PAUSED" }
        });
        activeCampaigns.delete(campaignId);
        return;
      }

      // 1. Enviar a mensagem
      try {
        const lead = nextContact.lead;
        const variables = {
          nome: lead.name,
          empresa: lead.category || "",
          cidade: lead.city || "",
          telefone: lead.phone || "",
          segmento: lead.category || "",
          nome_agencia: "Sua Agência",
        };

        const finalMessage = parseSpintax(campaign.template, variables);

        if (lead.phone) {
          console.log(`[CAMPAIGN] Enviando mensagem para ${lead.phone}...`);
          await whatsappService.sendMessage(lead.phone, finalMessage);
        } else {
          throw new Error("Lead sem telefone");
        }

        // Marcar sucesso
        await db.campaignContact.update({
          where: { id: nextContact.id },
          data: { status: "SENT", sentAt: new Date() }
        });

        await db.campaign.update({
          where: { id: campaignId },
          data: { totalSent: { increment: 1 } }
        });

      } catch (err: any) {
        console.error(`[CAMPAIGN] Falha ao enviar para contato ${nextContact.id}:`, err);
        await db.campaignContact.update({
          where: { id: nextContact.id },
          data: { status: "FAILED", errorMessage: err.message }
        });
      }

      // 2. Aguardar o atraso (Delay aleatório) antes de prosseguir
      const min = campaign.delayMin || 30;
      const max = campaign.delayMax || 60;
      const randomSeconds = Math.floor(Math.random() * (max - min + 1)) + min;
      
      console.log(`[CAMPAIGN ${campaignId}] Mensagem processada. Aguardando ${randomSeconds}s para o próximo...`);
      await new Promise(resolve => setTimeout(resolve, randomSeconds * 1000));
    }
  } catch (error) {
    activeCampaigns.delete(campaignId);
    throw error;
  }
}

export default startCampaignWorker;
