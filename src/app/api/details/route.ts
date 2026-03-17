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
async function deepPing(url: string | null, tags: any): Promise<{ status: "none" | "working" | "broken"; markers: DigitalMarkers }> {
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
    const timeout = setTimeout(() => ctrl.abort(), 7000);
    
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
  } catch (err) {
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

  try {
    const parts = rawId.replace("osm_", "").split("_");
    const type  = parts[0];
    const osmId = parts[1];

    if (!type || !osmId) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const query = `[out:json]; ${type}(${osmId}); out body;`;
    const res   = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "XovixBusinessFinder/1.0" },
    });

    const data = await res.json();
    const el   = data.elements?.[0];
    if (!el) return NextResponse.json({ error: "Business not found" }, { status: 404 });

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
