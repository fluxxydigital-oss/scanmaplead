"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface DailyLead {
  date: string;
  total: number;
}

interface FunnelStep {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  dailyData: DailyLead[];
  funnelData: FunnelStep[];
}

export function AcquisitionChart({ data }: { data: DailyLead[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full mt-4 bg-transparent animate-pulse rounded-lg" style={{ height: 250 }} />;

  return (
    <div className="w-full mt-4" style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#19E28F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#19E28F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2B3A" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8FA1B5', fontSize: 10 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8FA1B5', fontSize: 10 }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0D1620', borderColor: '#1A2B3A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ color: '#19E28F' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            name="Leads"
            stroke="#19E28F" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D1620] border border-[#1A2B3A] p-2 rounded-lg text-xs shadow-xl">
        <p className="text-white font-bold mb-1">{payload[0].payload.name}</p>
        <p className="text-[#8FA1B5]">Quantidade: <span className="text-white font-mono">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full mt-4 bg-transparent animate-pulse rounded-lg" style={{ height: 250 }} />;

  return (
    <div className="w-full mt-4" style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }} barSize={30}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8FA1B5', fontSize: 11, fontWeight: 600 }} 
            width={100}
          />
          <Tooltip cursor={{fill: '#1A2B3A', opacity: 0.4}} content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
