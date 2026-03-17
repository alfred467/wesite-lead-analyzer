import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// 6 Core Markers Data Structure
// ---------------------------------------------------------------------------
interface DigitalMarkers {
  ssl: boolean;
  socials: boolean;
  phone: boolean;
  email: boolean;
  mobile: boolean;
  speed: "fast" | "medium" | "slow" | "fail";
}

// ---------------------------------------------------------------------------
// Real-time deep-ping for 6 Core Markers
// ---------------------------------------------------------------------------
async function deepPing(url: string | null, tags: Record<string, string | undefined>): Promise<{ status: "none" | "working" | "broken"; markers: DigitalMarkers }> {
  const markers: DigitalMarkers = {
    ssl: url?.startsWith("https://") || false,
    socials: !!(tags["contact:facebook"] || tags["contact:instagram"] || tags["contact:twitter"] || tags["contact:linkedin"]),
    phone: !!(tags["phone"] || tags["contact:phone"]),
    email: !!(tags["email"] || tags["contact:email"]),
    mobile: false,
    speed: "fail",
  };

  if (!url) return { status: "none", markers };

  try {
    const startTime = Date.now();
    const ctrl = new AbortController();
    const timeoutMs = parseInt(process.env.WEBSITE_ANALYZER_TIMEOUT || "5000", 10);
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    
    const res = await fetch(url, {
      method: "GET",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow"
    });
    clearTimeout(timeout);

    const latency = Date.now() - startTime;
    const finalUrl = res.url || url;
    const text = (await res.text()).toLowerCase().slice(0, 20000);

    markers.ssl = finalUrl.startsWith("https://");
    markers.socials = markers.socials || text.includes("facebook.com/") || text.includes("instagram.com/") || text.includes("twitter.com/") || text.includes("linkedin.com/company/");
    markers.mobile = text.includes('name="viewport"') && text.includes("width=device-width");
    markers.phone = markers.phone || text.includes("tel:") || /\+?254\s?7\d{2}/.test(text);
    markers.email = markers.email || text.includes("mailto:") || /[\w.-]+@[\w.-]+\.[a-z]{2,}/.test(text);
    
    if (latency < 1500) markers.speed = "fast";
    else if (latency < 3500) markers.speed = "medium";
    else markers.speed = "slow";

    return { status: res.ok ? "working" : "broken", markers };
  } catch {
    return { status: "broken", markers };
  }
}

// ---------------------------------------------------------------------------
// Main GET handler
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("id");

  if (!rawId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 2): Promise<Response> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout for Overpass
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) return res;
        if (res.status === 429 || res.status >= 500) {
           if (i < retries) {
             await new Promise(r => setTimeout(r, 1000 * (i + 1)));
             continue;
           }
        }
        return res;
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw new Error("Maximum retries reached");
  };

  try {
    const parts = rawId.replace("osm_", "").split("_");
    const type  = parts[0];
    const osmId = parts[1];

    if (!type || !osmId) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const query = `[out:json][timeout:15]; ${type}(${osmId}); out body;`;
    const res = await fetchWithRetry("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "XovixBusinessFinder/1.0" },
    });

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 504 || res.status === 503) {
        throw new Error("Overpass API is currently busy or timed out. Please retry.");
      }
      throw new Error(`Overpass API Error: ${res.status} ${res.statusText}. ${errorText.slice(0, 50)}`);
    }

    let data;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (text.includes("<?xml") || text.includes("<html") || text.includes("<body")) {
        throw new Error("Overpass API returned an unexpected response (Server Busy). Please retry.");
      }
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Overpass API returned invalid data format. Please retry.");
      }
    }

    const el = data.elements?.[0];
    if (!el) return NextResponse.json({ error: "Business not found in OpenStreetMap" }, { status: 404 });

    const tags = el.tags || {};
    const url  = tags.website || tags["contact:website"] || null;
    
    // Perform deep ping for detail page
    const { status, markers } = await deepPing(url, tags);

    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:city"],
      tags["addr:country"],
    ].filter(Boolean);

    return NextResponse.json({
      id: rawId,
      name: tags.name,
      phone: tags.phone || tags["contact:phone"] || (markers.phone ? "Detected on site" : null),
      website: url,
      email: tags.email || tags["contact:email"] || (markers.email ? "Detected on site" : null),
      address: addressParts.join(", ") || "Kenya",
      industry: (tags.amenity || tags.shop || tags.tourism || tags.office || "Business").replace(/_/g, " "),
      website_status: status,
      markers: markers,
      tags: tags
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
