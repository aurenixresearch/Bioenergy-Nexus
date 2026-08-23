import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Building2
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

  const effectiveUser = user;
  const userEmail = (userProfile?.email || user?.email || '').trim();
  const userDisplayName = userProfile?.username || userProfile?.fullName || userProfile?.displayName || user?.displayName || (userEmail ? userEmail.split('@')[0] : 'Scholar Member');
  const userAvatarUrl = userProfile?.profilePicture || user?.photoURL || (userEmail ? `https://unavatar.io/google/${userEmail}` : '');

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

  // Real-time listener for unread messages count
  useEffect(() => {
    if (!effectiveUser?.uid) return;
    const unsub = subscribeToUnreadCount(effectiveUser.uid, (total) => {
      setUnreadMessages(total);
    });
    return () => unsub();
  }, [effectiveUser?.uid]);

  const isOrgAccount = Boolean(
    ['Institution', 'Industry', 'Government', 'Government Agency', 'NGO', 'Other'].includes(userProfile?.userRole || userProfile?.role || '') ||
    userProfile?.isOrganization ||
    userProfile?.organizationType ||
    userProfile?.accountType === 'institution'
  );

  const navItems = [
    { label: isOrgAccount ? 'Organization Dashboard' : 'User Dashboard', id: 'dashboard', icon: isOrgAccount ? Building2 : LayoutDashboard },
    { label: 'AI Research & Support', id: 'ai-assistant', icon: Sparkles },
    { label: 'Messages', id: 'messages', icon: MessageSquare, badge: unreadMessages },
    { label: 'Community', id: 'community', icon: Globe },
    { label: 'Explore Researchers', id: 'researchers', icon: Users },
    { label: 'Research Hub', id: 'research', icon: BookOpen },
    { label: 'Saved Studies', id: 'saved', icon: Bookmark },
    { label: 'Services', id: 'services', icon: HeartHandshake },
    { label: 'Collaborations', id: 'collaboration', icon: Handshake },
    { label: 'Operational Console', id: 'console', icon: Activity },
    { label: 'About Us', id: 'about', icon: Info },
    { label: 'Contact Us', id: 'contact', icon: Mail },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId);
    setIsOpen(false);
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

  const renderSidebarInner = (isDesktop: boolean) => {
    const collapsed = isDesktop && isCollapsed;

    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-white">
        {/* User Profile Summary */}
        <div className={`py-3 shrink-0 transition-all duration-300 ${collapsed ? 'px-2' : 'px-3'
          }`}>
          <div
            className={`rounded-2xl border transition-all duration-300 flex items-center min-w-0 overflow-hidden cursor-pointer ${collapsed
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
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-700 text-[9px] text-white font-black flex items-center justify-center border border-white transition-all duration-300 ${collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
                  }`}>
                  {tierBadge[0]}
                </span>
              </div>
              <div className={`min-w-0 flex flex-col justify-center overflow-hidden transition-all duration-300 ease-out ${collapsed ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100 w-auto'
                }`}>
                <p className="text-sm font-extrabold truncate leading-tight text-white whitespace-nowrap">
                  {userDisplayName}
                </p>
                <p className="text-xs font-semibold truncate leading-tight mt-0.5 text-emerald-300/90 font-mono whitespace-nowrap">
                  {userEmail}
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider shrink-0 text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 shadow-xs transition-all duration-300 ease-out ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
              }`}>
              {tierBadge}
            </span>

            {!isDesktop && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                title="Close Sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <div className={`flex-1 overflow-y-auto py-2 space-y-2 custom-scrollbar transition-all duration-300 ${collapsed ? 'px-2' : 'px-3'
          }`}>
          <div className={`px-3 pt-1 pb-1.5 text-xs font-black uppercase tracking-wider text-[#045627] whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'opacity-0 h-0 py-0 hidden' : 'opacity-100 h-auto'
            }`}>
            Main Workspace
          </div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center transition-colors duration-200 cursor-pointer text-left rounded-xl overflow-hidden border-0 ${collapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-3.5'
                  } ${isActive
                    ? 'bg-emerald-700 text-white font-black shadow-md'
                    : 'text-[#045627] hover:text-[#002b11] hover:bg-emerald-100/90 font-extrabold bg-transparent'
                  }`}
              >
                <div className={`flex items-center gap-3.5 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
                  <div className={`relative shrink-0 flex items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-[#045627]'
                    }`}>
                    <Icon className="w-6 h-6 shrink-0" />
                    {item.badge && item.badge > 0 ? (
                      <span className={`absolute -top-1.5 -right-2 w-4.5 h-4.5 text-[10px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs transition-all duration-300 ${collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none hidden'
                        }`}>
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </div>

                  <span className={`text-[15px] font-black tracking-tight truncate whitespace-nowrap flex-1 transition-all duration-300 ease-out ${isActive ? 'text-white' : 'text-[#045627]'
                    } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                    }`}>
                    {item.label}
                  </span>

                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-full shadow-2xs shrink-0 transition-all duration-300 ease-out ${isActive ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-white'
                      } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                      }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}

          <div className="my-3 border-t border-emerald-100" />

          <div className={`px-3 pt-1 pb-1.5 text-xs font-black uppercase tracking-wider text-[#045627] whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'opacity-0 h-0 py-0 hidden' : 'opacity-100 h-auto'
            }`}>
            Management & Settings
          </div>

          {/* Admin Portal - Only visible to users who are admins or made admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              title={collapsed ? "Admin Portal" : undefined}
              className={`w-full flex items-center transition-colors duration-200 cursor-pointer text-left rounded-xl overflow-hidden border-0 ${collapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-3.5'
                } ${currentView === 'admin'
                  ? 'bg-emerald-800 text-white font-black shadow-md'
                  : 'text-[#045627] hover:text-[#002b11] hover:bg-emerald-100/90 font-extrabold bg-transparent'
                }`}
            >
              <div className={`flex items-center gap-3.5 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
                <div className={`shrink-0 flex items-center justify-center ${currentView === 'admin' ? 'text-white' : 'text-[#045627]'
                  }`}>
                  <Shield className="w-6 h-6 shrink-0" />
                </div>
                <span className={`text-[15px] font-black tracking-tight truncate whitespace-nowrap flex-1 transition-all duration-300 ease-out ${currentView === 'admin' ? 'text-white' : 'text-[#045627]'
                  } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                  }`}>
                  Admin Portal
                </span>
              </div>
            </button>
          )}

          {/* Settings & Profile */}
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            title={collapsed ? "Settings & Profile" : undefined}
            className={`w-full flex items-center transition-colors duration-200 cursor-pointer text-left rounded-xl overflow-hidden border-0 ${collapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-3.5'
              } ${currentView === 'settings'
                ? 'bg-emerald-700 text-white font-black shadow-md'
                : 'text-[#045627] hover:text-[#002b11] hover:bg-emerald-100/90 font-extrabold bg-transparent'
              }`}
          >
            <div className={`flex items-center gap-3.5 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
              <div className={`shrink-0 flex items-center justify-center ${currentView === 'settings' ? 'text-white' : 'text-[#045627]'
                }`}>
                <Settings className="w-6 h-6 shrink-0" />
              </div>
              <span className={`text-[15px] font-black tracking-tight truncate whitespace-nowrap flex-1 transition-all duration-300 ease-out ${currentView === 'settings' ? 'text-white' : 'text-[#045627]'
                } ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                }`}>
                Settings & Profile
              </span>
            </div>
          </button>

          {/* Theme Toggle Button in collapsed mode */}
          {collapsed && onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-full flex items-center justify-center py-3 transition-all duration-200 cursor-pointer text-[#045627] hover:bg-emerald-100/90 font-bold rounded-xl overflow-hidden border-0 bg-transparent mt-1"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-[#045627]" />}
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
              title={collapsed ? "Sign Out" : undefined}
              className={`w-full flex items-center transition-colors duration-200 cursor-pointer text-left text-[#d70e35] hover:bg-rose-100/90 font-black rounded-xl mt-1 overflow-hidden border-0 bg-transparent ${collapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-3.5'
                }`}
            >
              <div className={`flex items-center gap-3.5 min-w-0 ${collapsed ? 'justify-center' : 'w-full'}`}>
                <div className="shrink-0 flex items-center justify-center text-[#d70e35]">
                  <LogOut className="w-6 h-6" />
                </div>
                <span className={`text-[15px] font-black tracking-tight truncate whitespace-nowrap flex-1 text-[#d70e35] transition-all duration-300 ease-out ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                  }`}>
                  Sign Out
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Bottom Sidebar Collapse Footer */}
        {isDesktop && setIsCollapsed && (
          <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${collapsed ? 'p-2' : 'p-3'
            }`}>
            <button
              type="button"
              onClick={toggleCollapse}
              className={`w-full py-3 rounded-xl text-white bg-[#115f1f] hover:bg-[#0d4a18] transition-colors cursor-pointer border border-emerald-800 shadow-2xs flex items-center min-w-0 overflow-hidden ${collapsed ? 'px-2 justify-center' : 'px-3.5 justify-between'
                }`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              id="aside_collapse_btn"
            >
              <span className={`text-sm font-black tracking-wide uppercase text-white whitespace-nowrap truncate transition-all duration-300 ease-out ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden' : 'opacity-100 w-auto'
                }`}>
                Collapse Sidebar
              </span>
              <div className="shrink-0 flex items-center justify-center text-white">
                {isCollapsed ? (
                  <PanelLeftOpen className="w-5.5 h-5.5 text-white" />
                ) : (
                  <PanelLeftClose className="w-5.5 h-5.5 text-white" />
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Permanent Desktop Aside Bar (Always displayed on desktop view xl+) */}
      <motion.aside
        id="desktop_floating_aside"
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden xl:flex fixed top-0 left-0 bottom-0 z-40 h-full bg-white border-r border-slate-200 shadow-md flex-col overflow-x-hidden"
      >
        {renderSidebarInner(true)}
      </motion.aside>

      {/* Mobile Backdrop overlay when drawer is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="xl:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Mobile / Tablet Drawer Menu (sliding from right when opened on screens < xl) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="mobile_aside_drawer"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="xl:hidden fixed top-0 right-0 bottom-0 z-50 h-full w-[300px] sm:w-[340px] bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {renderSidebarInner(false)}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Hamburger Button at Bottom Right on Mobile/Tablet */}
      <button
        id="aside_toggle_btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#006310] dark:bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 dark:hover:bg-emerald-500 flex items-center justify-center cursor-pointer border-2 border-white/20 dark:border-emerald-400/50 transition-all duration-250 hover:scale-108 active:scale-95"
        title={isOpen ? "Close Aside Navigation" : "Open Aside Navigation"}
        aria-label="Toggle Aside Navigation Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Menu className="w-6 h-6" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-emerald-600">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  );
}