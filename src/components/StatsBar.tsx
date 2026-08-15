import React from 'react';
import { CheckCircle2, RefreshCw, FileText, Database, ShieldAlert } from 'lucide-react';
import { ScraperStats, ScrapeRunRecord } from '../types.js';

interface StatsBarProps {
  stats: ScraperStats | null;
  latestRun?: ScrapeRunRecord | null;
  appMode?: 'student' | 'admin';
  onOpenAnomalyReport?: (run: ScrapeRunRecord) => void;
  onRefreshLinks?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  latestRun,
  appMode = 'student',
  onOpenAnomalyReport,
  onRefreshLinks
}) => {
  if (!stats) return null;

  // In student mode, don't show the dense diagnostic boxes
  if (appMode === 'student') {
    if (latestRun && (latestRun.anomaly_flag || latestRun.anomaly_reason)) {
      return (
        <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{latestRun.anomaly_reason || 'ICAI uploaded new material revisions.'}</span>
          </div>
          {onRefreshLinks && (
            <button
              onClick={onRefreshLinks}
              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg transition-colors"
            >
              Sync
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  // Diagnostics & Admin Mode KPIs
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
          <span>Total Materials</span>
          <FileText className="w-3.5 h-3.5 text-stone-400" />
        </div>
        <div className="text-xl font-bold text-stone-900 mt-1">
          {stats.total_materials}
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
          <span>Active Verified</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-xl font-bold text-emerald-700 mt-1">
          {stats.active_materials}
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
          <span>Revisions Detected</span>
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="text-xl font-bold text-blue-700 mt-1">
          {stats.changed_materials}
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
          <span>Completed Scrapes</span>
          <Database className="w-3.5 h-3.5 text-stone-400" />
        </div>
        <div className="text-xl font-bold text-stone-900 mt-1">
          {stats.total_runs}
        </div>
      </div>
    </div>
  );
};
