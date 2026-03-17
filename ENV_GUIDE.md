# Environment Variable Guide

Xovix Business Finder now uses **100% free, open-source APIs** — no API keys or billing required.

## No Keys Needed

The application uses the following free services with zero configuration:

| Service        | Purpose                         | API Key? | Cost   |
|----------------|---------------------------------|----------|--------|
| **Nominatim**  | Geocode city names → coordinates | None     | Free   |
| **Overpass API** | Search businesses by type & location | None    | Free   |
| **Own Analyzer** | Check website status & quality  | None    | Free   |

## Optional: Website Analyzer Timeout

You may set this to speed up or slow down the built-in website analyzer:

```env
WEBSITE_ANALYZER_TIMEOUT=5000
```

Default is `5000` ms (5 seconds). No other variables are required.

---
*The entire application runs without any paid API keys.*
