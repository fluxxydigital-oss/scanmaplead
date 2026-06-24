import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function POST(req: Request) {
  try {
    const user = await getMockUser();
    const body = await req.json();
    const { name, template, delayMin, delayMax, leadIds } = body;

    if (!template || !leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // Criar Campanha
    const campaign = await db.campaign.create({
      data: {
        userId: user.id,
        name: name || "Nova Campanha",
        template,
        delayMin: delayMin || 30,
        delayMax: delayMax || 60,
        status: "RUNNING",
        totalLeads: leadIds.length,
      },
    });

    // Criar Contatos da Campanha
    const contactsData = leadIds.map((leadId: string) => ({
      campaignId: campaign.id,
      leadId,
      status: "PENDING",
    }));

    await db.campaignContact.createMany({
      data: contactsData,
    });

    // O Worker em background agora fará o polling automático pelo status RUNNING

    // Mover os leads de "Novo Lead" para "Qualificação"
    await db.lead.updateMany({
      where: {
        id: { in: leadIds },
        crmStatus: "NEW"
      },
      data: {
        crmStatus: "CONTACTED",
        inPipeline: true
      }
    });

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
