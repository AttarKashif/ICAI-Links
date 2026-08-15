import React, { useState, useEffect } from 'react';
import { Sun, Moon, GraduationCap, ShieldCheck } from 'lucide-react';
import { HierarchyExplorer } from './components/HierarchyExplorer.js';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('icai_scraper_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('icai_scraper_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-stone-950 text-stone-100 selection:bg-stone-700 selection:text-white' 
        : 'bg-stone-100/60 text-stone-900 selection:bg-stone-800 selection:text-white'
    }`}>
      {/* Top Simple Brand Header */}
      <header className={`border-b sticky top-0 z-30 shadow-2xs transition-colors duration-200 ${
        isDarkMode ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isDarkMode ? 'bg-blue-600 text-white' : 'bg-stone-900 text-white'
            }`}>
              ICAI
            </div>
            <div>
              <h1 className={`text-sm sm:text-base font-bold leading-none ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                ICAI BoS Material Link Extractor
              </h1>
              <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Direct PDF link extraction and custom export engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border hidden sm:inline-flex items-center gap-1 ${
              isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              New Scheme (2024-2026)
            </span>

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700' 
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Focus Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HierarchyExplorer isDarkMode={isDarkMode} />
      </main>

      {/* Clean Footer */}
      <footer className={`border-t py-4 mt-auto transition-colors duration-200 ${
        isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-white border-stone-200 text-stone-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs">
          ICAI Board of Studies Material Link Extractor · Extracts direct compliant resources from <code className={isDarkMode ? 'text-stone-300' : 'text-stone-600'}>resource.cdn.icai.org</code>
        </div>
      </footer>
    </div>
  );
}
