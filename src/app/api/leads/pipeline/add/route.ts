import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function POST(req: Request) {
  try {
    const user = await getMockUser();
    const body = await req.json();
    const { leadIds, searchId } = body;

    if (!leadIds || leadIds.length === 0) {
      if (!searchId) {
        return NextResponse.json({ error: "Parâmetros inválidos. Forneça leadIds ou searchId." }, { status: 400 });
      }

      // If no specific leadIds, we move all leads from that search to pipeline.
      await db.lead.updateMany({
        where: { searchId, userId: user.id },
        data: { inPipeline: true, crmStatus: "NEW" }
      });

      return NextResponse.json({ success: true });
    }

    // Move specific leads
    await db.lead.updateMany({
      where: {
        id: { in: leadIds },
        userId: user.id
      },
      data: { inPipeline: true, crmStatus: "NEW" }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao adicionar ao pipeline:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
