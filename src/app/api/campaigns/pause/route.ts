import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function POST(req: Request) {
  try {
    const user = await getMockUser();
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "ID da campanha não informado" }, { status: 400 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId, userId: user.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "PAUSED" }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
