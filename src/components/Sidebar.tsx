"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  Users,
  Filter,
  Network,
  MessageSquare,
  Send,
  GitMerge,
  List,
  CreditCard,
  User,
  HelpCircle,
  LogOut,
  MapPin
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        {
          label: "Painel Geral",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: isLinkActive("/dashboard"),
        },
        {
          label: "Nova Busca",
          icon: Search,
          href: "/searches/new",
          active: isLinkActive("/searches/new") || pathname.includes("/progress"),
        },
        {
          label: "Base de Leads",
          icon: Users,
          href: "/leads",
          active: isLinkActive("/leads"),
        },
        {
          label: "Funil de Vendas",
          icon: Filter,
          href: "/pipeline",
          active: isLinkActive("/pipeline"),
        },
        {
          label: "Central de Dados",
          icon: Network,
          href: "#",
          active: false,
          badge: { value: 3, color: "bg-[#10D889] text-[#03110B]" },
        },
      ],
    },
    {
      title: "ENVIO EM MASSA",
      items: [
        {
          label: "Mensagens IA",
          icon: MessageSquare,
          href: "/campaigns",
          active: isLinkActive("/campaigns"),
        },
        {
          label: "Campanhas",
          icon: Send,
          href: "#",
          active: false,
        },
        {
          label: "Editor de Funis",
          icon: GitMerge,
          href: "#",
          active: false,
          badge: { value: "NOVO", color: "bg-[#2F8CFF] text-white" },
        },
        {
          label: "Fila de Envios",
          icon: List,
          href: "#",
          active: false,
        },
      ],
    },
    {
      title: "CONFIGURAÇÕES",
      items: [
        {
          label: "Assinatura",
          icon: CreditCard,
          href: "#",
          active: false,
        },
        {
          label: "Conta",
          icon: User,
          href: "/account",
          active: isLinkActive("/account"),
        },
        {
          label: "Ajuda & Tutoriais",
          icon: HelpCircle,
          href: "#",
          active: false,
        },
      ],
    },
  ];

  return (
    <aside className="w-[270px] border-r border-[#1B2A38] bg-gradient-to-b from-[#050A0F] to-[#05080D] flex flex-col shrink-0 select-none h-screen p-4">
      {/* Logo */}
      <div className="pb-4 border-b border-[#1B2A38] flex items-center gap-3">
        <div className="h-[44px] w-[44px] bg-[#081018] border border-[#1B2A38] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,216,137,0.15)] text-[#10D889] shrink-0">
          <MapPin className="h-5 w-5 fill-[#10D889]/25 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-[23px] leading-tight tracking-normal text-white">
            ScanLead <span className="text-[#10D889]">Map</span>
          </h1>
          <span className="text-[11px] uppercase font-bold tracking-[1.4px] text-[#6F7D8B]">
            MVP ENGINE
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[1px] text-[#707D8C] px-3">
              {section.title}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-[10px] text-[14px] font-medium transition-all group h-[38px] gap-3",
                        item.active
                          ? "bg-[#10D889]/14 border border-[#10D889]/80 text-white"
                          : "text-[#C8D0DA] hover:text-white hover:bg-white/4"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-[20px] w-[20px] transition-colors",
                            item.active ? "text-[#10D889]" : "text-[#C8D0DA] group-hover:text-white"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                          item.badge.color
                        )}>
                          {item.badge.value}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Card & Logout */}
      <div className="border-t border-[#1B2A38] pt-4 space-y-3">
        {/* User Info */}
        <div className="p-3 rounded-[14px] bg-gradient-to-b from-[#0D1721] to-[#081018] border border-[#263847]/45 flex items-center gap-3">
          <div className="h-[42px] w-[42px] rounded-xl bg-[#10D889] text-[#02100A] font-bold font-outfit text-lg flex items-center justify-center relative shrink-0">
            U
            {/* Status dot */}
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#10D889] border-2 border-[#050A0F]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">usuario.mvp</h4>
            <p className="text-xs text-[#A3B0BF] truncate">Sua central de prospecção local.</p>
          </div>
        </div>

        {/* Logout Button */}
        <Link href="#" className="block">
          <Button
            variant="outline"
            className="w-full border-[#1B2A38]/50 text-[#F5F7FA] hover:text-white hover:bg-[#081018] h-[48px] text-sm rounded-[10px] flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </Link>
      </div>
    </aside>
  );
}
