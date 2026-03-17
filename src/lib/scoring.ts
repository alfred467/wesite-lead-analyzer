export interface LeadAnalysis {
  hasWebsite: boolean;
  websiteStatus: "working" | "broken" | "none";
  hasEmail: boolean;
  hasSocials: boolean;
  qualityScore: number; // 0-100
}

export function calculateLeadScore(analysis: LeadAnalysis): { score: number; tag: "hot" | "warm" | "cold" } {
  let score = 0;

  // Rules:
  // No website → +40
  // Broken website → +35
  // Poor quality website → +25 (if qualityScore < 50)
  // No email → +10
  // No social media → +10

  if (analysis.websiteStatus === "none") {
    score += 40;
  } else if (analysis.websiteStatus === "broken") {
    score += 35;
  } else if (analysis.qualityScore < 50) {
    score += 25;
  }

  if (!analysis.hasEmail) {
    score += 10;
  }

  if (!analysis.hasSocials) {
    score += 10;
  }

  // Cap at 100
  score = Math.min(score, 100);

  let tag: "hot" | "warm" | "cold" = "cold";
  if (score >= 70) tag = "hot";
  else if (score >= 40) tag = "warm";

  return { score, tag };
}
