import React from 'react';
import { RESEARCH_AREAS, ResearchArea } from '../data/researchAreasData';
import { RESEARCH_PAPERS } from '../data';
import { INSIGHTS_ARTICLES } from '../data/insightsData';
import SeoManager from './seo/SeoManager';
import Breadcrumbs from './seo/Breadcrumbs';
import { Layers, Sun, Leaf, Zap, Cpu, Globe, Wind, ArrowRight, ArrowLeft, BookOpen, Users, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

interface ResearchAreasPageProps {
  selectedSlug?: string | null;
  onNavigateToArea?: (slug: string) => void;
  onNavigateToPaper?: (paperId: string) => void;
  onNavigateToArticle?: (slug: string) => void;
  onNavigateHome?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sun: <Sun className="w-6 h-6 text-amber-500" />,
  Leaf: <Leaf className="w-6 h-6 text-emerald-500" />,
  Zap: <Zap className="w-6 h-6 text-blue-500" />,
  Cpu: <Cpu className="w-6 h-6 text-indigo-500" />,
  Globe: <Globe className="w-6 h-6 text-teal-500" />,
  Wind: <Wind className="w-6 h-6 text-sky-500" />
};

export default function ResearchAreasPage({
  selectedSlug,
  onNavigateToArea,
  onNavigateToPaper,
  onNavigateToArticle,
  onNavigateHome
}: ResearchAreasPageProps) {
  const activeArea = selectedSlug
    ? RESEARCH_AREAS.find(a => a.slug === selectedSlug || a.id === selectedSlug)
    : null;

  // Single Research Area Hub
  if (activeArea) {
    // Related papers
    const relatedPapers = RESEARCH_PAPERS.filter(p => 
      p.category.toLowerCase().includes(activeArea.slug.replace('-', ' ')) ||
      activeArea.searchKeywords.some(kw => p.title.toLowerCase().includes(kw) || p.abstract.toLowerCase().includes(kw))
    );

    // Related articles
    const relatedArticles = INSIGHTS_ARTICLES.filter(art => art.relatedResearchAreaSlug === activeArea.slug);

    const areaJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ResearchProject',
      name: activeArea.title,
      description: activeArea.overview,
      url: `https://aurenix-research.org/research-areas/${activeArea.slug}`,
      keywords: activeArea.searchKeywords.join(', ')
    };

    return (
      <div className="min-h-screen bg-[#FAFDFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <SeoManager
          title={`${activeArea.title} — Research & Technology Hub | Aurenix`}
          description={activeArea.overview}
          keywords={activeArea.searchKeywords}
          canonicalUrl={`https://aurenix-research.org/research-areas/${activeArea.slug}`}
          jsonLd={areaJsonLd}
        />

        <div className="max-w-5xl mx-auto space-y-10 text-left">
          {/* Breadcrumbs */}
          <Breadcrumbs
            onHomeClick={onNavigateHome}
            items={[
              { label: 'Research Areas', onClick: () => onNavigateToArea?.('') },
              { label: activeArea.title }
            ]}
          />

          {/* Back button */}
          <button
            type="button"
            onClick={() => onNavigateToArea?.('')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> All Research Areas
          </button>

          {/* Area Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shrink-0">
                {ICON_MAP[activeArea.iconName] || <Layers className="w-6 h-6 text-emerald-600" />}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Core Research Focus
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                  {activeArea.title}
                </h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {activeArea.tagline}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {activeArea.overview}
            </p>

            {/* Impact Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {activeArea.impactMetrics.map((m, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-0.5">
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                    {m.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Subtopics Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Key Research Subtopics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeArea.keySubtopics.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Research Papers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Featured Studies & Publications
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPapers.length > 0 ? (
                relatedPapers.map(paper => (
                  <div
                    key={paper.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">
                        {paper.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {paper.abstract}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {paper.author} ({paper.publishedYear})
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigateToPaper?.(paper.id)}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Read Paper →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center text-xs text-slate-500">
                  Additional peer-reviewed studies for this area are being curated.
                </div>
              )}
            </div>
          </div>

          {/* Related Insights Articles */}
          {relatedArticles.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Insights & Policy Briefs
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map(art => (
                  <div key={art.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {art.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateToArticle?.(art.slug)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Read Insight Article →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // All Research Areas List
  const areasJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Aurenix Core Research Areas',
    description: 'Explore key research areas in renewable energy, solar PV, bioenergy, battery storage, smart grids, and climate policy.',
    url: 'https://aurenix-research.org/research-areas'
  };

  return (
    <div className="min-h-screen bg-[#FAFDFB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SeoManager
        title="Research Areas — Energy & Climate Innovation Focus | Aurenix"
        description="Explore core research fields at Aurenix: Solar Energy, Bioenergy, Energy Storage, Smart Grids, Climate Policy, Wind & Hydropower."
        keywords={['Research areas', 'Solar energy research', 'Bioenergy technology', 'Energy storage innovation', 'Smart microgrids', 'Climate policy africa']}
        canonicalUrl="https://aurenix-research.org/research-areas"
        jsonLd={areasJsonLd}
      />

      <div className="max-w-7xl mx-auto space-y-10 text-left">
        {/* Breadcrumb */}
        <Breadcrumbs
          onHomeClick={onNavigateHome}
          items={[{ label: 'Research Areas' }]}
        />

        {/* Hero Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Key Scientific Domains</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-display">
            Aurenix Research Areas
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Discover peer-reviewed literature, ongoing projects, and collaborative networks categorized across core energy and climate technology domains.
          </p>
        </div>

        {/* Grid of Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RESEARCH_AREAS.map(area => (
            <div
              key={area.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
                  {ICON_MAP[area.iconName] || <Layers className="w-6 h-6 text-emerald-600" />}
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {area.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {area.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex gap-2 text-[11px] font-bold text-slate-500">
                  {area.impactMetrics[0]?.value} Studies
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToArea?.(area.slug)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Explore Hub <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
