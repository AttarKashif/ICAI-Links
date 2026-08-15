import * as cheerio from 'cheerio';
import { normalizeUrl } from './normalizer.js';
import { classifyMaterial } from './classifier.js';
import { ExtractedResource } from './types.js';

const ALLOWED_HOSTNAMES = ['boslive.icai.org', 'icai.org', 'www.icai.org'];

const REJECT_PATTERNS = [
  /\/login/i,
  /\/register/i,
  /\/forgot_password/i,
  /\/feedback/i,
  /javascript:/i,
  /mailto:/i,
  /tel:/i,
  /eservices\.icai\.org/i,
  /icaiexam\.icai\.org/i,
  /twitter\.com/i,
  /facebook\.com/i,
  /linkedin\.com/i,
  /youtube\.com/i,
  /instagram\.com/i
];

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTNAMES.includes(parsed.hostname.toLowerCase())) {
      return false;
    }
    for (const pat of REJECT_PATTERNS) {
      if (pat.test(url)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function parseMaterialsFromHtml(html: string, sourcePageUrl: string): ExtractedResource[] {
  const $ = cheerio.load(html);
  const results: ExtractedResource[] = [];
  const seenUrls = new Set<string>();

  // Extract page title and broad hierarchy
  const pageTitle = $('title').text().trim() || $('h1').first().text().trim();

  // Find all anchor links
  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href') || '';
    const linkText = $(el).text().replace(/\s+/g, ' ').trim();

    if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) {
      return;
    }

    const normalizedUrl = normalizeUrl(rawHref, sourcePageUrl);
    if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
      return;
    }

    // Reject non-allowed domains & obvious spam/auth
    if (!isAllowedUrl(normalizedUrl)) {
      return;
    }

    // Must be either a PDF/ZIP or an ICAI material detail page
    const lowerUrl = normalizedUrl.toLowerCase();
    const isPdfOrDoc = lowerUrl.endsWith('.pdf') || lowerUrl.endsWith('.zip') || lowerUrl.includes('material') || lowerUrl.includes('rtp') || lowerUrl.includes('mtp');
    if (!isPdfOrDoc && !lowerUrl.includes('course_details') && !lowerUrl.includes('subject_details')) {
      return;
    }

    // Get surrounding heading context
    let headingContext = '';
    const parentContainer = $(el).closest('section, div, td, tr, li, .module-block, .material-group');
    if (parentContainer.length) {
      const headingElem = parentContainer.find('h1, h2, h3, h4, h5, .title, strong').first();
      if (headingElem.length) {
        headingContext = headingElem.text().replace(/\s+/g, ' ').trim();
      }
    }

    // If still empty, inspect previous headings in DOM order
    if (!headingContext) {
      const prevH = $(el).prevAll('h1, h2, h3, h4, h5').first();
      if (prevH.length) {
        headingContext = prevH.text().replace(/\s+/g, ' ').trim();
      }
    }

    // Classification
    const classified = classifyMaterial({
      url: normalizedUrl,
      linkText,
      headingContext,
      pageHierarchyContext: pageTitle,
      sourcePageUrl
    });

    seenUrls.add(normalizedUrl);
    results.push(classified);
  });

  return results;
}
