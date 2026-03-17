# Xovix Business Finder & Lead Analyzer 🚀

A high-performance lead generation and digital audit platform designed for **Xovix Labs**. This tool discovers businesses across Kenya, analyzes their digital footprint in real-time, and generates hyper-personalized outreach strategies.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-blue?style=flat-square&logo=tailwind-css)
![OpenStreetMap](https://img.shields.io/badge/OSM-Overpass-green?style=flat-square&logo=openstreetmap)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 🌟 Key Features

### 🔍 High-Scale Discovery
- **100 Results Per Page**: Scaled search engine capable of returning large batches of leads.
- **Zero API Cost**: Powered by OpenStreetMap (Overpass & Nominatim) — no Google Places API keys or billing required.
- **Sector-Specific Search**: Intelligent keyword mapping for Restaurants, Law Firms, Clinics, etc.

### 🛡️ The "6 Core Markers" Deep Scan
Every lead is automatically analyzed for the six pillars of digital excellence:
1. **SSL Security**: Identifies insecure sites (HTTP vs HTTPS).
2. **Mobile Readiness**: Verifies responsive design and viewport settings.
3. **Social Presence**: Detects links to Facebook, Instagram, LinkedIn, and Twitter.
4. **Contact digitized**: Extracts phone numbers and email addresses directly from site metadata.
5. **Load Performance**: Measures site latency and categorizes as Fast, Medium, or Slow.
6. **Domain Health**: Detects broken or non-resolving domains.

### 📊 Lead CRM & Pipeline
- **Smart Scoring**: Leads are ranked 0-100 based on their digital deficit (lower quality = higher sales opportunity).
- **Opportunity Filters**: Filter by specific technical gaps (e.g., "Find sites missing SSL").
- **Persistence**: Save leads to a local pipeline with custom strategy notes.
- **CSV Export**: One-click export for external outreach teams.

### 💬 Messaging Assistant
- **Tailored Outreach**: Generates WhatsApp & Email templates that mention specific technical gaps.
- **Intent Detection**: Analyzes lead replies and suggests professional responses.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS + Tailwind CSS 4
- **Icons**: Lucide React
- **Data**: Overpass API (OSM)
- **Deployment**: Vercel Ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alfred467/wesite-lead-analyzer.git
   cd wesite-lead-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## 🌍 Vercel Deployment

This project is optimized for Vercel. 

1. Push your code to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. No environment variables are required for the core functionality as it uses free open-source APIs.

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed for Xovix Labs by Antigravity.*
