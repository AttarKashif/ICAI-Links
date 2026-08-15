import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  CheckCircle2, 
  GraduationCap, 
  Filter,
  CheckSquare,
  Square,
  Database,
  Cpu,
  Sliders,
  ChevronUp,
  FileText,
  BookmarkCheck,
  FileQuestion,
  BookOpenCheck,
  Calendar,
  Sparkles,
  Tag,
  Share2,
  ListFilter,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { 
  CourseHierarchyNode, 
  StudyMaterialChapterItem, 
  RtpResourceItem, 
  MtpResourceItem, 
  CourseName, 
  GroupName, 
  StateManagedArraySnapshot, 
  PaperHierarchyNode,
  ResourceCategory
} from '../types.js';
import { 
  ApplicableFiltersBar, 
  ApplicableFiltersState, 
  defaultFiltersState 
} from './ApplicableFiltersBar.js';
import { FilterPanel } from './FilterPanel.js';

export interface UnifiedResourceItem {
  id: string;
  category: 'STUDY_MATERIAL' | 'RTP' | 'MTP';
  course: CourseName;
  group_name: GroupName;
  paper_number: number;
  paper_name: string;
  title: string;
  subtitle: string;
  pdf_url: string;
  source_url: string;
  file_size_bytes: number;
  status: string;
  exam_cycle?: string;
  series?: string;
  type?: string;
  module_name?: string;
  chapter_number?: number;
  highlights?: string[];
}

export interface HierarchyExplorerProps {
  isDarkMode?: boolean;
}

export const HierarchyExplorer: React.FC<HierarchyExplorerProps> = ({ isDarkMode }) => {
  const [hierarchy, setHierarchy] = useState<CourseHierarchyNode[]>([]);
  const [rtpsList, setRtpsList] = useState<RtpResourceItem[]>([]);
  const [mtpsList, setMtpsList] = useState<MtpResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [batchSize, setBatchSize] = useState<number>(6);
  
  // View Switcher State
  const [activeTab, setActiveTab] = useState<'TREE' | 'STATE_ARRAY'>('TREE');

  // Applicable Filters State
  const [filters, setFilters] = useState<ApplicableFiltersState>(defaultFiltersState);

  // Paper Sub-Tab state in tree (for each paper: 'SM' | 'RTP' | 'MTP')
  const [paperTabSelection, setPaperTabSelection] = useState<Record<string, 'SM' | 'RTP' | 'MTP'>>({});
  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeRtpMtpItem, setActiveRtpMtpItem] = useState<RtpResourceItem | MtpResourceItem | null>(null);
  
  // Selection state for export
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [extractLogs, setExtractLogs] = useState<string[]>([]);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [extractSummary, setExtractSummary] = useState<any | null>(null);
  const [stateSnapshot, setStateSnapshot] = useState<StateManagedArraySnapshot | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const fetchStateSnapshot = async () => {
    try {
      const res = await fetch('/api/scraper/batches/state');
      if (res.ok) {
        const snap = await res.json();
        setStateSnapshot(snap);
      }
    } catch (e) {
      console.error('Failed to fetch state snapshot:', e);
    }
  };

  const fetchAllData = async (course = filters.course) => {
    setLoading(true);
    try {
      const hierarchyUrl = course === 'ALL' ? '/api/scraper/hierarchy' : `/api/scraper/hierarchy?course=${course}`;
      const [hierRes, rtpRes, mtpRes] = await Promise.all([
        fetch(hierarchyUrl),
        fetch('/api/scraper/rtps'),
        fetch('/api/scraper/mtps')
      ]);

      const [hierData, rtpData, mtpData] = await Promise.all([
        hierRes.json(),
        rtpRes.json(),
        mtpRes.json()
      ]);

      if (hierData.hierarchy) {
        setHierarchy(hierData.hierarchy);
        // Expand the first paper of each course by default
        const initialPapers: Record<string, boolean> = {};
        const initialModules: Record<string, boolean> = {};
        hierData.hierarchy.forEach((c: CourseHierarchyNode) => {
          c.papers.forEach((p, pIdx) => {
            if (pIdx === 0) {
              initialPapers[p.paper_id] = true;
              p.modules.forEach(m => {
                initialModules[m.module_id] = true;
              });
            }
          });
        });
        setExpandedPapers(initialPapers);
        setExpandedModules(initialModules);
      }

      if (rtpData.rtps) {
        setRtpsList(rtpData.rtps);
      }

      if (mtpData.mtps) {
        setMtpsList(mtpData.mtps);
      }

      await fetchStateSnapshot();
    } catch (e) {
      console.error('Failed to load study materials, RTPs and MTPs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData('ALL');
  }, []);

  const handleRunBatchExtraction = async () => {
    setExtracting(true);
    setBatchProgress({ current: 1, total: Math.ceil(36 / batchSize) });
    try {
      const res = await fetch('/api/scraper/hierarchy/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize, crawlDelayMs: 30 })
      });
      const data = await res.json();
      if (data.success) {
        setHierarchy(data.hierarchy);
        setExtractLogs(data.stats?.logs || []);
        setExtractSummary(data.stats);
        if (data.state_snapshot) {
          setStateSnapshot(data.state_snapshot);
        }
        setShowLogsModal(true);
        showToast(`Extraction complete! Links synchronized.`);
      }
    } catch (e) {
      console.error('Failed to run hierarchy extraction:', e);
      showToast('Extraction encountered an error');
    } finally {
      setExtracting(false);
      setBatchProgress(null);
    }
  };

  const togglePaper = (paperId: string) => {
    setExpandedPapers(prev => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const expandAll = () => {
    const papers: Record<string, boolean> = {};
    const modules: Record<string, boolean> = {};
    hierarchy.forEach(c => {
      c.papers.forEach(p => {
        papers[p.paper_id] = true;
        p.modules.forEach(m => {
          modules[m.module_id] = true;
        });
      });
    });
    setExpandedPapers(papers);
    setExpandedModules(modules);
    showToast('Expanded all papers and modules');
  };

  const collapseAll = () => {
    setExpandedPapers({});
    setExpandedModules({});
    showToast('Collapsed all views');
  };

  const copyToClipboard = (text: string, label = 'PDF link copied!') => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showToast(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Convert all items (SM Chapters, RTPs, MTPs) into a unified list
  const unifiedResources = useMemo(() => {
    const list: UnifiedResourceItem[] = [];

    // 1. Study Material Chapters
    hierarchy.forEach(c => {
      c.papers.forEach(p => {
        p.modules.forEach(m => {
          m.chapters.forEach(ch => {
            list.push({
              id: ch.id,
              category: 'STUDY_MATERIAL',
              course: ch.course,
              group_name: ch.group_name,
              paper_number: ch.paper_number,
              paper_name: ch.paper_name,
              title: ch.chapter_name,
              subtitle: `${m.module_name} · Chapter ${ch.chapter_number}`,
              pdf_url: ch.pdf_url,
              source_url: ch.source_url,
              file_size_bytes: ch.file_size_bytes,
              status: ch.status,
              exam_cycle: ch.exam_cycle || 'May 2026',
              module_name: m.module_name,
              chapter_number: ch.chapter_number
            });
          });
        });
      });
    });

    // 2. RTPs
    rtpsList.forEach(r => {
      list.push({
        id: r.id,
        category: 'RTP',
        course: r.course,
        group_name: r.group_name,
        paper_number: r.paper_number,
        paper_name: r.paper_name,
        title: r.title,
        subtitle: `Revision Test Paper · ${r.exam_cycle}`,
        pdf_url: r.pdf_url,
        source_url: r.source_url,
        file_size_bytes: r.file_size_bytes,
        status: r.status,
        exam_cycle: r.exam_cycle,
        highlights: r.highlights
      });
    });

    // 3. MTPs
    mtpsList.forEach(m => {
      const typeLabel = m.type === 'QUESTION_PAPER' ? 'Question Paper (QP)' : 'Suggested Answers (ANS)';
      list.push({
        id: m.id,
        category: 'MTP',
        course: m.course,
        group_name: m.group_name,
        paper_number: m.paper_number,
        paper_name: m.paper_name,
        title: m.title,
        subtitle: `Mock Test Paper · ${m.series} · ${typeLabel}`,
        pdf_url: m.pdf_url,
        source_url: m.source_url,
        file_size_bytes: m.file_size_bytes,
        status: m.status,
        exam_cycle: m.exam_cycle,
        series: m.series,
        type: m.type
      });
    });

    return list;
  }, [hierarchy, rtpsList, mtpsList]);

  // Extract unique papers and exam cycles for dropdowns
  const availablePapers = useMemo(() => {
    const map = new Map<string, { number: number; name: string; course: string; group?: string }>();
    unifiedResources.forEach(item => {
      const key = `${item.course}-${item.paper_number}`;
      if (!map.has(key)) {
        map.set(key, {
          number: item.paper_number,
          name: item.paper_name,
          course: item.course,
          group: item.group_name
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.course !== b.course) return a.course.localeCompare(b.course);
      return a.number - b.number;
    });
  }, [unifiedResources]);

  const availableExamCycles = useMemo(() => {
    const set = new Set<string>();
    unifiedResources.forEach(item => {
      if (item.exam_cycle) set.add(item.exam_cycle);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [unifiedResources]);

  // Master Filter Application
  const filteredUnifiedResources = useMemo(() => {
    const filtered = unifiedResources.filter(item => {
      // 1. Resource Category Filter
      if (filters.category !== 'ALL' && item.category !== filters.category) return false;

      // 2. Course Filter
      if (filters.course !== 'ALL' && item.course.toLowerCase() !== filters.course.toLowerCase()) return false;

      // 3. Group Filter
      if (filters.group !== 'ALL' && item.group_name.toLowerCase() !== filters.group.toLowerCase()) return false;

      // 4. Paper Number Filter
      if (filters.paperNumber !== 'ALL' && item.paper_number !== Number(filters.paperNumber)) return false;

      // 5. Exam Cycle Filter
      if (filters.examCycle !== 'ALL' && item.exam_cycle && !item.exam_cycle.toLowerCase().includes(filters.examCycle.toLowerCase())) return false;

      // 6. MTP Series Filter
      if (filters.mtpSeries !== 'ALL' && item.series && item.series.toLowerCase() !== filters.mtpSeries.toLowerCase()) return false;

      // 7. MTP Type Filter
      if (filters.mtpType !== 'ALL' && item.type && item.type !== filters.mtpType) return false;

      // 8. File Size Filter
      if (filters.fileSizeRange !== 'ALL') {
        const mb = item.file_size_bytes / (1024 * 1024);
        if (filters.fileSizeRange === 'SMALL' && mb >= 2.0) return false;
        if (filters.fileSizeRange === 'MEDIUM' && (mb < 2.0 || mb > 5.0)) return false;
        if (filters.fileSizeRange === 'LARGE' && mb <= 5.0) return false;
      }

      // 9. Statutory Amendments Only Filter
      if (filters.amendmentsOnly) {
        const hasHighlights = item.highlights && item.highlights.length > 0;
        const titleMentions = item.title.toLowerCase().includes('amendment') || item.title.toLowerCase().includes('statutory');
        if (!hasHighlights && !titleMentions) return false;
      }

      // 10. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPaper = item.paper_name.toLowerCase().includes(q);
        const matchUrl = item.pdf_url.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchHighlights = item.highlights ? item.highlights.some(h => h.toLowerCase().includes(q)) : false;
        const matchCycle = item.exam_cycle ? item.exam_cycle.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchPaper && !matchUrl && !matchSub && !matchHighlights && !matchCycle) return false;
      }

      return true;
    });

    // Sort Logic
    if (filters.sortBy === 'PAPER_ASC') {
      return [...filtered].sort((a, b) => a.paper_number - b.paper_number);
    }
    if (filters.sortBy === 'PAPER_DESC') {
      return [...filtered].sort((a, b) => b.paper_number - a.paper_number);
    }
    if (filters.sortBy === 'SIZE_DESC') {
      return [...filtered].sort((a, b) => b.file_size_bytes - a.file_size_bytes);
    }
    if (filters.sortBy === 'SIZE_ASC') {
      return [...filtered].sort((a, b) => a.file_size_bytes - b.file_size_bytes);
    }
    if (filters.sortBy === 'TITLE_AZ') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [unifiedResources, filters]);

  // Selection handlers
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (selectedItemIds.size === filteredUnifiedResources.length && filteredUnifiedResources.length > 0) {
      setSelectedItemIds(new Set());
      showToast('Cleared selection');
    } else {
      const allIds = new Set(filteredUnifiedResources.map(c => c.id));
      setSelectedItemIds(allIds);
      showToast(`Selected all ${filteredUnifiedResources.length} matching links`);
    }
  };

  const toggleSelectItemsList = (items: UnifiedResourceItem[]) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      const allSelected = items.length > 0 && items.every(it => next.has(it.id));
      if (allSelected) {
        items.forEach(it => next.delete(it.id));
      } else {
        items.forEach(it => next.add(it.id));
      }
      return next;
    });
  };

  // Export functions
  const getItemsToExport = (forceAll = false): UnifiedResourceItem[] => {
    if (forceAll || selectedItemIds.size === 0) {
      return filteredUnifiedResources;
    }
    return unifiedResources.filter(item => selectedItemIds.has(item.id));
  };

  const exportAsJson = (forceAll = false) => {
    const items = getItemsToExport(forceAll);
    const isPartial = !forceAll && selectedItemIds.size > 0;
    
    const exportData = {
      exported_at: new Date().toISOString(),
      total_links: items.length,
      applicable_filters: filters,
      is_partial: isPartial,
      resources: items
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icai_bos_links_${items.length}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${items.length} links as JSON`);
  };

  const exportAsCsv = (forceAll = false) => {
    const items = getItemsToExport(forceAll);
    const headers = ['Category', 'Course', 'Group', 'Paper Number', 'Paper Name', 'Details / Series / Module', 'Item Title', 'PDF URL', 'Exam Cycle', 'File Size (MB)', 'Status'];
    const rows = items.map(item => [
      `"${item.category}"`,
      `"${item.course}"`,
      `"${item.group_name || 'N/A'}"`,
      `"Paper ${item.paper_number}"`,
      `"${item.paper_name.replace(/"/g, '""')}"`,
      `"${item.subtitle.replace(/"/g, '""')}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.pdf_url}"`,
      `"${item.exam_cycle || ''}"`,
      `"${(item.file_size_bytes / (1024 * 1024)).toFixed(2)}"`,
      `"${item.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icai_bos_links_${items.length}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${items.length} links as CSV`);
  };

  const exportAsTxtUrls = (forceAll = false) => {
    const items = getItemsToExport(forceAll);
    const txtContent = items.map(item => `[${item.category}] ${item.course} | Paper ${item.paper_number}: ${item.paper_name} | ${item.title}\n${item.pdf_url}`).join('\n\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icai_bos_urls_${items.length}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${items.length} plain URLs`);
  };

  // Group papers inside each course into distinct Groups
  const groupPapersByStructure = (papers: PaperHierarchyNode[]) => {
    const groups: { groupName: string; papers: PaperHierarchyNode[] }[] = [];
    const groupMap = new Map<string, PaperHierarchyNode[]>();

    papers.forEach(paper => {
      const gName = paper.group_name && paper.group_name !== 'N/A' ? paper.group_name : 'General Papers';
      if (!groupMap.has(gName)) {
        groupMap.set(gName, []);
      }
      groupMap.get(gName)!.push(paper);
    });

    groupMap.forEach((pList, gName) => {
      groups.push({ groupName: gName, papers: pList });
    });

    return groups;
  };

  // Counts by category
  const smCount = useMemo(() => unifiedResources.filter(r => r.category === 'STUDY_MATERIAL').length, [unifiedResources]);
  const rtpCount = useMemo(() => unifiedResources.filter(r => r.category === 'RTP').length, [unifiedResources]);
  const mtpCount = useMemo(() => unifiedResources.filter(r => r.category === 'MTP').length, [unifiedResources]);

  // Set of filtered item IDs for rapid lookups in tree rendering
  const filteredItemIdSet = useMemo(() => {
    return new Set(filteredUnifiedResources.map(i => i.id));
  }, [filteredUnifiedResources]);

  return (
    <div id="hierarchy-explorer-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-stone-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Filter Panel (Placed above HierarchyExplorer) */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(defaultFiltersState)}
        totalCount={unifiedResources.length}
        filteredCount={filteredUnifiedResources.length}
        availableExamCycles={availableExamCycles}
        isDarkMode={isDarkMode}
      />

      {/* Main Extraction Banner & Metric Deck */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-stone-800 border border-stone-700 rounded-lg text-blue-400 font-mono text-xs uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Full BoS Educational Link Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ICAI Study Material, RTP & MTP Links
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl">
              Direct official PDF extraction for <strong>Study Materials (SM)</strong>, <strong>Revision Test Papers (RTPs)</strong>, and <strong>Mock Test Papers (MTPs - Series I & II)</strong> across Foundation, Intermediate, and Final courses.
            </p>
          </div>

          {/* Batch Configuration & Primary Extraction Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-800/90 px-3 py-2 rounded-xl border border-stone-700 text-xs">
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-300 font-medium">Batch Size:</span>
              <select
                id="select-batch-size"
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
                className="bg-stone-900 text-white font-mono px-2 py-0.5 rounded border border-stone-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={4}>4 items</option>
                <option value={6}>6 items</option>
                <option value={8}>8 items</option>
                <option value={12}>12 items</option>
              </select>
            </div>

            <button
              id="btn-run-extract-all"
              onClick={handleRunBatchExtraction}
              disabled={extracting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${extracting ? 'animate-spin' : ''}`} />
              <span>{extracting ? 'Extracting...' : 'Sync All Links'}</span>
            </button>
          </div>
        </div>

        {/* Live Category Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-800">
          <div 
            onClick={() => setFilters(prev => ({ ...prev, category: 'STUDY_MATERIAL' }))}
            className={`cursor-pointer rounded-xl p-3 border transition ${
              filters.category === 'STUDY_MATERIAL' ? 'bg-blue-900/40 border-blue-500' : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                Study Material
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Chapters</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {smCount} PDFs
            </div>
            <div className="text-[10px] text-stone-400">All Syllabus Modules</div>
          </div>

          <div 
            onClick={() => setFilters(prev => ({ ...prev, category: 'RTP' }))}
            className={`cursor-pointer rounded-xl p-3 border transition ${
              filters.category === 'RTP' ? 'bg-amber-900/40 border-amber-500' : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <BookOpenCheck className="w-3.5 h-3.5 text-amber-400" />
                Revision Test Papers
              </span>
              <span className="text-[10px] text-amber-400 font-mono">RTP</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {rtpCount} RTPs
            </div>
            <div className="text-[10px] text-stone-400">May 2026 & Nov 2025 Cycles</div>
          </div>

          <div 
            onClick={() => setFilters(prev => ({ ...prev, category: 'MTP' }))}
            className={`cursor-pointer rounded-xl p-3 border transition ${
              filters.category === 'MTP' ? 'bg-indigo-900/40 border-indigo-500' : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
                Mock Test Papers
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">MTP</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {mtpCount} Papers
            </div>
            <div className="text-[10px] text-stone-400">Series I & II (QP + Answers)</div>
          </div>

          <div 
            onClick={() => setFilters(prev => ({ ...prev, category: 'ALL' }))}
            className={`cursor-pointer rounded-xl p-3 border transition ${
              filters.category === 'ALL' ? 'bg-stone-700/60 border-stone-400' : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-medium">Total Resources</span>
              <span className="text-[10px] text-blue-400 font-mono">All Types</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {unifiedResources.length} Links
            </div>
            <div className="text-[10px] text-stone-400">
              {selectedItemIds.size > 0 ? `${selectedItemIds.size} Selected` : 'Ready for Export'}
            </div>
          </div>
        </div>
      </div>

      {/* APPLICABLE FILTERS ENGINE */}
      <ApplicableFiltersBar 
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(defaultFiltersState)}
        totalResourcesCount={unifiedResources.length}
        matchingResourcesCount={filteredUnifiedResources.length}
        availablePapers={availablePapers}
        availableExamCycles={availableExamCycles}
      />

      {/* View Switcher, Search Input & Export Action Deck */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: View Modes */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
          <button
            id="view-tab-tree"
            onClick={() => setActiveTab('TREE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'TREE'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
            Syllabus Hierarchy View
          </button>
          <button
            id="view-tab-flat-stream"
            onClick={() => setActiveTab('STATE_ARRAY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'STATE_ARRAY'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1.5 text-indigo-600" />
            Flat List Stream ({filteredUnifiedResources.length})
          </button>
        </div>

        {/* Center: Search Query Filter */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-hierarchy-input"
            type="text"
            placeholder="Search within filtered resources by title, paper, topic..."
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8.5 pr-8 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Select & Export Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Select Visible Toggle */}
          <button
            id="btn-select-all-visible"
            onClick={toggleSelectAllVisible}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
            title="Toggle selection for all filtered items"
          >
            {selectedItemIds.size === filteredUnifiedResources.length && filteredUnifiedResources.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{selectedItemIds.size > 0 ? `(${selectedItemIds.size})` : 'Select All'}</span>
          </button>

          {/* Export Dropdown / Format Group */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              id="export-btn-json"
              onClick={() => exportAsJson(selectedItemIds.size === 0)}
              className="px-2.5 py-1 text-stone-700 hover:bg-white rounded-lg text-xs font-semibold transition"
              title="Export filtered items as JSON"
            >
              JSON
            </button>
            <button
              id="export-btn-csv"
              onClick={() => exportAsCsv(selectedItemIds.size === 0)}
              className="px-2.5 py-1 text-stone-700 hover:bg-white rounded-lg text-xs font-semibold transition"
              title="Export filtered items as CSV spreadsheet"
            >
              CSV
            </button>
            <button
              id="export-btn-txt"
              onClick={() => exportAsTxtUrls(selectedItemIds.size === 0)}
              className="px-2.5 py-1 text-stone-700 hover:bg-white rounded-lg text-xs font-semibold transition"
              title="Export plain list of URLs"
            >
              TXT
            </button>
          </div>

          {activeTab === 'TREE' && (
            <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
              <button
                onClick={expandAll}
                className="px-2 py-1 text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium"
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-stone-600">Loading educational materials, RTPs, and MTPs...</p>
        </div>
      ) : filteredUnifiedResources.length === 0 ? (
        /* Empty State when filters yield no matches */
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6 text-stone-400" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            No resources match the applied filters
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try resetting some of your filter criteria such as Course, Group, Exam Cycle, or Search Query to find available links.
          </p>
          <button
            onClick={() => setFilters(defaultFiltersState)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Applied Filters</span>
          </button>
        </div>
      ) : activeTab === 'STATE_ARRAY' ? (
        /* State Array Flat Stream */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 px-6 py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-stone-900">
                Filtered Resources Stream ({filteredUnifiedResources.length} of {unifiedResources.length} Links)
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Active Category: {filters.category} · Course: {filters.course}
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[700px] overflow-y-auto">
            {filteredUnifiedResources.map((item) => {
              const isSelected = selectedItemIds.has(item.id);
              const badgeColors = {
                STUDY_MATERIAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                RTP: 'bg-amber-50 text-amber-700 border-amber-200',
                MTP: 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }[item.category];

              return (
                <div
                  key={item.id}
                  className={`p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-stone-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="mt-0.5 text-stone-400 hover:text-stone-800 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${badgeColors}`}>
                          {item.category === 'STUDY_MATERIAL' ? 'SM' : item.category}
                        </span>
                        <span className="font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-700 text-[11px]">
                          {item.course} P{item.paper_number}
                        </span>
                        {item.group_name && item.group_name !== 'N/A' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                            {item.group_name}
                          </span>
                        )}
                        <span className="font-semibold text-stone-900">
                          {item.title}
                        </span>
                        {item.exam_cycle && (
                          <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                            {item.exam_cycle}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-stone-400">
                          {(item.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {item.subtitle}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 break-all mt-0.5">
                        {item.pdf_url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => copyToClipboard(item.pdf_url, 'PDF link copied!')}
                      className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                      title="Copy PDF URL"
                    >
                      {copiedUrl === item.pdf_url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition"
                      title="Open PDF"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Refined Structured Hierarchy Tree Reactively Filtered */
        <div className="space-y-8">
          {hierarchy
            .filter(courseNode => filters.course === 'ALL' || courseNode.course.toLowerCase() === filters.course.toLowerCase())
            .map(courseNode => {
              // Filter papers that contain any matching items under current filters
              const coursePapers = courseNode.papers.filter(paper => {
                if (filters.group !== 'ALL' && paper.group_name.toLowerCase() !== filters.group.toLowerCase()) return false;
                if (filters.paperNumber !== 'ALL' && paper.paper_number !== Number(filters.paperNumber)) return false;

                // Check if paper has any item present in filteredItemIdSet
                const hasMatchingSM = paper.modules.some(m => m.chapters.some(ch => filteredItemIdSet.has(ch.id)));
                const hasMatchingRTP = (paper.rtps || []).some(r => filteredItemIdSet.has(r.id));
                const hasMatchingMTP = (paper.mtps || []).some(m => filteredItemIdSet.has(m.id));

                return hasMatchingSM || hasMatchingRTP || hasMatchingMTP;
              });

              if (coursePapers.length === 0) return null;

              const groupedSections = groupPapersByStructure(coursePapers);

              return (
                <div
                  key={courseNode.course}
                  id={`course-section-${courseNode.course.toLowerCase()}`}
                  className="space-y-4"
                >
                  {/* Course Master Header */}
                  <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>CA {courseNode.course}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-stone-800 text-stone-300 font-mono rounded-md font-normal">
                            New Scheme
                          </span>
                        </h2>
                        <p className="text-xs text-stone-400">
                          {coursePapers.length} Papers Matching Applied Filters
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          const allCourseItems = filteredUnifiedResources.filter(r => r.course === courseNode.course);
                          toggleSelectItemsList(allCourseItems);
                        }}
                        className="text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        Select CA {courseNode.course}
                      </button>
                      <button
                        onClick={() => {
                          const allCourseItems = filteredUnifiedResources.filter(r => r.course === courseNode.course);
                          const urls = allCourseItems.map(c => c.pdf_url).join('\n');
                          copyToClipboard(urls, `Copied ${allCourseItems.length} links for CA ${courseNode.course}!`);
                        }}
                        className="text-xs text-stone-900 font-semibold bg-white hover:bg-stone-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Copy Links
                      </button>
                    </div>
                  </div>

                  {/* Render Distinct Groups */}
                  <div className="space-y-6">
                    {groupedSections.map((groupSec) => {
                      return (
                        <div
                          key={groupSec.groupName}
                          className="bg-stone-50/60 rounded-2xl border border-stone-200/90 p-4 sm:p-5 space-y-4 shadow-xs"
                        >
                          {/* Group Section Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                              <h3 className="text-sm font-bold text-stone-900">
                                {groupSec.groupName}
                              </h3>
                              <span className="text-xs text-stone-500 font-medium">
                                ({groupSec.papers.length} Papers)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const groupItems = filteredUnifiedResources.filter(
                                    r => r.course === courseNode.course && (r.group_name === groupSec.groupName || groupSec.groupName === 'General Papers')
                                  );
                                  toggleSelectItemsList(groupItems);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 font-medium transition"
                              >
                                <span>Select Group</span>
                              </button>

                              <button
                                onClick={() => {
                                  const groupItems = filteredUnifiedResources.filter(
                                    r => r.course === courseNode.course && (r.group_name === groupSec.groupName || groupSec.groupName === 'General Papers')
                                  );
                                  const urls = groupItems.map(c => c.pdf_url).join('\n');
                                  copyToClipboard(urls, `Copied ${groupItems.length} links for ${groupSec.groupName}!`);
                                }}
                                className="text-xs text-stone-700 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 font-medium transition"
                              >
                                Copy Group URLs
                              </button>
                            </div>
                          </div>

                          {/* Papers in this Group */}
                          <div className="space-y-4">
                            {groupSec.papers.map(paper => {
                              const isPaperOpen = Boolean(expandedPapers[paper.paper_id]);
                              
                              // Filtered Items for this paper
                              const matchingSMChapters = paper.modules.flatMap(m => m.chapters).filter(ch => filteredItemIdSet.has(ch.id));
                              const matchingRtps = (paper.rtps || []).filter(r => filteredItemIdSet.has(r.id));
                              const matchingMtps = (paper.mtps || []).filter(m => filteredItemIdSet.has(m.id));
                              const totalMatchingPaperItems = matchingSMChapters.length + matchingRtps.length + matchingMtps.length;

                              // Automatically prioritize tab based on active category filter or selection
                              const currentPaperTab = paperTabSelection[paper.paper_id] || (
                                filters.category === 'RTP' ? 'RTP' :
                                filters.category === 'MTP' ? 'MTP' : 
                                matchingSMChapters.length > 0 ? 'SM' : 
                                matchingRtps.length > 0 ? 'RTP' : 'MTP'
                              );

                              return (
                                <div
                                  key={paper.paper_id}
                                  id={`paper-card-${paper.paper_id}`}
                                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs transition hover:border-stone-300"
                                >
                                  {/* Paper Header Row */}
                                  <div
                                    id={`paper-header-${paper.paper_id}`}
                                    onClick={() => togglePaper(paper.paper_id)}
                                    className="px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-stone-50/80 transition"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="px-2 py-1 bg-stone-900 text-white font-bold text-xs rounded-md">
                                          P{paper.paper_number}
                                        </span>
                                      </div>

                                      <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                                          Paper {paper.paper_number}: {paper.paper_name}
                                        </div>
                                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                          <span className="text-emerald-700 font-medium">{matchingSMChapters.length} SM Chapters</span>
                                          <span>•</span>
                                          <span className="text-amber-700 font-medium">{matchingRtps.length} RTPs</span>
                                          <span>•</span>
                                          <span className="text-indigo-700 font-medium">{matchingMtps.length} MTPs</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Paper Action Buttons & Toggle Chevron */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const paperItems = filteredUnifiedResources.filter(r => r.course === courseNode.course && r.paper_number === paper.paper_number);
                                          const urls = paperItems.map(c => c.pdf_url).join('\n');
                                          copyToClipboard(urls, `Copied ${paperItems.length} links for Paper ${paper.paper_number}!`);
                                        }}
                                        className="hidden sm:inline-flex text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition"
                                      >
                                        Copy Paper ({totalMatchingPaperItems})
                                      </button>

                                      <div className="p-1 text-stone-400 hover:text-stone-700">
                                        {isPaperOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Paper Expanded Content & Sub-Tabs */}
                                  {isPaperOpen && (
                                    <div className="px-4 sm:px-5 pb-4 pt-2 bg-stone-50/50 border-t border-stone-100 space-y-3">
                                      {/* Sub Tabs: SM, RTP, MTP */}
                                      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 flex-wrap">
                                        <button
                                          onClick={() => setPaperTabSelection(prev => ({ ...prev, [paper.paper_id]: 'SM' }))}
                                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                            currentPaperTab === 'SM'
                                              ? 'bg-emerald-700 text-white shadow-2xs'
                                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                          }`}
                                        >
                                          <BookmarkCheck className="w-3.5 h-3.5" />
                                          <span>Study Material ({matchingSMChapters.length})</span>
                                        </button>

                                        <button
                                          onClick={() => setPaperTabSelection(prev => ({ ...prev, [paper.paper_id]: 'RTP' }))}
                                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                            currentPaperTab === 'RTP'
                                              ? 'bg-amber-700 text-white shadow-2xs'
                                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                          }`}
                                        >
                                          <BookOpenCheck className="w-3.5 h-3.5" />
                                          <span>Revision Test Papers ({matchingRtps.length})</span>
                                        </button>

                                        <button
                                          onClick={() => setPaperTabSelection(prev => ({ ...prev, [paper.paper_id]: 'MTP' }))}
                                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                            currentPaperTab === 'MTP'
                                              ? 'bg-indigo-700 text-white shadow-2xs'
                                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                          }`}
                                        >
                                          <FileQuestion className="w-3.5 h-3.5" />
                                          <span>Mock Test Papers ({matchingMtps.length})</span>
                                        </button>
                                      </div>

                                      {/* Sub-Tab 1: Study Material Modules & Chapters */}
                                      {currentPaperTab === 'SM' && (
                                        <div className="space-y-3 pt-1">
                                          {matchingSMChapters.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                                              No Study Material chapters match current filters.
                                            </div>
                                          ) : (
                                            paper.modules
                                              .filter(m => m.chapters.some(ch => filteredItemIdSet.has(ch.id)))
                                              .map(moduleNode => {
                                                const isModOpen = Boolean(expandedModules[moduleNode.module_id]);
                                                const visibleChapters = moduleNode.chapters.filter(ch => filteredItemIdSet.has(ch.id));

                                                return (
                                                  <div
                                                    key={moduleNode.module_id}
                                                    className="bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-2xs"
                                                  >
                                                    {/* Module Header Bar */}
                                                    <div
                                                      onClick={() => toggleModule(moduleNode.module_id)}
                                                      className="px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition select-none bg-stone-50/40"
                                                    >
                                                      <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="p-0.5 text-stone-400">
                                                          {isModOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-700" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <Layers className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                                        <span className="text-xs font-bold text-stone-800 truncate">
                                                          {moduleNode.module_name}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                                                          {visibleChapters.length} chapters
                                                        </span>
                                                      </div>

                                                      <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            const urls = visibleChapters.map(c => c.pdf_url).join('\n');
                                                            copyToClipboard(urls, `Copied ${visibleChapters.length} links for ${moduleNode.module_name}!`);
                                                          }}
                                                          className="text-[11px] text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded hover:bg-stone-200 transition"
                                                        >
                                                          Copy Links
                                                        </button>
                                                      </div>
                                                    </div>

                                                    {/* Chapter Rows */}
                                                    {isModOpen && (
                                                      <div className="border-t border-stone-100 divide-y divide-stone-100">
                                                        {visibleChapters.map(chapter => {
                                                          const isSelected = selectedItemIds.has(chapter.id);
                                                          return (
                                                            <div
                                                              key={chapter.id}
                                                              className={`p-2.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                                                                isSelected ? 'bg-blue-50/40' : 'hover:bg-stone-50/70'
                                                              }`}
                                                            >
                                                              <div className="flex items-start gap-2.5 min-w-0">
                                                                <button
                                                                  onClick={() => toggleSelectItem(chapter.id)}
                                                                  className="mt-0.5 text-stone-400 hover:text-stone-800 shrink-0"
                                                                >
                                                                  {isSelected ? (
                                                                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                                                  ) : (
                                                                    <Square className="w-3.5 h-3.5 text-stone-300" />
                                                                  )}
                                                                </button>

                                                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded shrink-0">
                                                                  Ch {chapter.chapter_number}
                                                                </span>

                                                                <div className="min-w-0">
                                                                  <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-semibold text-stone-900">
                                                                      {chapter.chapter_name}
                                                                    </span>
                                                                    <span className="text-[10px] font-mono text-stone-400">
                                                                      {(chapter.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                                                                    </span>
                                                                  </div>
                                                                  <div className="text-[10px] font-mono text-stone-500 break-all mt-0.5">
                                                                    {chapter.pdf_url}
                                                                  </div>
                                                                </div>
                                                              </div>

                                                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                                <button
                                                                  onClick={() => copyToClipboard(chapter.pdf_url, 'PDF link copied!')}
                                                                  className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                                                                  title="Copy PDF URL"
                                                                >
                                                                  {copiedUrl === chapter.pdf_url ? (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                  ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                  )}
                                                                </button>
                                                                <a
                                                                  href={chapter.pdf_url}
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition"
                                                                >
                                                                  <span>Open PDF</span>
                                                                  <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })
                                          )}
                                        </div>
                                      )}

                                      {/* Sub-Tab 2: Revision Test Papers (RTPs) */}
                                      {currentPaperTab === 'RTP' && (
                                        <div className="space-y-2.5 pt-1">
                                          {matchingRtps.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                                              No RTPs match the current filters for this paper.
                                            </div>
                                          ) : (
                                            matchingRtps.map(rtp => {
                                              const isSelected = selectedItemIds.has(rtp.id);
                                              return (
                                                <div
                                                  key={rtp.id}
                                                  className={`bg-white rounded-xl border border-amber-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs ${
                                                    isSelected ? 'bg-amber-50/50' : 'hover:border-amber-300'
                                                  }`}
                                                >
                                                  <div className="flex items-start gap-3 min-w-0">
                                                    <button
                                                      onClick={() => toggleSelectItem(rtp.id)}
                                                      className="mt-0.5 text-stone-400 hover:text-stone-800 shrink-0"
                                                    >
                                                      {isSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-amber-600" />
                                                      ) : (
                                                        <Square className="w-4 h-4 text-stone-300" />
                                                      )}
                                                    </button>

                                                    <div className="min-w-0">
                                                      <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono border border-amber-300">
                                                          {rtp.exam_cycle} RTP
                                                        </span>
                                                        <span className="text-xs font-bold text-stone-900">
                                                          {rtp.title}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-stone-400">
                                                          {(rtp.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                                                        </span>
                                                      </div>

                                                      {/* Highlights */}
                                                      {rtp.highlights && rtp.highlights.length > 0 && (
                                                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                                          {rtp.highlights.map((hl, hIdx) => (
                                                            <span
                                                              key={hIdx}
                                                              className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md flex items-center gap-1"
                                                            >
                                                              <Tag className="w-2.5 h-2.5 text-amber-600" />
                                                              {hl}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      )}

                                                      <div className="text-[10px] font-mono text-stone-400 break-all mt-1">
                                                        {rtp.pdf_url}
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                    <button
                                                      onClick={() => copyToClipboard(rtp.pdf_url, 'RTP link copied!')}
                                                      className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                                                      title="Copy RTP URL"
                                                    >
                                                      {copiedUrl === rtp.pdf_url ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                      ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                      )}
                                                    </button>
                                                    <a href={rtp.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition shadow-2xs"><span>Download RTP</span><ExternalLink className="w-3 h-3" /></a>
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}

                                      {/* Sub-Tab 3: Mock Test Papers (MTPs) */}
                                      {currentPaperTab === 'MTP' && (
                                        <div className="space-y-2.5 pt-1">
                                          {matchingMtps.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                                              No MTPs match the current filters for this paper.
                                            </div>
                                          ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                              {matchingMtps.map(mtp => {
                                                const isSelected = selectedItemIds.has(mtp.id);
                                                const isQP = mtp.type === 'QUESTION_PAPER';

                                                return (
                                                  <div
                                                    key={mtp.id}
                                                    className={`bg-white rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition shadow-2xs ${
                                                      isQP ? 'border-indigo-200' : 'border-emerald-200'
                                                    } ${isSelected ? 'bg-indigo-50/50' : 'hover:border-stone-400'}`}
                                                  >
                                                    <div className="flex items-start gap-2.5 min-w-0">
                                                      <button
                                                        onClick={() => toggleSelectItem(mtp.id)}
                                                        className="mt-0.5 text-stone-400 hover:text-stone-800 shrink-0"
                                                      >
                                                        {isSelected ? (
                                                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                        ) : (
                                                          <Square className="w-4 h-4 text-stone-300" />
                                                        )}
                                                      </button>

                                                      <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-stone-900 text-white rounded font-mono">
                                                            {mtp.series}
                                                          </span>
                                                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                                                            isQP ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                          }`}>
                                                            {isQP ? 'Question Paper' : 'Suggested Answers'}
                                                          </span>
                                                          <span className="text-[10px] text-stone-500 font-mono">
                                                            {mtp.exam_cycle}
                                                          </span>
                                                        </div>

                                                        <div className="text-xs font-semibold text-stone-900 mt-1 line-clamp-1">
                                                          {mtp.title}
                                                        </div>

                                                        <div className="text-[10px] font-mono text-stone-400 break-all mt-0.5 line-clamp-1">
                                                          {mtp.pdf_url}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                                      <span className="text-[10px] font-mono text-stone-500">
                                                        {(mtp.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                                                      </span>

                                                      <div className="flex items-center gap-1.5">
                                                        <button
                                                          onClick={() => copyToClipboard(mtp.pdf_url, `${isQP ? 'Question Paper' : 'Answer Key'} link copied!`)}
                                                          className="p-1 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition"
                                                          title="Copy URL"
                                                        >
                                                          {copiedUrl === mtp.pdf_url ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                          ) : (
                                                            <Copy className="w-3 h-3" />
                                                          )}
                                                        </button>
                                                        <a href={mtp.pdf_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-[11px] font-semibold rounded-md transition shadow-2xs ${isQP ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}><span>{isQP ? 'Open QP' : 'Open Answers'}</span><ExternalLink className="w-2.5 h-2.5" /></a>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Extraction Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Discovery & Extraction Logs</span>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-stone-400 hover:text-white text-xs font-medium"
              >
                Close
              </button>
            </div>

            {extractSummary && (
              <div className="p-3 bg-stone-800/40 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300">
                <span>Discovered: <strong>{extractSummary.chapters_discovered} Links</strong></span>
                <span>Batches: <strong>{extractSummary.total_batches} (Size {extractSummary.batch_size})</strong></span>
                <span>Duration: <strong>{extractSummary.duration_ms}ms</strong></span>
              </div>
            )}

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-stone-300 space-y-1 bg-black/40">
              {extractLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('[ERROR]')
                      ? 'text-red-400'
                      : log.includes('[PDF]')
                      ? 'text-emerald-400'
                      : log.includes('[BATCH')
                      ? 'text-yellow-400 font-bold'
                      : log.includes('[COURSE]')
                      ? 'text-blue-400 font-bold'
                      : 'text-stone-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RTP / MTP Access & Official Portal Gateway Modal */}
      {activeRtpMtpItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Secure ICAI Resource Gateway
                </h3>
              </div>
              <button
                onClick={() => setActiveRtpMtpItem(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-mono border border-amber-200 dark:border-amber-900">
                    {activeRtpMtpItem.course} • Paper {activeRtpMtpItem.paper_number}
                  </span>
                  {'exam_cycle' in activeRtpMtpItem && activeRtpMtpItem.exam_cycle && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-mono">
                      {activeRtpMtpItem.exam_cycle}
                    </span>
                  )}
                  {'series' in activeRtpMtpItem && activeRtpMtpItem.series && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                      {activeRtpMtpItem.series}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug">
                  {activeRtpMtpItem.title}
                </h4>
              </div>

              {/* ICAI WAF Notice & Official Portal Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-emerald-950 dark:text-emerald-300 text-xs">
                      Official ICAI BoS Knowledge Portal (Recommended)
                    </h5>
                    <p className="text-xs text-emerald-900/80 dark:text-emerald-400/90 leading-relaxed">
                      Due to ICAI Web Application Firewall (WAF) policies, direct raw CDN links on <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.2 rounded font-mono text-emerald-950 dark:text-emerald-200">resource.cdn.icai.org</code> may trigger 403 errors when opened directly. The official portal ensures instant, uninterrupted access.
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.icai.org/post/bos-knowledge-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Open Official ICAI BoS Knowledge Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Direct CDN Option */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Direct CDN PDF Link
                </div>
                <div className="flex items-center space-x-2 bg-stone-50 dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="font-mono text-[11px] text-stone-700 dark:text-stone-300 truncate flex-1 select-all">
                    {activeRtpMtpItem.pdf_url}
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeRtpMtpItem.pdf_url, 'Direct link copied!')}
                    className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 text-xs font-semibold rounded transition"
                  >
                    {copiedUrl === activeRtpMtpItem.pdf_url ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={activeRtpMtpItem.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded transition inline-flex items-center gap-1"
                  >
                    <span>Open PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setActiveRtpMtpItem(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
