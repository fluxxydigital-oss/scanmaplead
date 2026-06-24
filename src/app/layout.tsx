import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ChevronDown } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "ScanLead Map — Captura de Leads Inteligente",
  description: "Encontre leads locais altamente qualificados direto do Google Maps com Puppeteer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${playfair.variable} dark h-screen`}>
      <body suppressHydrationWarning className="h-screen bg-[#05080D] font-sans text-[#F5F7FA] flex overflow-hidden">
        {/* Sidebar client-side */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#05090D] h-full overflow-hidden">
          {/* Topbar */}
          <header className="h-[64px] border-b border-[#1B2A38] bg-[#05090D] flex items-center px-10 justify-between shrink-0 select-none">
            <div className="text-[14px] text-[#A3B0BF] font-semibold flex items-center gap-2">
              <span>Status da API:</span>
              <span className="flex items-center gap-1.5 text-[#10D889] font-bold">
                <span className="h-[10px] w-[10px] rounded-full bg-[#10D889] animate-pulse" />
                Conectado
              </span>
            </div>
            
            <div className="flex items-center gap-[14px]">
              <div className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-medium text-[#A3B0BF]">
                  usuario.mvp@scanleadmap.com
                </span>
                <div className="h-[34px] w-[34px] rounded-full bg-[#10D889] text-[#02100A] flex items-center justify-center font-bold text-sm">
                  U
                </div>
                <ChevronDown className="h-4 w-4 text-[#A3B0BF]" />
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
        </main>
      </body>
    </html>
  );
}
