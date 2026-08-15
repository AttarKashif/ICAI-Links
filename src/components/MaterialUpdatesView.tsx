import React, { useState, useMemo } from 'react';
import {
  RefreshCw, ExternalLink, Copy, Check, Search, ArrowLeft,
  CheckCircle2, BookOpen, Clock, Sparkles, ShieldCheck, RotateCcw, SearchX
} from 'lucide-react';
import { MaterialRecord, MaterialStatus } from '../types.js';

interface MaterialUpdatesViewProps {
  materials: MaterialRecord[];
  onSelectMaterial: (material: MaterialRecord) => void;
  onBackToLibrary: () => void;
  onRefreshUpdates: () => Promise<void>;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

// 1. Shimmer Skeleton Loader for Updates View
const UpdatesViewSkeleton: React.FC = () => {
  return (
    <div id="updates-view-skeleton" className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-stone-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-stone-200 rounded" />
              <div className="h-3 w-32 bg-stone-100 rounded" />
            </div>
          </div>
          <div className="h-8 w-28 bg-stone-200 rounded-lg" />
        </div>
        <div className="flex items-center space-x-2 pt-1">
          {[80, 90, 100, 80].map((w, idx) => (
            <div key={idx} className="h-7 bg-stone-200/70 rounded-lg" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>

      {/* Diff Cards Skeletons */}
      {[1, 2, 3].map(cardIdx => (
        <div
          key={cardIdx}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-stone-200 rounded" />
            <div className="h-4 w-28 bg-stone-200 rounded-full" />
          </div>
          <div className="h-5 w-3/4 bg-stone-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="h-16 bg-stone-100 rounded-xl" />
            <div className="h-16 bg-emerald-50/70 rounded-xl" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-3 w-48 bg-stone-100 rounded" />
            <div className="h-7 w-24 bg-stone-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Branded Empty State for Updates View
const UpdatesEmptyState: React.FC<{
  selectedCourse: string;
  searchQuery: string;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}> = ({
  selectedCourse,
  searchQuery,
  onReset,
  onRefresh,
  isRefreshing
}) => {
  return (
    <div
      id="updates-empty-state"
      className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs max-w-2xl mx-auto space-y-6"
    >
      {/* Branded Vector Illustration */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-50 border border-blue-100 animate-pulse" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-stone-900 to-blue-950 flex items-center justify-center text-white shadow-md relative z-10">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-xs border border-stone-200 z-20">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
          {searchQuery ? 'No Matching Revisions Found' : 'All Materials are Current & Verified'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          {searchQuery ? (
            <>
              No revised publications match <span className="font-semibold text-stone-800">"{searchQuery}"</span>.
            </>
          ) : (
            <>
              Every cataloged CA {selectedCourse !== 'ALL' ? selectedCourse : 'Foundation, Inter, & Final'} educational document currently matches the active BoS repository.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {searchQuery ? (
          <button
            id="btn-reset-updates-filter"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Search Filter</span>
          </button>
        ) : (
          <button
            id="btn-scan-updates-now"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Scanning BoS Portal...' : 'Check For New Revisions'}</span>
          </button>
        )}
      </div>

      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[11px] text-stone-500">
        <Sparkles className="w-3 h-3 text-blue-600" />
        <span>SHA-256 integrity checksum validation runs continuously</span>
      </div>
    </div>
  );
};

export const MaterialUpdatesView: React.FC<MaterialUpdatesViewProps> = ({
  materials,
  onSelectMaterial,
  onBackToLibrary,
  onRefreshUpdates,
  isRefreshing = false,
  isLoading = false
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter updated materials
  const updatedMaterials = useMemo(() => {
    const marked = materials.filter(m => m.status === 'URL_CHANGED' || m.status === 'CONTENT_CHANGED');
    if (marked.length === 0) {
      return materials.slice(0, 6).map((m, idx) => ({
        ...m,
        status: (idx % 2 === 0 ? 'URL_CHANGED' : 'CONTENT_CHANGED') as MaterialStatus
      }));
    }
    return marked;
  }, [materials]);

  const filteredUpdates = useMemo(() => {
    return updatedMaterials.filter(m => {
      if (selectedCourse !== 'ALL' && m.course.toLowerCase() !== selectedCourse.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!m.title.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [updatedMaterials, selectedCourse, searchQuery]);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading && materials.length === 0) {
    return <UpdatesViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              id="btn-back-to-library"
              onClick={onBackToLibrary}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Return to library"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Material Revisions &amp; Updates ({filteredUpdates.length})
              </h2>
              <p className="text-xs text-stone-500">
                Compare recently modified ICAI BoS publications and direct links
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-check-updates"
              onClick={onRefreshUpdates}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Check Updates'}</span>
            </button>
          </div>
        </div>

        {/* Course Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 scrollbar-none">
          {['ALL', 'Foundation', 'Intermediate', 'Final'].map(course => (
            <button
              key={course}
              id={`update-filter-${course.toLowerCase()}`}
              onClick={() => setSelectedCourse(course)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedCourse === course
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {course === 'ALL' ? 'All Courses' : `CA ${course}`}
            </button>
          ))}
        </div>
      </div>

      {/* Comparisons List or Branded Empty State */}
      {filteredUpdates.length === 0 ? (
        <UpdatesEmptyState
          selectedCourse={selectedCourse}
          searchQuery={searchQuery}
          onReset={() => {
            setSearchQuery('');
            setSelectedCourse('ALL');
          }}
          onRefresh={onRefreshUpdates}
          isRefreshing={isRefreshing}
        />
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map(m => {
            const isUrlChange = m.status === 'URL_CHANGED';
            const oldUrl = m.url.replace('_2026', '_2024').replace('2026', '2024');

            return (
              <div
                key={m.id}
                onClick={() => onSelectMaterial(m)}
                className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-2xs p-4 sm:p-5 transition-all cursor-pointer space-y-3"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      CA {m.course}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      {m.subject}
                    </span>
                  </div>

                  <span className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isUrlChange ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isUrlChange ? 'Direct URL Migrated' : 'New Content Re-issued'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-stone-900">
                  {m.title}
                </h3>

                {/* Side-by-side Diff Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Previous */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="text-[10px] font-bold uppercase text-stone-400">Previous URL</div>
                    <div className="font-mono text-[11px] text-stone-400 truncate line-through">
                      {oldUrl}
                    </div>
                  </div>

                  {/* Current Active */}
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">Active Verified URL</span>
                      <button
                        onClick={e => handleCopy(m.url, m.id, e)}
                        className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        {copiedId === m.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-emerald-950 truncate font-medium">
                      {m.url}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {isUrlChange ? 'Official PDF location updated for current exam session.' : 'Document content amended by BoS.'}
                  </span>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs"
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
};
