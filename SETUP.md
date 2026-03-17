# Xovix Business Finder — Setup Guide

## Requirements
- Node.js 18 or newer
- npm

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Login credentials:** `alfred` / `password`

---

## No API Keys Required

This application uses **completely free, open-source APIs**:

| API | What it does |
|-----|-------------|
| [Nominatim](https://nominatim.openstreetmap.org/) | Geocodes city names to coordinates |
| [Overpass API](https://overpass-api.de/) | Searches OpenStreetMap for real businesses |
| Built-in `/api/analyze` | Checks website status, SSL, mobile responsiveness |

You do **NOT** need Google Cloud, any credit card, or any API key.

---

## How the Search Works

1. You type a business type (e.g. "Restaurant") and a city (e.g. "Nairobi")
2. Nominatim converts the city to GPS coordinates
3. Overpass API queries OpenStreetMap for all matching businesses within that area
4. Our scoring engine assigns lead scores based on digital presence
5. Clicking a business navigates to a full detail + messaging assistant page

---

## Lead Scoring Logic

| Signal | Points |
|--------|--------|
| No website found	 | +45 |
| No phone number | +15 |
| No social media links | +10 |
| Has a website (base) | +20 |

- **Hot lead** (70–100): No digital presence — ideal pitch target
- **Warm lead** (45–69): Partial presence — room to improve
- **Cold lead** (0–44): Already online — harder to convert

---

## Project Structure

```
src/
  app/
    api/
      search/    ← Overpass business search
      details/   ← Overpass single business details
      analyze/   ← Website quality checker
    business/[id]/  ← Business detail + messaging
    dashboard/      ← Lead CRM
    login/          ← Auth page
  components/
    Navbar.tsx
    BusinessCard.tsx
  lib/
    messaging.ts    ← Smart message generator
    scoring.ts      ← Lead scoring logic
    storage.ts      ← Local lead CRM
  context/
    AuthContext.tsx ← Login state
```
