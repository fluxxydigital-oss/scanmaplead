import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

const createSearchSchema = z.object({
  niche: z.string().min(2, "O nicho deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  maxLeads: z.number().int().min(1).max(100).default(50),
  minScore: z.string().optional(),
  digitalStatus: z.string().optional(),
  orderBy: z.string().optional(),
  platform: z.string().optional().default("MAPS"),
});

export async function GET() {
  try {
    const user = await getMockUser();

    const searches = await db.search.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(searches);
  } catch (error: any) {
    console.error("Erro ao listar buscas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar históricos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getMockUser();
    const body = await request.json();

    const validation = createSearchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }

    const { niche, state, city, neighborhood, maxLeads, minScore, digitalStatus, orderBy, platform } = validation.data;

    // 1. Limite de 1 busca ativa por usuário: se houver, cancela a antiga
    const activeSearches = await db.search.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            "PENDING",
            "STARTING_BROWSER",
            "SEARCHING_MAPS",
            "COLLECTING_CARDS",
            "OPENING_PLACES",
            "SAVING_LEADS",
          ],
        },
      },
    });

    if (activeSearches.length > 0) {
      await db.search.updateMany({
        where: {
          userId: user.id,
          status: {
            in: [
              "PENDING",
              "STARTING_BROWSER",
              "SEARCHING_MAPS",
              "COLLECTING_CARDS",
              "OPENING_PLACES",
              "SAVING_LEADS",
            ],
          },
        },
        data: { status: "CANCELLED" },
      });
      console.log("Buscas ativas anteriores foram canceladas automaticamente.");
    }

    // 2. Montar query
    let query = "";
    if (platform === "INSTAGRAM") {
      let location = "";
      if (neighborhood) location += `${neighborhood} `;
      if (city) location += `${city} `;
      location += state;
      query = `site:instagram.com "${niche}" "${location.trim()}" ("wa.me" OR "whatsapp" OR "+55")`;
    } else {
      query = `${niche} em `;
      if (neighborhood) query += `${neighborhood}, `;
      if (city) query += `${city} - `;
      query += state;
    }

    // 3. Criar a busca no banco
    const search = await db.search.create({
      data: {
        userId: user.id,
        niche,
        city: state, // Usando o campo city do prisma para salvar o Estado
        neighborhood: neighborhood ? (city ? `${neighborhood}, ${city}` : neighborhood) : (city ? city : undefined), // Salvando Bairro e Cidade

        query,
        platform,
        minScore,
        digitalStatus,
        orderBy,
        maxLeads,
        status: "PENDING",
      },
    });

    // 4. Registrar primeiro log
    await db.searchLog.create({
      data: {
        searchId: search.id,
        level: "INFO",
        message: `Busca criada com sucesso para query: "${query}"`,
      },
    });

    // O Worker em background agora fará o polling automático pelo status PENDING

    return NextResponse.json(search, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao iniciar busca:", error);
    return NextResponse.json(
      { error: "Erro ao criar nova busca no servidor." },
      { status: 500 }
    );
  }
}
