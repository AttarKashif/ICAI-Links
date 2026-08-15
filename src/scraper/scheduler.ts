import { executeScrapeRun } from './runner.js';
import { storage } from './storage.js';
import { PageFetcher } from './fetcher.js';
import { parseMaterialsFromHtml } from './discovery.js';
import { ExtractedResource } from './types.js';

export interface SchedulerState {
  enabled: boolean;
  intervalHours: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  isRunning: boolean;
}

let schedulerState: SchedulerState = {
  enabled: true,
  intervalHours: 24,
  lastRunAt: null,
  nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isRunning: false
};

let schedulerTimer: NodeJS.Timeout | null = null;

export function getSchedulerState(): SchedulerState {
  return schedulerState;
}

export function updateSchedulerConfig(enabled: boolean, intervalHours: number): SchedulerState {
  schedulerState.enabled = enabled;
  schedulerState.intervalHours = intervalHours;

  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  if (enabled) {
    schedulerState.nextRunAt = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();
    schedulerTimer = setInterval(async () => {
      if (!schedulerState.isRunning) {
        schedulerState.isRunning = true;
        try {
          await executeScrapeRun();
          schedulerState.lastRunAt = new Date().toISOString();
          schedulerState.nextRunAt = new Date(Date.now() + schedulerState.intervalHours * 60 * 60 * 1000).toISOString();
        } catch (e) {
          console.error('Scheduled scrape run error:', e);
        } finally {
          schedulerState.isRunning = false;
        }
      }
    }, intervalHours * 60 * 60 * 1000);
  } else {
    schedulerState.nextRunAt = null;
  }

  return schedulerState;
}

// Single-page tester (Phase 2 Deliverable)
export async function testSinglePageScrape(url: string): Promise<{
  success: boolean;
  url: string;
  materialsExtracted: ExtractedResource[];
  htmlSnippet: string;
  durationMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  const fetcher = new PageFetcher({}, 0);
  const fetchResult = await fetcher.fetch(url);

  if (!fetchResult.isSuccess || !fetchResult.body) {
    return {
      success: false,
      url,
      materialsExtracted: [],
      htmlSnippet: '',
      durationMs: Date.now() - startTime,
      error: fetchResult.error || 'Failed to fetch page'
    };
  }

  const extracted = parseMaterialsFromHtml(fetchResult.body, url);
  return {
    success: true,
    url,
    materialsExtracted: extracted,
    htmlSnippet: fetchResult.body.substring(0, 1000),
    durationMs: Date.now() - startTime
  };
}

// Seed initial run if brand new
export async function seedInitialRunIfEmpty(): Promise<void> {
  await storage.init();
  const existing = storage.getAllMaterials();
  if (existing.length === 0) {
    console.log('Seeding initial ICAI BoS Material Scraper run...');
    await executeScrapeRun({
      scopeDescription: 'Initial Discovery: CA Intermediate (Taxation Focus) & Core BOS Materials'
    });
    schedulerState.lastRunAt = new Date().toISOString();
  }
}
