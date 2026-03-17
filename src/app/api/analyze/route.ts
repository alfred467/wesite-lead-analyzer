import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Fast parallel website status check — used by search API
// Returns "working" | "broken" | "none"
// ---------------------------------------------------------------------------
export async function checkWebsiteStatus(url: string): Promise<"working" | "broken"> {
  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method:  "GET",
      signal:  controller.signal,
      headers: { "User-Agent": "XovixBusinessFinder/1.0" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res.ok || (res.status >= 300 && res.status < 400) ? "working" : "broken";
  } catch {
    return "broken";
  }
}

// ---------------------------------------------------------------------------
// Deep analysis — called from the detail page
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const startTime  = Date.now();
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      signal:  controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const loadTime = Date.now() - startTime;
    const html     = (await response.text()).toLowerCase();

    // Quality heuristics
    const isHttps           = url.startsWith("https");
    const isMobileResponsive= html.includes('name="viewport"') && html.includes("width=device-width");
    const hasContactPage    = html.includes("contact") || html.includes("get in touch") || html.includes("reach us");
    const hasCTA            = html.includes("<button") || html.includes('type="submit"') || html.includes("book now") || html.includes("order now");
    const hasFacebook       = html.includes("facebook.com/");
    const hasInstagram      = html.includes("instagram.com/");
    const hasLinkedIn       = html.includes("linkedin.com/company/");
    const hasSocials        = hasFacebook || hasInstagram || hasLinkedIn;

    let qualityScore = 30;
    if (isHttps)            qualityScore += 15;
    if (isMobileResponsive) qualityScore += 20;
    if (hasContactPage)     qualityScore += 15;
    if (hasCTA)             qualityScore += 10;
    if (hasSocials)         qualityScore += 10;
    if (loadTime < 2000)    qualityScore += 10;

    const issues: string[] = [];
    if (!isHttps)            issues.push("Missing HTTPS (SSL certificate)");
    if (!isMobileResponsive) issues.push("Not optimized for mobile devices");
    if (!hasContactPage)     issues.push("No clear contact page found");
    if (!hasCTA)             issues.push("Missing strong Call-to-Action");
    if (!hasSocials)         issues.push("No connected social media found");
    if (loadTime > 3000)     issues.push("Slow page load speed");

    return NextResponse.json({
      url,
      status:      response.ok ? "working" : "broken",
      statusCode:  response.status,
      loadTimeMs:  loadTime,
      analysis: {
        isHttps,
        isMobileResponsive,
        hasContactPage,
        hasCTA,
        hasFacebook,
        hasInstagram,
        hasLinkedIn,
        hasSocials,
        qualityScore: Math.min(qualityScore, 100),
        issues,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      url,
      status:   "broken",
      error:    error.message,
      analysis: { qualityScore: 0, issues: ["Website failed to respond or timed out"] },
    });
  }
}
