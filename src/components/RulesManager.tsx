import React, { useEffect, useState } from 'react';
import { Sliders, History, Save, Check, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';

export const RulesManager: React.FC = () => {
  const [rules, setRules] = useState<any>(null);
  const [changelog, setChangelog] = useState('');
  const [loading, setLoading] = useState(true);
  const [yamlEdit, setYamlEdit] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'weights' | 'yaml' | 'changelog'>('weights');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = () => {
    setLoading(true);
    fetch('/api/scraper/rules')
      .then(res => res.json())
      .then(data => {
        setRules(data.rules);
        setChangelog(data.changelog);
        setYamlEdit(JSON.stringify(data.rules, null, 2));
      })
      .catch(e => console.error('Failed to load rules:', e))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-stone-900">Classifier Rule Set &amp; Versioning (§34)</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200">
              Active: {rules?.version || 'v1.2.0'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Multi-signal scoring rules, weight matrix, regex patterns, and versioned audit history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-stone-100 p-1 rounded-lg flex space-x-1 text-xs font-medium">
            <button
              onClick={() => setActiveSubTab('weights')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'weights' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Signal Weights
            </button>
            <button
              onClick={() => setActiveSubTab('yaml')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'yaml' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rules Manifest
            </button>
            <button
              onClick={() => setActiveSubTab('changelog')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'changelog' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              CHANGELOG.md (§34)
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center text-stone-500 rounded-xl border">Loading classifier rules...</div>
      ) : activeSubTab === 'weights' ? (
        /* Weights Matrix Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Multi-Signal Weighting Matrix (§12 &amp; §32)
            </h4>
            <p className="text-xs text-stone-500">
              Extracted links are evaluated across 5 independent signals. A confidence score (0.00 to 1.00) is calculated based on signal agreement.
            </p>

            <div className="space-y-3 pt-2">
              <WeightRow label="1. URL Pattern Matching" weight={rules?.weights?.url_pattern || 0.30} color="bg-blue-600" />
              <WeightRow label="2. Heading Context" weight={rules?.weights?.heading_context || 0.25} color="bg-emerald-600" />
              <WeightRow label="3. Anchor Link Text" weight={rules?.weights?.link_text || 0.20} color="bg-amber-600" />
              <WeightRow label="4. Page Breadcrumb / Hierarchy" weight={rules?.weights?.page_hierarchy || 0.15} color="bg-purple-600" />
              <WeightRow label="5. PDF Filename Conventions" weight={rules?.weights?.filename_pattern || 0.10} color="bg-rose-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Target Course &amp; Material Taxonomy
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900">Supported Courses</div>
                <div className="text-stone-600 mt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white rounded border text-[11px]">CA Foundation</span>
                  <span className="px-2 py-0.5 bg-white rounded border text-[11px]">CA Intermediate (Group I &amp; II)</span>
                  <span className="px-2 py-0.5 bg-white rounded border text-[11px]">CA Final (Group I &amp; II)</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900">Recognized Material Types</div>
                <div className="text-stone-600 mt-1 flex flex-wrap gap-1.5">
                  {Object.keys(rules?.material_types || {}).map(m => (
                    <span key={m} className="px-2 py-0.5 bg-white rounded border text-[11px] font-medium text-stone-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'yaml' ? (
        /* YAML Manifest Tab */
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">config/classifier_rules.yaml</span>
          </div>
          <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[450px]">
            {yamlEdit}
          </pre>
        </div>
      ) : (
        /* Changelog Tab */
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-900">Changelog Audit History (§34)</span>
            <span className="text-[11px] font-mono text-stone-400">CHANGELOG.md</span>
          </div>
          <pre className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
            {changelog}
          </pre>
        </div>
      )}
    </div>
  );
};

const WeightRow: React.FC<{ label: string; weight: number; color: string }> = ({ label, weight, color }) => (
  <div>
    <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
      <span>{label}</span>
      <span className="font-mono font-bold text-stone-900">{Math.round(weight * 100)}%</span>
    </div>
    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
      <div className={`${color} h-full rounded-full`} style={{ width: `${weight * 100}%` }} />
    </div>
  </div>
);
