import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Resolver params caso seja Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const search = await db.search.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: "asc" },
          take: 50, // Retorna os últimos 50 logs para preencher o terminal do frontend
        },
        leads: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            category: true,
            rating: true,
            phone: true,
            website: true,
            hasWebsite: true,
            websiteType: true,
            score: true,
            scoreLabel: true,
          },
        },
      },
    });

    if (!search) {
      return NextResponse.json({ error: "Busca não encontrada" }, { status: 404 });
    }

    return NextResponse.json(search);
  } catch (error: any) {
    console.error("Erro ao obter progresso da busca:", error);
    return NextResponse.json(
      { error: "Erro interno ao consultar o progresso." },
      { status: 500 }
    );
  }
}
