import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, AlertCircle, FileText, Code2, ExternalLink, Hash } from 'lucide-react';
import { ExtractedResource } from '../types.js';

export const SinglePageSandbox: React.FC = () => {
  const [testUrl, setTestUrl] = useState('https://boslive.icai.org/education_content_study_material_new_scheme.php');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    materialsExtracted: ExtractedResource[];
    htmlSnippet: string;
    durationMs: number;
    error?: string;
  } | null>(null);

  const presets = [
    {
      label: 'New Scheme Master Hub (All Materials)',
      url: 'https://boslive.icai.org/education_content_study_material_new_scheme.php'
    },
    {
      label: 'CA Inter: Taxation Material Page',
      url: 'https://boslive.icai.org/subject_details.php?c=intermediate&g=1&s=taxation'
    },
    {
      label: 'CA Inter: Advanced Accounting Page',
      url: 'https://boslive.icai.org/course_details.php?c=intermediate'
    },
    {
      label: 'CA Foundation Course Listing',
      url: 'https://boslive.icai.org/course_details.php?c=foundation'
    },
    {
      label: 'CA Final Educational Resources',
      url: 'https://boslive.icai.org/course_details.php?c=final'
    }
  ];

  const handleTest = async (urlToTest = testUrl) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper/single-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest })
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        materialsExtracted: [],
        htmlSnippet: '',
        durationMs: 0,
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sandbox Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-stone-900 flex items-center">
          <Code2 className="w-5 h-5 mr-2 text-stone-700" />
          Single-Page Scraper Sandbox (Phase 2 Deliverable)
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Test the discovery parser and multi-signal classifier against any specific ICAI BoS URL in isolation without scheduling or database mutations.
        </p>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            id="input-sandbox-url"
            type="text"
            value={testUrl}
            onChange={e => setTestUrl(e.target.value)}
            placeholder="https://boslive.icai.org/subject_details.php?..."
            className="flex-1 px-3.5 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
          />
          <button
            id="btn-sandbox-test"
            onClick={() => handleTest(testUrl)}
            disabled={isLoading}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center shrink-0 transition-colors"
          >
            {isLoading ? 'Parsing...' : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Extract Single Page
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-stone-500 font-medium">Quick Presets:</span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setTestUrl(p.url);
                handleTest(p.url);
              }}
              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-stone-900">
                Extracted {result.materialsExtracted.length} Educational Resource Candidates
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Fetched &amp; parsed in {result.durationMs}ms
            </span>
          </div>

          {result.error && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200">
              {result.error}
            </div>
          )}

          {/* Cards for extracted items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.materialsExtracted.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-stone-900 leading-snug">
                    {item.title}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded bg-stone-200 text-stone-800">
                    {Math.round(item.classification_confidence * 100)}% Conf
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600">
                  <div>Course: <strong>{item.course}</strong></div>
                  <div>Group: <strong>{item.group_name}</strong></div>
                  <div>Subject: <strong>{item.subject}</strong></div>
                  <div>Type: <strong>{item.material_type}</strong></div>
                </div>

                {/* Signals breakdown (§32) */}
                <div className="pt-2 border-t border-stone-200/60">
                  <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Multi-Signal Agreement:
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <SignalChip label="URL Pattern" active={item.signals_matched.url_pattern} />
                    <SignalChip label="Heading" active={item.signals_matched.heading_context} />
                    <SignalChip label="Link Text" active={item.signals_matched.link_text} />
                    <SignalChip label="Hierarchy" active={item.signals_matched.page_hierarchy} />
                    <SignalChip label="PDF Filename" active={item.signals_matched.filename_pattern} />
                  </div>
                </div>

                {/* URL */}
                <div className="font-mono text-[10px] text-stone-500 truncate pt-1">
                  {item.normalized_url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SignalChip: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`px-1.5 py-0.5 rounded ${
    active ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-stone-200/60 text-stone-400 line-through'
  }`}>
    {label}
  </span>
);
