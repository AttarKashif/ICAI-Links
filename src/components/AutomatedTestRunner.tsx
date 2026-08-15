import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  CheckCheck, 
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';
import { AutomatedTestResult } from '../types';

export const AutomatedTestRunner: React.FC = () => {
  const [tests, setTests] = useState<AutomatedTestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scraper/tests');
      const data = await res.json();
      if (data.results) {
        setTests(data.results);
      }
    } catch (e) {
      console.error('Failed to load automated test suite:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/scraper/run-tests', { method: 'POST' });
      const data = await res.json();
      if (data.results) {
        setTests(data.results);
        setLastRunAt(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to run automated tests:', e);
    } finally {
      setRunning(false);
    }
  };

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'PASSED').length;
  const failedTests = tests.filter(t => t.status === 'FAILED').length;
  const totalDuration = tests.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div id="test-runner-container" className="space-y-6">
      {/* Header & Run Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Automated Verification & Resilience Suite (PHASE 18)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Scraper Contract Test Cases (10/10)
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Verifies chapter discovery, PDF association, relative URL conversions, non-extension Content-Type resolution, non-study material exclusion, deduplication, hierarchy retention, timeout resilience, malformed DOM fault-tolerance, and infinite loop safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-run-automated-tests"
            onClick={handleRunTests}
            disabled={running}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {running ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{running ? 'Running Test Suite...' : 'Execute All 10 Tests'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Test Suite Status</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
            {passedTests === totalTests && totalTests > 0 ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> 100% Passing
              </>
            ) : (
              <>{passedTests}/{totalTests} Passed</>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{failedTests} failed assertions</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Passed Tests</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {passedTests} of {totalTests}
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5">Full contract verified</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Duration</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalDuration} ms
          </div>
          <div className="text-[11px] text-blue-500 mt-0.5">High-speed unit & crawl tests</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last Execution</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {lastRunAt || 'Loaded'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Auto-validated</div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">ICAI Scraper Validation Test Suite</h3>
          </div>
          <button
            onClick={fetchTests}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {tests.map(test => (
            <div
              key={test.testId}
              id={`test-row-${test.testId.toLowerCase()}`}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {test.status === 'PASSED' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {test.testId}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {test.testName}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {test.description}
                  </p>
                  <div className="mt-2 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 mr-2">Assertion:</span>
                    {test.details}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                    {test.durationMs} ms
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {test.passedAssertions}/{test.assertionsCount} Assertions
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    test.status === 'PASSED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  }`}
                >
                  {test.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
