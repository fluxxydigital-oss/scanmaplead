import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export async function POST(req: Request) {
  try {
    const user = await getMockUser();
    const body = await req.json();
    const { leadIds } = body;

    if (!leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
    }

    const leads = await db.lead.findMany({
      where: {
        userId: user.id,
        id: { in: leadIds },
        phone: { not: null }
      }
    });

    let updatedCount = 0;

    for (const lead of leads) {
      if (!lead.phone) continue;

      let clean = lead.phone.replace(/\D/g, "");
      
      // Remove o zero inicial, comum em DDDs brasileiros (ex: 022 -> 22)
      if (clean.startsWith("0")) {
        clean = clean.substring(1);
      }

      // Garante que tenha 55
      if (!clean.startsWith("55")) {
        clean = "55" + clean;
      }

      const formatted = "+" + clean;

      if (formatted !== lead.phone) {
        await db.lead.update({
          where: { id: lead.id },
          data: { phone: formatted }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
