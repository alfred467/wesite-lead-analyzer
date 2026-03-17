"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Globe, Phone, MapPin, Building2,
  ShieldCheck, ShieldAlert, Zap, Flame, Snowflake,
  Mail, MessageSquare, Copy, CheckCircle2, AlertCircle,
  BarChart3, Rocket, Smartphone, RefreshCw, Send, History, 
  Sparkles, MessageCircleMore, Tag, Share2, Gauge, Save, BookmarkCheck, Trash2
} from "lucide-react";
import { generateOutreach, suggestReply, generateFollowUp, detectIntent } from "@/lib/messaging";

export default function BusinessDetail() {
  const { id } = useParams();
  const router  = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [notes, setNotes] = useState("");

  // Messaging
  const [activeTab, setActiveTab]       = useState<"outreach" | "reply" | "followup">("outreach");
  const [variations, setVariations]     = useState<string[]>([]);
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [replyText, setReplyText]       = useState("");
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [followUps, setFollowUps]       = useState<string[]>([]);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Check if already saved in localStorage
    const savedLeads = JSON.parse(localStorage.getItem("xovix_saved_leads") || "[]");
    const existing = savedLeads.find((l: any) => l.id === id);
    if (existing) {
      setIsSaved(true);
      setNotes(existing.notes || "");
    }

    const fetchBusiness = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res  = await fetch(`/api/details?id=${encodeURIComponent(id as string)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load business");

        // Compute score and tag
        const m = data.markers;
        let score = 0;
        if (data.website_status === "none")    score += 45;
        if (data.website_status === "broken")  score += 35;
        if (!m.ssl && data.website_status !== "none")     score += 15;
        if (!m.mobile && data.website_status !== "none")  score += 15;
        if (!m.socials) score += 10;
        if (!m.phone)   score += 5;
        if (m.speed === "slow") score += 10;
        score = Math.min(score, 100);
        const leadTag = score >= 70 ? "hot" : score >= 45 ? "warm" : "cold";

        const businessData = {
          ...data,
          lead_score: score,
          lead_tag: leadTag,
        };

        setBusiness(businessData);
        setVariations(generateOutreach({
          businessName: businessData.name,
          industry:     businessData.industry,
          location:     businessData.address,
          status:       businessData.website_status,
          qualityScore: score,
        }));
        setFollowUps(generateFollowUp(businessData.name));
      } catch (err: any) {
        setError(err.message || "Failed to load business data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  const handleSaveToggle = () => {
    if (!business) return;
    const savedLeads = JSON.parse(localStorage.getItem("xovix_saved_leads") || "[]");
    
    if (isSaved) {
      // Remove
      const filtered = savedLeads.filter((l: any) => l.id !== id);
      localStorage.setItem("xovix_saved_leads", JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      // Save
      const newLead = {
        ...business,
        notes: notes,
        savedAt: new Date().toISOString()
      };
      savedLeads.push(newLead);
      localStorage.setItem("xovix_saved_leads", JSON.stringify(savedLeads));
      setIsSaved(true);
    }
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (isSaved) {
      const savedLeads = JSON.parse(localStorage.getItem("xovix_saved_leads") || "[]");
      const updated = savedLeads.map((l: any) => l.id === id ? { ...l, notes: val } : l);
      localStorage.setItem("xovix_saved_leads", JSON.stringify(updated));
    }
  };

  const handleRegenerate = () => {
    if (!business) return;
    setVariations(generateOutreach({
      businessName: business.name,
      industry:     business.industry,
      location:     business.location,
      status:       business.website_status,
      qualityScore: business.lead_score,
    }));
    setSelectedVarIdx(0);
  };

  const currentMessage = useMemo(() => {
    if (activeTab === "outreach") return variations[selectedVarIdx] || "";
    if (activeTab === "followup") return followUps[0] || "";
    return "";
  }, [activeTab, variations, selectedVarIdx, followUps]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = business?.phone?.replace(/[^0-9+]/g, "") || "";
  const waNumber   = cleanPhone.startsWith("+") ? cleanPhone.replace("+", "") : `254${cleanPhone.replace(/^0/, "")}`;
  const waUrl      = cleanPhone ? `https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessage)}` : null;

  // Loading / Error
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-10">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Deep-scanning {id}...</p>
        <p className="text-xs text-gray-400">Verifying 6 core markers: SSL, Mobile, Socials, Email...</p>
      </div>
    </div>
  );

  if (error || !business) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <AlertCircle className="w-14 h-14 text-red-200 mb-6" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">Lead Expired or Not Found</h2>
      <p className="text-sm text-gray-400 mb-8 max-w-sm text-center">{error || "This lead could not be retrieved from the network."}</p>
      <button onClick={() => router.back()} className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Return to Search
      </button>
    </div>
  );

  const tagStyles: Record<string, any> = {
    hot:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    icon: <Flame className="w-4 h-4" />,     label: "Hot Prospect"  },
    warm: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: <Zap   className="w-4 h-4" />,     label: "Warm Lead" },
    cold: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   icon: <Snowflake className="w-4 h-4" />, label: "Cold" },
  };
  const ts = tagStyles[business.lead_tag] || tagStyles.cold;

  return (
    <div className="bg-gray-25 min-h-screen pb-20">
      {/* Detail Header */}
      <section className="bg-white border-b border-gray-100 py-8 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 hover:text-primary hover:border-primary transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{business.industry}</p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{business.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
               onClick={handleSaveToggle}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                 isSaved ? "bg-primary/10 text-primary border border-primary/20" : "bg-gray-900 text-white border border-gray-900 hover:bg-black"
               }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved to Leads" : "Save this Lead"}
            </button>
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-4 ${ts.bg} ${ts.border}`}>
              <div className="text-center">
                <p className={`text-[8px] font-black uppercase tracking-widest ${ts.text}`}>Score</p>
                <p className={`text-xl font-black ${ts.text}`}>{business.lead_score}</p>
              </div>
              <div className="w-px h-8 bg-black/5" />
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${ts.text}`}>
                {ts.icon} {ts.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Business Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <ContactInfoCard 
                label="Website" 
                value={business.website ? business.website.replace(/^https?:\/\//, "") : "Not Detected"} 
                link={business.website}
                icon={<Globe className="w-5 h-5 text-primary" />}
                status={business.website_status === "working" ? "active" : business.website_status === "broken" ? "fail" : "none"}
               />
               <ContactInfoCard 
                label="Primary Phone" 
                value={business.phone || "Missing"} 
                link={business.phone ? `tel:${business.phone}` : null}
                icon={<Phone className="w-5 h-5 text-primary" />}
                status={business.phone ? "active" : "none"}
               />
               <ContactInfoCard 
                label="Business Email" 
                value={business.email || "Missing"} 
                link={business.email ? `mailto:${business.email}` : null}
                icon={<Mail className="w-5 h-5 text-primary" />}
                status={business.email ? "active" : "none"}
               />
            </div>

            {/* The 6 Core Digital Markers Panel */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <BarChart3 className="w-6 h-6 text-primary" /> 6 Core Digital Opportunity Markers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MarkerDetail 
                   label="SSL Security" 
                   active={business.markers?.ssl} 
                   icon={<ShieldCheck className="w-5 h-5" />} 
                   desc={business.markers?.ssl ? "Encrypted and secure connection." : "Unsecured. Browser warn users against entry."} 
                />
                <MarkerDetail 
                   label="Mobile Readiness" 
                   active={business.markers?.mobile} 
                   icon={<Smartphone className="w-5 h-5" />} 
                   desc={business.markers?.mobile ? "Responsive on all screens." : "Static layout. Hard to use on phones."} 
                />
                <MarkerDetail 
                   label="Social Footprint" 
                   active={business.markers?.socials} 
                   icon={<Share2 className="w-5 h-5" />} 
                   desc={business.markers?.socials ? "Connected brands detected." : "No social media linked or found."} 
                />
                 <MarkerDetail 
                   label="Load Speed" 
                   active={business.markers?.speed === "fast"} 
                   warning={business.markers?.speed === "medium" || business.markers?.speed === "slow"}
                   icon={<Gauge className="w-5 h-5" />} 
                   desc={`Current performance: ${business.markers?.speed?.toUpperCase()}.`} 
                />
                 <MarkerDetail 
                   label="Contact-Ready" 
                   active={business.markers?.phone && business.markers?.email} 
                   icon={<CheckCircle2 className="w-5 h-5" />} 
                   desc="Checks if both email and phone are digitized." 
                />
                 <MarkerDetail 
                   label="Domain Integrity" 
                   active={business.website_status === "working"} 
                   fail={business.website_status === "broken"}
                   icon={<Globe className="w-5 h-5" />} 
                   desc={business.website_status === "working" ? "Domain resolves correctly." : "Domain pointing errors detected."} 
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
               <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <Tag className="w-6 h-6 text-primary" /> Lead Notes & Strategy
              </h2>
              <textarea 
                placeholder="Type lead strategy or custom notes here... (Autosaves)" 
                className="w-full h-40 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
            </div>
            
            {/* Raw OSM Tags (Collapsible) */}
            {Object.keys(business.tags || {}).length > 0 && (
              <details className="group">
                <summary className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer list-none">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">OpenStreetMap Infrastructure Metadata</span>
                  <Tag className="w-4 h-4 text-gray-300 group-open:rotate-180 transition-all" />
                </summary>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3 bg-white border border-t-0 border-gray-100 rounded-b-2xl">
                   {Object.entries(business.tags).map(([k, v]: any) => (
                    <div key={k} className="p-3 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                      <p className="text-[9px] font-bold text-gray-400 uppercase truncate">{k}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{v}</p>
                    </div>
                   ))}
                </div>
              </details>
            )}
          </div>

          {/* Assistant Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="p-8 pb-4 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Xovix Smart Assistant</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Nairobi HQ - Ver 4.0</p>
                </div>
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>

              {/* Tabs */}
              <div className="flex px-4 pt-4">
                {[
                  { id: "outreach", label: "Initial", icon: <Send className="w-3 h-3" /> },
                  { id: "reply",    label: "Reply Assistant", icon: <MessageCircleMore className="w-3 h-3" /> },
                  { id: "followup", label: "Follow-up", icon: <History className="w-3 h-3" /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-t-3xl ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab.icon} {tab.label.split(" ")[0]}
                  </button>
                ))}
              </div>

              <div className="bg-white p-8">
                {activeTab === "outreach" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Sets</p>
                      <button onClick={handleRegenerate} className="text-primary hover:rotate-180 transition-all duration-700">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                       {variations.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVarIdx(i)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedVarIdx === i ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                          SET {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-sm text-gray-700 leading-relaxed min-h-[160px] italic">
                      "{variations[selectedVarIdx] || "Calibrating engine..."}"
                    </div>
                  </div>
                )}

                {activeTab === "reply" && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Response</p>
                    <textarea
                      placeholder="Paste their reply here..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-800 focus:outline-none min-h-[100px] resize-none"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <button
                      onClick={() => setSuggestedReplies(suggestReply(detectIntent(replyText)))}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
                    >
                      Analyze Intent & Suggest Response
                    </button>
                    {suggestedReplies.map((r, i) => (
                      <div key={i} className="group relative p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                        <p className="text-xs text-gray-700 pr-8 italic">{r}</p>
                        <button onClick={() => handleCopy(r)} className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-all">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "followup" && (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence Builders</p>
                      {followUps.map((msg, i) => (
                        <div key={i} className="group relative p-6 bg-gray-50 border border-gray-100 rounded-[2rem]">
                          <p className="text-sm text-gray-600 pr-6 leading-relaxed italic">"{msg}"</p>
                          <button onClick={() => handleCopy(msg)} className="absolute top-4 right-4 text-gray-300 hover:text-primary transition-all">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                   </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                   <button
                      onClick={() => handleCopy(currentMessage)}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied to Clipboard" : "Copy Message"}
                    </button>
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#22c55e] transition-all shadow-xl shadow-green-500/20">
                        <MessageSquare className="w-4 h-4" /> Ship via WhatsApp
                      </a>
                    )}
                </div>
              </div>
            </div>

            {/* Strategy Sidebar Tooltip */}
            <div className={`p-6 rounded-[2rem] border ${ts.bg} ${ts.border} shadow-sm`}>
               <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${ts.text} flex items-center gap-2`}>
                 <Rocket className="w-3.5 h-3.5" /> Growth Strategy
               </h4>
               <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Focused on <span className="font-bold text-gray-900">{business.name}</span>'s digital deficit. 
                  {business.website_status === "none" 
                    ? " Absence of digital footprint makes them a prime candidate for a starter web presence package."
                    : " Site detected but with critical infrastructure failure (SSL/Mobile). Pitch and fix the funnel first."}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({ label, value, link, icon, status }: any) {
  const statusColors = {
    active: "bg-green-50 text-green-700 border-green-100",
    fail:   "bg-red-50 text-red-600 border-red-100",
    none:   "bg-gray-50 text-gray-400 border-gray-100",
  }[status as keyof typeof statusColors];

  return (
    <div className={`p-5 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col gap-4`}>
       <div className="flex items-center justify-between">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">{icon}</div>
          <div className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${statusColors}`}>
            {status}
          </div>
       </div>
       <div>
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
         {link ? (
           <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-900 hover:text-primary transition-all truncate block">
             {value}
           </a>
         ) : (
           <p className="text-sm font-bold text-gray-300 italic">{value}</p>
         )}
       </div>
    </div>
  );
}

function MarkerDetail({ label, active, icon, desc, warning, fail }: any) {
  const color = active ? "text-primary border-primary/20 bg-primary/5" : (fail ? "text-red-600 border-red-200 bg-red-50" : (warning ? "text-amber-600 border-amber-200 bg-amber-50" : "text-gray-300 border-gray-100 bg-gray-50"));
  
  return (
    <div className={`p-6 rounded-[2rem] border ${color} transition-all`}>
       <div className="flex items-center gap-3 mb-4">
         <div className="p-2 rounded-xl bg-white/50">{icon}</div>
         <p className="text-xs font-black uppercase tracking-widest">{label}</p>
       </div>
       <p className="text-[11px] font-medium leading-relaxed opacity-80">{desc}</p>
    </div>
  );
}
