"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Search, MapPin, Building2, TrendingUp, CheckCircle2,
  AlertTriangle, XCircle, ArrowRight, ShieldCheck, Zap,
  Rocket, Sparkles, ChevronLeft, ChevronRight, List,
  Filter, Smartphone, Share2, Mail, Gauge, ShieldAlert, Phone
} from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface SearchMeta {
  total:      number;
  page:       number;
  totalPages: number;
  perPage:    number;
  query:      string;
  location:   string;
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();

  const [query,       setQuery]       = useState("");
  const [location,    setLocation]    = useState("Nairobi");
  const [isLoading,   setIsLoading]   = useState(false);
  const [results,     setResults]     = useState<any[]>([]);
  const [meta,        setMeta]        = useState<SearchMeta | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error,       setError]       = useState("");

  // ── Filters State ────────────────────────────────────────────────────────
  const [mainFilter,  setMainFilter]  = useState("all");
  const [advFilters,  setAdvFilters]  = useState({
    noSsl:    false,
    noSocials:false,
    noMobile: false,
    noPhone:  false,
    noEmail:  false,
    slowSpeed:false,
  });

  const toggleAdvFilter = (key: keyof typeof advFilters) => {
    setAdvFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Core search function ──────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string, loc: string, page = 1) => {
    setIsLoading(true);
    setError("");
    try {
      const res  = await fetch(
        `/api/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&page=${page}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      setResults(data.results || []);
      setMeta({
        total:      data.total,
        page:       data.page,
        totalPages: data.totalPages,
        perPage:    data.perPage,
        query:      data.query,
        location:   data.location,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Search failed");
      setResults([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setMainFilter("all");
    setAdvFilters({
      noSsl: false, noSocials: false, noMobile: false, noPhone: false, noEmail: false, slowSpeed: false
    });
    await doSearch(query, location, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (!meta) return;
    doSearch(meta.query, meta.location, newPage);
  };

  // ── Filter results client-side ────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = results;
    
    // Main status filter
    if (mainFilter !== "all") {
      list = list.filter(b => b.website_status === mainFilter);
    }

    // Advanced marker filters
    if (advFilters.noSsl)     list = list.filter(b => b.website_status === "working" && !b.markers?.ssl);
    if (advFilters.noMobile)  list = list.filter(b => b.website_status === "working" && !b.markers?.mobile);
    if (advFilters.noSocials) list = list.filter(b => !b.markers?.socials);
    if (advFilters.noPhone)   list = list.filter(b => !b.markers?.phone);
    if (advFilters.noEmail)   list = list.filter(b => !b.markers?.email);
    if (advFilters.slowSpeed) list = list.filter(b => b.website_status === "working" && (b.markers?.speed === "slow" || b.markers?.speed === "medium"));

    return list;
  }, [results, mainFilter, advFilters]);

  // ── Loading / auth guard ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ── Landing page for guests ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Xovix Labs — Internal Tool
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
            Xovix Business<br /><span className="text-primary">Finder</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto">
            Discover Kenyan businesses, analyze their digital presence, and reach out directly.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md">
            Sign In to Access <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Search Header */}
      <section className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <TrendingUp className="w-3 h-3" /> Welcome back, {user}
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Find High-Value Business Leads
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Analyze thousands of businesses in real-time across Kenya.</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50 border border-gray-200 rounded-3xl shadow-sm">
              <div className="relative flex-1">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Restaurant, Clinic, Law Firm"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                  required
                />
              </div>
              <div className="relative md:w-52">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="City"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-primary text-white font-black text-sm rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/20"
              >
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Search className="w-4 h-4" />
                }
                SEARCH
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results & Filters Section */}
      <section className="container mx-auto px-4 py-12">
        {!hasSearched && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Suggested Industries</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Restaurants", "Hotels", "Schools", "Clinics", "Pharmacies",
                "Law Firms", "Banks", "Salons", "Gyms", "Car Dealers", "Hardware"
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); }}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-6" />
            <p className="font-black text-gray-900 uppercase tracking-widest text-sm">Analyzing {location}...</p>
            <p className="text-xs text-gray-400 mt-2">Deep-scanning websites for 6 core digital markers</p>
          </div>
        )}

        {/* Filters and Results Toolbar */}
        {hasSearched && !isLoading && !error && results.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {meta?.total.toLocaleString()} leads found
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Sorted by high-opportunity leads · Page {meta?.page} of {meta?.totalPages}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase px-2">Main Filter</span>
                {[
                  { k: "all", l: "All" },
                  { k: "none", l: "No Site" },
                  { k: "broken", l: "Broken" },
                  { k: "working", l: "Has Site" }
                ].map(f => (
                  <button
                    key={f.k}
                    onClick={() => setMainFilter(f.k)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      mainFilter === f.k ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-primary"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters (Digital Opportunity) */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-900">
                <Filter className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Digital Opportunity Filters</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdvFilterButton
                  active={advFilters.noSsl}
                  onClick={() => toggleAdvFilter("noSsl")}
                  label="Insecure (No SSL)"
                  icon={<ShieldAlert className="w-3.5 h-3.5" />}
                />
                <AdvFilterButton
                  active={advFilters.noMobile}
                  onClick={() => toggleAdvFilter("noMobile")}
                  label="Not Mobile Ready"
                  icon={<Smartphone className="w-3.5 h-3.5" />}
                />
                <AdvFilterButton
                  active={advFilters.noSocials}
                  onClick={() => toggleAdvFilter("noSocials")}
                  label="No Social Presence"
                  icon={<Share2 className="w-3.5 h-3.5" />}
                />
                <AdvFilterButton
                  active={advFilters.noPhone}
                  onClick={() => toggleAdvFilter("noPhone")}
                  label="Missing Phone"
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
                <AdvFilterButton
                  active={advFilters.noEmail}
                  onClick={() => toggleAdvFilter("noEmail")}
                  label="Missing Email"
                  icon={<Mail className="w-3.5 h-3.5" />}
                />
                <AdvFilterButton
                  active={advFilters.slowSpeed}
                  onClick={() => toggleAdvFilter("slowSpeed")}
                  label="Slow Load Speed"
                  icon={<Gauge className="w-3.5 h-3.5" />}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 px-2 font-bold uppercase tracking-widest">
              <List className="w-3.5 h-3.5" /> Showing {displayed.length} results
            </div>

            {/* Business Cards Grid */}
            {displayed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayed.map((b, i) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-bold">No results match your active filters.</p>
                <button
                  onClick={() => { setMainFilter("all"); setAdvFilters({ noSsl: false, noSocials: false, noMobile: false, noPhone: false, noEmail: false, slowSpeed: false }); }}
                  className="mt-2 text-primary text-xs font-black uppercase hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-12 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                      let p = i + 1;
                      if (meta.page > 3) p = meta.page - 2 + i;
                      if (p > meta.totalPages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-11 h-11 rounded-2xl font-black text-sm transition-all ${
                            meta.page === p ? "bg-gray-900 text-white shadow-xl" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.totalPages}
                    className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {meta.page} of {meta.totalPages}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function AdvFilterButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: any, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
        active ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}
