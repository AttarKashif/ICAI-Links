import React, { useState } from 'react';
import { Play, Flame, AlertCircle, RefreshCw, Terminal, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { ScraperStats, ScrapeRunRecord } from '../types.js';

interface RunControlPanelProps {
  stats: ScraperStats | null;
  onRunScraper: (options: {
    scopeCourse?: string;
    scopeSubject?: string;
    scopeDescription?: string;
    forceAnomalyTest?: boolean;
  }) => Promise<ScrapeRunRecord | null>;
  isRunning: boolean;
  lastRunReport: ScrapeRunRecord | null;
}

export const RunControlPanel: React.FC<RunControlPanelProps> = ({
  stats,
  onRunScraper,
  isRunning,
  lastRunReport
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'taxation' | 'full' | 'foundation' | 'final' | 'anomaly'>('taxation');
  const [customCourse, setCustomCourse] = useState('Intermediate');
  const [customSubject, setCustomSubject] = useState('Taxation');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [activeReport, setActiveReport] = useState<ScrapeRunRecord | null>(lastRunReport);

  const handleExecute = async () => {
    let opts: any = {};
    if (selectedPreset === 'taxation') {
      opts = {
        scopeCourse: 'Intermediate',
        scopeSubject: 'Taxation',
        scopeDescription: 'CA Intermediate → Paper 3: Taxation (Study Material, RTP, MTP, Suggested Answers)'
      };
    } else if (selectedPreset === 'full') {
      opts = {
        scopeDescription: 'New Scheme Master Hub (education_content_study_material_new_scheme.php)',
        entryUrls: [
          'https://boslive.icai.org/education_content_study_material_new_scheme.php',
          'https://boslive.icai.org/course_details.php?c=intermediate',
          'https://boslive.icai.org/course_details.php?c=foundation',
          'https://boslive.icai.org/course_details.php?c=final'
        ]
      };
    } else if (selectedPreset === 'foundation') {
      opts = {
        scopeCourse: 'Foundation',
        scopeDescription: 'CA Foundation (All Papers Study Materials & RTPs)'
      };
    } else if (selectedPreset === 'final') {
      opts = {
        scopeCourse: 'Final',
        scopeDescription: 'CA Final (Group I & II Core Papers)'
      };
    } else if (selectedPreset === 'anomaly') {
      opts = {
        scopeDescription: 'Anomaly Simulation Test (§32 Safeguards Verification)',
        forceAnomalyTest: true
      };
    } else {
      opts = {
        scopeCourse: customCourse,
        scopeSubject: customSubject,
        scopeDescription: `Custom Scope: ${customCourse} - ${customSubject}`
      };
    }

    setLiveLogs([
      `[${new Date().toLocaleTimeString()}] Initializing Scraper Pipeline...`,
      `[${new Date().toLocaleTimeString()}] Target Scope: ${opts.scopeDescription}`,
      `[${new Date().toLocaleTimeString()}] Checking robots.txt directives and crawl-delay (1.0s)...`,
      `[${new Date().toLocaleTimeString()}] Dispatching Fetcher workers...`
    ]);

    const res = await onRunScraper(opts);
    if (res) {
      setActiveReport(res);
      if (res.logs && res.logs.length > 0) {
        setLiveLogs(res.logs);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Scraper Configuration */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-stone-900 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-stone-700" />
              Scraper Execution &amp; Discovery Console
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Execute target crawl runs against the official ICAI Board of Studies portal with real-time validation and change tracking.
            </p>
          </div>

          <button
            id="btn-run-scrape"
            onClick={handleExecute}
            disabled={isRunning}
            className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all ${
              isRunning
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-98'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Pipeline Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Execute Scrape Run
              </>
            )}
          </button>
        </div>

        {/* Preset Scope Selector */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Preset 1: Recommended first experiment */}
          <button
            onClick={() => setSelectedPreset('taxation')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPreset === 'taxation'
                ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900">CA Inter: Taxation</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                §30 Target
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Income Tax &amp; GST Study Modules, RTPs, MTPs, Suggested Answers.
            </p>
          </button>

          {/* Preset 2: Full Crawl */}
          <button
            onClick={() => setSelectedPreset('full')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPreset === 'full'
                ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900">New Scheme Master</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">All Courses</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              education_content_study_material_new_scheme.php master hub.
            </p>
          </button>

          {/* Preset 3: CA Foundation */}
          <button
            onClick={() => setSelectedPreset('foundation')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPreset === 'foundation'
                ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900">CA Foundation</span>
              <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">4 Papers</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Accounting, Business Laws, Quantitative Aptitude &amp; Economics.
            </p>
          </button>

          {/* Preset 4: CA Final */}
          <button
            onClick={() => setSelectedPreset('final')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPreset === 'final'
                ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900">CA Final</span>
              <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">Group I &amp; II</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Financial Reporting, AFM, Direct &amp; Indirect Tax Laws.
            </p>
          </button>

          {/* Preset 5: Anomaly Simulation */}
          <button
            onClick={() => setSelectedPreset('anomaly')}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPreset === 'anomaly'
                ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                : 'border-stone-200 hover:border-amber-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Test Anomaly (§32)</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Simulates DOM collapse to verify silent-failure protection guardrails.
            </p>
          </button>
        </div>
      </div>

      {/* Live Pipeline Logs & Text Report Viewer (§21) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Terminal Log Stream */}
        <div className="bg-stone-900 rounded-xl p-4 text-stone-100 font-mono text-xs border border-stone-800 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-stone-200">Scraper Pipeline Event Stream</span>
            </div>
            <span className="text-[10px] text-stone-400">
              {isRunning ? '● RUNNING' : '○ IDLE'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-stone-700">
            {liveLogs.length === 0 ? (
              <div className="text-stone-500 italic py-8 text-center">
                Ready for run. Click "Execute Scrape Run" above to start live discovery.
              </div>
            ) : (
              liveLogs.map((line, idx) => {
                const isWarn = line.includes('WARN');
                const isErr = line.includes('ERROR');
                const isNew = line.includes('NEW:');
                const isChanged = line.includes('CHANGED');
                return (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      isErr ? 'text-rose-400 font-medium' :
                      isWarn ? 'text-amber-300' :
                      isNew ? 'text-emerald-400' :
                      isChanged ? 'text-cyan-300' :
                      'text-stone-300'
                    }`}
                  >
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Formatted Report Summary (§21) */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col h-[340px]">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-stone-900">Run Summary Report (§21 Deliverable)</span>
            </div>
            {activeReport && (
              <span className="text-[11px] font-mono text-stone-500">
                Duration: {activeReport.duration_seconds}s
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-200">
            {activeReport?.report_summary ? (
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {activeReport.report_summary}
              </pre>
            ) : (
              <div className="text-stone-500 italic text-center py-10 font-sans text-xs">
                No scrape report loaded yet. Run a scrape cycle to generate the formatted summary report.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
