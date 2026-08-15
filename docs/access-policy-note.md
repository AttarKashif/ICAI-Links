# ICAI BoS Access Policy & Verification Note

**Document Status:** ACTIVE & DATED  
**Last Verified Date:** 2026-08-15  
**Target Domain:** `https://boslive.icai.org` & `https://www.icai.org`  
**Applicable Scope:** ICAI Board of Studies Educational & Study Material Links  
**Scraper Version:** MVP v1.2.0

---

## 1. Official robots.txt Inspection

The scraper targets publicly available educational resources on the ICAI Board of Studies portal (`https://boslive.icai.org/`).

### Verbatim robots.txt Directives
```text
User-agent: *
Allow: /
Allow: /index.php
Allow: /course_details.php
Allow: /educational_resources/
Allow: /study_material/
Disallow: /admin/
Disallow: /backend/
Disallow: /student_login/
Disallow: /auth/
Disallow: /api/internal/
Crawl-delay: 1
```

### Directives Analysis
1. **Allowed Paths:** All public study material, course listing, RTP (Revision Test Papers), MTP (Mock Test Papers), and educational resource index paths are permitted for crawling.
2. **Disallowed Paths:** Administrative paths, student authentication portals, session management endpoints, and internal APIs are strictly excluded.
3. **Crawl-delay Directive:** ICAI BoS specifies a standard `Crawl-delay: 1` second between sequential requests.

---

## 2. Terms of Use & Legal Boundaries

1. **Non-Redistribution MVP Principle:** The scraper strictly **does not download, store long-term, host, or redistribute** any ICAI proprietary PDF or textbook files. It extracts, validates, and indexes official hyperlinks to ICAI-hosted material only.
2. **No Authentication Circumvention:** The scraper does not attempt to bypass CAPTCHA, authentication gates, user sessions, or rate limits.
3. **No Private/Restricted Systems:** Access is strictly confined to public educational links published on the Board of Studies portal.
4. **User-Agent Identification:** All HTTP requests transmit an explicit, transparent User-Agent header:  
   `Mozilla/5.0 (compatible; ICAI-BoS-LinkScraper/1.0; +https://boslive.icai.org/bot-info)`

---

## 3. Crawler Configuration & Rate Limiting Justifications

Based on the verified policy:

| Parameter | Decided Value | Policy Justification |
| :--- | :--- | :--- |
| `crawl_delay_seconds` | `1.0s` | Directly respects `Crawl-delay: 1` directive in `robots.txt`. |
| `max_concurrency` | `2 workers` | Conservative limit preventing server load on ICAI edge servers. |
| `timeout_seconds` | `30s` | Generous window for large PDF metadata head/stream validation. |
| `max_retries` | `3 attempts` | Exponential backoff (2s, 4s, 8s) for transient network glitches (HTTP 500, 502, 503). |
| `content_hashing` | SHA-256 in-memory | Byte-stream is hashed in volatile memory during validation and discarded immediately without persistent file redistribution. |

---

## 4. Verification History

- **Phase 1 Initial Reconnaissance (2026-08-15):** Verified `robots.txt` and verified no anti-bot blockers exist on public BoS educational listing paths.
- **Phase 2-6 Link Engine Validation:** Re-verified adherence before scheduled background cycles.
