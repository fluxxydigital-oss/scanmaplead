import { Client, LocalAuth } from "whatsapp-web.js";
import db from "../db";
import qrcode from "qrcode";

export const USER_ID = "cm1234567890user"; // Simulando auth real

class WhatsAppService {
  public client: Client | null = null;
  public qrCodeBase64: string | null = null;
  public status: "DISCONNECTED" | "QR_READY" | "AUTHENTICATED" = "DISCONNECTED";

  constructor() {}

  async initialize() {
    if (this.client) return;

    console.log("[WHATSAPP] Inicializando cliente...");
    
    // Garantir registro no DB
    await db.whatsappSession.upsert({
      where: { userId: USER_ID },
      create: { userId: USER_ID, status: "DISCONNECTED" },
      update: { status: "DISCONNECTED" },
    });

    // Redis Pub/Sub removido para transição DB Polling
    // Para reiniciar, precisaremos futuramente fazer polling de um comando na tabela whatsappSession

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: `scanlead-${USER_ID}` }),
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
        ],
      },
    });

    this.client.on("qr", async (qr) => {
      console.log("[WHATSAPP] Novo QR Code gerado.");
      this.status = "QR_READY";
      
      // Gera base64 a partir do texto do QR Code
      this.qrCodeBase64 = await qrcode.toDataURL(qr);

      await db.whatsappSession.update({
        where: { userId: USER_ID },
        data: { status: "QR_READY", qrCode: this.qrCodeBase64 },
      });
    });

    this.client.on("ready", async () => {
      console.log("[WHATSAPP] Conectado e pronto!");
      this.status = "AUTHENTICATED";
      this.qrCodeBase64 = null;

      await db.whatsappSession.update({
        where: { userId: USER_ID },
        data: { 
          status: "AUTHENTICATED", 
          qrCode: null,
          connectedAt: new Date()
        },
      });
    });

    this.client.on("authenticated", () => {
      console.log("[WHATSAPP] Autenticado com sucesso.");
    });

    this.client.on("auth_failure", async (msg) => {
      console.error("[WHATSAPP] Falha na autenticação:", msg);
      this.status = "DISCONNECTED";
      await db.whatsappSession.update({
        where: { userId: USER_ID },
        data: { status: "DISCONNECTED", qrCode: null },
      });
    });

    this.client.on("disconnected", async (reason) => {
      console.log("[WHATSAPP] Desconectado:", reason);
      this.status = "DISCONNECTED";
      this.qrCodeBase64 = null;
      this.client = null;
      
      await db.whatsappSession.update({
        where: { userId: USER_ID },
        data: { status: "DISCONNECTED", qrCode: null },
      });
    });

    await this.client.initialize();
  }

  async logout() {
    if (this.client) {
      try {
        await this.client.logout();
      } catch (err) {
        console.error("Erro ao fazer logout do whatsapp", err);
      }
      this.client = null;
      this.status = "DISCONNECTED";
      this.qrCodeBase64 = null;
      await db.whatsappSession.update({
        where: { userId: USER_ID },
        data: { status: "DISCONNECTED", qrCode: null },
      });
    }
  }

  async restart() {
    await this.logout();
    await this.initialize();
  }

  async sendMessage(to: string, message: string) {
    if (!this.client || this.status !== "AUTHENTICATED") {
      throw new Error("WhatsApp não está conectado.");
    }
    
    // O whatsapp-web.js exige DDI + DDD + numero @c.us
    // Limpar o telefone para conter apenas numeros
    const cleanPhone = to.replace(/\D/g, "");
    // Assumir 55 caso n tenha
    const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    
    const numberId = await this.client.getNumberId(finalPhone);
    if (!numberId) {
      throw new Error("Este número não possui WhatsApp ou é inválido.");
    }

    await this.client.sendMessage(numberId._serialized, message);
  }
}

export const whatsappService = new WhatsAppService();
