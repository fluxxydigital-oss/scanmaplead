import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const search = await db.search.findUnique({ where: { id } });
    if (!search) {
      return NextResponse.json({ error: "Busca não encontrada" }, { status: 404 });
    }

    if (["FINISHED", "ERROR", "CANCELLED"].includes(search.status)) {
      return NextResponse.json(
        { error: "Esta busca já foi finalizada ou cancelada." },
        { status: 400 }
      );
    }

    // Atualizar status para CANCELLED no banco. O scraper irá ler este status e abortar na próxima oportunidade.
    const updatedSearch = await db.search.update({
      where: { id },
      data: { status: "CANCELLED", finishedAt: new Date() },
    });

    await db.searchLog.create({
      data: {
        searchId: id,
        level: "WARNING",
        message: "O usuário solicitou o cancelamento da busca.",
      },
    });

    return NextResponse.json(updatedSearch);
  } catch (error: any) {
    console.error("Erro ao cancelar busca:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar cancelamento." },
      { status: 500 }
    );
  }
}
