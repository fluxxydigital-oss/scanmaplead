import { NextResponse } from "next/server";
import db from "@/lib/db";
import { CrmStatus } from "@/generated/client/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { crmStatus } = body;

    if (!crmStatus || !Object.values(CrmStatus).includes(crmStatus as CrmStatus)) {
      return NextResponse.json(
        { error: "Status comercial inválido." },
        { status: 400 }
      );
    }

    const lead = await db.lead.update({
      where: { id },
      data: { crmStatus: crmStatus as CrmStatus },
    });

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("Erro ao atualizar status do lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao atualizar o status." },
      { status: 500 }
    );
  }
}
