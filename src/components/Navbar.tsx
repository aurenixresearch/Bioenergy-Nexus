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
  ];

  const isNavActive = (id: string) => {
    if (id === 'home') {
      return currentView === 'home' || currentView === 'dashboard';
    }
    return currentView === id;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs" id="main_navbar">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* 1. LEFT — Logo / Brand */}
          <div className="flex items-center justify-start shrink-0 min-w-0 sm:min-w-[200px]">
            <button 
              onClick={() => { setView(user ? 'dashboard' : 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2 lg:gap-3 cursor-pointer text-left focus:outline-none group"
              id="brand_logo_btn"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl shrink-0 shadow-xs group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-900/80 transition-colors duration-200">
                <img 
                  src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                  alt="Aurenix Research Logo" 
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="whitespace-nowrap">
                <span className="block text-base lg:text-lg font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  Aurenix <span className="text-emerald-600 dark:text-emerald-400">Research</span>
                </span>
                <span className="block text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-1">
                  Research & Sustainability
                </span>
              </div>
            </button>
          </div>

          {/* 2. CENTER — Main Navigation */}
          {!user && (
            <div className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 flex-1 px-2 mx-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    isNavActive(item.id)
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                  }`}
                  id={`nav_btn_${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* 3. RIGHT — Theme Toggle + CTA */}
          <div className="hidden lg:flex items-center justify-end shrink-0 gap-3 sm:min-w-[200px]">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                id="navbar_theme_toggle_desktop"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-emerald-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            )}

            {user && (
              <NotificationBell user={user} setView={setView} theme={theme} />
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800"
                  title={user.email || ''}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Member'}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors duration-200 cursor-pointer"
                  title="Sign Out"
                  id="nav_logout_btn"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSignIn();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] rounded-full text-xs xl:text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                id="nav_signin_btn"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Start Documenting</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors duration-200 cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                id="navbar_theme_toggle_mobile_bar"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-emerald-400" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            {user && (
              <NotificationBell user={user} setView={setView} theme={theme} />
            )}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 focus:outline-none transition-colors cursor-pointer"
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
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-4 space-y-3 shadow-lg absolute w-full left-0 right-0 animate-in fade-in slide-in-from-top-2 duration-200" id="mobile_menu_dropdown">
          {!user && navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                isNavActive(item.id)
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/75 dark:bg-emerald-950/75'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
              id={`mobile_nav_btn_${item.id}`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

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
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                    {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.displayName || 'Aurenix Member'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); onSignOut(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-base font-semibold transition-colors cursor-pointer"
                id="mobile_logout_btn"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsOpen(false); onSignIn(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-base font-semibold shadow-sm transition-colors cursor-pointer"
              id="mobile_signin_btn"
            >
              <User className="w-5 h-5" />
              Start Documenting
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
