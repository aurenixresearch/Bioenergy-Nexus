import React, { useState } from 'react';
import { Menu, X, User, LogOut, ArrowRight, Sun, Moon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion } from 'motion/react';
import NotificationBell from './notifications/NotificationBell';

interface NavbarProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  currentView: any;
  setView: (view: any) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Navbar({ 
  user, 
  onSignIn, 
  onSignOut, 
  currentView, 
  setView,
  theme,
  onToggleTheme
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (sectionId === 'home' && user) {
      setView('dashboard');
    } else {
      setView(sectionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'About', id: 'about' },
    { label: 'Researchers', id: 'researchers' },
    { label: 'Research', id: 'research' },
    { label: 'Research Areas', id: 'research-areas' },
    { label: 'Insights', id: 'insights' },
    { label: 'Services', id: 'services' },
    { label: 'Collaborations', id: 'collaboration' },
    { label: 'Contact', id: 'contact' },
  ];

  const isNavActive = (id: string) => {
    if (id === 'home') {
      return currentView === 'home' || currentView === 'dashboard';
    }
    return currentView === id;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#42534D] text-white backdrop-blur-md border-b border-[#35433e] shadow-md" id="main_navbar">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* 1. LEFT — Logo / Brand */}
          <div className="flex items-center justify-start shrink-0 min-w-max">
            <button 
              onClick={() => { setView(user ? 'dashboard' : 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2 xl:gap-3 cursor-pointer text-left focus:outline-none group"
              id="brand_logo_btn"
            >
              <div className="p-1.5 xl:p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-xl shrink-0 shadow-xs group-hover:bg-emerald-900/60 transition-colors duration-200">
                <img 
                  src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                  alt="Aurenix Research Logo" 
                  referrerPolicy="no-referrer"
                  width="24"
                  height="24"
                  fetchPriority="high"
                  className="w-5 h-5 xl:w-6 xl:h-6 object-contain"
                />
              </div>
              <div className="whitespace-nowrap">
                <span className="block text-sm xl:text-base 2xl:text-lg font-display font-bold tracking-tight text-white leading-none">
                  Aurenix <span className="text-emerald-300">Research</span>
                </span>
                <span className="block text-[8px] xl:text-[9px] font-mono tracking-wider text-emerald-100/70 uppercase mt-0.5 xl:mt-1">
                  Research & Sustainability
                </span>
              </div>
            </button>
          </div>

          {/* 2. CENTER — Main Navigation (Desktop) */}
          {!user && (
            <div className="hidden xl:flex items-center justify-center flex-1 px-4 2xl:px-8 mx-auto min-w-0">
              <div 
                className="flex items-center justify-center gap-2 2xl:gap-4 bg-transparent p-0 max-w-full shrink-0"
                id="main_nav_buttons_container"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2 xl:px-2.5 2xl:px-3.5 py-1.5 rounded-lg text-xs 2xl:text-sm font-bold tracking-tight transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isNavActive(item.id)
                        ? 'text-emerald-300 bg-white/10'
                        : 'text-white/90 hover:text-emerald-300 hover:bg-white/5'
                    }`}
                    id={`nav_btn_${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. RIGHT — Theme Toggle + CTA (Desktop) */}
          <div className="hidden xl:flex items-center justify-end shrink-0 pl-4 2xl:pl-6 border-l border-white/20 my-auto">
            <div className="flex items-center gap-2.5 xl:gap-3 2xl:gap-4" id="navbar_controls_group">
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="p-1 bg-[#34423d]/90 hover:bg-[#2c3834] rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 border border-white/15 shrink-0"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  id="navbar_theme_toggle_desktop"
                >
                  <div className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${theme === 'light' ? 'bg-white text-amber-500 shadow-xs scale-105' : 'text-slate-300 hover:text-white'}`}>
                    <Sun className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </div>
                  <div className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 text-emerald-400 shadow-xs scale-105' : 'text-slate-300 hover:text-white'}`}>
                    <Moon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </div>
                </button>
              )}

              {user && (
                <NotificationBell user={user} setView={setView} theme={theme} />
              )}

              {user ? (
                <div className="flex items-center gap-2 xl:gap-3">
                  <div 
                    className="flex items-center gap-1.5 xl:gap-2 pl-2 pr-2.5 xl:pr-3 py-1 xl:py-1.5 bg-[#34423d] rounded-full border border-white/10 text-white"
                    title={user.email || ''}
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-6 h-6 xl:w-7 xl:h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 xl:w-7 xl:h-7 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-200 text-xs font-bold">
                        {user.displayName?.charAt(0) || <User className="w-3.5 h-3.5 xl:w-4 xl:h-4" />}
                      </div>
                    )}
                    <span className="text-[11px] xl:text-xs font-semibold text-slate-100 max-w-[80px] xl:max-w-[100px] truncate">
                      {user.displayName?.split(' ')[0] || 'Member'}
                    </span>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="p-1.5 xl:p-2 text-slate-300 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-colors duration-200 cursor-pointer"
                    title="Sign Out"
                    id="nav_logout_btn"
                  >
                    <LogOut className="w-4 h-4 xl:w-5 xl:h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onSignIn();
                  }}
                  className="flex items-center gap-1.5 xl:gap-2 px-3.5 xl:px-5 py-2 xl:py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-[0.99] rounded-full text-xs xl:text-sm font-bold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                  id="nav_signin_btn"
                >
                  <User className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-slate-950" />
                  <span>Start Documenting</span>
                  <ArrowRight className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-slate-950" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-2 xl:hidden">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1 bg-[#34423d]/90 hover:bg-[#2c3834] rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 border border-white/15 shrink-0"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                id="navbar_theme_toggle_mobile_bar"
              >
                <div className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${theme === 'light' ? 'bg-white text-amber-500 shadow-xs' : 'text-slate-300'}`}>
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 text-emerald-400 shadow-xs' : 'text-slate-300'}`}>
                  <Moon className="w-3.5 h-3.5" />
                </div>
              </button>
            )}
            {user && (
              <NotificationBell user={user} setView={setView} theme={theme} />
            )}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none transition-colors cursor-pointer"
              aria-label="Toggle Menu"
              id="mobile_menu_toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="xl:hidden border-t border-[#35433e] bg-[#42534D] text-white py-4 px-4 space-y-3 shadow-xl absolute w-full left-0 right-0 animate-in fade-in slide-in-from-top-2 duration-200" id="mobile_menu_dropdown">
          {!user && navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                isNavActive(item.id)
                  ? 'text-emerald-300 bg-white/15 border border-emerald-400/20'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
              id={`mobile_nav_btn_${item.id}`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="h-px bg-white/10 my-2"></div>

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-200 text-sm font-bold">
                    {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white">{user.displayName || 'Aurenix Member'}</div>
                  <div className="text-xs text-slate-300 max-w-[200px] truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); onSignOut(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-xl text-base font-semibold transition-colors cursor-pointer"
                id="mobile_logout_btn"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsOpen(false); onSignIn(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-base font-bold shadow-sm transition-colors cursor-pointer"
              id="mobile_signin_btn"
            >
              <User className="w-5 h-5 text-slate-950" />
              Start Documenting
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
