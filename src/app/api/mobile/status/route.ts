import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Retorna status simples de saúde para o app Mobile
    return NextResponse.json({
      status: "online",
      version: "2.0.0",
      services: {
        database: "connected",
        scraper: "apify",
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "offline",
      error: err.message
    }, { status: 500 });
  }
}
