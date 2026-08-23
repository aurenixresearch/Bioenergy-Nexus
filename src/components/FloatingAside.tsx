import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  Bookmark,
  HeartHandshake,
  Handshake,
  Activity,
  Info,
  Mail,
  Shield,
  Settings,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Building2,
  Search,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { subscribeToUnreadCount } from '../services/messagingDb';

interface FloatingAsideProps {
  user: FirebaseUser | null;
  userProfile?: any | null;
  currentView: any;
  setView: (view: any) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onSignOut?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

interface NavItemDef {
  label: string;
  id: string;
  icon: React.ElementType;
  badge?: number;
  isAi?: boolean;
  category: 'workspace' | 'research' | 'network' | 'management';
}

export default function FloatingAside({
  user,
  userProfile,
  currentView,
  setView,
  isCollapsed = false,
  setIsCollapsed,
  onSignOut,
  theme,
  onToggleTheme
}: FloatingAsideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    workspace: false,
    research: false,
    network: false,
    management: false
  });

  const drawerRef = useRef<HTMLDivElement>(null);

  const effectiveUser = user;
  const userEmail = (userProfile?.email || user?.email || '').trim();
  const userDisplayName =
    userProfile?.username ||
    userProfile?.fullName ||
    userProfile?.displayName ||
    user?.displayName ||
    (userEmail ? userEmail.split('@')[0] : 'Scholar Member');
  const userAvatarUrl =
    userProfile?.profilePicture ||
    user?.photoURL ||
    (userEmail ? `https://unavatar.io/google/${userEmail}` : '');

  const isPro =
    userProfile?.isPro === true ||
    userProfile?.isPaid === true ||
    userProfile?.tier?.toLowerCase() === 'pro' ||
    userProfile?.subscriptionTier?.toLowerCase() === 'pro' ||
    userProfile?.plan?.toLowerCase() === 'pro' ||
    userProfile?.role?.toLowerCase() === 'pro' ||
    userProfile?.role?.toLowerCase() === 'paid' ||
    userProfile?.role?.toLowerCase() === 'super_admin' ||
    userProfile?.role?.toLowerCase() === 'admin' ||
    userEmail.toLowerCase() === 'bola.adeyemi@aurenix-research.org';

  const tierBadge = isPro ? 'PRO' : 'FREE';

  const userRoleStr = (userProfile?.role || '').trim().toLowerCase();
  const userEmailStr = userEmail.toLowerCase();

  const ADMIN_EMAILS = [
    'bola.adeyemi@aurenix-research.org',
    'adeyemibola2569@gmail.com',
    'egburedipraise@gmail.com'
  ];

  const isAdmin = Boolean(
    userEmailStr && (
      ADMIN_EMAILS.includes(userEmailStr) ||
      userProfile?.isAdmin === true ||
      userProfile?.admin === true ||
      userRoleStr === 'admin' ||
      userRoleStr === 'super_admin' ||
      userRoleStr === 'platform super admin' ||
      userRoleStr === 'platform admin'
    )
  );

  const isOrgAccount = Boolean(
    ['Institution', 'Industry', 'Government', 'Government Agency', 'NGO', 'Other'].includes(
      userProfile?.userRole || userProfile?.role || ''
    ) ||
    userProfile?.isOrganization ||
    userProfile?.organizationType ||
    userProfile?.accountType === 'institution'
  );

  // Real-time listener for unread messages count
  useEffect(() => {
    if (!effectiveUser?.uid) return;
    const unsub = subscribeToUnreadCount(effectiveUser.uid, (total) => {
      setUnreadMessages(total);
    });
    return () => unsub();
  }, [effectiveUser?.uid]);

  // Lock body scroll when mobile drawer is open to prevent background scrolling jitter
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Global custom event listeners for opening/toggling aside from anywhere
  useEffect(() => {
    const handleOpenAside = () => setIsOpen(true);
    const handleToggleAside = () => setIsOpen((prev) => !prev);
    const handleCloseAside = () => setIsOpen(false);

    window.addEventListener('open-mobile-aside', handleOpenAside);
    window.addEventListener('toggle-mobile-aside', handleToggleAside);
    window.addEventListener('close-mobile-aside', handleCloseAside);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-mobile-aside', handleOpenAside);
      window.removeEventListener('toggle-mobile-aside', handleToggleAside);
      window.removeEventListener('close-mobile-aside', handleCloseAside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const allNavItems: NavItemDef[] = useMemo(() => {
    const items: NavItemDef[] = [
      {
        label: isOrgAccount ? 'Organization Dashboard' : 'User Dashboard',
        id: 'dashboard',
        icon: isOrgAccount ? Building2 : LayoutDashboard,
        category: 'workspace'
      },
      {
        label: 'AI Research & Support',
        id: 'ai-assistant',
        icon: Sparkles,
        isAi: true,
        category: 'workspace'
      },
      {
        label: 'Messages',
        id: 'messages',
        icon: MessageSquare,
        badge: unreadMessages,
        category: 'workspace'
      },
      {
        label: 'Community Feed',
        id: 'community',
        icon: Globe,
        category: 'workspace'
      },
      {
        label: 'Explore Researchers',
        id: 'researchers',
        icon: Users,
        category: 'workspace'
      },
      {
        label: 'Research Hub',
        id: 'research',
        icon: BookOpen,
        category: 'research'
      },
      {
        label: 'Saved Studies',
        id: 'saved',
        icon: Bookmark,
        category: 'research'
      },
      {
        label: 'Technical Services',
        id: 'services',
        icon: HeartHandshake,
        category: 'research'
      },
      {
        label: 'Collaborations',
        id: 'collaboration',
        icon: Handshake,
        category: 'research'
      },
      {
        label: 'Operational Console',
        id: 'console',
        icon: Activity,
        category: 'research'
      },
      {
        label: 'About Us',
        id: 'about',
        icon: Info,
        category: 'network'
      },
      {
        label: 'Contact Us',
        id: 'contact',
        icon: Mail,
        category: 'network'
      }
    ];

    if (isAdmin) {
      items.push({
        label: 'Admin Portal',
        id: 'admin',
        icon: Shield,
        category: 'management'
      });
    }

    items.push({
      label: 'Settings & Profile',
      id: 'settings',
      icon: Settings,
      category: 'management'
    });

    return items;
  }, [isOrgAccount, unreadMessages, isAdmin]);

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [allNavItems, searchQuery]);

  const handleNavClick = (viewId: string) => {
    setView(viewId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleCollapse = () => {
    if (setIsCollapsed) {
      setIsCollapsed((prev: boolean) => {
        const next = !prev;
        localStorage.setItem('nexus_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    { key: 'workspace', title: 'Main Workspace' },
    { key: 'research', title: 'Research & Programs' },
    { key: 'network', title: 'Network & Info' },
    { key: 'management', title: 'Management & Settings' }
  ];

  /* -------------------------------------------------------------
     RENDER: Desktop Sidebar Inner
  -------------------------------------------------------------- */
  const renderDesktopSidebarInner = () => {
    const collapsed = isCollapsed;

    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* User Profile Card */}
        <div className={`py-3 shrink-0 transition-all duration-300 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div
            className={`rounded-2xl border transition-all duration-300 flex items-center min-w-0 overflow-hidden cursor-pointer ${
              collapsed
                ? 'p-2 justify-center border-emerald-800/60 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 shadow-md hover:border-emerald-500/50'
                : 'p-3 justify-between border-emerald-800/60 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-md hover:border-emerald-500/50 hover:shadow-lg'
            }`}
            onClick={() => handleNavClick('settings')}
            title={`${userDisplayName} (${userEmail})`}
          >
            <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative shrink-0 flex items-center justify-center w-10 h-10 aspect-square">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt="Profile"
                    className="w-10 h-10 min-w-[40px] min-h-[40px] aspect-square shrink-0 rounded-full object-cover border-2 border-emerald-400/80 shadow-xs ring-2 ring-emerald-500/30 overflow-hidden"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 min-w-[40px] min-h-[40px] aspect-square shrink-0 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shadow-xs uppercase ring-2 ring-emerald-400/40 border border-emerald-300/30">
                    {userDisplayName ? userDisplayName[0] : 'A'}
                  </div>
                )}
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-[9px] text-white font-black flex items-center justify-center border border-white dark:border-slate-900 transition-all duration-300 ${
                    collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
                  }`}
                >
                  {tierBadge[0]}
                </span>
              </div>
              <div
                className={`min-w-0 flex flex-col justify-center overflow-hidden transition-all duration-300 ease-out ${
                  collapsed ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100 w-auto'
                }`}
              >
                <p className="text-sm font-extrabold truncate leading-tight text-white whitespace-nowrap">
                  {userDisplayName}
                </p>
                <p className="text-xs font-semibold truncate leading-tight mt-0.5 text-emerald-300/90 font-mono whitespace-nowrap">
                  {userEmail}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider shrink-0 text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 shadow-xs transition-all duration-300 ease-out ${
                collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
              }`}
            >
              {tierBadge}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div
          className={`flex-1 overflow-y-auto py-2 space-y-1.5 custom-scrollbar transition-all duration-300 ${
            collapsed ? 'px-2' : 'px-3'
          }`}
        >
          {categories.map((cat) => {
            const catItems = allNavItems.filter((i) => i.category === cat.key);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-1">
                <div
                  className={`px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${
                    collapsed ? 'opacity-0 h-0 py-0 hidden' : 'opacity-100 h-auto'
                  }`}
                >
                  {cat.title}
                </div>

                {catItems.map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center transition-all duration-150 cursor-pointer text-left rounded-xl overflow-hidden border-0 ${
                        collapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-emerald-700 dark:bg-emerald-600 text-white font-extrabold shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold bg-transparent'
                      }`}
                    >
                      <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
                        <div
                          className={`relative shrink-0 flex items-center justify-center transition-colors ${
                            isActive
                              ? 'text-white'
                              : item.isAi
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${item.isAi ? 'animate-pulse' : ''}`} />
                          {item.badge && item.badge > 0 ? (
                            <span
                              className={`absolute -top-1.5 -right-2 w-4 h-4 text-[9px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs transition-all duration-300 ${
                                collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none hidden'
                              }`}
                            >
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          ) : null}
                        </div>

                        <span
                          className={`text-sm font-bold tracking-tight truncate whitespace-nowrap flex-1 transition-all duration-300 ease-out ${
                            isActive ? 'text-white font-extrabold' : 'text-slate-800 dark:text-slate-200'
                          } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'}`}
                        >
                          {item.label}
                        </span>

                        {item.badge && item.badge > 0 ? (
                          <span
                            className={`px-2 py-0.5 text-[11px] font-black rounded-full shadow-2xs shrink-0 transition-all duration-300 ease-out ${
                              isActive
                                ? 'bg-white text-emerald-800'
                                : 'bg-rose-500 text-white'
                            } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'}`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {cat.key !== 'management' && (
                  <div className={`my-2 border-t border-slate-100 dark:border-slate-800/80 ${collapsed ? 'mx-2' : 'mx-3'}`} />
                )}
              </div>
            );
          })}

          {/* Theme Toggle Button in collapsed mode */}
          {collapsed && onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-full flex items-center justify-center py-3 transition-all duration-200 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold rounded-xl overflow-hidden border-0 bg-transparent mt-1"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-emerald-700" />}
            </button>
          )}

          {/* Sign Out */}
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              title={collapsed ? 'Sign Out' : undefined}
              className={`w-full flex items-center transition-colors duration-200 cursor-pointer text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-black rounded-xl mt-1 overflow-hidden border-0 bg-transparent ${
                collapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'
              }`}
            >
              <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
                <div className="shrink-0 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <LogOut className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-bold tracking-tight truncate whitespace-nowrap flex-1 text-rose-600 dark:text-rose-400 transition-all duration-300 ease-out ${
                    collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                  }`}
                >
                  Sign Out
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Bottom Sidebar Collapse Footer */}
        {setIsCollapsed && (
          <div className={`shrink-0 flex items-center justify-center transition-all duration-300 border-t border-slate-100 dark:border-slate-800 ${collapsed ? 'p-2' : 'p-3'}`}>
            <button
              type="button"
              onClick={toggleCollapse}
              className={`w-full py-2.5 rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors cursor-pointer border border-emerald-700/60 shadow-xs flex items-center min-w-0 overflow-hidden ${
                collapsed ? 'px-2 justify-center' : 'px-3 justify-between'
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              id="aside_collapse_btn"
            >
              <span
                className={`text-xs font-bold tracking-wide uppercase text-white whitespace-nowrap truncate transition-all duration-300 ease-out ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                }`}
              >
                Collapse Sidebar
              </span>
              <div className="shrink-0 flex items-center justify-center text-white">
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-white" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------
     RENDER: Mobile Drawer (collapsible, touch-friendly, smooth)
  -------------------------------------------------------------- */
  return (
    <>
      {/* 1. Desktop Aside (fixed on xl+ screens) */}
      <motion.aside
        id="desktop_floating_aside"
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden xl:flex fixed top-0 left-0 bottom-0 z-40 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm flex-col overflow-x-hidden"
      >
        {renderDesktopSidebarInner()}
      </motion.aside>

      {/* 2. Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="xl:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 cursor-pointer"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 3. Mobile Collapsible Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={drawerRef}
            id="mobile_aside_drawer"
            initial={{ x: '-100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
            drag="x"
            dragConstraints={{ left: -360, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              // Close if dragged left beyond threshold
              if (info.offset.x < -80 || info.velocity.x < -300) {
                setIsOpen(false);
              }
            }}
            className="xl:hidden fixed top-0 left-0 bottom-0 z-50 h-full w-[88vw] max-w-[340px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Top Drawer Header with Brand & Close Button */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-700 text-white rounded-xl shadow-xs">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight font-display">
                      Aurenix <span className="text-emerald-700 dark:text-emerald-400">Navigation</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Scholar Research Hub
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 shrink-0"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* User Identity Card */}
              <div
                onClick={() => handleNavClick('settings')}
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white border border-emerald-700/50 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-400/60 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400/80 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs uppercase border border-emerald-300/40">
                        {userDisplayName ? userDisplayName[0] : 'A'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-white">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-black truncate text-white leading-tight">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] font-medium truncate text-emerald-300/90 font-mono mt-0.5">
                      {userEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-black rounded-md uppercase tracking-wider text-emerald-200 bg-emerald-900/90 border border-emerald-500/40">
                    {tierBadge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300/60 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Quick Search in Drawer */}
              <div className="mt-3 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages & tools..."
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/30 transition shadow-2xs font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick-Access Top Pills (Shown when not searching) */}
            {!searchQuery && (
              <div className="px-4 py-2.5 grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer border ${
                    currentView === 'dashboard'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-bold hover:border-emerald-500/40'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[10px] leading-tight truncate max-w-full">Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('ai-assistant')}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer border ${
                    currentView === 'ai-assistant'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-bold hover:border-emerald-500/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-[10px] leading-tight truncate max-w-full">AI Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('messages')}
                  className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer border ${
                    currentView === 'messages'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-bold hover:border-emerald-500/40'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-[10px] leading-tight truncate max-w-full">Messages</span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black shadow-xs">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Scrollable Navigation Category Groups */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {searchQuery ? (
                /* Search Results */
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Search Results ({filteredNavItems.length})
                  </div>
                  {filteredNavItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching pages found for "{searchQuery}"
                    </div>
                  ) : (
                    filteredNavItems.map((item) => {
                      const isActive = currentView === item.id;
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer text-left ${
                            isActive
                              ? 'bg-emerald-700 text-white font-black shadow-sm'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm truncate">{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="px-2 py-0.5 text-xs font-black rounded-full bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Categorized Collapsible Sections */
                categories.map((cat) => {
                  const catItems = allNavItems.filter((i) => i.category === cat.key);
                  if (catItems.length === 0) return null;
                  const isCollapsed = collapsedSections[cat.key];

                  return (
                    <div key={cat.key} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleSection(cat.key)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <span>{cat.title}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeInOut' }}
                            className="space-y-1 overflow-hidden"
                          >
                            {catItems.map((item) => {
                              const isActive = currentView === item.id;
                              const Icon = item.icon;
                              return (
                                <motion.button
                                  key={item.id}
                                  whileTap={{ scale: 0.98 }}
                                  type="button"
                                  onClick={() => handleNavClick(item.id)}
                                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer text-left min-h-[44px] ${
                                    isActive
                                      ? 'bg-emerald-700 text-white font-black shadow-sm'
                                      : 'text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Icon
                                      className={`w-5 h-5 shrink-0 ${
                                        isActive
                                          ? 'text-white'
                                          : item.isAi
                                          ? 'text-emerald-600 dark:text-emerald-400 animate-pulse'
                                          : 'text-slate-500 dark:text-slate-400'
                                      }`}
                                    />
                                    <span className="text-sm tracking-tight truncate">{item.label}</span>
                                  </div>

                                  {item.badge && item.badge > 0 ? (
                                    <span
                                      className={`px-2 py-0.5 text-xs font-black rounded-full shadow-2xs shrink-0 ${
                                        isActive
                                          ? 'bg-white text-emerald-800'
                                          : 'bg-rose-500 text-white'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  ) : (
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 opacity-40 shrink-0 ${
                                        isActive ? 'opacity-100 text-white' : ''
                                      }`}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile Drawer Bottom Quick Controls & Sign Out */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs min-h-[44px]"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-emerald-700" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                )}

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onSignOut();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer shadow-2xs min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] text-center text-slate-400 dark:text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
                <span>Aurenix Network</span>
                <span>•</span>
                <span>v2.4</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 4. Floating Mobile Launcher Action Button (bottom right on mobile/tablet) */}
      <motion.button
        id="aside_toggle_btn"
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed bottom-6 right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white shadow-xl flex items-center justify-center cursor-pointer border-2 border-white/30 dark:border-emerald-400/40"
        title={isOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        aria-label="Toggle Aside Navigation Menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-white" />
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-emerald-700 animate-bounce">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
