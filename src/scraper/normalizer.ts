/**
 * ICAI BoS URL Normalizer
 * Normalizes discovered ICAI URLs to ensure stable identity and deduplication.
 */

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'fbclid', 'gclid', '_ga', '_gl', 'session_id', 'sid', 'timestamp'
]);

export function normalizeUrl(rawUrl: string, baseUrl = 'https://boslive.icai.org'): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  
  let trimmed = rawUrl.trim();
  
  // Ignore javascript: and mailto: and anchors
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('#') || trimmed.startsWith('tel:')) {
    return '';
  }

  try {
    // Resolve relative URLs
    const parsed = new URL(trimmed, baseUrl);
    
    // Normalize protocol & hostname
    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.toLowerCase();

    // Standardize default port
    if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
      parsed.port = '';
    }

    // Strip hash fragment
    parsed.hash = '';

    // Remove tracking parameters & sort remaining query params for determinism
    const searchParams = new URLSearchParams(parsed.search);
    const keysToDelete: string[] = [];
    
    searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(k => searchParams.delete(k));
    
    // Sort parameters alphabetically
    searchParams.sort();
    
    const queryString = searchParams.toString();
    parsed.search = queryString ? `?${queryString}` : '';

    // Path normalization: decode/encode safe characters, strip duplicate slashes
    let pathname = parsed.pathname;
    
    // Replace duplicate consecutive slashes
    pathname = pathname.replace(/\/+/g, '/');

    // For file extensions (.pdf, .zip, .html), remove trailing slash
    if (/\.[a-zA-Z0-9]{2,5}\/$/.test(pathname)) {
      pathname = pathname.slice(0, -1);
    }

    parsed.pathname = pathname;

    return parsed.toString();
  } catch (err) {
    // Fallback if URL constructor fails
    return trimmed;
  }
}

export function extractFileType(url: string): 'pdf' | 'page' | 'zip' | 'other' {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.zip') || lower.endsWith('.rar')) return 'zip';
  if (lower.endsWith('.html') || lower.endsWith('.php') || lower.endsWith('.aspx') || !lower.includes('.')) return 'page';
  return 'other';
}
