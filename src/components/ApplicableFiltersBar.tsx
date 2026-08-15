import React, { useState } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  GraduationCap, 
  BookmarkCheck, 
  BookOpenCheck, 
  FileQuestion, 
  Tag, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Layers,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { ResourceCategory, CourseName, GroupName } from '../types.js';

export interface ApplicableFiltersState {
  category: ResourceCategory;
  course: string;
  group: string;
  paperNumber: string; // 'ALL' or number as string
  examCycle: string;
  mtpSeries: string;
  mtpType: 'ALL' | 'QUESTION_PAPER' | 'SUGGESTED_ANSWERS';
  fileSizeRange: 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
  amendmentsOnly: boolean;
  searchQuery: string;
  sortBy: 'DEFAULT' | 'PAPER_ASC' | 'PAPER_DESC' | 'SIZE_DESC' | 'SIZE_ASC' | 'TITLE_AZ';
}

export interface ApplicableFiltersBarProps {
  filters: ApplicableFiltersState;
  onFilterChange: (updater: (prev: ApplicableFiltersState) => ApplicableFiltersState) => void;
  onResetFilters: () => void;
  totalResourcesCount: number;
  matchingResourcesCount: number;
  availablePapers: { number: number; name: string; course: string; group?: string }[];
  availableExamCycles: string[];
}

export const defaultFiltersState: ApplicableFiltersState = {
  category: 'ALL',
  course: 'ALL',
  group: 'ALL',
  paperNumber: 'ALL',
  examCycle: 'ALL',
  mtpSeries: 'ALL',
  mtpType: 'ALL',
  fileSizeRange: 'ALL',
  amendmentsOnly: false,
  searchQuery: '',
  sortBy: 'DEFAULT',
};

export const ApplicableFiltersBar: React.FC<ApplicableFiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResourcesCount,
  matchingResourcesCount,
  availablePapers,
  availableExamCycles
}) => {
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState<boolean>(false);

  // Compute active filters list for visual chips
  const activeFilterChips = React.useMemo(() => {
    const chips: { id: string; label: string; key: keyof ApplicableFiltersState; resetValue: any }[] = [];

    if (filters.category !== 'ALL') {
      const labels: Record<string, string> = {
        STUDY_MATERIAL: 'Study Material',
        RTP: 'Revision Test Papers (RTP)',
        MTP: 'Mock Test Papers (MTP)'
      };
      chips.push({
        id: 'category',
        label: `Category: ${labels[filters.category] || filters.category}`,
        key: 'category',
        resetValue: 'ALL'
      });
    }

    if (filters.course !== 'ALL') {
      chips.push({
        id: 'course',
        label: `Course: CA ${filters.course}`,
        key: 'course',
        resetValue: 'ALL'
      });
    }

    if (filters.group !== 'ALL') {
      chips.push({
        id: 'group',
        label: `Group: ${filters.group}`,
        key: 'group',
        resetValue: 'ALL'
      });
    }

    if (filters.paperNumber !== 'ALL') {
      const pNum = Number(filters.paperNumber);
      const matchP = availablePapers.find(p => p.number === pNum);
      chips.push({
        id: 'paperNumber',
        label: matchP ? `Paper ${matchP.number}: ${matchP.name}` : `Paper ${filters.paperNumber}`,
        key: 'paperNumber',
        resetValue: 'ALL'
      });
    }

    if (filters.examCycle !== 'ALL') {
      chips.push({
        id: 'examCycle',
        label: `Exam: ${filters.examCycle}`,
        key: 'examCycle',
        resetValue: 'ALL'
      });
    }

    if (filters.mtpSeries !== 'ALL') {
      chips.push({
        id: 'mtpSeries',
        label: `Series: ${filters.mtpSeries}`,
        key: 'mtpSeries',
        resetValue: 'ALL'
      });
    }

    if (filters.mtpType !== 'ALL') {
      chips.push({
        id: 'mtpType',
        label: `Format: ${filters.mtpType === 'QUESTION_PAPER' ? 'Question Papers' : 'Suggested Answers'}`,
        key: 'mtpType',
        resetValue: 'ALL'
      });
    }

    if (filters.fileSizeRange !== 'ALL') {
      const sizeLabels = {
        SMALL: '< 2 MB (Compact)',
        MEDIUM: '2 - 5 MB (Standard)',
        LARGE: '> 5 MB (Comprehensive)'
      };
      chips.push({
        id: 'fileSizeRange',
        label: `Size: ${sizeLabels[filters.fileSizeRange]}`,
        key: 'fileSizeRange',
        resetValue: 'ALL'
      });
    }

    if (filters.amendmentsOnly) {
      chips.push({
        id: 'amendmentsOnly',
        label: `⚡ With Statutory Amendments`,
        key: 'amendmentsOnly',
        resetValue: false
      });
    }

    if (filters.searchQuery.trim()) {
      chips.push({
        id: 'searchQuery',
        label: `Search: "${filters.searchQuery}"`,
        key: 'searchQuery',
        resetValue: ''
      });
    }

    if (filters.sortBy !== 'DEFAULT') {
      const sortLabels: Record<string, string> = {
        PAPER_ASC: 'Sort: Paper 1 → 6',
        PAPER_DESC: 'Sort: Paper 6 → 1',
        SIZE_DESC: 'Sort: Largest File First',
        SIZE_ASC: 'Sort: Smallest File First',
        TITLE_AZ: 'Sort: Title A-Z'
      };
      chips.push({
        id: 'sortBy',
        label: sortLabels[filters.sortBy] || 'Custom Sort',
        key: 'sortBy',
        resetValue: 'DEFAULT'
      });
    }

    return chips;
  }, [filters, availablePapers]);

  // Handler to clear a single chip
  const removeChip = (key: keyof ApplicableFiltersState, resetValue: any) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: resetValue,
      ...(key === 'course' ? { group: 'ALL', paperNumber: 'ALL' } : {}),
      ...(key === 'group' ? { paperNumber: 'ALL' } : {})
    }));
  };

  // Quick Preset Handlers
  const applyPreset = (presetType: 'MAY_2026' | 'MTP_ONLY' | 'AMENDMENTS' | 'SM_ONLY' | 'GROUP_I' | 'GROUP_II') => {
    onFilterChange(prev => {
      switch (presetType) {
        case 'MAY_2026':
          return {
            ...prev,
            examCycle: 'May 2026',
            paperNumber: 'ALL',
            searchQuery: ''
          };
        case 'MTP_ONLY':
          return {
            ...prev,
            category: 'MTP',
            paperNumber: 'ALL',
            mtpSeries: 'ALL',
            mtpType: 'ALL'
          };
        case 'AMENDMENTS':
          return {
            ...prev,
            category: 'RTP',
            amendmentsOnly: true
          };
        case 'SM_ONLY':
          return {
            ...prev,
            category: 'STUDY_MATERIAL',
            amendmentsOnly: false
          };
        case 'GROUP_I':
          return {
            ...prev,
            group: 'Group I',
            paperNumber: 'ALL'
          };
        case 'GROUP_II':
          return {
            ...prev,
            group: 'Group II',
            paperNumber: 'ALL'
          };
        default:
          return prev;
      }
    });
  };

  // Filtered papers dropdown list based on current course and group selection
  const selectablePapers = React.useMemo(() => {
    return availablePapers.filter(p => {
      if (filters.course !== 'ALL' && p.course.toLowerCase() !== filters.course.toLowerCase()) return false;
      if (filters.group !== 'ALL' && p.group && p.group.toLowerCase() !== filters.group.toLowerCase()) return false;
      return true;
    });
  }, [availablePapers, filters.course, filters.group]);

  const percentageMatching = totalResourcesCount > 0 
    ? Math.round((matchingResourcesCount / totalResourcesCount) * 100) 
    : 100;

  return (
    <div id="applicable-filters-panel" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden space-y-0 transition-colors duration-200">
      {/* Top Main Applicable Filters Bar */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header & Quick Preset Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Applicable Filters & Presets
                </h3>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  {matchingResourcesCount} matching ({percentageMatching}%)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Filter by Course, Group, Subject, Exam Cycle, MTP Series, or Amendments
              </p>
            </div>
          </div>

          {/* Quick Filter Presets Strip */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Presets:
            </span>
            <button
              id="preset-btn-may2026"
              onClick={() => applyPreset('MAY_2026')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filters.examCycle === 'May 2026'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
              title="Filter by May 2026 Exam Cycle"
            >
              <span>🔥 May 2026 Pack</span>
            </button>

            <button
              id="preset-btn-mtp"
              onClick={() => applyPreset('MTP_ONLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filters.category === 'MTP'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
              title="Show Mock Test Papers (QP & Answers)"
            >
              <span>📝 MTP Tests</span>
            </button>

            <button
              id="preset-btn-amendments"
              onClick={() => applyPreset('AMENDMENTS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filters.amendmentsOnly
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
              title="Show RTPs with Statutory Amendments"
            >
              <span>⚡ Amendments</span>
            </button>

            <button
              id="preset-btn-sm"
              onClick={() => applyPreset('SM_ONLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filters.category === 'STUDY_MATERIAL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
              title="Show Study Material Chapters"
            >
              <span>📘 Study Material</span>
            </button>

            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setIsAdvancedExpanded(prev => !prev)}
              className="px-2.5 py-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition flex items-center gap-1"
            >
              <span>{isAdvancedExpanded ? 'Less Filters' : 'More Filters'}</span>
              {isAdvancedExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary Filter Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Resource Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-stone-400" />
              Resource Type
            </label>
            <select
              id="filter-select-category"
              value={filters.category}
              onChange={e => onFilterChange(prev => ({ ...prev, category: e.target.value as ResourceCategory }))}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Resource Types</option>
              <option value="STUDY_MATERIAL">Study Material (SM Chapters)</option>
              <option value="RTP">Revision Test Papers (RTP)</option>
              <option value="MTP">Mock Test Papers (MTP Series I & II)</option>
            </select>
          </div>

          {/* 2. Course Level Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-stone-400" />
              Course
            </label>
            <select
              id="filter-select-course"
              value={filters.course}
              onChange={e => onFilterChange(prev => ({ 
                ...prev, 
                course: e.target.value,
                group: 'ALL',
                paperNumber: 'ALL'
              }))}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All CA Courses</option>
              <option value="Foundation">CA Foundation</option>
              <option value="Intermediate">CA Intermediate</option>
              <option value="Final">CA Final</option>
            </select>
          </div>

          {/* 3. Group Filter (Contextual) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
              <Layers className="w-3 h-3 text-stone-400" />
              Group Level
            </label>
            <select
              id="filter-select-group"
              value={filters.group}
              disabled={filters.course === 'Foundation'}
              onChange={e => onFilterChange(prev => ({ 
                ...prev, 
                group: e.target.value,
                paperNumber: 'ALL'
              }))}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Groups</option>
              <option value="Group I">Group I (Papers 1, 2, 3)</option>
              <option value="Group II">Group II (Papers 4, 5, 6)</option>
            </select>
          </div>

          {/* 4. Subject / Paper Direct Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3 text-stone-400" />
              Subject / Paper
            </label>
            <select
              id="filter-select-paper"
              value={filters.paperNumber}
              onChange={e => onFilterChange(prev => ({ ...prev, paperNumber: e.target.value }))}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="ALL">All Subjects & Papers</option>
              {selectablePapers.map(p => (
                <option key={`${p.course}-${p.number}`} value={p.number}>
                  {p.course} P{p.number}: {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary / Advanced Filters Drawer */}
        {isAdvancedExpanded && (
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
            {/* Exam Attempt / Cycle */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                Exam Cycle
              </label>
              <select
                id="filter-select-exam-cycle"
                value={filters.examCycle}
                onChange={e => onFilterChange(prev => ({ ...prev, examCycle: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Exam Cycles</option>
                {availableExamCycles.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* MTP Series & Format */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
                <FileQuestion className="w-3 h-3 text-stone-400" />
                MTP Series / Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  id="filter-select-mtp-series"
                  value={filters.mtpSeries}
                  onChange={e => onFilterChange(prev => ({ ...prev, mtpSeries: e.target.value }))}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Series</option>
                  <option value="Series I">Series I</option>
                  <option value="Series II">Series II</option>
                </select>

                <select
                  id="filter-select-mtp-type"
                  value={filters.mtpType}
                  onChange={e => onFilterChange(prev => ({ ...prev, mtpType: e.target.value as any }))}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">QP + Answers</option>
                  <option value="QUESTION_PAPER">QP Only</option>
                  <option value="SUGGESTED_ANSWERS">ANS Only</option>
                </select>
              </div>
            </div>

            {/* File Size Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-stone-400" />
                File Size
              </label>
              <select
                id="filter-select-file-size"
                value={filters.fileSizeRange}
                onChange={e => onFilterChange(prev => ({ ...prev, fileSizeRange: e.target.value as any }))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All PDF Sizes</option>
                <option value="SMALL">Compact (&lt; 2 MB)</option>
                <option value="MEDIUM">Standard (2 - 5 MB)</option>
                <option value="LARGE">Comprehensive (&gt; 5 MB)</option>
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-stone-400" />
                Sort Order
              </label>
              <select
                id="filter-select-sort"
                value={filters.sortBy}
                onChange={e => onFilterChange(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DEFAULT">Default Syllabus Order</option>
                <option value="PAPER_ASC">Paper Number (1 → 6)</option>
                <option value="PAPER_DESC">Paper Number (6 → 1)</option>
                <option value="SIZE_DESC">File Size (Largest First)</option>
                <option value="SIZE_ASC">File Size (Smallest First)</option>
                <option value="TITLE_AZ">Title Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Applied Filters Strip */}
      {activeFilterChips.length > 0 && (
        <div className="bg-stone-50 dark:bg-stone-800/80 px-4 sm:px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Applied Filters ({activeFilterChips.length}):
            </span>

            {activeFilterChips.map(chip => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 shadow-2xs animate-in fade-in duration-150"
              >
                <span>{chip.label}</span>
                <button
                  id={`remove-filter-${chip.id}`}
                  onClick={() => removeChip(chip.key, chip.resetValue)}
                  className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded transition"
                  title="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <button
            id="btn-clear-all-filters"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900 px-3 py-1 rounded-lg transition shrink-0 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}
    </div>
  );
};
