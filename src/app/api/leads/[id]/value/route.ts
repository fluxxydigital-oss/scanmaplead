import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function PATCH(
  request: Request, 
  context: any
) {
  try {
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "ID do lead não fornecido na URL." }, { status: 400 });
    }

    const user = await getMockUser();
    const { dealValue } = await request.json();

    const lead = await db.lead.updateMany({
      where: {
        id: id,
        userId: user.id, // Garante que só altera se for o dono
      },
      data: {
        dealValue,
      },
    });

    if (lead.count === 0) {
      return NextResponse.json({ error: "Lead não encontrado ou não pertence a você." }, { status: 404 });
    }

    // Buscar o lead atualizado para retornar
    const updatedLead = await db.lead.findUnique({
      where: { id: id }
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("Erro ao atualizar deal value do lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao atualizar valor." },
      { status: 500 }
    );
  }
}
