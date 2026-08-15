import {
  StudyMaterialChapterItem,
  CourseHierarchyNode,
  CourseName,
  GroupName,
  DiscoveredModuleQueueItem,
  BatchProcessingStats,
  StateManagedArraySnapshot
} from './types.js';
import { MASTER_ICAI_RTP_MAP, MASTER_ICAI_MTP_MAP } from './rtpMtpMap.js';

export class LinkStateManager {
  private stateManagedLinks: StudyMaterialChapterItem[] = [];
  private moduleQueue: DiscoveredModuleQueueItem[] = [];
  private batchHistory: BatchProcessingStats[] = [];
  private isProcessing = false;
  private currentBatch = 0;
  private totalBatches = 0;
  private batchSize = 10;
  private lastUpdated = new Date().toISOString();

  // Index maps for O(1) deduplication and fast queries
  private linkIdIndex = new Map<string, number>();
  private pdfUrlIndex = new Map<string, number>();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.stateManagedLinks = [];
    this.moduleQueue = [];
    this.batchHistory = [];
    this.linkIdIndex.clear();
    this.pdfUrlIndex.clear();
    this.isProcessing = false;
    this.currentBatch = 0;
    this.totalBatches = 0;
    this.lastUpdated = new Date().toISOString();
  }

  public setProcessingStatus(isProcessing: boolean, currentBatch = 0, totalBatches = 0, batchSize = 10): void {
    this.isProcessing = isProcessing;
    this.currentBatch = currentBatch;
    this.totalBatches = totalBatches;
    this.batchSize = batchSize;
    this.lastUpdated = new Date().toISOString();
  }

  public enqueueModules(modules: DiscoveredModuleQueueItem[]): void {
    for (const mod of modules) {
      const existingIdx = this.moduleQueue.findIndex(m => m.id === mod.id);
      if (existingIdx >= 0) {
        this.moduleQueue[existingIdx] = mod;
      } else {
        this.moduleQueue.push(mod);
      }
    }
    this.lastUpdated = new Date().toISOString();
  }

  public getModuleQueue(): DiscoveredModuleQueueItem[] {
    return [...this.moduleQueue];
  }

  public updateModuleStatus(moduleId: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'): void {
    const item = this.moduleQueue.find(m => m.id === moduleId);
    if (item) {
      item.status = status;
      this.lastUpdated = new Date().toISOString();
    }
  }

  /**
   * Stores or updates an item in the state-managed array with strict deduplication.
   */
  public addOrUpdateLink(link: StudyMaterialChapterItem): boolean {
    const existingById = this.linkIdIndex.get(link.id);
    const existingByUrl = this.pdfUrlIndex.get(link.pdf_url);

    const targetIdx = existingById !== undefined ? existingById : existingByUrl;

    if (targetIdx !== undefined && targetIdx < this.stateManagedLinks.length) {
      // Update existing item in state array
      this.stateManagedLinks[targetIdx] = {
        ...this.stateManagedLinks[targetIdx],
        ...link,
        last_verified_at: new Date().toISOString()
      };
      return false; // updated
    } else {
      // Append new item to state-managed array
      const newIdx = this.stateManagedLinks.length;
      this.stateManagedLinks.push(link);
      this.linkIdIndex.set(link.id, newIdx);
      this.pdfUrlIndex.set(link.pdf_url, newIdx);
      this.lastUpdated = new Date().toISOString();
      return true; // new
    }
  }

  /**
   * Stores a batch of discovered links into the state-managed array.
   */
  public addBatch(links: StudyMaterialChapterItem[], batchStats?: BatchProcessingStats): { newCount: number; updatedCount: number } {
    let newCount = 0;
    let updatedCount = 0;

    for (const link of links) {
      const isNew = this.addOrUpdateLink(link);
      if (isNew) {
        newCount++;
      } else {
        updatedCount++;
      }
    }

    if (batchStats) {
      this.batchHistory.unshift(batchStats);
      if (this.batchHistory.length > 50) {
        this.batchHistory.pop();
      }
    }

    this.lastUpdated = new Date().toISOString();
    return { newCount, updatedCount };
  }

  /**
   * Returns all items currently held in the state-managed array.
   */
  public getAllLinks(): StudyMaterialChapterItem[] {
    return [...this.stateManagedLinks];
  }

  /**
   * Returns filtered items from the state-managed array.
   */
  public getLinks(filter?: {
    course?: string;
    paper_number?: number;
    module_number?: number;
    search?: string;
  }): StudyMaterialChapterItem[] {
    let results = [...this.stateManagedLinks];

    if (filter?.course && filter.course !== 'ALL') {
      results = results.filter(item => item.course.toLowerCase() === filter.course!.toLowerCase());
    }
    if (filter?.paper_number !== undefined) {
      results = results.filter(item => item.paper_number === filter.paper_number);
    }
    if (filter?.module_number !== undefined) {
      results = results.filter(item => item.module_number === filter.module_number);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(item =>
        item.chapter_name.toLowerCase().includes(q) ||
        item.paper_name.toLowerCase().includes(q) ||
        item.material_title.toLowerCase().includes(q) ||
        item.pdf_url.toLowerCase().includes(q) ||
        item.module_name.toLowerCase().includes(q)
      );
    }

    return results;
  }

  /**
   * Computes coverage breakdown per paper and module from the state-managed array.
   */
  public getCoverageSummary(): StateManagedArraySnapshot['coverage_summary'] {
    const paperMap = new Map<string, {
      course: CourseName;
      paper_number: number;
      paper_name: string;
      modulesSet: Set<number>;
      chaptersCount: number;
    }>();

    for (const item of this.stateManagedLinks) {
      const key = `${item.course}_p${item.paper_number}`;
      if (!paperMap.has(key)) {
        paperMap.set(key, {
          course: item.course,
          paper_number: item.paper_number,
          paper_name: item.paper_name,
          modulesSet: new Set<number>(),
          chaptersCount: 0
        });
      }

      const entry = paperMap.get(key)!;
      entry.modulesSet.add(item.module_number);
      entry.chaptersCount++;
    }

    const summary = Array.from(paperMap.values()).map(p => ({
      course: p.course,
      paper_number: p.paper_number,
      paper_name: p.paper_name,
      modules_count: p.modulesSet.size,
      chapters_count: p.chaptersCount
    }));

    return summary.sort((a, b) => {
      const courseOrder = { Foundation: 1, Intermediate: 2, Final: 3, Other: 4 };
      const diff = (courseOrder[a.course] || 99) - (courseOrder[b.course] || 99);
      return diff !== 0 ? diff : a.paper_number - b.paper_number;
    });
  }

  /**
   * Assembles the hierarchical Course -> Paper -> Module -> Chapter tree directly from the state-managed array.
   */
  public buildHierarchyFromState(): CourseHierarchyNode[] {
    const courses: CourseName[] = ['Foundation', 'Intermediate', 'Final'];

    return courses.map(courseName => {
      const courseLinks = this.stateManagedLinks.filter(l => l.course === courseName);

      // Group by Paper
      const paperMap = new Map<number, {
        paper_id: string;
        paper_number: number;
        paper_name: string;
        group_name: GroupName;
        modulesMap: Map<number, {
          module_id: string;
          module_number: number;
          module_name: string;
          source_url: string;
          chapters: StudyMaterialChapterItem[];
        }>;
      }>();

      for (const item of courseLinks) {
        if (!paperMap.has(item.paper_number)) {
          paperMap.set(item.paper_number, {
            paper_id: item.paper_id,
            paper_number: item.paper_number,
            paper_name: item.paper_name,
            group_name: item.group_name,
            modulesMap: new Map()
          });
        }

        const paperEntry = paperMap.get(item.paper_number)!;
        if (!paperEntry.modulesMap.has(item.module_number)) {
          paperEntry.modulesMap.set(item.module_number, {
            module_id: item.module_id,
            module_number: item.module_number,
            module_name: item.module_name,
            source_url: item.source_url,
            chapters: []
          });
        }

        const moduleEntry = paperEntry.modulesMap.get(item.module_number)!;
        moduleEntry.chapters.push(item);
      }

      // Convert Maps to nested array structure
      const papers = Array.from(paperMap.values()).map(p => {
        const paperRtps = MASTER_ICAI_RTP_MAP.filter(
          r => r.course.toLowerCase() === courseName.toLowerCase() && r.paper_number === p.paper_number
        );
        const paperMtps = MASTER_ICAI_MTP_MAP.filter(
          m => m.course.toLowerCase() === courseName.toLowerCase() && m.paper_number === p.paper_number
        );

        return {
          paper_id: p.paper_id,
          paper_number: p.paper_number,
          paper_name: p.paper_name,
          group_name: p.group_name,
          modules: Array.from(p.modulesMap.values()).map(m => ({
            module_id: m.module_id,
            module_number: m.module_number,
            module_name: m.module_name,
            source_url: m.source_url,
            chapters: m.chapters.sort((a, b) => a.chapter_number - b.chapter_number)
          })).sort((a, b) => a.module_number - b.module_number),
          rtps: paperRtps,
          mtps: paperMtps
        };
      }).sort((a, b) => a.paper_number - b.paper_number);

      return {
        course: courseName,
        papers
      };
    });
  }

  /**
   * Returns a complete snapshot of the state-managed array and processing statistics.
   */
  public getSnapshot(): StateManagedArraySnapshot {
    const coverage = this.getCoverageSummary();
    const uniqueModules = new Set<string>();
    const uniquePapers = new Set<string>();
    const uniqueCourses = new Set<string>();

    for (const l of this.stateManagedLinks) {
      uniqueCourses.add(l.course);
      uniquePapers.add(`${l.course}_${l.paper_number}`);
      uniqueModules.add(`${l.course}_${l.paper_number}_${l.module_number}`);
    }

    return {
      total_links: this.stateManagedLinks.length,
      total_courses: uniqueCourses.size,
      total_papers: uniquePapers.size,
      total_modules: uniqueModules.size,
      total_chapters: this.stateManagedLinks.length,
      last_updated: this.lastUpdated,
      is_processing: this.isProcessing,
      current_batch: this.currentBatch,
      total_batches: this.totalBatches,
      batch_size: this.batchSize,
      links: [...this.stateManagedLinks],
      recent_batches: [...this.batchHistory],
      coverage_summary: coverage
    };
  }
}

export const linkStateManager = new LinkStateManager();
