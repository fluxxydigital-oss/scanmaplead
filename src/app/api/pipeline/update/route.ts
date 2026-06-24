import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function PUT(req: Request) {
  try {
    const user = await getMockUser();
    const body = await req.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const updatedLead = await db.lead.update({
      where: {
        id: leadId,
        userId: user.id, // Ensure user owns the lead
      },
      data: {
        crmStatus: status,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("Erro ao atualizar lead no pipeline:", error);
    return NextResponse.json({ error: "Erro ao mover o lead." }, { status: 500 });
  }
}
