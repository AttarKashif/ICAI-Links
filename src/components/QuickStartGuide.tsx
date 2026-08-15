import React from 'react';
import { HelpCircle, CheckCircle2, RefreshCw, X, Sparkles, BookOpen } from 'lucide-react';

interface QuickStartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Status &amp; Portal Guide</h3>
              <p className="text-[11px] text-stone-300">Understanding ICAI BoS Material Labels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-stone-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Active */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Active</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Direct official ICAI link verified with HTTP 200 OK. Matches current exam session and is safe to study or print.
              </p>
            </div>

            {/* Updated */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-blue-900">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Updated / Re-issued</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                ICAI re-uploaded or modified this document with statutory amendments, new MCQs, or updated digital URLs.
              </p>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Key Features</span>
            </h4>
            <ul className="space-y-1.5 text-stone-600 list-disc list-inside">
              <li><strong>1-Click Study Plan:</strong> Check off completed modules to track progress.</li>
              <li><strong>Direct PDF Access:</strong> All links lead directly to authentic <code className="font-mono bg-stone-200 px-1 py-0.5 rounded">icai.org</code> documents.</li>
              <li><strong>Export Plan:</strong> Download your personalized markdown study checklist anytime.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
