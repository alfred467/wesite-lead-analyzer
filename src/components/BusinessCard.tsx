"use client";

import Link from "next/link";
import {
  Globe, Phone, MapPin, Building2,
  ShieldCheck, ShieldAlert, Zap, Flame, Snowflake,
  ArrowRight, Smartphone, Mail, Share2, Gauge,
  CheckCircle2, AlertCircle, XCircle
} from "lucide-react";

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    industry: string;
    location: string;
    website_status: "none" | "working" | "broken";
    lead_score: number;
    lead_tag: "hot" | "warm" | "cold";
    phone?: string | null;
    website?: string | null;
    email?: string | null;
    markers?: {
      ssl: boolean;
      socials: boolean;
      phone: boolean;
      email: boolean;
      mobile: boolean;
      speed: "fast" | "medium" | "slow" | "fail";
    };
  };
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { id, name, industry, location, website_status, lead_score, lead_tag, markers } = business;

  const tagStyles = {
    hot:  { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", icon: <Flame className="w-3 h-3" />, label: "Hot Lead" },
    warm: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: <Zap className="w-3 h-3" />, label: "Warm Lead" },
    cold: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: <Snowflake className="w-3 h-3" />, label: "Cold Lead" },
  };

  const ts = tagStyles[lead_tag] || tagStyles.cold;

  // Status badge for website
  const statusBadge = {
    working: { bg: "bg-green-500", label: "Working" },
    broken:  { bg: "bg-red-500",   label: "Broken" },
    none:    { bg: "bg-gray-400",  label: "No site" },
  }[website_status];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> {industry}
          </p>
          <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{name}</h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-900 text-[10px] font-black text-white mb-1.5">
            SCORE {lead_score}
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${ts.bg} ${ts.text} ${ts.border} text-[10px] font-bold`}>
            {ts.icon} {ts.label}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{location}</span>
        </p>
        
        {/* Core Markers Grid (The 6 Features) */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-50 my-3">
          <MarkerIcon
            icon={<ShieldCheck className="w-3 h-3" />}
            label="SSL"
            active={markers?.ssl}
            missing={website_status === "working" && !markers?.ssl}
          />
          <MarkerIcon
            icon={<Share2 className="w-3 h-3" />}
            label="Social"
            active={markers?.socials}
          />
          <MarkerIcon
            icon={<Phone className="w-3 h-3" />}
            label="Phone"
            active={markers?.phone}
          />
          <MarkerIcon
            icon={<Mail className="w-3 h-3" />}
            label="Email"
            active={markers?.email}
          />
          <MarkerIcon
            icon={<Smartphone className="w-3 h-3" />}
            label="Mobile"
            active={markers?.mobile}
            missing={website_status === "working" && !markers?.mobile}
          />
          <MarkerIcon
            icon={<Gauge className="w-3 h-3" />}
            label="Speed"
            active={markers?.speed === "fast"}
            warning={markers?.speed === "medium" || markers?.speed === "slow"}
            fail={markers?.speed === "fail"}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative flex">
            <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.bg} border-2 border-white`} />
            <span className={`absolute w-2.5 h-2.5 rounded-full ${statusBadge.bg} animate-ping opacity-30`} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{statusBadge.label}</span>
        </div>

        <Link
          href={`/business/${id}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:shadow-sm"
        >
          Analyze <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function MarkerIcon({ icon, label, active, missing, warning, fail }: any) {
  let statusColor = "text-gray-300 bg-gray-50 border-gray-100";
  if (active) statusColor = "text-primary bg-primary/5 border-primary/20";
  if (missing || fail) statusColor = "text-red-500 bg-red-50 border-red-100";
  if (warning) statusColor = "text-amber-500 bg-amber-50 border-amber-100";

  return (
    <div className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border ${statusColor} transition-colors title={label}`}>
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}
