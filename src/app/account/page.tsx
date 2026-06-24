"use client";

import {
  Calendar,
  Download,
  Edit2,
  Eye,
  Lock,
  Mail,
  MessageCircle,
  Shield,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Users
} from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("Perfil");

  const tabs = [
    "Perfil",
    "Preferências",
    "Segurança",
    "Integrações",
    "Sessões ativas",
    "Notificações",
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#05090D] px-7 py-7 pb-24 text-[#F5F7FA]">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[36px] font-bold tracking-tight text-white">
          Conta
        </h1>
        <p className="mt-1 text-[14px] text-[#A1AFBF]">
          Gerencie suas informações pessoais, preferências e configurações da sua conta.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-6 border-b border-[#1B2B3A]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex h-[48px] items-center border-b-2 text-[14px] font-medium transition-colors ${
              activeTab === tab
                ? "border-[#19E28F] text-[#19E28F]"
                : "border-transparent text-[#A1AFBF] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-1 flex-col gap-[22px] lg:flex-row">
        
        {/* Left Column (flex-1) */}
        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
          
          {/* Informações do Perfil */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-[18px] font-bold text-white">Informações do Perfil</h3>
              <button className="flex h-[36px] items-center gap-2 rounded-[10px] border border-[#223345] bg-[#0B1118] px-4 text-[13px] font-semibold text-[#F5F7FA] transition hover:bg-[#101A24]">
                <Edit2 className="h-4 w-4" />
                Editar Perfil
              </button>
            </div>
            
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#19E28F,#0FCF83)] font-outfit text-[40px] font-bold text-[#04110B]">
                U
              </div>
              
              <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[12px] text-[#A1AFBF]">Nome</p>
                  <p className="mt-1 font-medium text-white">usuario.mvp</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#A1AFBF]">Função</p>
                  <p className="mt-1 font-medium text-white">Administrador</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#A1AFBF]">E-mail</p>
                  <p className="mt-1 font-medium text-white">usuario.mvp@scanleadmap.com</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#A1AFBF]">Membro desde</p>
                  <div className="mt-1 flex items-center gap-2 font-medium text-white">
                    <Calendar className="h-4 w-4 text-[#A1AFBF]" />
                    15/03/2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duas Colunas: Empresa e Preferências */}
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
            
            {/* Informações da Empresa */}
            <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-serif text-[18px] font-bold text-white">Informações da Empresa</h3>
                <button className="flex h-[36px] items-center gap-2 rounded-[10px] border border-[#223345] bg-[#0B1118] px-4 text-[13px] font-semibold text-[#F5F7FA] transition hover:bg-[#101A24]">
                  <Edit2 className="h-4 w-4" />
                  Editar Empresa
                </button>
              </div>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">Nome da Empresa</span>
                  <span className="col-span-2 text-[14px] font-medium text-white">MVP Engine</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">CNPJ</span>
                  <span className="col-span-2 text-[14px] font-medium text-white">12.345.678/0001-90</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">Segmento</span>
                  <span className="col-span-2 text-[14px] font-medium text-white">Marketing Digital</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">Website</span>
                  <span className="col-span-2 text-[14px] font-medium text-white">www.mvpengine.com.br</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">Telefone</span>
                  <span className="col-span-2 text-[14px] font-medium text-white">(11) 98765-4321</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-[13px] text-[#A1AFBF]">Endereço</span>
                  <span className="col-span-2 text-[14px] font-medium leading-relaxed text-white">
                    Rua das Orquídeas, 500, Sala 1203<br/>
                    Jardins, São Paulo - SP, 01419-000
                  </span>
                </div>
              </div>
            </div>

            {/* Preferências da Conta */}
            <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-serif text-[18px] font-bold text-white">Preferências da Conta</h3>
                <button className="flex h-[36px] items-center gap-2 rounded-[10px] border border-[#223345] bg-[#0B1118] px-4 text-[13px] font-semibold text-[#F5F7FA] transition hover:bg-[#101A24]">
                  <Edit2 className="h-4 w-4" />
                  Editar Preferências
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: "Idioma", value: "Português (Brasil)" },
                  { label: "Fuso horário", value: "(GMT-03:00) Brasília" },
                  { label: "Moeda", value: "BRL - Real (R$)" },
                  { label: "Formato de data", value: "DD/MM/YYYY" },
                  { label: "Tema", value: "Escuro" },
                ].map((pref, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#A1AFBF]">{pref.label}</label>
                    <div className="flex h-[48px] items-center justify-between rounded-[10px] border border-[#223345] bg-[#081018] px-4 text-[14px] text-white">
                      {pref.value}
                      <ChevronDown className="h-4 w-4 text-[#7D8A98]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Exportar Dados da Conta */}
          <div className="flex items-center justify-between rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div>
              <h3 className="font-serif text-[18px] font-bold text-white">Exportar Dados da Conta</h3>
              <p className="mt-1 text-[13px] text-[#A1AFBF]">
                Faça o download dos seus dados cadastrados na plataforma.
              </p>
            </div>
            <button className="flex h-[40px] items-center gap-2 rounded-[10px] border border-[#223345] bg-[#0B1118] px-5 text-[14px] font-semibold text-[#F5F7FA] transition hover:bg-[#101A24]">
              <Download className="h-4 w-4" />
              Exportar Dados
            </button>
          </div>

        </div>

        {/* Right Panel (440px) */}
        <div className="flex w-full shrink-0 flex-col gap-[22px] lg:w-[440px]">
          
          {/* Resumo da Conta */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-[18px] font-bold text-white">Resumo da Conta</h3>
              <span className="rounded-full bg-[rgba(25,226,143,0.12)] px-3 py-1 text-[11px] font-bold text-[#19E28F]">
                Plano Profissional
              </span>
            </div>

            <div className="mb-6 flex items-center justify-between rounded-[12px] bg-[#081018] p-5 border border-[#1B2B3A]">
              <div>
                <p className="mb-1 text-[12px] text-[#A1AFBF]">Leads utilizados</p>
                <p className="font-outfit text-[22px] font-bold text-white">
                  2.451 <span className="text-[14px] text-[#708090] font-medium">/ 5.000</span>
                </p>
                <div className="mt-3 h-1.5 w-[140px] rounded-full bg-[#1B2B3A]">
                  <div className="h-full w-[49%] rounded-full bg-[#19E28F]" />
                </div>
              </div>
              <div className="relative flex h-[64px] w-[64px] items-center justify-center">
                <svg className="h-[64px] w-[64px] -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1B2B3A" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#19E28F" strokeLinecap="round" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - 0.49 * (2 * Math.PI * 28)} />
                </svg>
                <span className="absolute font-outfit text-[14px] font-bold text-white">49%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-[12px] bg-[#081018] p-4 border border-[#1B2B3A]">
                <Calendar className="h-5 w-5 text-[#A1AFBF]" />
                <div>
                  <p className="text-[11px] text-[#A1AFBF]">Renova em</p>
                  <p className="text-[13px] font-bold text-white">12 dias</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[#081018] p-4 border border-[#1B2B3A]">
                <Users className="h-5 w-5 text-[#19E28F]" />
                <div>
                  <p className="text-[11px] text-[#A1AFBF]">Membros da equipe</p>
                  <p className="text-[13px] font-bold text-white">5 usuários</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segurança da Conta */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <h3 className="mb-5 font-serif text-[18px] font-bold text-white">Segurança da Conta</h3>
            
            <div className="mb-5 flex items-start gap-4 rounded-[12px] bg-[rgba(25,226,143,0.06)] p-4 border border-[#19E28F]/20">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#19E28F]/10">
                <ShieldCheck className="h-4 w-4 text-[#19E28F]" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#19E28F]">Sua conta está protegida</p>
                <p className="mt-0.5 text-[12px] text-[#A1AFBF]">Todas as medidas de segurança estão ativas.</p>
              </div>
            </div>

            <div className="flex flex-col">
              {[
                { label: "Senha", value: "Alterada há 12 dias", icon: Eye },
                { label: "Autenticação em duas etapas", value: "Ativa", icon: Shield },
                { label: "E-mail de recuperação", value: "usuario.mvp@scanleadmap.com", icon: Mail },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between border-b border-[#1B2B3A] py-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#19E28F]" />
                      <span className="text-[13px] font-medium text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#A1AFBF]">{item.value}</span>
                      <ChevronRight className="h-4 w-4 text-[#7D8A98]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="rounded-[16px] border border-[rgba(70,110,145,0.28)] bg-[linear-gradient(180deg,#0C141D,#09111A)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-[18px] font-bold text-white">Atividades Recentes</h3>
              <button className="text-[13px] font-medium text-white hover:underline">Ver todas</button>
            </div>
            
            <div className="flex flex-col gap-5">
              {[
                { title: "Login realizado", desc: "São Paulo, SP - Brasil", time: "12 min atrás", icon: Mail, color: "#19E28F", bg: "rgba(25,226,143,0.1)" },
                { title: "Alteração de perfil", desc: "Dados pessoais atualizados", time: "1 dia atrás", icon: UserCheck, color: "#FFD21E", bg: "rgba(255,210,30,0.1)" },
                { title: "Exportação de dados", desc: "Leads exportados", time: "2 dias atrás", icon: Download, color: "#A1AFBF", bg: "rgba(161,175,191,0.1)" },
                { title: "Senha alterada", desc: "Alteração realizada com sucesso", time: "5 dias atrás", icon: Lock, color: "#A1AFBF", bg: "rgba(161,175,191,0.1)" },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: act.bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: act.color }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">{act.title}</p>
                      <p className="mt-0.5 text-[11px] text-[#A1AFBF]">{act.desc}</p>
                    </div>
                    <span className="ml-auto mt-1 text-[11px] text-[#708090]">{act.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Support Floating Button */}
      <button
        type="button"
        className="fixed bottom-6 right-8 z-50 flex h-[48px] items-center justify-center gap-2.5 rounded-full border border-[#12D889]/40 bg-[linear-gradient(90deg,rgba(18,216,137,0.85),rgba(10,191,120,0.9))] px-5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(18,216,137,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,216,137,0.4)]"
      >
        <MessageCircle className="h-5 w-5" />
        Suporte
      </button>

    </div>
  );
}
