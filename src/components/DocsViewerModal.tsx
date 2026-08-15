import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Layers, Copy, Check, FileText } from 'lucide-react';

interface DocsViewerModalProps {
  docId: string | null;
  onClose: () => void;
}

export const DocsViewerModal: React.FC<DocsViewerModalProps> = ({
  docId,
  onClose
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (docId) {
      setLoading(true);
      fetch(`/api/scraper/docs/${docId}`)
        .then(res => res.json())
        .then(data => {
          setContent(data.content || '');
        })
        .catch(err => console.error('Failed to load doc:', err))
        .finally(() => setLoading(false));
    }
  }, [docId]);

  if (!docId) return null;

  const isPolicy = docId === 'access-policy-note';
  const title = isPolicy ? 'Access Policy & robots.txt Verification Note (§31)' : 'ICAI BoS Website Structure Map (§35)';
  const icon = isPolicy ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <Layers className="w-5 h-5 text-blue-600" />;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center space-x-2">
            {icon}
            <div>
              <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
              <span className="text-[11px] font-mono text-stone-500">docs/{docId}.md</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors text-xs flex items-center space-x-1"
              title="Copy Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Markdown Content */}
        <div className="p-5 overflow-y-auto bg-stone-50/50 flex-1">
          {loading ? (
            <div className="text-center py-12 text-stone-400">Loading document...</div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
