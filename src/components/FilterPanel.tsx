import React from 'react';
import { 
  Filter, 
  Search, 
  BookOpen, 
  FileText, 
  FileQuestion, 
  Layers, 
  RotateCcw, 
  Calendar, 
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { ApplicableFiltersState } from './ApplicableFiltersBar.js';
import { ResourceCategory } from '../types.js';

export interface FilterPanelProps {
  filters: ApplicableFiltersState;
  onFilterChange: (updater: (prev: ApplicableFiltersState) => ApplicableFiltersState) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
  availableExamCycles: string[];
  isDarkMode?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
  availableExamCycles,
  isDarkMode
}) => {
  const categories: { id: ResourceCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'All Resources', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'STUDY_MATERIAL', label: 'Study Materials', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'RTP', label: 'RTPs', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'MTP', label: 'MTPs', icon: <FileQuestion className="w-3.5 h-3.5" /> }
  ];

  const courses = [
    { id: 'ALL', label: 'All Courses' },
    { id: 'Foundation', label: 'CA Foundation' },
    { id: 'Intermediate', label: 'CA Intermediate' },
    { id: 'Final', label: 'CA Final' }
  ];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-xs space-y-4 ${
      isDarkMode 
        ? 'bg-stone-900/90 border-stone-800 text-stone-100' 
        : 'bg-white border-stone-200/80 text-stone-900'
    }`}>
      {/* Top Bar: Search & Counts */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search chapters, papers, study materials, RTPs, or MTPs in real-time..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all outline-none ${
              isDarkMode 
                ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-blue-500' 
                : 'bg-stone-50/80 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-900'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded ${
                isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
              }`}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className={`text-xs font-medium px-3 py-2 rounded-xl border flex items-center gap-1.5 ${
            isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Showing <strong className="font-bold">{filteredCount}</strong> of {totalCount} resources</span>
          </div>

          <button
            onClick={onResetFilters}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' 
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Category Toggles */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => {
          const isActive = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange(prev => ({ ...prev, category: cat.id }))}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-stone-900 text-white shadow-xs'
                  : isDarkMode
                    ? 'bg-stone-800/60 text-stone-300 hover:bg-stone-800'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filters: Course & Attempt (Exam Cycle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
        {/* Course Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>CA Course Level</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {courses.map(c => {
              const isActive = filters.course === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onFilterChange(prev => ({ ...prev, course: c.id }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center truncate ${
                    isActive
                      ? isDarkMode ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-stone-900 text-white'
                      : isDarkMode ? 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {c.label.replace('CA ', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attempt / Exam Cycle Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Exam Attempt Name / Cycle</span>
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, examCycle: 'ALL' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                filters.examCycle === 'ALL'
                  ? isDarkMode ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'bg-stone-900 text-white'
                  : isDarkMode ? 'bg-stone-950 text-stone-300 border border-stone-800' : 'bg-stone-100 text-stone-700'
              }`}
            >
              All Attempts
            </button>
            {availableExamCycles.map(cycle => {
              const isActive = filters.examCycle.toLowerCase() === cycle.toLowerCase();
              return (
                <button
                  key={cycle}
                  onClick={() => onFilterChange(prev => ({ ...prev, examCycle: cycle }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? isDarkMode ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'bg-stone-900 text-white'
                      : isDarkMode ? 'bg-stone-950 text-stone-300 border border-stone-800' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {cycle}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
