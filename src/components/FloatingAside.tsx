import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  HeartHandshake, 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Menu, 
  X,
  Leaf,
  Sparkles,
  User,
  Moon,
  Sun,
  LogOut,
  Settings,
  Shield,
  Home,
  Mail,
  Bookmark,
  Activity,
  MessageSquare
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToUnreadCount } from '../services/messagingDb';

interface FloatingAsideProps {
  user: FirebaseUser | null;
  userProfile?: any | null;
  currentView: any;
  setView: (view: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSignOut?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function FloatingAside({ 
  user, 
  userProfile,
  currentView, 
  setView,
  isCollapsed,
  setIsCollapsed,
  onSignOut,
  theme,
  onToggleTheme
}: FloatingAsideProps) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  React.useEffect(() => {
    console.log(`[REAL-TIME ROLE AUDIT] Sidebar role used for rendering: "${userProfile?.role}"`);
  }, [userProfile]);

  // Real-time listener for unread messages badge
  React.useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUnreadCount(user.uid, (total) => {
      setUnreadMessages(total);
    });
    return () => unsub();
  }, [user?.uid]);

  // If no user is logged in, do not render the floating aside
  if (!user) return null;

  // Flat list of navigation items
  const navItems = [
    { label: 'User Dashboard', id: 'dashboard' as const, icon: LayoutDashboard, desc: 'Manage your submissions' },
    { label: 'Messages', id: 'messages' as const, icon: MessageSquare, desc: 'Private scholar communications' },
    { label: 'My Public Profile', id: 'profile' as const, icon: User, desc: 'View and edit your portfolio' },
    { label: 'System Settings', id: 'settings' as const, icon: Settings, desc: 'Preferences and privacy' },
    { label: 'Explore Researchers', id: 'researchers' as const, icon: Users, desc: 'Discover experts across Africa' },
    { label: 'Research Hub', id: 'research' as const, icon: BookOpen, desc: 'Explore published research' },
    { label: 'Saved Studies', id: 'saved' as const, icon: Bookmark, desc: 'Your bookmarked research' },
    { label: 'Services', id: 'services' as const, icon: HeartHandshake, desc: 'Request specialized consulting' },
    { label: 'Collaborations', id: 'collaboration' as const, icon: Users, desc: 'Partner with global teams' },
    { label: 'Operational Console', id: 'console' as const, icon: Activity, desc: 'Manage workspaces & grants' },
    { label: 'About Us', id: 'about' as const, icon: Info, desc: 'Learn about our mission' },
    { label: 'Contact Us', id: 'contact' as const, icon: Mail, desc: 'Get in touch with our team' },
  ];

  const handleNav = (id: any) => {
    setView(id);
    setIsMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('nexus_sidebar_collapsed', String(newVal));
  };

  return (
    <>
      {/* 1. DESKTOP VIEW: COLLAPSIBLE SIDEBAR IN THE EXACT STYLE OF THE IMAGE */}
      <motion.aside
        animate={{ 
          width: isCollapsed ? '78px' : '260px',
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="hidden md:flex fixed left-4 top-4 bottom-4 z-40 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100 rounded-3xl flex-col justify-between overflow-hidden py-6"
        id="desktop_floating_aside"
      >
        {/* UPPER PORTION */}
        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar px-4">
          
          {/* Aside Header: Brand & Moon Toggle */}
          <div className={`flex items-center justify-between mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div 
                  key="expanded-header"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                      alt="Aurenix Research Logo" 
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-display font-black text-slate-900 tracking-tight leading-none">
                      Aurenix <span className="text-emerald-600">Research</span>
                    </span>
                    <span className="block text-[8px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                      research & collaboration hub
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="collapsed-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-emerald-50 rounded-xl"
                >
                  <img 
                    src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                    alt="Aurenix Research Logo" 
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!isCollapsed && onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-500' : ''}`}
                title="Toggle visual style mode"
                id="aside_theme_toggle"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* User Profile Info Card (Matching "Alex Miller" block) */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div 
                  key="user-box-expanded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-3 bg-slate-50 border border-slate-100/80 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                        {user.displayName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <div className="text-xs font-extrabold text-slate-800 truncate">
                        {user.displayName || 'Guest Researcher'}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {user.email || 'guest@aurenix-research.org'}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[8px] font-mono font-bold tracking-wider text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-md uppercase">
                    Free
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  key="user-box-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User" 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {user.displayName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Flat Navigation List (No sections/headers) */}
          <div className="space-y-1 flex-grow">
            {navItems.map((item) => {
              if (item.id === 'settings' || item.id === 'profile') return null;
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <div key={item.id} className="relative group/nav-item">
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50/80 font-bold shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id={`aside_btn_${item.id}`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover/nav-item:text-slate-700'}`} />
                    
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.id === 'messages' && unreadMessages > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-mono font-bold text-[9px] rounded-full shrink-0 shadow-xs ml-1">
                            {unreadMessages}
                          </span>
                        )}
                      </span>
                    )}

                    {isCollapsed && item.id === 'messages' && unreadMessages > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}

                    {/* Active Blue/Emerald line overlay */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full origin-center" />
                    )}
                  </button>

                  {/* Collapsed Tooltip on Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100 transition-all duration-150 z-50 whitespace-nowrap flex flex-col gap-0.5">
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {(user.uid === 'sandbox-admin-bola' || 
              user.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' || 
              user.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
              userProfile?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' || 
              userProfile?.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
              userProfile?.role?.toLowerCase() === 'admin' || 
              userProfile?.role?.toLowerCase() === 'super_admin') && (
              <div className="relative group/nav-item pt-2 border-t border-slate-100">
                <motion.button
                  onClick={() => handleNav('admin')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative ${
                    currentView === 'admin' 
                      ? 'text-emerald-700 bg-emerald-50/80 font-bold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="aside_btn_admin_portal"
                >
                  <Shield className={`w-4.5 h-4.5 shrink-0 transition-colors ${currentView === 'admin' ? 'text-emerald-600' : 'text-slate-400 group-hover/nav-item:text-slate-700'}`} />
                  
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      🛡️ Admin Portal
                    </motion.span>
                  )}

                  {currentView === 'admin' && (
                    <motion.div 
                      initial={{ opacity: 0, scaleY: 0.5 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full origin-center" 
                    />
                  )}
                </motion.button>

                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100 transition-all duration-150 z-50 whitespace-nowrap flex flex-col gap-0.5">
                    <span>🛡️ Admin Portal</span>
                    <span className="text-[10px] text-slate-400 font-normal">Manage Aurenix Research</span>
                  </div>
                )}
              </div>
            )}
          </div>



        </div>

        {/* BOTTOM PORTION: Settings / Sign out */}
        <div className="px-4 pt-4 border-t border-slate-100 space-y-2">
          
          {/* Decorative Settings bottom block matching reference image */}
          <div className="relative group/bottom-settings">
            <button
              onClick={() => handleNav('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                currentView === 'settings'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-4.5 h-4.5 transition-colors ${currentView === 'settings' ? 'text-emerald-600' : 'text-slate-400 group-hover/bottom-settings:text-slate-700'}`} />
              {!isCollapsed && (
                <span className="truncate">Settings & Profile</span>
              )}
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/bottom-settings:opacity-100 group-hover/bottom-settings:scale-100 transition-all duration-150 z-50 whitespace-nowrap">
                Settings & Profile
              </div>
            )}
          </div>

          {/* Sign Out block */}
          {onSignOut && (
            <div className="relative group/bottom-logout">
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-900 hover:bg-rose-50/60 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 text-rose-500 group-hover/bottom-logout:text-rose-700" />
                {!isCollapsed && (
                  <span className="truncate">Sign Out</span>
                )}
              </button>
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/bottom-logout:opacity-100 group-hover/bottom-logout:scale-100 transition-all duration-150 z-50 whitespace-nowrap">
                  Sign Out
                </div>
              )}
            </div>
          )}

          {/* Collapse/Expand Sidebar Trigger Row */}
          <div className="flex justify-center pt-2">
            <motion.button
              onClick={toggleCollapse}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(243, 244, 246, 1)' }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl transition-all cursor-pointer bg-slate-50 border border-slate-100 flex items-center justify-center"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              id="aside_toggle_btn"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </motion.button>
          </div>

        </div>
      </motion.aside>


      {/* 2. MOBILE VIEW: FLOATING TRIGGER AND OVERLAY DRAWER */}
      <div className="md:hidden">
        {/* Floating Toggle Button */}
        <motion.button
          onClick={() => setIsMobileOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center border border-emerald-600/50 cursor-pointer"
          title="Open Navigation Drawer"
          id="mobile_aside_trigger"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Drawer Slide-Over & Backdrop */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50"
                id="mobile_aside_backdrop"
              />

              {/* Slide-out Drawer Sheet */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col p-6"
                id="mobile_aside_drawer"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                        alt="Aurenix Research Logo" 
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <span className="block text-lg font-display font-extrabold text-slate-900 leading-none">
                        Aurenix <span className="text-emerald-600">Research</span>
                      </span>
                      <span className="block text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
                        Sustainability Menu
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onToggleTheme && (
                      <motion.button
                        onClick={onToggleTheme}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 cursor-pointer"
                        id="mobile_aside_theme_toggle"
                      >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-emerald-500" /> : <Moon className="w-5 h-5" />}
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => setIsMobileOpen(false)}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 cursor-pointer"
                      id="mobile_aside_close"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Subtitle / User Card */}
                <div className="my-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-9 h-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {user.displayName || 'Guest Researcher'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Collaborator Panel
                    </div>
                  </div>
                </div>

                {/* Flat Nav Links List (No sections/headers) */}
                <div className="flex-grow space-y-1 overflow-y-auto py-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left relative ${
                          isActive 
                            ? 'text-emerald-700 bg-emerald-50 shadow-inner' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                        id={`mobile_aside_btn_${item.id}`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="block">{item.label}</span>
                            {item.id === 'messages' && unreadMessages > 0 && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold text-xs rounded-full shrink-0 shadow-xs ml-2">
                                {unreadMessages}
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                            {item.desc}
                          </span>
                        </div>

                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                        )}
                      </button>
                    );
                  })}

                  {(user.uid === 'sandbox-admin-bola' || 
                    user.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' || 
                    user.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
                    userProfile?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' || 
                    userProfile?.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
                    userProfile?.role?.toLowerCase() === 'admin' || 
                    userProfile?.role?.toLowerCase() === 'super_admin') && (
                    <button
                      onClick={() => handleNav('admin')}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left relative ${
                        currentView === 'admin' 
                          ? 'text-emerald-700 bg-emerald-50 shadow-inner' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      id="mobile_aside_btn_admin"
                    >
                      <Shield className={`w-5 h-5 ${currentView === 'admin' ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <div>
                        <span className="block">🛡️ Admin Portal</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          Manage Aurenix Research
                        </span>
                      </div>

                      {currentView === 'admin' && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                      )}
                    </button>
                  )}
                </div>

                {/* Mobile Sign Out button */}
                {onSignOut && (
                  <div className="pt-2 pb-4">
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/60 transition-all duration-200 cursor-pointer"
                    >
                      <LogOut className="w-5 h-5 text-rose-500" />
                      <div>
                        <span className="block">Sign Out</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          Securely end your session
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
                  AURENIX RESEARCH v1.2 • SECURE SESSION
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
