import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getMockUser } from "@/lib/auth-mock";

export const revalidate = 0;

export async function GET() {
  try {
    const user = await getMockUser();
    const session = await db.whatsappSession.findUnique({
      where: { userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ status: "DISCONNECTED", qrCode: null });
    }

    return NextResponse.json({
      status: session.status,
      qrCode: session.qrCode,
      connectedAt: session.connectedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
