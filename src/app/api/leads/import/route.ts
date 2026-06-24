import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export const revalidate = 0;

export async function GET() {
  try {
    const user = await getMockUser();

    // Busca leads com telefone
    const leads = await db.lead.findMany({
      where: {
        userId: user.id,
        inPipeline: true,
        crmStatus: "NEW",
        phone: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
