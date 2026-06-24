"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default to 30 days if no param
  const currentDays = searchParams.get("days") || "30";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Select value={currentDays} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] h-9 bg-[#091018] border-[#1A2B3A] text-white text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#8FA1B5]" />
          <SelectValue placeholder="Selecione o período" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#0D1620] border-[#1A2B3A] text-white">
        <SelectItem value="7">Últimos 7 dias</SelectItem>
        <SelectItem value="15">Últimos 15 dias</SelectItem>
        <SelectItem value="30">Últimos 30 dias</SelectItem>
        <SelectItem value="90">Últimos 3 meses</SelectItem>
        <SelectItem value="all">Todo o Período</SelectItem>
      </SelectContent>
    </Select>
  );
}
