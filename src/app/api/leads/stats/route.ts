import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function GET() {
  try {
    const user = await getMockUser();

    // Buscar total de leads
    const totalLeads = await db.lead.count({
      where: { userId: user.id }
    });

    // Buscar oportunidades ativas (não NEW, não LOST, não IGNORED)
    const activeOpportunities = await db.lead.count({
      where: {
        userId: user.id,
        crmStatus: {
          notIn: ["NEW", "LOST", "IGNORED"]
        }
      }
    });

    // Buscar leads ganhos (CLOSED)
    const wonLeads = await db.lead.count({
      where: {
        userId: user.id,
        crmStatus: "CLOSED"
      }
    });

    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      totalLeads,
      activeOpportunities,
      conversionRate
    });

  } catch (error: any) {
    console.error("Erro ao buscar estatísticas dos leads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar estatísticas." },
      { status: 500 }
    );
  }
}
