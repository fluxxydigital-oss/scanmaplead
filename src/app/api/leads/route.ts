import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";
import { WebsiteType, ScoreLabel, CrmStatus } from "@/generated/client/client";

export async function GET(request: Request) {
  try {
    const user = await getMockUser();
    const { searchParams } = new URL(request.url);

    // Filtros
    const searchId = searchParams.get("searchId") || undefined;
    const crmStatus = searchParams.get("crmStatus") as CrmStatus | null;
    const scoreLabel = searchParams.get("scoreLabel") as ScoreLabel | null;
    const websiteType = searchParams.get("websiteType") as WebsiteType | null;
    const hasWebsite = searchParams.get("hasWebsite");
    const hasPhone = searchParams.get("hasPhone");
    
    // Ordenação
    const orderByField = searchParams.get("orderBy") || "score"; // score, rating, reviewCount, createdAt
    const orderDirection = searchParams.get("orderDirection") || "desc"; // asc, desc

    const where: any = {
      userId: user.id,
      searchId,
    };

    if (crmStatus) {
      where.crmStatus = crmStatus;
    }

    if (scoreLabel) {
      where.scoreLabel = scoreLabel;
    }

    if (websiteType) {
      where.websiteType = websiteType;
    }

    if (hasWebsite === "true") {
      where.hasWebsite = true;
    } else if (hasWebsite === "false") {
      where.hasWebsite = false;
    }

    if (hasPhone === "true") {
      where.phone = { not: null };
    } else if (hasPhone === "false") {
      where.phone = null;
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;
    
    const searchQuery = searchParams.get("search") || "";

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { category: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const [leads, totalCount] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: {
          [orderByField]: orderDirection,
        },
        skip,
        take: limit,
      }),
      db.lead.count({ where })
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("Erro ao listar leads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao consultar leads." },
      { status: 500 }
    );
  }
}
