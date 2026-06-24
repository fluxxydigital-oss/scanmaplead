import { NextResponse } from "next/server";
import { redisConnection } from "@/lib/redis";

export async function POST() {
  try {
    const publisher = redisConnection.duplicate();
    await publisher.publish("whatsapp-commands", "LOGOUT");
    await publisher.quit();

    return NextResponse.json({ success: true, message: "Comando de logout enviado." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
