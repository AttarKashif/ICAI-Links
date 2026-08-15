import crypto from 'crypto';
import { storage } from './storage.js';
import { PageFetcher } from './fetcher.js';
import { parseMaterialsFromHtml } from './discovery.js';
import { generateMaterialIdentity, deduplicateExtractedResources } from './deduplicator.js';
import { validateUrl } from './validator.js';
import { detectRunAnomalies } from './anomalyDetector.js';
import { loadClassifierRules } from './classifier.js';
import { MaterialRecord, ScrapeRunRecord, CourseName, ExtractedResource, MaterialStatus } from './types.js';

export interface RunOptions {
  scopeCourse?: CourseName;
  scopeSubject?: string;
  scopeDescription?: string;
  entryUrls?: string[];
  forceAnomalyTest?: boolean;
}

export async function executeScrapeRun(options: RunOptions = {}): Promise<ScrapeRunRecord> {
  const startTime = Date.now();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logs: string[] = [];
  const errors: string[] = [];

  const log = (msg: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const line = `${timestamp} INFO  ${msg}`;
    logs.push(line);
    console.log(line);
  };

  const warn = (msg: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const line = `${timestamp} WARN  ${msg}`;
    logs.push(line);
    console.warn(line);
  };

  const err = (msg: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const line = `${timestamp} ERROR ${msg}`;
    logs.push(line);
    errors.push(msg);
    console.error(line);
  };

  log(`Scraper started [Run ID: ${runId}]`);
  await storage.init();

  const rules = loadClassifierRules();
  log(`Loaded Classifier Rules version: ${rules.version} (updated: ${rules.last_updated})`);

  // Determine Entry URLs based on scope
  const scopeDesc = options.scopeDescription || (options.scopeCourse ? `${options.scopeCourse} (${options.scopeSubject || 'All Subjects'})` : 'CA Intermediate (Taxation Focus) & Core BOS Materials');
  log(`Target Scope: ${scopeDesc}`);

  const defaultEntryUrls = [
    'https://boslive.icai.org/education_content_study_material_new_scheme.php',
    'https://boslive.icai.org/course_details.php?c=intermediate',
    'https://boslive.icai.org/subject_details.php?c=intermediate&g=1&s=taxation',
    'https://boslive.icai.org/course_details.php?c=foundation',
    'https://boslive.icai.org/course_details.php?c=final'
  ];

  const targetUrls = options.entryUrls && options.entryUrls.length > 0 ? options.entryUrls : defaultEntryUrls;
  const pagesDiscovered = targetUrls.length;
  let pagesFetched = 0;

  const fetcher = new PageFetcher({}, 0.5); // crawl delay 0.5s for snappy preview responsiveness
  const allExtracted: ExtractedResource[] = [];

  log(`Discovering pages (Allowlist: boslive.icai.org, icai.org)...`);

  for (const pageUrl of targetUrls) {
    log(`Fetching: ${pageUrl}`);
    const fetchResult = await fetcher.fetch(pageUrl);

    if (fetchResult.isSuccess && fetchResult.body) {
      pagesFetched++;
      log(`Fetched ${pageUrl} in ${fetchResult.durationMs}ms [HTTP ${fetchResult.statusCode}]`);
      
      const parsed = parseMaterialsFromHtml(fetchResult.body, pageUrl);
      log(`Extracted ${parsed.length} material candidate links from ${pageUrl}`);
      allExtracted.push(...parsed);
    } else {
      warn(`Failed to fetch page ${pageUrl}: ${fetchResult.error || 'Unknown HTTP error'}`);
    }
  }

  // Deduplicate discovered resources
  const deduplicated = deduplicateExtractedResources(allExtracted);
  log(`Total unique materials identified across pages: ${deduplicated.length}`);

  // Anomaly Detection (§32)
  const previousRun = storage.getPreviousRun(scopeDesc);
  const anomalyCheck = options.forceAnomalyTest
    ? { isAnomalous: true, reason: 'Manual Anomaly Simulation triggered by user test', previousCount: 15, currentCount: deduplicated.length, confidenceDrop: 0 }
    : detectRunAnomalies(deduplicated, previousRun, scopeDesc);

  if (anomalyCheck.isAnomalous) {
    warn(`ANOMALY DETECTED: ${anomalyCheck.reason}`);
    warn(`Safety protection active: Halting destructive removal marking for previously active items.`);
  }

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let contentChangedCount = 0;
  let potentiallyRemovedCount = 0;
  let activeUrlCount = 0;
  let failedUrlCount = 0;

  const nowIso = new Date().toISOString();
  const seenMaterialIds = new Set<string>();

  log(`Validating URLs and computing in-memory SHA-256 content hashes (§33)...`);

  for (const item of deduplicated) {
    const materialId = generateMaterialIdentity(item);
    seenMaterialIds.add(materialId);

    const existing = storage.getMaterialById(materialId);
    const validation = await validateUrl(item.normalized_url);

    if (validation.status === 'ACTIVE') {
      activeUrlCount++;
    } else {
      failedUrlCount++;
    }

    if (!existing) {
      // NEW Material
      newCount++;
      const newRecord: MaterialRecord = {
        id: materialId,
        course: item.course,
        group_name: item.group_name,
        subject: item.subject,
        material_type: item.material_type,
        title: item.title,
        edition: item.edition,
        language: item.language,
        url: validation.final_url || item.normalized_url,
        source_page_url: item.source_page_url,
        file_type: item.file_type,
        status: validation.status,
        classification_confidence: item.classification_confidence,
        classified_with_version: rules.version,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        last_checked_at: nowIso,
        content_hash: validation.content_hash,
        notes: `Discovered on ${new Date().toLocaleDateString()}`
      };

      storage.upsertMaterial(newRecord);
      storage.addUrlHistory({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        material_id: materialId,
        url: newRecord.url,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        status: validation.status,
        content_hash: validation.content_hash
      });
      log(`NEW: [${newRecord.course} - ${newRecord.subject}] "${newRecord.title}" (Confidence: ${(newRecord.classification_confidence * 100).toFixed(0)}%)`);
    } else {
      // Check for URL change vs Content Change vs Unchanged
      const urlChanged = existing.url !== (validation.final_url || item.normalized_url);
      const contentChanged = Boolean(existing.content_hash && validation.content_hash && existing.content_hash !== validation.content_hash);

      let newStatus: MaterialStatus = validation.status;

      if (urlChanged) {
        updatedCount++;
        newStatus = 'URL_CHANGED';
        log(`URL_CHANGED: "${existing.title}" -> ${validation.final_url}`);
        storage.addUrlHistory({
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          material_id: materialId,
          url: validation.final_url,
          first_seen_at: nowIso,
          last_seen_at: nowIso,
          status: 'URL_CHANGED',
          content_hash: validation.content_hash
        });
      } else if (contentChanged) {
        contentChangedCount++;
        newStatus = 'CONTENT_CHANGED';
        log(`CONTENT_CHANGED (Same URL updated with new edition SHA-256): "${existing.title}"`);
        storage.addUrlHistory({
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          material_id: materialId,
          url: existing.url,
          first_seen_at: existing.first_seen_at,
          last_seen_at: nowIso,
          status: 'CONTENT_CHANGED',
          content_hash: validation.content_hash
        });
      } else {
        unchangedCount++;
        newStatus = validation.status;
      }

      existing.url = validation.final_url || item.normalized_url;
      existing.title = item.title;
      existing.edition = item.edition;
      existing.status = newStatus;
      existing.classification_confidence = item.classification_confidence;
      existing.classified_with_version = rules.version;
      existing.last_seen_at = nowIso;
      existing.last_checked_at = nowIso;
      if (validation.content_hash) {
        existing.content_hash = validation.content_hash;
      }

      storage.upsertMaterial(existing);
    }
  }

  // Handle items in database not seen in this scrape run (§16)
  if (!anomalyCheck.isAnomalous) {
    const allDbMaterials = storage.getAllMaterials();
    for (const m of allDbMaterials) {
      if (!seenMaterialIds.has(m.id)) {
        if (m.status === 'ACTIVE') {
          m.status = 'NOT_SEEN';
          m.last_checked_at = nowIso;
          storage.upsertMaterial(m);
          potentiallyRemovedCount++;
          warn(`Material not seen in current run (transitioned to NOT_SEEN): ${m.title}`);
        } else if (m.status === 'NOT_SEEN') {
          m.status = 'RECHECK';
          m.last_checked_at = nowIso;
          storage.upsertMaterial(m);
          potentiallyRemovedCount++;
        } else if (m.status === 'RECHECK') {
          m.status = 'REMOVED';
          m.last_checked_at = nowIso;
          storage.upsertMaterial(m);
          log(`Material confirmed REMOVED after 3 consecutive missed cycles: ${m.title}`);
        }
      }
    }
  }

  const durationSec = Math.round(((Date.now() - startTime) / 1000) * 10) / 10;
  const completedAt = new Date().toISOString();
  log(`Scraper run completed in ${durationSec}s`);

  // Generate Report Summary (§21)
  const reportSummary = `ICAI SCRAPE REPORT
────────────────────────────────────────
Run: ${new Date().toISOString().replace('T', ' ').substring(0, 16)}
Scope: ${scopeDesc}
Rules Version: ${rules.version}
${anomalyCheck.isAnomalous ? `\n⚠️  ANOMALY DETECTED: ${anomalyCheck.reason}\n` : ''}
Pages discovered:       ${pagesDiscovered}
Pages fetched:          ${pagesFetched}
Materials discovered:   ${deduplicated.length}

New:                     ${newCount}
Updated (URL Changed):   ${updatedCount}
Content Changed (SHA):   ${contentChangedCount}
Unchanged:              ${unchangedCount}
Potentially removed:    ${potentiallyRemovedCount}

Active URLs:            ${activeUrlCount}
Failed URLs:            ${failedUrlCount}

Duration:               ${durationSec} sec
Status:                 ${anomalyCheck.isAnomalous ? 'ANOMALOUS_COMPLETED' : 'COMPLETED'}
`;

  const runRecord: ScrapeRunRecord = {
    id: runId,
    started_at: new Date(startTime).toISOString(),
    completed_at: completedAt,
    status: anomalyCheck.isAnomalous ? 'ANOMALOUS_COMPLETED' : 'COMPLETED',
    scope_description: scopeDesc,
    pages_discovered: pagesDiscovered,
    pages_fetched: pagesFetched,
    materials_found: deduplicated.length,
    new_materials: newCount,
    updated_materials: updatedCount,
    unchanged_materials: unchangedCount,
    content_changed_materials: contentChangedCount,
    potentially_removed: potentiallyRemovedCount,
    active_urls: activeUrlCount,
    failed_urls: failedUrlCount,
    classifier_rules_version: rules.version,
    anomaly_flag: anomalyCheck.isAnomalous,
    anomaly_reason: anomalyCheck.reason,
    duration_seconds: durationSec,
    errors,
    logs,
    report_summary: reportSummary
  };

  storage.saveScrapeRun(runRecord);
  return runRecord;
}
