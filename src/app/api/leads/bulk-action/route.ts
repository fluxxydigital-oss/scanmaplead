import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function POST(request: Request) {
  try {
    const user = await getMockUser();
    const body = await request.json();
    const { action, leadIds, payload } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "Nenhum lead selecionado." }, { status: 400 });
    }

    if (action === "DELETE") {
      await db.lead.deleteMany({
        where: {
          id: { in: leadIds },
          userId: user.id
        }
      });
      return NextResponse.json({ success: true, message: "Leads excluídos com sucesso." });
    } 
    
    if (action === "UPDATE_STATUS") {
      const { crmStatus } = payload;
      if (!crmStatus) return NextResponse.json({ error: "Status não fornecido." }, { status: 400 });

      await db.lead.updateMany({
        where: {
          id: { in: leadIds },
          userId: user.id
        },
        data: {
          crmStatus,
          inPipeline: crmStatus !== "IGNORED" // Se não for ignorado, entra no pipeline
        }
      });
      return NextResponse.json({ success: true, message: "Status atualizados com sucesso." });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });

  } catch (error: any) {
    console.error("Erro no bulk-action de leads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao processar ação em massa." },
      { status: 500 }
    );
  }
}
