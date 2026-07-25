import React from 'react';
import SeoManager from './seo/SeoManager';
import { FileQuestion, Home, BookOpen, Layers, Sparkles } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate?: (view: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFDFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center py-16 px-4">
      <SeoManager
        title="Page Not Found (404) | Aurenix"
        description="The requested page could not be found on Aurenix."
        noIndex={true}
      />

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            404 — Page Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The page or research asset you requested does not exist or may have been relocated.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('research')}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> Explore Research Repository
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('research-areas')}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" /> Browse Research Areas
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('insights')}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Read Insights Hub
          </button>
        </div>
      </div>
    </div>
  );
}
