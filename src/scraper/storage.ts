import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { MaterialRecord, UrlHistoryRecord, ScrapeRunRecord } from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'icai.db');
const JSON_BACKUP = path.join(DATA_DIR, 'icai_store.json');

interface LocalStoreState {
  materials: Record<string, MaterialRecord>;
  url_history: UrlHistoryRecord[];
  scrape_runs: ScrapeRunRecord[];
}

export class StorageEngine {
  private db: Database | null = null;
  private state: LocalStoreState = {
    materials: {},
    url_history: [],
    scrape_runs: []
  };
  private isInitialized = false;

  constructor() {
    // Synchronously preload JSON cache on instantiation so state is instantly queryable
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(JSON_BACKUP)) {
        const raw = fs.readFileSync(JSON_BACKUP, 'utf8');
        this.state = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Local state cache load note:', e);
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize SQL.js Database with locateFile fallback
    try {
      const initFn = typeof initSqlJs === 'function' ? initSqlJs : (initSqlJs as any)?.default;
      if (typeof initFn === 'function') {
        const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');
        const SQL = await initFn({
          locateFile: (file: string) => path.join(wasmPath, file)
        });

        if (fs.existsSync(DB_FILE)) {
          const fileBuffer = fs.readFileSync(DB_FILE);
          this.db = new SQL.Database(fileBuffer);
        } else {
          this.db = new SQL.Database();
        }

        this.createTables();
        this.syncStateToSql();
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('SQL.js initialization note (using high-speed state cache):', err);
      this.isInitialized = true;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    const schema = `
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        course TEXT NOT NULL,
        group_name TEXT,
        subject TEXT NOT NULL,
        material_type TEXT NOT NULL,
        title TEXT NOT NULL,
        edition TEXT,
        language TEXT,
        url TEXT NOT NULL,
        source_page_url TEXT,
        file_type TEXT,
        status TEXT NOT NULL,
        classification_confidence REAL,
        classified_with_version TEXT,
        first_seen_at TEXT,
        last_seen_at TEXT,
        last_checked_at TEXT,
        content_hash TEXT,
        notes TEXT,
        exam_cycle TEXT,
        scheme TEXT
      );

      CREATE TABLE IF NOT EXISTS url_history (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        url TEXT NOT NULL,
        first_seen_at TEXT,
        last_seen_at TEXT,
        status TEXT,
        content_hash TEXT,
        FOREIGN KEY (material_id) REFERENCES materials (id)
      );

      CREATE TABLE IF NOT EXISTS scrape_runs (
        id TEXT PRIMARY KEY,
        started_at TEXT,
        completed_at TEXT,
        status TEXT,
        scope_description TEXT,
        pages_discovered INTEGER,
        pages_fetched INTEGER,
        materials_found INTEGER,
        new_materials INTEGER,
        updated_materials INTEGER,
        unchanged_materials INTEGER,
        content_changed_materials INTEGER,
        potentially_removed INTEGER,
        active_urls INTEGER,
        failed_urls INTEGER,
        classifier_rules_version TEXT,
        anomaly_flag INTEGER,
        anomaly_reason TEXT,
        duration_seconds REAL,
        errors TEXT,
        logs TEXT,
        report_summary TEXT
      );
    `;
    this.db.run(schema);
  }

  private syncStateToSql(): void {
    if (!this.db) return;
    try {
      for (const m of Object.values(this.state.materials)) {
        this.db.run(
          `INSERT OR REPLACE INTO materials (
            id, course, group_name, subject, material_type, title, edition, language,
            url, source_page_url, file_type, status, classification_confidence,
            classified_with_version, first_seen_at, last_seen_at, last_checked_at, content_hash, notes, exam_cycle, scheme
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id, m.course, m.group_name, m.subject, m.material_type, m.title, m.edition, m.language,
            m.url, m.source_page_url, m.file_type, m.status, m.classification_confidence,
            m.classified_with_version, m.first_seen_at, m.last_seen_at, m.last_checked_at, m.content_hash || '', m.notes || '', m.exam_cycle || '', m.scheme || ''
          ]
        );
      }
    } catch (e) {
      console.warn('Error during SQL sync:', e);
    }
  }

  private persistDisk(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      fs.writeFileSync(JSON_BACKUP, JSON.stringify(this.state, null, 2), 'utf8');

      if (this.db) {
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
      }
    } catch (e) {
      console.error('Error persisting database to disk:', e);
    }
  }

  // Material queries
  getMaterialById(id: string): MaterialRecord | undefined {
    return this.state.materials[id];
  }

  getMaterialByUrl(url: string): MaterialRecord | undefined {
    return Object.values(this.state.materials).find(m => m.url === url);
  }

  findMaterialByIdentity(canonicalKey: string): MaterialRecord | undefined {
    return this.state.materials[canonicalKey];
  }

  getAllMaterials(filters?: {
    course?: string;
    group_name?: string;
    subject?: string;
    material_type?: string;
    status?: string;
    search?: string;
  }): MaterialRecord[] {
    let list = Object.values(this.state.materials);

    if (filters) {
      if (filters.course && filters.course !== 'ALL') {
        list = list.filter(m => m.course.toLowerCase() === filters.course!.toLowerCase());
      }
      if (filters.group_name && filters.group_name !== 'ALL') {
        list = list.filter(m => m.group_name.toLowerCase() === filters.group_name!.toLowerCase());
      }
      if (filters.subject && filters.subject !== 'ALL') {
        list = list.filter(m => m.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
      }
      if (filters.material_type && filters.material_type !== 'ALL') {
        list = list.filter(m => m.material_type.toLowerCase() === filters.material_type!.toLowerCase());
      }
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(m => m.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q) ||
          (m.content_hash && m.content_hash.toLowerCase().includes(q))
        );
      }
    }

    return list.sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
  }

  upsertMaterial(material: MaterialRecord): void {
    this.state.materials[material.id] = material;

    if (this.db) {
      try {
        this.db.run(
          `INSERT OR REPLACE INTO materials (
            id, course, group_name, subject, material_type, title, edition, language,
            url, source_page_url, file_type, status, classification_confidence,
            classified_with_version, first_seen_at, last_seen_at, last_checked_at, content_hash, notes, exam_cycle, scheme
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            material.id, material.course, material.group_name, material.subject, material.material_type,
            material.title, material.edition, material.language, material.url, material.source_page_url,
            material.file_type, material.status, material.classification_confidence, material.classified_with_version,
            material.first_seen_at, material.last_seen_at, material.last_checked_at, material.content_hash || '', material.notes || '', material.exam_cycle || '', material.scheme || ''
          ]
        );
      } catch (e) {
        console.warn('DB upsert error:', e);
      }
    }

    this.persistDisk();
  }

  // URL History
  addUrlHistory(record: UrlHistoryRecord): void {
    this.state.url_history.push(record);
    if (this.db) {
      try {
        this.db.run(
          `INSERT INTO url_history (id, material_id, url, first_seen_at, last_seen_at, status, content_hash)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [record.id, record.material_id, record.url, record.first_seen_at, record.last_seen_at, record.status, record.content_hash || '']
        );
      } catch (e) {
        console.warn('URL history insert error:', e);
      }
    }
    this.persistDisk();
  }

  getUrlHistory(materialId: string): UrlHistoryRecord[] {
    return this.state.url_history.filter(h => h.material_id === materialId).sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
  }

  // Scrape Runs
  saveScrapeRun(run: ScrapeRunRecord): void {
    const existingIndex = this.state.scrape_runs.findIndex(r => r.id === run.id);
    if (existingIndex >= 0) {
      this.state.scrape_runs[existingIndex] = run;
    } else {
      this.state.scrape_runs.unshift(run);
    }

    if (this.db) {
      try {
        this.db.run(
          `INSERT OR REPLACE INTO scrape_runs (
            id, started_at, completed_at, status, scope_description, pages_discovered,
            pages_fetched, materials_found, new_materials, updated_materials,
            unchanged_materials, content_changed_materials, potentially_removed, active_urls, failed_urls,
            classifier_rules_version, anomaly_flag, anomaly_reason, duration_seconds, errors, logs, report_summary
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            run.id, run.started_at, run.completed_at, run.status, run.scope_description,
            run.pages_discovered, run.pages_fetched, run.materials_found, run.new_materials,
            run.updated_materials, run.unchanged_materials, run.content_changed_materials, run.potentially_removed,
            run.active_urls, run.failed_urls, run.classifier_rules_version, run.anomaly_flag ? 1 : 0,
            run.anomaly_reason || '', run.duration_seconds, JSON.stringify(run.errors), JSON.stringify(run.logs), run.report_summary
          ]
        );
      } catch (e) {
        console.warn('Scrape run insert error:', e);
      }
    }

    this.persistDisk();
  }

  // Hierarchy Queries (Course -> Paper -> Module -> Chapter -> PDF)
  getHierarchy(courseFilter?: string) {
    const { hierarchyScraper } = require('./hierarchyScraper.js');
    const nodes = hierarchyScraper.generateFullCourseHierarchy();
    if (courseFilter && courseFilter !== 'ALL') {
      return nodes.filter((n: any) => n.course.toLowerCase() === courseFilter.toLowerCase());
    }
    return nodes;
  }

  getScrapeRuns(limit = 30): ScrapeRunRecord[] {
    return this.state.scrape_runs.slice(0, limit);
  }

  getScrapeRunById(id: string): ScrapeRunRecord | undefined {
    return this.state.scrape_runs.find(r => r.id === id);
  }

  getPreviousRun(scopeDescription?: string): ScrapeRunRecord | undefined {
    const completed = this.state.scrape_runs.filter(r => r.status === 'COMPLETED' || r.status === 'ANOMALOUS_COMPLETED');
    if (!scopeDescription) return completed[0];
    return completed.find(r => r.scope_description === scopeDescription) || completed[0];
  }

  getStats() {
    const materials = Object.values(this.state.materials);
    const active = materials.filter(m => m.status === 'ACTIVE').length;
    const changed = materials.filter(m => m.status === 'URL_CHANGED' || m.status === 'CONTENT_CHANGED').length;
    const dead = materials.filter(m => m.status === 'NOT_FOUND' || m.status === 'REMOVED' || m.status === 'SERVER_ERROR').length;
    const recheck = materials.filter(m => m.status === 'NOT_SEEN' || m.status === 'RECHECK').length;
    const avgConfidence = materials.length > 0
      ? (materials.reduce((acc, m) => acc + (m.classification_confidence || 0.8), 0) / materials.length)
      : 0;

    return {
      total_materials: materials.length,
      active_materials: active,
      changed_materials: changed,
      dead_materials: dead,
      recheck_materials: recheck,
      active_percentage: materials.length > 0 ? ((active / materials.length) * 100).toFixed(1) : '100.0',
      average_confidence: (avgConfidence * 100).toFixed(1),
      total_runs: this.state.scrape_runs.length
    };
  }

  clearAllData(): void {
    this.state = {
      materials: {},
      url_history: [],
      scrape_runs: []
    };
    if (this.db) {
      try {
        this.db.run('DELETE FROM materials;');
        this.db.run('DELETE FROM url_history;');
        this.db.run('DELETE FROM scrape_runs;');
      } catch (e) {}
    }
    this.persistDisk();
  }
}

export const storage = new StorageEngine();
