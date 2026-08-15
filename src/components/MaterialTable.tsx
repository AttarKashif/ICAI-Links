import React, { useState, useMemo } from 'react';
import {
  Search, ExternalLink, Copy, Check, Filter, History, FileText,
  ShieldCheck, AlertCircle, Hash, ChevronRight, Layers, Sparkles, X,
  SearchX, RotateCcw, RefreshCw
} from 'lucide-react';
import { MaterialRecord, CourseName, MaterialStatus } from '../types.js';

interface MaterialTableProps {
  materials: MaterialRecord[];
  onSelectMaterial: (material: MaterialRecord) => void;
  onRevalidateMaterial?: (materialId: string) => Promise<void>;
  isLoading: boolean;
}

export const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  onSelectMaterial,
  onRevalidateMaterial,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleRevalidate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRevalidateMaterial) return;
    setValidatingId(id);
    try {
      await onRevalidateMaterial(id);
    } finally {
      setValidatingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCourseFilter('ALL');
    setGroupFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  // Course counts
  const courseCounts = useMemo(() => {
    const counts = { Foundation: 0, Intermediate: 0, Final: 0 };
    materials.forEach(m => {
      if (m.course === 'Foundation') counts.Foundation++;
      if (m.course === 'Intermediate') counts.Intermediate++;
      if (m.course === 'Final') counts.Final++;
    });
    return counts;
  }, [materials]);

  // Derive filter lists
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => { if (m.material_type) set.add(m.material_type); });
    return Array.from(set);
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      if (courseFilter !== 'ALL' && m.course.toLowerCase() !== courseFilter.toLowerCase()) return false;
      if (groupFilter !== 'ALL' && m.group_name.toLowerCase() !== groupFilter.toLowerCase()) return false;
      if (typeFilter !== 'ALL' && m.material_type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (statusFilter !== 'ALL' && m.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSubj = m.subject.toLowerCase().includes(q);
        const matchesUrl = m.url.toLowerCase().includes(q);
        const matchesHash = m.content_hash && m.content_hash.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubj && !matchesUrl && !matchesHash) return false;
      }

      return true;
    });
  }, [materials, courseFilter, groupFilter, typeFilter, statusFilter, searchTerm]);

  const getStatusBadge = (status: MaterialStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'URL_CHANGED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            URL Changed
          </span>
        );
      case 'CONTENT_CHANGED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Content Changed
          </span>
        );
      case 'NOT_FOUND':
      case 'SERVER_ERROR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            {status === 'NOT_FOUND' ? 'Not Found (404)' : 'Error (500)'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="material-table-container" className="space-y-4">
      {/* Controls & Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, subject, URL, or hash..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white rounded-lg text-xs border border-stone-200 focus:border-stone-400 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Course Counts */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-stone-500 font-medium mr-1">Courses:</span>
            <button
              onClick={() => setCourseFilter('Foundation')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                courseFilter === 'Foundation' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              Found: {courseCounts.Foundation}
            </button>
            <button
              onClick={() => setCourseFilter('Intermediate')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                courseFilter === 'Intermediate' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              Inter: {courseCounts.Intermediate}
            </button>
            <button
              onClick={() => setCourseFilter('Final')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                courseFilter === 'Final' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              Final: {courseCounts.Final}
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500 font-medium">Filters:</span>
          </div>

          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Courses</option>
            <option value="Foundation">Foundation</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Final">Final</option>
          </select>

          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Groups</option>
            <option value="Group I">Group I</option>
            <option value="Group II">Group II</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (200 OK)</option>
            <option value="URL_CHANGED">URL Changed</option>
            <option value="CONTENT_CHANGED">Content Changed</option>
            <option value="DEAD_LINK">Dead Link (404)</option>
          </select>

          {(courseFilter !== 'ALL' || groupFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-stone-500 hover:text-stone-900 underline ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-stone-800">Materials In Registry</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-stone-200 text-stone-700 rounded-full">
              {filteredMaterials.length}
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            ICAI BoS Database (§31 Compliant)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/90 text-stone-500 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Title &amp; Subject</th>
                <th className="py-2.5 px-3">Type &amp; Edition</th>
                <th className="py-2.5 px-3">URL &amp; Checksum</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {isLoading && materials.length === 0 ? (
                /* Skeleton Loading Rows */
                [1, 2, 3, 4, 5, 6].map(skeletonIdx => (
                  <tr key={skeletonIdx} className="animate-pulse">
                    <td className="py-3 px-3">
                      <div className="h-4 w-48 bg-stone-200 rounded mb-1" />
                      <div className="h-3 w-28 bg-stone-100 rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-24 bg-stone-200 rounded mb-1" />
                      <div className="h-3 w-16 bg-stone-100 rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-40 bg-stone-200 rounded mb-1" />
                      <div className="h-3 w-24 bg-stone-100 rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-12 bg-stone-200 rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-5 w-16 bg-stone-200 rounded" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-6 w-20 bg-stone-200 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredMaterials.length === 0 ? (
                /* Branded Empty State Row */
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                        <SearchX className="w-8 h-8 text-stone-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-stone-900">No Registry Records Found</h4>
                        <p className="text-xs text-stone-500">
                          {searchTerm ? `No materials matched query "${searchTerm}".` : 'No materials match the active course/type filters.'}
                        </p>
                      </div>
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMaterial(m)}
                    className="hover:bg-stone-50/80 cursor-pointer transition-colors"
                  >
                    {/* Title & Subject */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 line-clamp-1">{m.title}</div>
                      <div className="text-[11px] text-stone-500">
                        {m.course} {m.group_name !== 'N/A' ? `• ${m.group_name}` : ''} • {m.subject}
                      </div>
                    </td>

                    {/* Type & Edition */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-stone-800">{m.material_type}</div>
                      <div className="text-[11px] text-stone-500">Edition: {m.edition || '2024-25'}</div>
                    </td>

                    {/* URL & SHA-256 Hash */}
                    <td className="py-3 px-3 max-w-xs" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-stone-800 hover:text-stone-900 font-mono text-[11px] truncate max-w-[180px] hover:underline"
                          title={m.url}
                        >
                          {m.url}
                        </a>
                        <button
                          onClick={e => handleCopy(m.url, e)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
                          title="Copy URL"
                        >
                          {copiedUrl === m.url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {m.content_hash && (
                        <div className="flex items-center space-x-1 text-[10px] font-mono text-stone-400 mt-0.5">
                          <Hash className="w-2.5 h-2.5" />
                          <span>SHA: {m.content_hash.substring(0, 12)}...</span>
                        </div>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-stone-900 text-xs">
                          {Math.round((m.classification_confidence || 0.8) * 100)}%
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1 py-0.2 rounded border border-stone-200">
                          {m.classified_with_version || 'v1.2.0'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(m.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={e => handleRevalidate(m.id, e)}
                          disabled={validatingId === m.id}
                          className="inline-flex items-center text-[11px] font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded transition-colors"
                          title="Run live HTTP re-check and recalculate SHA-256 hash"
                        >
                          <ShieldCheck className={`w-3 h-3 mr-1 text-emerald-600 ${validatingId === m.id ? 'animate-spin' : ''}`} />
                          <span>{validatingId === m.id ? 'Verifying...' : 'Re-Check'}</span>
                        </button>
                        <button
                          onClick={() => onSelectMaterial(m)}
                          className="inline-flex items-center text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded transition-colors"
                        >
                          <span>History</span>
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
