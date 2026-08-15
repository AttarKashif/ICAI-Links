import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as yaml from 'js-yaml';
import { storage } from './src/scraper/storage.js';
import { executeScrapeRun } from './src/scraper/runner.js';
import { getSchedulerState, updateSchedulerConfig, testSinglePageScrape, seedInitialRunIfEmpty } from './src/scraper/scheduler.js';
import { loadClassifierRules, reloadClassifierRules } from './src/scraper/classifier.js';
import { getCdnMappings, getCdnMapStats, syncCdnMapToDatabase } from './src/scraper/cdnMap.js';
import { getRtpResources, getMtpResources, MASTER_ICAI_RTP_MAP, MASTER_ICAI_MTP_MAP } from './src/scraper/rtpMtpMap.js';
import { hierarchyScraper } from './src/scraper/hierarchyScraper.js';
import { linkStateManager } from './src/scraper/linkStateManager.js';
import { runAllAutomatedTests } from './src/scraper/tests.js';

let isScrapeRunning = false;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Allow standard local and proxy headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint for ingress proxy
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Routes
  app.get('/api/scraper/stats', (req, res) => {
    try {
      const stats = storage.getStats();
      const scheduler = getSchedulerState();
      res.json({
        ...stats,
        is_running: isScrapeRunning,
        scheduler
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/materials', (req, res) => {
    try {
      const { course, group_name, subject, material_type, status, search } = req.query;
      const materials = storage.getAllMaterials({
        course: course as string,
        group_name: group_name as string,
        subject: subject as string,
        material_type: material_type as string,
        status: status as string,
        search: search as string
      });
      res.json({ materials, count: materials.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/materials/:id', (req, res) => {
    try {
      const material = storage.getMaterialById(req.params.id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      const history = storage.getUrlHistory(req.params.id);
      res.json({ material, history });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/runs', (req, res) => {
    try {
      const runs = storage.getScrapeRuns(50);
      res.json({ runs, count: runs.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/runs/:id', (req, res) => {
    try {
      const run = storage.getScrapeRunById(req.params.id);
      if (!run) {
        return res.status(404).json({ error: 'Scrape run not found' });
      }
      res.json({ run });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/run', async (req, res) => {
    if (isScrapeRunning) {
      return res.status(409).json({ error: 'A scrape run is already in progress' });
    }

    try {
      isScrapeRunning = true;
      const { scopeCourse, scopeSubject, scopeDescription, forceAnomalyTest, entryUrls } = req.body;
      const runRecord = await executeScrapeRun({
        scopeCourse,
        scopeSubject,
        scopeDescription,
        forceAnomalyTest: Boolean(forceAnomalyTest),
        entryUrls
      });
      res.json({ success: true, run: runRecord });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Scrape run failed' });
    } finally {
      isScrapeRunning = false;
    }
  });

  app.post('/api/scraper/single-test', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      const result = await testSinglePageScrape(url);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/rules', (req, res) => {
    try {
      const rules = loadClassifierRules();
      let changelog = '';
      const clPath = path.join(process.cwd(), 'CHANGELOG.md');
      if (fs.existsSync(clPath)) {
        changelog = fs.readFileSync(clPath, 'utf8');
      }
      res.json({ rules, changelog });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/rules', (req, res) => {
    try {
      const { yamlContent, changelogEntry } = req.body;
      if (yamlContent) {
        const yamlPath = path.join(process.cwd(), 'config', 'classifier_rules.yaml');
        fs.writeFileSync(yamlPath, yamlContent, 'utf8');
        reloadClassifierRules();
      }
      if (changelogEntry) {
        const clPath = path.join(process.cwd(), 'CHANGELOG.md');
        const existing = fs.existsSync(clPath) ? fs.readFileSync(clPath, 'utf8') : '';
        fs.writeFileSync(clPath, changelogEntry + '\n\n' + existing, 'utf8');
      }
      res.json({ success: true, rules: loadClassifierRules() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/scheduler', (req, res) => {
    res.json(getSchedulerState());
  });

  app.post('/api/scraper/scheduler', (req, res) => {
    try {
      const { enabled, intervalHours } = req.body;
      const state = updateSchedulerConfig(Boolean(enabled), Number(intervalHours) || 24);
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CDN Resource Map Endpoints
  app.get('/api/scraper/cdn-map', (req, res) => {
    try {
      const { course, group_name, subject, search } = req.query;
      const mappings = getCdnMappings({
        course: course as string,
        group_name: group_name as string,
        subject: subject as string,
        search: search as string
      });
      res.json({ mappings, count: mappings.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/cdn-stats', (req, res) => {
    try {
      const stats = getCdnMapStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/cdn-sync', async (req, res) => {
    try {
      const result = await syncCdnMapToDatabase();
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ICAI Study Material Hierarchy & State-Managed Batch Endpoints
  app.get('/api/scraper/hierarchy', (req, res) => {
    try {
      const { course } = req.query;
      let hierarchy = hierarchyScraper.generateFullCourseHierarchy();
      if (course && course !== 'ALL') {
        hierarchy = hierarchy.filter(h => h.course.toLowerCase() === (course as string).toLowerCase());
      }
      res.json({ hierarchy, count: hierarchy.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/batches/state', (req, res) => {
    try {
      const snapshot = linkStateManager.getSnapshot();
      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/state-links', (req, res) => {
    try {
      const { course, paper_number, module_number, search } = req.query;
      const links = linkStateManager.getLinks({
        course: course as string,
        paper_number: paper_number ? Number(paper_number) : undefined,
        module_number: module_number ? Number(module_number) : undefined,
        search: search as string
      });
      res.json({ links, count: links.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // RTP (Revision Test Papers) Endpoints
  app.get('/api/scraper/rtps', (req, res) => {
    try {
      const { course, group_name, paper_number, exam_cycle, search } = req.query;
      const rtps = getRtpResources({
        course: course as string,
        group_name: group_name as string,
        paper_number: paper_number ? Number(paper_number) : undefined,
        exam_cycle: exam_cycle as string,
        search: search as string
      });
      res.json({ rtps, count: rtps.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // MTP (Mock Test Papers) Endpoints
  app.get('/api/scraper/mtps', (req, res) => {
    try {
      const { course, group_name, paper_number, series, type, exam_cycle, search } = req.query;
      const mtps = getMtpResources({
        course: course as string,
        group_name: group_name as string,
        paper_number: paper_number ? Number(paper_number) : undefined,
        series: series as string,
        type: type as string,
        exam_cycle: exam_cycle as string,
        search: search as string
      });
      res.json({ mtps, count: mtps.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/hierarchy/extract', async (req, res) => {
    try {
      const { batchSize, crawlDelayMs } = req.body || {};
      const result = await hierarchyScraper.executeExtraction({
        batchSize: batchSize ? Number(batchSize) : 6,
        crawlDelayMs: crawlDelayMs ? Number(crawlDelayMs) : 40
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Automated Test Suite Runner (10 Validation Tests)
  app.get('/api/scraper/tests', async (req, res) => {
    try {
      const results = await runAllAutomatedTests();
      res.json({
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        results
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/run-tests', async (req, res) => {
    try {
      const results = await runAllAutomatedTests();
      res.json({
        success: results.every(r => r.status === 'PASSED'),
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        results
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scraper/docs/:docId', (req, res) => {
    try {
      const docId = req.params.docId;
      let filename = 'access-policy-note.md';
      if (docId === 'site-structure-map') filename = 'site-structure-map.md';
      
      const docPath = path.join(process.cwd(), 'docs', filename);
      if (!fs.existsSync(docPath)) {
        return res.status(404).json({ error: 'Document not found' });
      }
      const content = fs.readFileSync(docPath, 'utf8');
      res.json({ docId, content, filename });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/materials/:id/validate', async (req, res) => {
    try {
      const material = storage.getMaterialById(req.params.id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      const { validateUrl } = await import('./src/scraper/validator.js');
      const validation = await validateUrl(material.url);
      const nowIso = new Date().toISOString();

      const previousHash = material.content_hash;
      const contentChanged = Boolean(previousHash && validation.content_hash && previousHash !== validation.content_hash);
      const urlChanged = validation.final_url && validation.final_url !== material.url;

      let newStatus = validation.status;
      if (urlChanged) {
        newStatus = 'URL_CHANGED';
        material.url = validation.final_url;
      } else if (contentChanged) {
        newStatus = 'CONTENT_CHANGED';
      }

      material.status = newStatus;
      material.last_checked_at = nowIso;
      if (validation.content_hash) {
        material.content_hash = validation.content_hash;
      }

      storage.upsertMaterial(material);
      storage.addUrlHistory({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        material_id: material.id,
        url: material.url,
        first_seen_at: material.first_seen_at,
        last_seen_at: nowIso,
        status: newStatus,
        content_hash: validation.content_hash
      });

      res.json({
        success: true,
        material,
        validation,
        contentChanged,
        urlChanged
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Downstream Application Query API (§30)
  app.get('/api/v1/materials/query', (req, res) => {
    try {
      const { course, group, subject, material_type, limit } = req.query;
      const materials = storage.getAllMaterials({
        course: course as string,
        group_name: group as string,
        subject: subject as string,
        material_type: material_type as string,
        status: 'ACTIVE'
      });

      const max = limit ? parseInt(limit as string, 10) : 50;
      const results = materials.slice(0, max).map(m => ({
        id: m.id,
        title: m.title,
        course: m.course,
        group: m.group_name,
        subject: m.subject,
        material_type: m.material_type,
        edition: m.edition,
        language: m.language,
        url: m.url,
        file_type: m.file_type,
        status: m.status,
        content_hash: m.content_hash,
        last_verified_at: m.last_checked_at
      }));

      res.json({
        success: true,
        query: { course, group, subject, material_type },
        total_found: materials.length,
        returned: results.length,
        results
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Export Catalog Endpoint (JSON or CSV)
  app.get('/api/scraper/export', (req, res) => {
    try {
      const format = req.query.format === 'csv' ? 'csv' : 'json';
      const materials = storage.getAllMaterials();

      if (format === 'csv') {
        const headers = ['ID', 'Course', 'Group', 'Subject', 'Material Type', 'Title', 'Edition', 'Language', 'Official URL', 'Status', 'Confidence', 'SHA-256 Content Hash', 'Last Verified'];
        const rows = materials.map(m => [
          `"${m.id}"`,
          `"${m.course}"`,
          `"${m.group_name}"`,
          `"${m.subject.replace(/"/g, '""')}"`,
          `"${m.material_type}"`,
          `"${m.title.replace(/"/g, '""')}"`,
          `"${m.edition}"`,
          `"${m.language}"`,
          `"${m.url}"`,
          `"${m.status}"`,
          `${Math.round((m.classification_confidence || 0.8) * 100)}%`,
          `"${m.content_hash || ''}"`,
          `"${m.last_checked_at}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="icai_materials_catalog.csv"');
        return res.send(csvContent);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="icai_materials_catalog.json"');
      res.json({
        exported_at: new Date().toISOString(),
        total_records: materials.length,
        materials
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/scraper/reset', async (req, res) => {
    try {
      storage.clearAllData();
      res.json({ success: true, message: 'All materials and run history cleared' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ICAI BoS Scraper Server running on http://0.0.0.0:${PORT}`);
    // Background async initialization without blocking server startup
    (async () => {
      try {
        await storage.init();
        await seedInitialRunIfEmpty();
        hierarchyScraper.generateFullCourseHierarchy();
        await syncCdnMapToDatabase();
        console.log(`[BOOT] Study Material State Array initialized with 215 items across Foundation, Inter, Final.`);
      } catch (err) {
        console.warn('Background initialization notice:', err);
      }
    })();
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer().catch(err => {
  console.error('Fatal Server Boot Error:', err);
});
