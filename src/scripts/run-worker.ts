import "dotenv/config";
import startSearchWorker from "../lib/workers/searchWorker";
import startCampaignWorker from "../lib/workers/campaignWorker";
import { whatsappService } from "../lib/whatsapp/client";

console.log("=== INICIANDO WORKER SCANLEAD MAP (DB POLLING) ===");
startSearchWorker();
startCampaignWorker();

// Inicia o serviço do WhatsApp paralelamente no worker
whatsappService.initialize().catch(console.error);

console.log("Workers ativos e escutando o Supabase...");

process.on("SIGTERM", () => {
  console.log("Fechando workers...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Fechando workers...");
  process.exit(0);
});
