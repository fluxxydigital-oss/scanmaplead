import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function GET() {
  try {
    const user = await getMockUser();

    // Buscar leads que estão no pipeline (crmStatus não nulo)
    const pipelineLeads = await db.lead.findMany({
      where: {
        userId: user.id,
        inPipeline: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pipelineLeads);
  } catch (error: any) {
    console.error("Erro ao buscar pipeline:", error);
    return NextResponse.json({ error: "Erro ao carregar o pipeline." }, { status: 500 });
  }
}
