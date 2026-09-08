// Route preloader utility to fetch and cache view modules in the background
// This eliminates chunk-loading delays and full-page loading screens on navigation.

const viewLoaders: Record<string, () => Promise<any>> = {
  about: () => import('../components/AboutSection'),
  research: () => import('../components/ResearchSection'),
  'research-detail': () => import('../components/ResearchDetail'),
  project: () => import('../components/ProjectDetailsPage'),
  alliance: () => import('../components/AllianceDetailsPage'),
  saved: () => import('../components/SavedStudiesPage'),
  services: () => import('../components/ConsultationSection'),
  collaboration: () => import('../components/CollaborationSection'),
  contact: () => import('../components/ContactSection'),
  dashboard: () => import('../components/UserDashboard'),
  organization: () => import('../components/organization/OrganizationDashboard'),
  researchers: () => import('../components/ExploreResearchers'),
  console: () => import('../components/collaboration/OperationalConsole'),
  profile: () => import('../components/ProfilePage'),
  settings: () => import('../components/SettingsPage'),
  admin: () => import('../components/admin/AdminPortal'),
  messages: () => import('../components/MessagesPage'),
  notifications: () => import('../components/NotificationsPage'),
  insights: () => import('../components/InsightsHub'),
  'research-areas': () => import('../components/ResearchAreasPage'),
  legal: () => import('../components/legal/LegalLayout'),
  community: () => import('../components/CommunityPage'),
  onboarding: () => import('../components/OnboardingPage'),
};

const preloadedRoutes = new Set<string>();

/**
 * Preload a specific route on demand (e.g. on link hover, touch, or anticipated action)
 */
export function preloadRoute(viewKey: string) {
  const normalizedKey = viewKey === 'saved_studies' ? 'saved' : (viewKey === 'collaborations' ? 'collaboration' : viewKey);
  if (preloadedRoutes.has(normalizedKey)) return;

  const loader = viewLoaders[normalizedKey];
  if (loader) {
    preloadedRoutes.add(normalizedKey);
    loader().catch(() => {
      // Allow retry on subsequent calls if network was temporarily unavailable
      preloadedRoutes.delete(normalizedKey);
    });
  }
}

/**
 * Eagerly prefetch high-priority routes, and background-load all remaining routes during idle time
 */
export function initBackgroundPreloading() {
  if (typeof window === 'undefined') return;

  // Immediate priority routes (most frequently accessed first)
  const priorityRoutes = ['dashboard', 'research', 'researchers', 'collaboration', 'about', 'profile', 'settings'];
  
  const scheduleIdle = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 300);
    }
  };

  // Phase 1: High priority routes shortly after initial page mount
  setTimeout(() => {
    priorityRoutes.forEach(r => preloadRoute(r));
  }, 100);

  // Phase 2: All remaining routes when the browser is idle
  scheduleIdle(() => {
    Object.keys(viewLoaders).forEach(key => {
      if (!preloadedRoutes.has(key)) {
        preloadRoute(key);
      }
    });
  });
}
