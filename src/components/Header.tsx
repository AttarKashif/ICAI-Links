import React from 'react';
import { Search, HelpCircle, GraduationCap, RefreshCw } from 'lucide-react';
import { CourseName } from '../types.js';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenHelp: () => void;
  selectedCourse: CourseName;
  setSelectedCourse: (course: CourseName) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenHelp,
  selectedCourse,
  setSelectedCourse,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Mobile brand indicator (visible only on mobile < 768px) */}
          <div className="flex items-center space-x-2 md:hidden shrink-0">
            <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white shadow-2xs">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-xs text-stone-900 tracking-tight">ICAI BoS</span>
          </div>

          {/* Mobile Course Picker (hidden on desktop where it's in the vertical sidebar) */}
          <div className="flex items-center space-x-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg md:hidden shrink-0">
            {(['Foundation', 'Intermediate', 'Final'] as CourseName[]).map(c => (
              <button
                key={c}
                id={`mobile-course-${c.toLowerCase()}`}
                onClick={() => setSelectedCourse(c)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  selectedCourse === c ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {c === 'Intermediate' ? 'Inter' : c}
              </button>
            ))}
          </div>

          {/* Real-Time Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search papers, modules, RTPs, MTPs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white rounded-xl text-xs text-stone-900 border border-transparent focus:border-stone-300 focus:outline-none transition-all placeholder:text-stone-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop / Mobile Actions */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {onRefresh && (
              <button
                id="btn-header-sync"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                title="Sync with ICAI portal"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}

            <button
              id="btn-header-help"
              onClick={onOpenHelp}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              title="Help & Labels"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
