import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  try {
    const USER_ID = "cm1234567890user"; // Simulando auth
    await db.whatsappSession.update({
      where: { userId: USER_ID },
      data: { status: "DISCONNECTED" }
    });

    return NextResponse.json({ success: true, message: "Comando de restart registrado." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
