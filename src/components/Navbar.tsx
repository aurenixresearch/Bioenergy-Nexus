import React, { useState } from 'react';
import { Leaf, Menu, X, User, LogOut, BookOpen, LayoutDashboard, ArrowRight } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion } from 'motion/react';

interface NavbarProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  currentView: 'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact' | 'saved' | 'researchers';
  setView: (view: 'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact' | 'saved' | 'researchers') => void;
}

export default function Navbar({ 
  user, 
  onSignIn, 
  onSignOut, 
  currentView, 
  setView
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (sectionId: 'home' | 'about' | 'services' | 'research' | 'collaboration' | 'contact' | 'researchers') => {
    setIsOpen(false);
    setView(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Home', id: 'home' as const },
    { label: 'About', id: 'about' as const },
    { label: 'Researchers', id: 'researchers' as const },
    { label: 'Research', id: 'research' as const },
    { label: 'Services', id: 'services' as const },
    { label: 'Collaborations', id: 'collaboration' as const },
    { label: 'Contact', id: 'contact' as const },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs" id="main_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left Column: Logo and brand */}
          <div className="flex items-center justify-start shrink-0">
            <motion.button 
              onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-2 lg:gap-3 cursor-pointer text-left focus:outline-none"
              id="brand_logo_btn"
            >
              <div className="p-2 bg-emerald-50 rounded-xl shrink-0 shadow-xs">
                <img 
                  src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                  alt="Bioenergy Nexus Logo" 
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="whitespace-nowrap">
                <span className="block text-base lg:text-lg font-display font-bold tracking-tight text-slate-900 leading-none">
                  Bioenergy <span className="text-emerald-600">Nexus</span>
                </span>
                <span className="block text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-1">
                  Research & Sustainability
                </span>
              </div>
            </motion.button>
          </div>

          {/* 2. Center Column: Desktop Nav Items (Perfectly Centered & Spacious!) */}
          <div className="hidden md:flex items-center justify-center gap-1 lg:gap-2 xl:gap-3 flex-1 px-4">
            {!user && navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-2.5 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentView === item.id
                    ? 'text-emerald-600 bg-emerald-50/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
                id={`nav_btn_${item.id}`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* 3. Right Column: Auth CTA / User Details */}
          <div className="hidden md:flex items-center justify-end shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-100"
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
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Member'}
                  </span>
                </div>
                <motion.button
                  onClick={onSignOut}
                  whileHover={{ scale: 1.05, y: -0.5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                  title="Sign Out"
                  id="nav_logout_btn"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={onSignIn}
                whileHover={{ scale: 1.03, y: -0.5 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-xs lg:text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
                id="nav_signin_btn"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Start Documenting</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none transition-colors cursor-pointer"
              aria-label="Toggle Menu"
              id="mobile_menu_toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-3 shadow-lg absolute w-full left-0 right-0 animate-in fade-in slide-in-from-top-2 duration-200" id="mobile_menu_dropdown">
          {!user && navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                currentView === item.id
                  ? 'text-emerald-700 bg-emerald-50/75'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              id={`mobile_nav_btn_${item.id}`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="h-px bg-slate-100 my-2"></div>

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
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-bold">
                    {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.displayName || 'Bioenergy Member'}</div>
                  <div className="text-xs text-slate-500 max-w-[200px] truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); onSignOut(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-base font-semibold transition-colors cursor-pointer"
                id="mobile_logout_btn"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsOpen(false); onSignIn(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-base font-semibold shadow-sm transition-colors cursor-pointer"
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
