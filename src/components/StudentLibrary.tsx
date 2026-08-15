import React, { useState, useMemo } from 'react';
import {
  BookOpen, ExternalLink, Download, CheckCircle2,
  Share2, Check, ChevronDown, ChevronUp,
  Sparkles, CheckSquare, Square, RefreshCw, Filter, SearchX, RotateCcw
} from 'lucide-react';
import { MaterialRecord, CourseName } from '../types.js';

interface StudentLibraryProps {
  materials: MaterialRecord[];
  selectedCourse: CourseName;
  setSelectedCourse: (course: CourseName) => void;
  searchQuery: string;
  setSearchQuery?: (q: string) => void;
  onSelectMaterial: (material: MaterialRecord) => void;
  onNavigateToUpdates?: () => void;
  studiedMap: Record<string, boolean>;
  onToggleStudied: (id: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// 1. Shimmer Skeleton Component for Student Library
const StudentLibrarySkeleton: React.FC = () => {
  return (
    <div id="student-library-skeleton" className="space-y-5 animate-pulse">
      {/* Top Filter Bar Skeleton */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {[100, 120, 110, 110, 130].map((w, idx) => (
              <div
                key={idx}
                className="h-8 rounded-lg bg-stone-200/70"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-28 bg-stone-200/70 rounded-md" />
            <div className="h-7 w-16 bg-stone-200/70 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Subject Section Skeletons (2 Mock Subjects) */}
      {[1, 2].map(sectionIdx => (
        <div
          key={sectionIdx}
          className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs space-y-0"
        >
          {/* Header Skeleton */}
          <div className="px-5 py-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-48 sm:w-64 bg-stone-200 rounded" />
                <div className="h-3 w-32 bg-stone-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-stone-200 rounded" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map(cardIdx => (
              <div
                key={cardIdx}
                className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-stone-200 rounded-md" />
                    <div className="h-4 w-4 bg-stone-200 rounded" />
                  </div>
                  <div className="h-4 w-full bg-stone-200 rounded" />
                  <div className="h-3.5 w-3/4 bg-stone-100 rounded" />
                  <div className="h-3 w-1/2 bg-stone-100 rounded" />
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="h-4 w-12 bg-stone-100 rounded" />
                  <div className="h-6 w-16 bg-stone-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Branded Empty State Component
const BrandedEmptyState: React.FC<{
  searchQuery: string;
  selectedCategory: string;
  selectedGroup: string;
  selectedCourse: CourseName;
  onResetFilters: () => void;
  onRefresh?: () => void;
}> = ({
  searchQuery,
  selectedCategory,
  selectedGroup,
  selectedCourse,
  onResetFilters,
  onRefresh
}) => {
  return (
    <div
      id="student-library-empty-state"
      className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs max-w-2xl mx-auto space-y-6"
    >
      {/* Branded Vector Illustration */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        {/* Ambient Ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-stone-900 to-stone-800 flex items-center justify-center text-white shadow-md relative z-10">
          <BookOpen className="w-9 h-9 text-emerald-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-xs border border-stone-200 z-20">
          <SearchX className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
          No ICAI Materials Found
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          {searchQuery ? (
            <>
              No BoS resources match <span className="font-semibold text-stone-800">"{searchQuery}"</span> under <span className="font-semibold text-stone-800">CA {selectedCourse}</span>.
            </>
          ) : (
            <>
              No educational materials are currently cataloged for the selected category (<span className="font-semibold text-stone-800">{selectedCategory}</span>).
            </>
          )}
        </p>
      </div>

      {/* Suggested Filter Resets */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>

        {onRefresh && (
          <button
            id="btn-sync-empty-state"
            onClick={onRefresh}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors border border-stone-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span>Sync BoS Portal</span>
          </button>
        )}
      </div>

      {/* Help info pill */}
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[11px] text-stone-500">
        <Sparkles className="w-3 h-3 text-emerald-600" />
        <span>Tip: Try searching for "Accounting", "Taxation", "RTP", or "Module 1"</span>
      </div>
    </div>
  );
};

export const StudentLibrary: React.FC<StudentLibraryProps> = ({
  materials,
  selectedCourse,
  setSelectedCourse,
  searchQuery,
  setSearchQuery,
  onSelectMaterial,
  onNavigateToUpdates,
  studiedMap,
  onToggleStudied,
  isLoading = false,
  onRefresh
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'Group I' | 'Group II'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [collapsedSubjects, setCollapsedSubjects] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSubjectCollapse = (subjectName: string) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  const handleResetFilters = () => {
    if (setSearchQuery) setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedGroup('ALL');
  };

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      // Course filter
      if (selectedCourse && m.course !== selectedCourse) return false;

      // Group filter
      if (selectedGroup !== 'ALL') {
        if (m.group_name !== selectedGroup && m.group_name !== 'All Groups' && m.group_name !== 'N/A') {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'Study Material') {
          if (!m.material_type.includes('Study Material') && !m.material_type.includes('Module')) return false;
        } else if (selectedCategory === 'RTP') {
          if (!m.material_type.includes('Revision Test') && !m.material_type.includes('RTP')) return false;
        } else if (selectedCategory === 'MTP') {
          if (!m.material_type.includes('Mock Test') && !m.material_type.includes('MTP')) return false;
        } else if (selectedCategory === 'Suggested Answers') {
          if (!m.material_type.includes('Suggested') && !m.material_type.includes('Answers')) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSubject = m.subject.toLowerCase().includes(q);
        const matchesType = m.material_type.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesType) return false;
      }

      return true;
    });
  }, [materials, selectedCourse, selectedGroup, selectedCategory, searchQuery]);

  // Group materials by Subject / Paper
  const subjectsMap = useMemo(() => {
    const map = new Map<string, { groupName: string; items: MaterialRecord[] }>();
    filteredMaterials.forEach(m => {
      const subject = m.subject || 'General Educational Material';
      if (!map.has(subject)) {
        map.set(subject, { groupName: m.group_name, items: [] });
      }
      map.get(subject)!.items.push(m);
    });
    return map;
  }, [filteredMaterials]);

  // Export study plan
  const handleExportPlan = () => {
    const lines: string[] = [
      `# CA ${selectedCourse} Study Plan & Official Resources`,
      `Generated: ${new Date().toLocaleDateString()} | Syllabus: ICAI New Scheme (2024-2025)\n`
    ];

    subjectsMap.forEach((data, subjectName) => {
      lines.push(`\n## ${subjectName} (${data.groupName !== 'N/A' ? data.groupName : 'Core Paper'})`);
      data.items.forEach(item => {
        const check = studiedMap[item.id] ? '[x]' : '[ ]';
        lines.push(`- ${check} ${item.title} (${item.material_type})`);
        lines.push(`  URL: ${item.url}`);
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CA_${selectedCourse}_Study_Plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'Study Material', label: 'Study Modules' },
    { id: 'RTP', label: 'RTP (Revision)' },
    { id: 'MTP', label: 'MTP (Mock Tests)' },
    { id: 'Suggested Answers', label: 'Suggested Answers' }
  ];

  // If loading skeleton state requested
  if (isLoading && materials.length === 0) {
    return <StudentLibrarySkeleton />;
  }

  return (
    <div className="space-y-5">
      {/* Category Chips & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Group Filter (For Inter / Final) & Export */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            {(selectedCourse === 'Intermediate' || selectedCourse === 'Final') && (
              <div className="flex items-center space-x-1">
                {(['ALL', 'Group I', 'Group II'] as const).map(group => (
                  <button
                    key={group}
                    id={`group-filter-${group.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-all ${
                      selectedGroup === group
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {group === 'ALL' ? 'All' : group.replace('Group ', 'Gr ')}
                  </button>
                ))}
              </div>
            )}

            <button
              id="btn-export-plan"
              onClick={handleExportPlan}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-200 text-xs font-semibold transition-colors"
              title="Download your checklist"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Material Grid by Subject or Branded Empty State */}
      {subjectsMap.size === 0 ? (
        <BrandedEmptyState
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedGroup={selectedGroup}
          selectedCourse={selectedCourse}
          onResetFilters={handleResetFilters}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="space-y-5">
          {Array.from(subjectsMap.entries()).map(([subjectName, data]) => {
            const isCollapsed = collapsedSubjects[subjectName];
            const completedCount = data.items.filter(m => studiedMap[m.id]).length;
            const isAllDone = data.items.length > 0 && completedCount === data.items.length;

            return (
              <div
                key={subjectName}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs transition-all hover:border-stone-300"
              >
                {/* Paper Header */}
                <div
                  onClick={() => toggleSubjectCollapse(subjectName)}
                  className="px-4 sm:px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between cursor-pointer select-none hover:bg-stone-100/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {subjectName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm sm:text-base font-bold text-stone-900">
                          {subjectName}
                        </h3>
                        {data.groupName !== 'N/A' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                            {data.groupName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {data.items.length} official materials • May 2025/2026 scheme
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-stone-500 hidden sm:inline font-medium">
                      {completedCount}/{data.items.length} studied
                    </span>
                    {isAllDone && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Done
                      </span>
                    )}
                    <button className="text-stone-400 p-1">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Paper Materials Grid */}
                {!isCollapsed && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {data.items.map(m => {
                      const isStudied = !!studiedMap[m.id];
                      const isUpdated = m.status === 'URL_CHANGED' || m.status === 'CONTENT_CHANGED';

                      let badgeColor = 'bg-stone-100 text-stone-700';
                      if (m.material_type.includes('RTP')) badgeColor = 'bg-purple-50 text-purple-700 border border-purple-200';
                      if (m.material_type.includes('MTP')) badgeColor = 'bg-amber-50 text-amber-700 border border-amber-200';
                      if (m.material_type.includes('Suggested')) badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                      if (m.material_type.includes('Study Material') || m.material_type.includes('Module')) {
                        badgeColor = 'bg-blue-50 text-blue-700 border border-blue-200';
                      }

                      return (
                        <div
                          key={m.id}
                          onClick={() => onSelectMaterial(m)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative ${
                            isStudied
                              ? 'bg-emerald-50/30 border-emerald-200'
                              : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div>
                            {/* Card Top: Type Pill & Checkbox */}
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
                                {m.material_type || 'Study Module'}
                              </span>

                              <div className="flex items-center space-x-1">
                                {isUpdated && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                    Updated
                                  </span>
                                )}
                                <button
                                  onClick={e => onToggleStudied(m.id, e)}
                                  className={`p-1 rounded-md transition-colors ${
                                    isStudied
                                      ? 'text-emerald-700 bg-emerald-100'
                                      : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                                  }`}
                                  title={isStudied ? 'Mark unstudied' : 'Mark completed'}
                                >
                                  {isStudied ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-xs font-bold text-stone-900 group-hover:text-stone-800 leading-snug line-clamp-2">
                              {m.title}
                            </h4>

                            {/* Edition subtitle */}
                            <p className="text-[10px] text-stone-400 mt-1">
                              Edition: {m.edition || '2024-2025'} • {m.language || 'English'}
                            </p>
                          </div>

                          {/* Card Footer: Action Links */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                            <button
                              onClick={e => handleCopyLink(m.url, m.id, e)}
                              className="text-[11px] text-stone-400 hover:text-stone-700 inline-flex items-center space-x-1"
                              title="Copy URL"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Share2 className="w-3 h-3" />
                              )}
                              <span>{copiedId === m.id ? 'Copied' : 'Share'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMaterial(m);
                              }}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                              title="Read study guide, outline and practice Q&A"
                            >
                              <BookOpen className="w-3 h-3 text-emerald-400" />
                              <span>Study Guide</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
