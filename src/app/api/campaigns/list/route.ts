import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getMockUser();

    // Buscar campanhas recentes
    const campaigns = await db.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: {
          select: { contacts: true }
        }
      }
    });

    // Se houver campanhas, vamos pegar os detalhes da mais recente para o Resumo
    let activeCampaign = null;
    let activeStats = { pending: 0, sent: 0, failed: 0 };

    if (campaigns.length > 0) {
      activeCampaign = campaigns[0];
      
      const statsRaw = await db.campaignContact.groupBy({
        by: ['status'],
        where: { campaignId: activeCampaign.id },
        _count: true,
      });

      statsRaw.forEach(s => {
        if (s.status === "PENDING") activeStats.pending = s._count;
        if (s.status === "SENT") activeStats.sent = s._count;
        if (s.status === "FAILED") activeStats.failed = s._count;
      });
    }

    return NextResponse.json({ 
      campaigns, 
      activeCampaign: activeCampaign ? {
        ...activeCampaign,
        stats: activeStats
      } : null 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
