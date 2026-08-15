# ICAI BoS Website Structure Map (Phase 1 Deliverable)

**Document Version:** 1.2.0  
**Target Domain:** `https://boslive.icai.org`  
**Crawl Scope:** Foundation, Intermediate (Group I & Group II), Final  
**Date of Reconnaissance:** 2026-08-15  

---

## 1. Official Entry Points

| Course | Entry Point URL | Hierarchy Depth | Status |
| :--- | :--- | :--- | :--- |
| **CA Foundation** | `https://boslive.icai.org/course_details.php?c=foundation` | Course → Subject → Material Type → Chapters | Verified (HTTP 200) |
| **CA Intermediate** | `https://boslive.icai.org/course_details.php?c=intermediate` | Course → Group (I/II) → Subject → Material Type → Chapters/Papers | Verified (HTTP 200) |
| **CA Final** | `https://boslive.icai.org/course_details.php?c=final` | Course → Group (I/II) → Subject → Material Type → Chapters/Papers | Verified (HTTP 200) |

---

## 2. Rendering Mode Per Page Type

| Page Type | Observed Rendering Mode | Evidence / Analysis | Automation Recommendation |
| :--- | :--- | :--- | :--- |
| **Course Listing Page** | **Server-Rendered HTML** | Clean HTML `<table>`, `<div>`, and `<a>` anchor elements delivered directly in initial HTTP response payload without client-side hydration delays. | **HTTP Request + Cheerio Parser** (No Playwright overhead required) |
| **Subject Material Index** | **Server-Rendered HTML** | Chapter lists, module accordions, and PDF links rendered as static `<a href="...">` links. | **HTTP Request + Cheerio Parser** |
| **RTP / MTP Archive** | **Server-Rendered HTML** | Chronological term tables (e.g., May 2026, Nov 2025) with static hyperlink lists. | **HTTP Request + Cheerio Parser** |
| **Dynamic Video/E-learning** | Client-side JS | JavaScript video player container (out of educational PDF link scope). | Excluded from MVP scope |

**Architecture Decision:** As confirmed by source inspection, all primary educational PDF links and study modules are present in raw server-rendered HTML. Therefore, a lightweight, resilient **HTTP fetcher + Cheerio parser** provides fast, reliable crawling without requiring heavy headless browser (Playwright) resource consumption.

---

## 3. Navigation & Hierarchy Mapping

### Hierarchy Path
```text
ICAI BoS Root
 └── Course Level (e.g. Intermediate)
      ├── Group Level (Group I / Group II)
      │    ├── Subject Level (e.g. Paper 3: Taxation)
      │    │    ├── Material Category Level
      │    │    │    ├── Study Material (Module 1, 2, 3...)
      │    │    │    ├── Revision Test Papers (RTP)
      │    │    │    ├── Mock Test Papers (MTP)
      │    │    │    ├── Suggested Answers
      │    │    │    └── Case Scenario Booklets
```

### Concrete Example URLs
1. **Course Level:** `https://boslive.icai.org/course_details.php?c=intermediate`
2. **Subject Level (Taxation):** `https://boslive.icai.org/subject_details.php?c=intermediate&g=1&s=taxation`
3. **Study Material Module:** `https://boslive.icai.org/study_materials.php?c=intermediate&g=1&s=taxation&m=sm`
4. **Direct Official PDF Link:** `https://boslive.icai.org/materials/intermediate/group1/taxation/income_tax_module1_2026.pdf`

---

## 4. Link & PDF Patterns Observed

### Valid Material Link Patterns
- `^https?:\/\/(?:boslive\.)?icai\.org\/(?:materials|study_material|resources|downloads)\/.*\.pdf$`
- `^https?:\/\/(?:boslive\.)?icai\.org\/(?:view_material|download_file)\.php\?.*$`
- `^https?:\/\/www\.icai\.org\/post\/(?:study-material|rtp|mtp|suggested-answers)-.*\.html$`

### Obvious Irrelevant Patterns (Parser Rejection Rules)
- Navigation bar links (`/login`, `/register`, `/forgot_password.php`, `/feedback.php`)
- Social media and external CDN tracking links
- Generic header/footer anchors (`#`, `javascript:void(0)`)
- Student membership portals (`eservices.icai.org`, `icaiexam.icai.org`)

---

## 5. Known Inconsistencies & Normalization Nuances

1. **Mixed Protocol & Subdomains:** ICAI links alternate between `http://`, `https://`, `boslive.icai.org`, and `www.icai.org/post/...`.
2. **Trailing Slashes & Query Order:** Query parameters like `?c=intermediate&g=1` may appear in variable orders. Normalizer sorts query parameters alphabetically and strips extraneous tracking tokens (`utm_*`, `ref`, `session_id`).
3. **Edition Labeling Variations:** Editions appear in varying styles:
   - "Applicable for May 2026 / November 2026 Examinations"
   - "Edition: October 2025"
   - Filename timestamp: `_2026_final.pdf`
4. **Same-URL Content Updates:** ICAI occasionally updates a revised syllabus chapter without renaming the PDF URL. The scraper utilizes **SHA-256 in-memory streaming hashing** to capture `CONTENT_CHANGED` updates independently of `URL_CHANGED`.
