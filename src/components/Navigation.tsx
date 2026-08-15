import React from 'react';
import {
  GraduationCap, BookOpen, RefreshCw, Wrench, HelpCircle,
  ShieldCheck, ChevronRight, FolderTree
} from 'lucide-react';
import { CourseName, ScraperStats } from '../types.js';

interface NavigationProps {
  activeView: 'hierarchy' | 'library' | 'updates' | 'diagnostics';
  setActiveView: (view: 'hierarchy' | 'library' | 'updates' | 'diagnostics') => void;
  selectedCourse: CourseName;
  setSelectedCourse: (course: CourseName) => void;
  updatedCount: number;
  stats: ScraperStats | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHelp: () => void;
  onOpenPolicy: () => void;
  studiedCount: number;
  totalMaterials: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  setActiveView,
  selectedCourse,
  setSelectedCourse,
  updatedCount,
  stats,
  onRefresh,
  isRefreshing,
  onOpenHelp,
  onOpenPolicy,
  studiedCount,
  totalMaterials
}) => {
  const progressPct = totalMaterials > 0 ? Math.round((studiedCount / totalMaterials) * 100) : 0;

  return (
    <>
      {/* 1. DESKTOP VERTICAL SIDEBAR (Fixed on screens >= 768px: md:) */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 z-30 select-none shadow-2xs"
      >
        {/* Brand & Scheme Header */}
        <div className="p-4 lg:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-800 flex items-center justify-center text-white shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-sm text-stone-900 dark:text-stone-100 tracking-tight truncate">ICAI Study Hub</h1>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900 inline-block mt-0.5">
              New Scheme (2024-25)
            </span>
          </div>
        </div>

        {/* Course Switcher in Sidebar */}
        <div className="p-3.5 lg:p-4 border-b border-stone-100 dark:border-stone-800 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Select Course Level
          </label>
          <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            {(['Foundation', 'Intermediate', 'Final'] as CourseName[]).map(course => (
              <button
                key={course}
                id={`sidebar-course-${course.toLowerCase()}`}
                onClick={() => setSelectedCourse(course)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  selectedCourse === course
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {course === 'Intermediate' ? 'Inter' : course}
              </button>
            ))}
          </div>
        </div>

        {/* Primary View Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 mb-2">
            Main Portal
          </div>

          <button
            id="sidebar-nav-hierarchy"
            onClick={() => setActiveView('hierarchy')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'hierarchy'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FolderTree className={`w-4 h-4 ${activeView === 'hierarchy' ? 'text-blue-300' : 'text-blue-600'}`} />
              <span>BoS Hierarchy Tree</span>
            </div>
            {activeView === 'hierarchy' && <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          <button
            id="sidebar-nav-library"
            onClick={() => setActiveView('library')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'library'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className={`w-4 h-4 ${activeView === 'library' ? 'text-emerald-400' : 'text-stone-500'}`} />
              <span>Study Library</span>
            </div>
            {activeView === 'library' && <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          <button
            id="sidebar-nav-updates"
            onClick={() => setActiveView('updates')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'updates'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <RefreshCw className={`w-4 h-4 ${activeView === 'updates' ? 'text-blue-300' : 'text-stone-500'}`} />
              <span>Material Updates</span>
            </div>
            {updatedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeView === 'updates' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {updatedCount}
              </span>
            )}
          </button>

          <button
            id="sidebar-nav-diagnostics"
            onClick={() => setActiveView('diagnostics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'diagnostics'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Wrench className={`w-4 h-4 ${activeView === 'diagnostics' ? 'text-stone-300' : 'text-stone-400'}`} />
              <span>Scraper Console</span>
            </div>
            {activeView === 'diagnostics' && <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {/* Quick Help & Policy */}
          <div className="pt-4 mt-4 border-t border-stone-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 mb-2">
              Help &amp; Governance
            </div>

            <button
              id="sidebar-btn-help"
              onClick={onOpenHelp}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <span>Status Guide &amp; FAQ</span>
            </button>

            <button
              id="sidebar-btn-policy"
              onClick={onOpenPolicy}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors text-left"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ICAI Access Policy (§31)</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Study Progress & Sync */}
        <div className="p-3.5 lg:p-4 border-t border-stone-200 bg-stone-50/70 space-y-3">
          {/* Progress widget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-600">
              <span>{selectedCourse} Progress</span>
              <span className="font-bold text-stone-900">{progressPct}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-400">
              {studiedCount} of {totalMaterials} modules completed
            </div>
          </div>

          {/* 1-Click Sync Button */}
          <button
            id="sidebar-btn-sync"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync BoS Portal'}</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM HORIZONTAL NAVIGATION BAR (Fixed at bottom for mobile screens < 768px: block md:hidden) */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Mobile Navigation"
        className="block md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 pb-[max(env(safe-area-inset-bottom),0.35rem)] shadow-lg"
      >
        <div className="grid grid-cols-4 items-center h-14 max-w-md mx-auto px-2">
          {/* 1. Library */}
          <button
            id="mobile-nav-library"
            onClick={() => setActiveView('library')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
              activeView === 'library' ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeView === 'library' ? 'bg-emerald-50' : ''}`}>
              <BookOpen className={`w-4 h-4 ${activeView === 'library' ? 'text-emerald-600' : 'text-stone-400'}`} />
            </div>
            <span className="text-[10px] font-medium leading-none mt-0.5">Library</span>
          </button>

          {/* 2. Updates */}
          <button
            id="mobile-nav-updates"
            onClick={() => setActiveView('updates')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors relative ${
              activeView === 'updates' ? 'text-blue-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeView === 'updates' ? 'bg-blue-50' : ''}`}>
              <RefreshCw className={`w-4 h-4 ${activeView === 'updates' ? 'text-blue-600' : 'text-stone-400'}`} />
            </div>
            <span className="text-[10px] font-medium leading-none mt-0.5">Updates</span>
            {updatedCount > 0 && (
              <span className="absolute top-1 right-2.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {updatedCount}
              </span>
            )}
          </button>

          {/* 3. Sync Action */}
          <button
            id="mobile-nav-sync"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <div className={`p-1 rounded-lg ${isRefreshing ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-[10px] font-medium leading-none mt-0.5">{isRefreshing ? 'Syncing' : 'Sync'}</span>
          </button>

          {/* 4. Diagnostics / Console */}
          <button
            id="mobile-nav-diagnostics"
            onClick={() => setActiveView('diagnostics')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
              activeView === 'diagnostics' ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeView === 'diagnostics' ? 'bg-stone-100' : ''}`}>
              <Wrench className={`w-4 h-4 ${activeView === 'diagnostics' ? 'text-stone-900' : 'text-stone-400'}`} />
            </div>
            <span className="text-[10px] font-medium leading-none mt-0.5">Console</span>
          </button>
        </div>
      </nav>
    </>
  );
};
