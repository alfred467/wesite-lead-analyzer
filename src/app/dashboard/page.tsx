"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Users, Globe, MessageSquare,
  TrendingUp, Download,
  Building2, Trash2, 
  ExternalLink, Calendar, Search,
  MapPin, ArrowRight, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { getSavedLeads, updateLead, removeLead, SavedLead } from "@/lib/storage";

export default function Dashboard() {
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeads(getSavedLeads());
    setIsMounted(true);
  }, []);
  const [isExporting, setIsExporting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    { label: "Total Saved", value: leads.length, icon: <Users className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
    { label: "Hot Prospects", value: leads.filter(l => l.lead_tag === "hot").length, icon: <TrendingUp className="w-5 h-5" />, color: "bg-red-50 text-red-600" },
    { label: "No Website", value: leads.filter(l => l.website_status === "none").length, icon: <Globe className="w-5 h-5" />, color: "bg-amber-50 text-amber-600" },
    { label: "Contacted", value: leads.filter(l => l.contacted).length, icon: <MessageSquare className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
  ];

  const handleToggleContacted = (id: string, contacted: boolean) => {
    updateLead(id, { contacted: !contacted });
    setLeads(getSavedLeads());
  };

  const handleRemoveLead = (id: string) => {
    if (confirm("Remove this lead from your dashboard?")) {
      removeLead(id);
      setLeads(getSavedLeads());
    }
  };

  const filteredLeads = leads
    .filter(l => (filter === "all" || l.website_status === filter))
    .filter(l => (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.industry.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = "Lead Name,Industry,Location,Website Status,Score,Hot Lead,Contacted,Phone,Website,Email,SSL,Mobile,Socials,Speed,Notes,Saved Date\n";
      const rows = leads.map(l => {
        const m = l.markers;
        return `"${l.name}","${l.industry}","${l.location}","${l.website_status}",${l.lead_score},${l.lead_tag === "hot"},${l.contacted},"${l.phone || ""}","${l.website || ""}","${l.email || ""}",${m?.ssl || false},${m?.mobile || false},${m?.socials || false},"${m?.speed || "fail"}","${l.notes.replace(/"/g, '""')}","${l.savedAt}"`;
      }).join("\n");
      
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `xovix_leads_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Dashboard Hero */}
      <section className="bg-white border-b border-gray-100 py-12 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                <BarChart3 className="w-3.5 h-3.5" /> Xovix Lead Management CRM
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Sales Pipeline</h1>
              <p className="text-gray-400 text-sm mt-2 max-w-lg">Track, manage and optimize your outreach to businesses across Kenya. High-opportunity leads are prioritized first.</p>
            </div>
            
            <button 
              onClick={handleExportCSV}
              disabled={leads.length === 0 || isExporting}
              className="px-8 py-4 bg-gray-900 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-30"
            >
              {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? "PREPARING..." : "EXPORT CSV DATA"}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color} shadow-sm`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leads Table Section */}
      <section className="container mx-auto px-4 mt-12">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          {/* Table Header/Toolbar */}
          <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="relative flex-1 lg:min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    placeholder="Search leads by name or industry..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/5"
                  />
               </div>
               <div className="hidden lg:flex items-center gap-2">
                 {[
                   { k: "all", l: "All" },
                   { k: "none", l: "No Website" },
                   { k: "working", l: "Active" },
                 ].map(f => (
                   <button 
                     key={f.k} 
                     onClick={() => setFilter(f.k)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                       filter === f.k ? "bg-primary text-white border-primary" : "bg-white text-gray-400 border-gray-100"
                     }`}
                   >
                     {f.l}
                   </button>
                 ))}
               </div>
            </div>
            <Link href="/" className="px-6 py-3 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl border border-primary/10 hover:bg-primary/10 transition-all flex items-center gap-2">
               <Search className="w-3.5 h-3.5" /> Start New Search
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
               <thead>
                 <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-8 py-5">Prospect Business</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-center">Digital Score</th>
                    <th className="px-8 py-5 text-center">Contacted</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                   <tr key={lead.id} className="hover:bg-gray-25 transition-all">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-50">
                              <Building2 className="w-6 h-6 text-gray-400" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-gray-900 leading-tight">{lead.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-primary uppercase">{lead.industry}</span>
                                <span className="text-gray-300 text-[10px]">|</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" /> {lead.location}
                                </span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          lead.website_status === "working" ? "bg-green-50 text-green-700 border-green-100" :
                          lead.website_status === "broken" ? "bg-red-50 text-red-600 border-red-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {lead.website_status === "none" ? "No Digital Presence" : lead.website_status}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                              <div className={`h-full rounded-full transition-all duration-1000 ${
                                lead.lead_score >= 70 ? "bg-red-500" : lead.lead_score >= 40 ? "bg-amber-500" : "bg-primary"
                              }`} style={{ width: `${lead.lead_score}%` }} />
                           </div>
                           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{lead.lead_score} POINTS</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => handleToggleContacted(lead.id, lead.contacted)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          lead.contacted ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300"
                        }`}>
                           {lead.contacted ? "Completed" : "Mark as Done"}
                        </button>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link 
                              href={`/business/${lead.id}`} 
                              className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                           >
                              <ExternalLink className="w-4 h-4" />
                           </Link>
                           <button 
                              onClick={() => handleRemoveLead(lead.id)}
                              className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={5} className="px-8 py-32 text-center">
                        <div className="max-w-xs mx-auto">
                           <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                              <Building2 className="w-8 h-8 text-gray-200" />
                           </div>
                           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Pipeline Empty</h3>
                           <p className="text-xs text-gray-400 leading-relaxed mb-6">Start searching for businesses and save them to your pipeline for outreach.</p>
                           <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                             Go to Search Engine
                           </Link>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        </div>

        {/* Lead Insights Row */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
             <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <TrendingUp className="w-5 h-5 text-primary" />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-widest">Growth Velocity</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-gray-500 uppercase">Contacted Leads</p>
                      <p className="text-xl font-black">{Math.round((leads.filter(l => l.contacted).length / leads.length) * 100)}%</p>
                   </div>
                   <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(leads.filter(l => l.contacted).length / leads.length) * 100}%` }} />
                   </div>
                   <p className="text-xs text-gray-400 italic font-medium leading-relaxed">
                     You have completed outreach to {leads.filter(l => l.contacted).length} out of your {leads.length} saved leads.
                   </p>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">High-Priority Hotleads</h3>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed">
                     We detected <strong>{leads.filter(l => l.lead_tag === "hot").length} businesses</strong> that require urgent digital assistance. These represent high-value potential clients.
                   </p>
                </div>
                <Link href="/" className="mt-6 text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                   View search depth <ArrowRight className="w-3.5 h-3.5" />
                </Link>
             </div>

             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pending Strategy</h3>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      You have <strong>{leads.filter(l => !l.contacted).length} leads</strong> awaiting outreach. Use the Xovix Smart Messaging Assistant to reach them faster.
                   </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-gray-300 text-[10px] font-black uppercase">
                   <Calendar className="w-3.5 h-3.5" /> Auto-sync enabled
                </div>
             </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Flame({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.203 1.15-3.003l3.85 3.003z"/>
    </svg>
  );
}
