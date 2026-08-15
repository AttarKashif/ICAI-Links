import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code, Layers, Sparkles, Send } from 'lucide-react';

export const ApiExplorer: React.FC = () => {
  const [course, setCourse] = useState('Intermediate');
  const [subject, setSubject] = useState('Taxation');
  const [materialType, setMaterialType] = useState('Study Material');
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);

  const endpointUrl = `/api/v1/materials/query?course=${encodeURIComponent(course)}&subject=${encodeURIComponent(subject)}&material_type=${encodeURIComponent(materialType)}`;

  const fetchApiResponse = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpointUrl);
      const data = await res.json();
      setResponseJson(data);
    } catch (e: any) {
      setResponseJson({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiResponse();
  }, [course, subject, materialType]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X GET "${window.location.origin}${endpointUrl}"`;

  return (
    <div className="space-y-5">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-stone-700" />
              <h3 className="text-base font-semibold text-stone-900">
                Downstream Consumer REST API Explorer (§30)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                Active v1 Endpoint
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Provides an isolated, production-ready REST API for student portals, mobile apps, or LMS backends to request verified official ICAI URLs without needing to know scraper internals.
            </p>
          </div>
        </div>

        {/* Interactive Query Builder */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Course
            </label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="Foundation">CA Foundation</option>
              <option value="Intermediate">CA Intermediate</option>
              <option value="Final">CA Final</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="Taxation">Taxation</option>
              <option value="Accounting">Accounting / Adv Accounting</option>
              <option value="Law">Corporate and Other Laws</option>
              <option value="Cost">Cost and Management Accounting</option>
              <option value="Audit">Auditing and Ethics</option>
              <option value="Financial Management">FM &amp; SM</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Material Type
            </label>
            <select
              value={materialType}
              onChange={e => setMaterialType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="Study Material">Study Material</option>
              <option value="Revision Test Papers (RTP)">Revision Test Papers (RTP)</option>
              <option value="Mock Test Papers (MTP)">Mock Test Papers (MTP)</option>
              <option value="Suggested Answers">Suggested Answers</option>
              <option value="Case Study Booklets">Case Scenario Booklet</option>
            </select>
          </div>
        </div>

        {/* Live cURL snippet */}
        <div className="mt-4 bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-emerald-400">GET</span> {endpointUrl}
          </div>
          <button
            onClick={() => handleCopy(curlExample, 'curl')}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 transition-colors shrink-0"
            title="Copy cURL command"
          >
            {copied === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live JSON Response */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-stone-600" />
            <span className="text-xs font-semibold text-stone-900">
              Live JSON Response Payload ({responseJson?.returned ?? 0} matches)
            </span>
          </div>
          <button
            onClick={() => handleCopy(JSON.stringify(responseJson, null, 2), 'json')}
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1"
          >
            {copied === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy JSON</span>
          </button>
        </div>

        <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">
          {loading ? 'Fetching live endpoint response...' : JSON.stringify(responseJson, null, 2)}
        </pre>
      </div>
    </div>
  );
};
