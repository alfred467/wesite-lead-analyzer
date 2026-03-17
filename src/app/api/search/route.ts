import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Keyword → OSM tag mapping
// ---------------------------------------------------------------------------
const OSM_TAG_MAP: Record<string, string[]> = {
  restaurant:   [`"amenity"="restaurant"`, `"amenity"="fast_food"`],
  "fast food":  [`"amenity"="fast_food"`],
  cafe:         [`"amenity"="cafe"`, `"amenity"="coffee_shop"`],
  hotel:        [`"tourism"="hotel"`, `"tourism"="guest_house"`, `"tourism"="motel"`],
  lodge:        [`"tourism"="hotel"`, `"tourism"="guest_house"`, `"tourism"="hostel"`],
  clinic:       [`"amenity"="clinic"`, `"amenity"="doctors"`, `"amenity"="health_post"`],
  hospital:     [`"amenity"="hospital"`],
  pharmacy:     [`"amenity"="pharmacy"`],
  school:       [`"amenity"="school"`, `"amenity"="kindergarten"`],
  college:      [`"amenity"="college"`, `"amenity"="university"`],
  university:   [`"amenity"="university"`],
  supermarket:  [`"shop"="supermarket"`, `"shop"="convenience"`],
  "law firm":   [`"office"="lawyer"`],
  lawyer:       [`"office"="lawyer"`],
  bank:         [`"amenity"="bank"`],
  "car dealer": [`"shop"="car"`, `"shop"="car_repair"`],
  garage:       [`"shop"="car_repair"`, `"amenity"="fuel"`],
  fuel:         [`"amenity"="fuel"`, `"amenity"="fuel_station"`],
  petrol:       [`"amenity"="fuel"`],
  gym:          [`"leisure"="fitness_centre"`, `"leisure"="sports_centre"`],
  salon:        [`"shop"="hairdresser"`, `"shop"="beauty"`],
  barbershop:   [`"shop"="hairdresser"`],
  beauty:       [`"shop"="beauty"`, `"shop"="cosmetics"`],
  dentist:      [`"amenity"="dentist"`],
  optician:     [`"shop"="optician"`],
  bakery:       [`"shop"="bakery"`],
  butcher:      [`"shop"="butcher"`],
  church:       [`"amenity"="place_of_worship"`],
  office:       [`"office"~".",i`],
  bar:          [`"amenity"="bar"`, `"amenity"="pub"`],
  nightclub:    [`"amenity"="nightclub"`],
  hardware:     [`"shop"="hardware"`, `"shop"="doityourself"`],
  electronics:  [`"shop"="electronics"`, `"shop"="mobile_phone"`],
  clothing:     [`"shop"="clothes"`, `"shop"="fashion"`],
  bookshop:     [`"shop"="books"`],
  laundry:      [`"shop"="laundry"`, `"amenity"="laundry"`],
  printing:     [`"shop"="copyshop"`, `"craft"="printer"`],
  insurance:    [`"office"="insurance"`],
  accounting:   [`"office"="accountant"`],
  construction: [`"office"="construction_company"`, `"craft"="construction"`],
  travel:       [`"office"="travel_agent"`, `"shop"="travel_agency"`],
  taxi:         [`"amenity"="taxi"`],
  logistics:    [`"office"="logistics"`, `"shop"="storage_rental"`],
  veterinary:   [`"amenity"="veterinary"`],
  photography:  [`"shop"="photo"`, `"craft"="photographer"`],
  catering:     [`"amenity"="restaurant"`, `"amenity"="catering"`],
  spa:          [`"leisure"="spa"`, `"shop"="beauty"`],
  real_estate:  [`"office"="estate_agent"`],
  shop:         [`"shop"~".",i`],
  store:        [`"shop"~".",i`],
};

function getOsmTags(keyword: string): string[] {
  const lower = keyword.toLowerCase().trim();
  if (OSM_TAG_MAP[lower]) return OSM_TAG_MAP[lower];
  for (const key of Object.keys(OSM_TAG_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return OSM_TAG_MAP[key];
  }
  return [`"name"~"${keyword}",i`];
}

// ---------------------------------------------------------------------------
// Nominatim Geocode
// ---------------------------------------------------------------------------
async function geocodeCity(city: string): Promise<{ bbox: [number, number, number, number] } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
      headers: { "User-Agent": "XovixBusinessFinder/1.0" }
    });
    const data = await res.json();
    if (!data?.length) return null;
    const [south, north, west, east] = data[0].boundingbox.map(Number);
    return { bbox: [south, north, west, east] };
  } catch { return null; }
}

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
  // Base markers from OSM tags
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
    
    // Fetch with follow redirects
    const res = await fetch(url, {
      method: "GET",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow"
    });
    clearTimeout(timeout);

    const latency = Date.now() - startTime;
    const finalUrl = res.url || url;
    const isHttps = finalUrl.startsWith("https://");
    
    // Read a small chunk of text to detect markers
    const text = (await res.text()).toLowerCase().slice(0, 15000); // Check first 15KB

    const hasSocials = markers.socials || text.includes("facebook.com/") || text.includes("instagram.com/") || text.includes("twitter.com/") || text.includes("linkedin.com/company/");
    const hasMobile = text.includes('name="viewport"') && text.includes("width=device-width");
    const hasPhoneInText = text.includes("tel:") || /\+?254\s?7\d{2}/.test(text); // Basic KE number regex
    const hasEmailInText = text.includes("mailto:") || /[\w.-]+@[\w.-]+\.[a-z]{2,}/.test(text);

    markers.ssl = isHttps;
    markers.socials = hasSocials;
    markers.mobile = hasMobile;
    markers.phone = markers.phone || hasPhoneInText;
    markers.email = markers.email || hasEmailInText;
    
    if (latency < 1500) markers.speed = "fast";
    else if (latency < 3500) markers.speed = "medium";
    else markers.speed = "slow";

    return { status: res.ok ? "working" : "broken", markers };
  } catch {
    return { status: "broken", markers };
  }
}

// ---------------------------------------------------------------------------
// Lead Scoring (Urgency / Opportunity)
// ---------------------------------------------------------------------------
function computeScore(status: string, m: DigitalMarkers): { score: number; tag: "hot" | "warm" | "cold" } {
  let score = 0;
  
  if (status === "none") score += 45;   // No website = Big opportunity
  if (status === "broken") score += 35; // Broken site = Urgent fix
  
  if (!m.ssl && status !== "none") score += 15;
  if (!m.mobile && status !== "none") score += 15;
  if (!m.socials) score += 10;
  if (!m.phone) score += 5;
  if (m.speed === "slow") score += 10;
  
  const tag = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
  return { score: Math.min(score, 100), tag };
}

// ---------------------------------------------------------------------------
// Main Search Handler
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query    = searchParams.get("query") || "restaurant";
  const location = searchParams.get("location") || "Nairobi";
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit    = 100;

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 2): Promise<Response> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for Overpass
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
    const geo = await geocodeCity(location);
    if (!geo) return NextResponse.json({ error: `Could not geocode city: ${location}` }, { status: 400 });
    const [south, north, west, east] = geo.bbox;
    const pad = 0.15;
    const bbox = `${south - pad},${west - pad},${north + pad},${east + pad}`;

    const osmTags = getOsmTags(query);
    const nodes = osmTags.map(t => `node[${t}][name](${bbox});`).join("\n  ");
    const ways  = osmTags.map(t => `way[${t}][name](${bbox});`).join("\n  ");
    const overpassQuery = `[out:json][timeout:25];\n(\n  ${nodes}\n  ${ways}\n);\nout body;`;

    const overpassRes = await fetchWithRetry("https://overpass-api.de/api/interpreter", {
      method: "POST", body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "XovixBusinessFinder/1.0" }
    });

    if (!overpassRes.ok) {
      const errorText = await overpassRes.text();
      throw new Error(`Overpass API Error: ${overpassRes.status}. ${errorText.slice(0, 100)}`);
    }

    let data;
    const contentType = overpassRes.headers.get("content-type") || "";
    if (contentType.includes("json")) {
      data = await overpassRes.json();
    } else {
      const text = await overpassRes.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Overpass API returned invalid data format (XML/HTML). The server might be busy.");
      }
    }

    const elements = data.elements || [];

    // Deduplicate
    const seen = new Set();
    const unique = elements.filter((el: { type: string; id: number; tags?: Record<string, string> }) => {
      const k = el.tags?.name?.toLowerCase().trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const total = unique.length;
    const totalPages = Math.ceil(total / limit);
    const slice = unique.slice((page - 1) * limit, page * limit);

    // Deep pings in parallel (chunked to avoid rate limiting)
    const CONCURRENCY = 25;
    const results = [];
    
    for (let i = 0; i < slice.length; i += CONCURRENCY) {
      const batch = slice.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(batch.map(async (el: { type: string; id: number; tags?: Record<string, string> }) => {
        const tags = el.tags || {};
        const url = tags.website || tags["contact:website"] || null;
        const { status, markers } = await deepPing(url, tags);
        const { score, tag } = computeScore(status, markers);

        return {
          id: `osm_${el.type}_${el.id}`,
          name: tags.name,
          industry: (tags.amenity || tags.shop || tags.tourism || tags.office || query).replace(/_/g, " "),
          location: [tags["addr:street"], tags["addr:suburb"], tags["addr:city"] || location].filter(Boolean).join(", "),
          phone: tags.phone || tags["contact:phone"] || (markers.phone ? "Detected" : null),
          website: url,
          email: tags.email || tags["contact:email"] || (markers.email ? "Detected" : null),
          website_status: status,
          lead_score: score,
          lead_tag: tag,
          markers: markers, // 6 core markers for UI icons and filtering
          source: "OpenStreetMap"
        };
      }));
      results.push(...batchResults);
    }

    // Sort by score
    results.sort((a, b) => b.lead_score - a.lead_score);

    return NextResponse.json({ results, total, page, totalPages, perPage: limit, query, location });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
