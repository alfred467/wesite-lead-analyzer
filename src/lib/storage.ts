export interface SavedLead {
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
  contacted: boolean;
  notes: string;
  savedAt: string;
  markers?: {
    ssl: boolean;
    socials: boolean;
    phone: boolean;
    email: boolean;
    mobile: boolean;
    speed: "fast" | "medium" | "slow" | "fail";
  };
}

export const getSavedLeads = (): SavedLead[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("xovix_saved_leads");
  return saved ? JSON.parse(saved) : [];
};

export const updateLead = (id: string, updates: Partial<SavedLead>) => {
  const leads = getSavedLeads();
  const updated = leads.map(l => l.id === id ? { ...l, ...updates } : l);
  localStorage.setItem("xovix_saved_leads", JSON.stringify(updated));
};

export const removeLead = (id: string) => {
  const leads = getSavedLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem("xovix_saved_leads", JSON.stringify(filtered));
};
