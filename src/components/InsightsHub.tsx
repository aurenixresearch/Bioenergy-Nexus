import React, { useState, useEffect } from 'react';
import { INSIGHTS_ARTICLES, InsightArticle } from '../data/insightsData';
import { RESEARCH_AREAS } from '../data/researchAreasData';
import { RESEARCH_PAPERS } from '../data';
import SeoManager from './seo/SeoManager';
import Breadcrumbs from './seo/Breadcrumbs';
import { BookOpen, Calendar, Clock, User, ArrowRight, Tag, Share2, ArrowLeft, Check, Sparkles, Building, Layers, Search } from 'lucide-react';
import { ResearchPaper } from '../types';

interface InsightsHubProps {
  selectedSlug?: string | null;
  onNavigateToArticle?: (slug: string) => void;
  onNavigateToResearchArea?: (areaSlug: string) => void;
  onNavigateToPaper?: (paperId: string) => void;
  onNavigateHome?: () => void;
}

export default function InsightsHub({
  selectedSlug,
  onNavigateToArticle,
  onNavigateToResearchArea,
  onNavigateToPaper,
  onNavigateHome
}: InsightsHubProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const activeArticle = selectedSlug 
    ? INSIGHTS_ARTICLES.find(a => a.slug === selectedSlug || a.id === selectedSlug) 
    : null;

  // Filter articles
  const filteredArticles = INSIGHTS_ARTICLES.filter(art => {
    const matchesCat = activeCategory === 'All' || art.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      art.title.toLowerCase().includes(q) || 
      art.summary.toLowerCase().includes(q) || 
      art.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const categories = ['All', 'Renewable Energy', 'Climate Tech', 'Bioenergy', 'Energy Storage', 'Energy Policy', 'Smart Grids'];

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If a specific article is selected, render single article view
  if (activeArticle) {
    const relatedArea = RESEARCH_AREAS.find(ra => ra.slug === activeArticle.relatedResearchAreaSlug);
    const relatedPapers = RESEARCH_PAPERS.filter(p => activeArticle.relatedPaperIds.includes(p.id));

    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: activeArticle.title,
      description: activeArticle.summary,
      image: activeArticle.author.avatar,
      author: {
        '@type': 'Person',
        name: activeArticle.author.name,
        jobTitle: activeArticle.author.role,
        worksFor: {
          '@type': 'Organization',
          name: activeArticle.author.institution
        }
      },
      publisher: {
        '@type': 'Organization',
        name: 'Aurenix Research Network',
        logo: {
          '@type': 'ImageObject',
          url: 'https://lh3.googleusercontent.com/d/1t_ZlrLjmjasOCDhzkwmIohFTqC8ux0oZ'
        }
      },
      datePublished: activeArticle.publishedDate,
      mainEntityOfPage: `https://aurenix-research.org/insights/${activeArticle.slug}`
    };

    return (
      <div className="min-h-screen bg-[#FAFDFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <SeoManager
          title={`${activeArticle.title} | Aurenix Insights`}
          description={activeArticle.summary}
          keywords={activeArticle.tags}
          canonicalUrl={`https://aurenix-research.org/insights/${activeArticle.slug}`}
          ogType="article"
          author={activeArticle.author.name}
          publishedDate={activeArticle.publishedDate}
          jsonLd={articleJsonLd}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            onHomeClick={onNavigateHome}
            items={[
              { label: 'Insights Hub', onClick: () => onNavigateToArticle?.('') },
              { label: activeArticle.category, onClick: () => setActiveCategory(activeArticle.category) },
              { label: activeArticle.title }
            ]}
          />

          {/* Back button */}
          <button
            type="button"
            onClick={() => onNavigateToArticle?.('')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Insights Hub
          </button>

          {/* Main Article Header */}
          <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>{activeArticle.category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight font-display">
              {activeArticle.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {activeArticle.subtitle}
            </p>

            {/* Author Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <img
                  src={activeArticle.author.avatar}
                  alt={activeArticle.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-emerald-500/30 shadow-xs"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeArticle.author.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeArticle.author.role} • {activeArticle.author.institution}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeArticle.publishedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {activeArticle.readTime}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Article Main Body */}
          <article className="prose prose-slate dark:prose-invert max-w-none text-left space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-2xl border-l-4 border-emerald-500">
              {activeArticle.content}
            </p>

            {activeArticle.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {sec.body}
                </p>
              </section>
            ))}
          </article>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
            <span className="text-xs font-bold text-slate-500 mr-2">Topics:</span>
            {activeArticle.tags.map(t => (
              <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                #{t}
              </span>
            ))}
          </div>

          {/* Cross-linking Widgets: Research Area & Related Peer-Reviewed Papers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
            {/* Related Research Area */}
            {relatedArea && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Explore Research Area</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {relatedArea.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {relatedArea.description}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToResearchArea?.(relatedArea.slug)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View Research Area Hub <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Related Peer-Reviewed Studies */}
            {relatedPapers.length > 0 && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Peer-Reviewed Studies</span>
                </div>
                <div className="space-y-2">
                  {relatedPapers.map(paper => (
                    <div key={paper.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {paper.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {paper.author} • {paper.publishedYear}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateToPaper?.(paper.id)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Read Full Research Paper →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Articles List View
  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Aurenix Knowledge & Insights Hub',
    description: 'Explore peer-informed articles, climate tech briefs, and energy transition studies across Africa and global clean tech sectors.',
    url: 'https://aurenix-research.org/insights'
  };

  return (
    <div className="min-h-screen bg-[#FAFDFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SeoManager
        title="Knowledge & Insights Hub — Energy & Climate Innovation | Aurenix"
        description="Discover authoritative articles, policy analyses, and technological insights on solar energy, bioenergy, energy storage, smart grids, and clean energy transition across Africa and beyond."
        keywords={['Energy insights', 'Climate technology articles', 'African clean energy transition', 'Solar energy studies', 'Bioenergy research']}
        canonicalUrl="https://aurenix-research.org/insights"
        jsonLd={hubJsonLd}
      />

      <div className="max-w-7xl mx-auto space-y-10 text-left">
        {/* Breadcrumbs */}
        <Breadcrumbs
          onHomeClick={onNavigateHome}
          items={[{ label: 'Knowledge & Insights Hub' }]}
        />

        {/* Hub Header Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aurenix Knowledge Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
              Energy & Climate Technology Insights
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              In-depth analysis, scientific policy briefs, and innovation deep dives connecting African researchers, global universities, and clean energy pioneers.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search insights & articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(art => (
            <article
              key={art.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full font-extrabold uppercase text-[10px]">
                    {art.category}
                  </span>
                  <span>{art.readTime}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {art.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={art.author.avatar}
                    alt={art.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {art.author.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToArticle?.(art.slug)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
