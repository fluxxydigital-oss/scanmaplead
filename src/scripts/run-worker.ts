import "dotenv/config";
import http from "http";
import startSearchWorker from "../lib/workers/searchWorker";
import startCampaignWorker from "../lib/workers/campaignWorker";
import { whatsappService } from "../lib/whatsapp/client";

// --- DUMMY SERVER PARA O RENDER (Plano Grátis Web Service) ---
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Worker está rodando!");
}).listen(PORT, () => {
  console.log(`[DUMMY SERVER] Escutando na porta ${PORT} para manter o Render feliz.`);
});
// -------------------------------------------------------------

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
