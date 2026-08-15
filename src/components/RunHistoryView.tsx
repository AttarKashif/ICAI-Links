import React, { useState } from 'react';
import {
  FileText, ShieldAlert, CheckCircle2, Clock, Terminal, ChevronRight, X,
  AlertTriangle, Database, Download, RefreshCw, Sparkles, Check, FileCode, FileSpreadsheet
} from 'lucide-react';
import { ScrapeRunRecord } from '../types.js';

interface RunHistoryViewProps {
  runs: ScrapeRunRecord[];
  onSelectRun?: (run: ScrapeRunRecord) => void;
  onCorroborateRun?: (run: ScrapeRunRecord) => Promise<void>;
  isLoading: boolean;
  isCorroborating?: boolean;
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({
  runs,
  onCorroborateRun,
  isLoading,
  isCorroborating = false
}) => {
  const [selectedRun, setSelectedRun] = useState<ScrapeRunRecord | null>(null);
  const [corroboratingRunId, setCorroboratingRunId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Trigger Corroborate Verification Scan
  const handleCorroborate = async (run: ScrapeRunRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onCorroborateRun) return;
    setCorroboratingRunId(run.id);
    try {
      await onCorroborateRun(run);
    } finally {
      setCorroboratingRunId(null);
    }
  };

  // Export and Download Report as JSON
  const handleDownloadJson = (run: ScrapeRunRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(run, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `icai-bos-report-${run.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('JSON report downloaded');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Export and Download Report as CSV
  const handleDownloadCsv = (run: ScrapeRunRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const headers = [
      'Run ID',
      'Started At',
      'Completed At',
      'Status',
      'Scope Description',
      'Pages Discovered',
      'Pages Fetched',
      'Materials Found',
      'New Materials',
      'URL Changed',
      'Content Changed (SHA)',
      'Potentially Removed',
      'Anomaly Flag',
      'Anomaly Reason',
      'Duration (Seconds)',
      'Classifier Rules Version'
    ];

    const values = [
      `"${run.id}"`,
      `"${run.started_at}"`,
      `"${run.completed_at || ''}"`,
      `"${run.status}"`,
      `"${(run.scope_description || '').replace(/"/g, '""')}"`,
      run.pages_discovered,
      run.pages_fetched,
      run.materials_found,
      run.new_materials,
      run.updated_materials,
      run.content_changed_materials,
      run.potentially_removed,
      run.anomaly_flag ? 'YES' : 'NO',
      `"${(run.anomaly_reason || '').replace(/"/g, '""')}"`,
      run.duration_seconds,
      `"${run.classifier_rules_version || 'v1.2.0'}"`
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), values.join(',')].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `icai-bos-report-${run.id}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('CSV report downloaded');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Scrape Run History &amp; Audit Trail</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Every crawl cycle produces a persistent audit record with SHA-256 validation, rule versioning, anomaly diagnostics, and exportable logs.
          </p>
        </div>

        {downloadSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white p-12 text-center text-stone-500 rounded-xl border border-stone-200">
          Loading scrape history...
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-500 rounded-xl border border-stone-200">
          No scrape runs recorded yet. Execute a crawl to view diagnostic logs.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
          {runs.map(run => {
            const isAnomalous = run.anomaly_flag || run.status === 'ANOMALOUS_COMPLETED' || !!run.anomaly_reason;
            const isCurrentCorroborating = corroboratingRunId === run.id || (isCorroborating && runs[0]?.id === run.id);

            return (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-4 hover:bg-stone-50/90 cursor-pointer transition-all flex flex-col gap-3 text-xs ${
                  isAnomalous ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {run.id}
                      </span>
                      {isAnomalous ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700 animate-pulse" /> ANOMALY DETECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> COMPLETED
                        </span>
                      )}
                      <span className="text-stone-400 font-mono text-[11px]">
                        Rules: {run.classifier_rules_version || 'v1.2.0'}
                      </span>
                    </div>

                    <div className="text-stone-800 font-medium text-sm">
                      {run.scope_description}
                    </div>

                    <div className="text-stone-400 text-[11px] flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{new Date(run.started_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>Duration: {run.duration_seconds}s</span>
                    </div>
                  </div>

                  {/* Metrics Breakdown & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 text-stone-600 text-xs self-start md:self-center">
                    <div className="flex items-center space-x-2">
                      <div className="text-center px-2 py-1 bg-stone-50 rounded border border-stone-200">
                        <div className="text-[10px] uppercase font-bold text-stone-400">Materials</div>
                        <div className="font-bold text-stone-900">{run.materials_found}</div>
                      </div>
                      <div className="text-center px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                        <div className="text-[10px] uppercase font-bold text-emerald-600">New</div>
                        <div className="font-bold text-emerald-800">{run.new_materials}</div>
                      </div>
                      <div className="text-center px-2 py-1 bg-blue-50 rounded border border-blue-200">
                        <div className="text-[10px] uppercase font-bold text-blue-600">URL Chg</div>
                        <div className="font-bold text-blue-800">{run.updated_materials}</div>
                      </div>
                      <div className="text-center px-2 py-1 bg-indigo-50 rounded border border-indigo-200">
                        <div className="text-[10px] uppercase font-bold text-indigo-600">SHA Chg</div>
                        <div className="font-bold text-indigo-800">{run.content_changed_materials}</div>
                      </div>
                    </div>

                    {/* Corroborate Run button */}
                    <button
                      id={`btn-corroborate-${run.id}`}
                      onClick={(e) => handleCorroborate(run, e)}
                      disabled={isCurrentCorroborating}
                      title="Trigger an immediate verification scan to corroborate this scrape cycle"
                      className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium text-xs border transition-colors ${
                        isAnomalous
                          ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                      } disabled:opacity-50`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCurrentCorroborating ? 'animate-spin' : ''}`} />
                      <span>{isCurrentCorroborating ? 'Verifying...' : 'Corroborate Run'}</span>
                    </button>

                    {/* Download Report button */}
                    <div className="relative group" onClick={e => e.stopPropagation()}>
                      <button
                        id={`btn-download-${run.id}`}
                        onClick={(e) => handleDownloadCsv(run, e)}
                        title="Download audit report for this run"
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-600" />
                        <span>Report</span>
                      </button>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 hidden md:block" />
                  </div>
                </div>

                {/* Highlighted Specific Anomaly Reason Banner */}
                {isAnomalous && (
                  <div className="mt-1 bg-amber-100/80 border-l-4 border-amber-500 rounded-r-lg p-2.5 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 text-xs">Specific Anomaly Reason: </span>
                        <span className="text-amber-900 font-mono text-xs">
                          {run.anomaly_reason || 'Anomaly flag triggered due to material count variation or drop exceeding §32 threshold limits.'}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold self-end sm:self-center shrink-0">
                      §32 Anomaly Guard Active
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-stone-700" />
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Scrape Run Details — {selectedRun.id}
                  </h4>
                  <div className="text-[11px] text-stone-500">
                    {new Date(selectedRun.started_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Download Report and Close in Modal Header */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDownloadCsv(selectedRun, e)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                  title="Download Report as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={(e) => handleDownloadJson(selectedRun, e)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                  title="Download Report as JSON"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Highlighted Anomaly Reason Banner in Modal */}
              {(selectedRun.anomaly_flag || selectedRun.anomaly_reason) && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 text-amber-950 shadow-xs">
                  <div className="font-bold flex items-center text-sm text-amber-900">
                    <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-700" />
                    ANOMALY DETECTED (§32 Guard Triggered)
                  </div>
                  <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-amber-300">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-0.5">
                      Specific Reason:
                    </div>
                    <p className="text-xs font-mono font-medium text-amber-950">
                      {selectedRun.anomaly_reason || 'Anomaly detected during crawl analysis.'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800">
                      Verification recommended to inspect catalog structure.
                    </span>
                    <button
                      onClick={() => handleCorroborate(selectedRun)}
                      disabled={corroboratingRunId === selectedRun.id}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${corroboratingRunId === selectedRun.id ? 'animate-spin' : ''}`} />
                      <span>{corroboratingRunId === selectedRun.id ? 'Verifying...' : 'Corroborate Run Now'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Formatted Text Report Summary (§21) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Report Summary (§21 Format)
                  </h5>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadCsv(selectedRun)}
                      className="text-stone-600 hover:text-stone-900 underline text-[11px] flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" /> Download CSV
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleDownloadJson(selectedRun)}
                      className="text-stone-600 hover:text-stone-900 underline text-[11px] flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" /> Download JSON
                    </button>
                  </div>
                </div>
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedRun.report_summary}
                </pre>
              </div>

              {/* Event Logs */}
              {selectedRun.logs && selectedRun.logs.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-1" />
                    Run Event Log Stream ({selectedRun.logs.length} entries)
                  </h5>
                  <div className="bg-stone-950 text-stone-300 p-3 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
                    {selectedRun.logs.map((l, i) => (
                      <div key={i} className="leading-snug">{l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCorroborate(selectedRun)}
                  disabled={corroboratingRunId === selectedRun.id}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-medium text-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${corroboratingRunId === selectedRun.id ? 'animate-spin' : ''}`} />
                  <span>{corroboratingRunId === selectedRun.id ? 'Verifying...' : 'Corroborate Run'}</span>
                </button>

                <button
                  onClick={() => handleDownloadCsv(selectedRun)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-medium text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download Report (CSV)</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

