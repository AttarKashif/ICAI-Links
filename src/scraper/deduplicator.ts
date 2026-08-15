import crypto from 'crypto';
import { ExtractedResource } from './types.js';

/**
 * Deduplicator & Identity Engine
 * Establishes stable deterministic IDs across recurring scrape cycles.
 */
export function generateMaterialIdentity(res: ExtractedResource): string {
  // Try extracting official doc ID from query or filename
  try {
    const parsed = new URL(res.normalized_url);
    const idParam = parsed.searchParams.get('id') || parsed.searchParams.get('mid') || parsed.searchParams.get('doc_id');
    if (idParam) {
      return `icai_doc_${idParam}`;
    }
  } catch (e) {}

  // Canonical normalized string identity: course:subject:type:url
  const identityString = `${res.course.toLowerCase()}|${res.group_name.toLowerCase()}|${res.subject.toLowerCase()}|${res.material_type.toLowerCase()}|${res.normalized_url.toLowerCase()}`;
  const hash = crypto.createHash('sha1').update(identityString).digest('hex').substring(0, 16);
  
  const cleanSubjectSlug = res.subject.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 12);
  const cleanTypeSlug = res.material_type.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 8);

  return `${res.course.toLowerCase()}_${cleanSubjectSlug}_${cleanTypeSlug}_${hash}`;
}

export function deduplicateExtractedResources(resources: ExtractedResource[]): ExtractedResource[] {
  const map = new Map<string, ExtractedResource>();

  for (const item of resources) {
    const key = item.normalized_url;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      // If duplicate URL found in same run, prefer the one with higher confidence
      const existing = map.get(key)!;
      if (item.classification_confidence > existing.classification_confidence) {
        map.set(key, item);
      }
    }
  }

  return Array.from(map.values());
}
