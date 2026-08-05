import React, { useState } from 'react';
import { Mail, Clock, Linkedin, Instagram, MessageSquare, Bug } from 'lucide-react';
import { CONTACT_INFO } from '../data';
import FeedbackModal from './FeedbackModal';

interface FooterProps {
  onNavClick: (sectionId: string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-200 pt-10 sm:pt-16 pb-6 sm:pb-8 text-left" id="footer">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Top footer row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-10 pb-8 sm:pb-12 border-b border-slate-800/80">
          
          {/* Logo and About column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3.5 sm:space-y-5">
            <button 
              onClick={() => { onNavClick('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none group"
            >
              <div className="p-2 bg-emerald-950 rounded-xl border border-emerald-800/40 group-hover:border-emerald-600 transition-colors">
                <img 
                  src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                  alt="Aurenix Research Logo" 
                  referrerPolicy="no-referrer"
                  width="20"
                  height="20"
                  loading="lazy"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-display font-bold tracking-tight text-white leading-none">
                  Aurenix <span className="text-emerald-400">Research</span>
                </span>
                <span className="block text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">
                  Research & Sustainability
                </span>
              </div>
            </button>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Aurenix Research is a research and innovation hub connecting African expertise, energy and climate solutions, and global collaboration to drive sustainable impact.
            </p>
          </div>

          {/* Quick Menu column */}
          <div className="sm:col-span-1 md:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-2 text-xs sm:text-sm">
              {[
                { label: 'Home', id: 'home' },
                { label: 'About Us', id: 'about' },
                { label: 'Research Areas', id: 'research-areas' },
                { label: 'Insights Hub', id: 'insights' },
                { label: 'Research Repository', id: 'research' },
                { label: 'Endorsements & Testimonials', id: 'endorsements' },
                { label: 'Services & Advisory', id: 'services' },
                { label: 'Collaboration Network', id: 'collaboration' },
                { label: 'Contact Us', id: 'contact' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavClick(link.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left py-0.5 sm:py-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Center column */}
          <div className="sm:col-span-1 md:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { label: 'Terms and Conditions', id: 'legal/terms' },
                { label: 'Privacy Policy', id: 'legal/privacy' },
                { label: 'Cookie Policy', id: 'legal/cookies' },
                { label: 'Community Guidelines', id: 'legal/community-guidelines' },
                { label: 'Research Ethics Policy', id: 'legal/research-ethics' },
                { label: 'Intellectual Property Policy', id: 'legal/intellectual-property' },
                { label: 'Disclaimer Notice', id: 'legal/disclaimer' },
                { label: 'Help Center', id: 'legal/help' },
                { label: 'Contact Legal Team', id: 'legal/contact' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavClick(link.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left py-0.5 sm:py-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details column */}
          <div className="sm:col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Contact
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-slate-300 hover:text-emerald-400 transition-colors truncate">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-sans text-xs">{CONTACT_INFO.hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Feedback & Bug Report Card */}
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800/90 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-xs">
          <div className="flex items-start sm:items-center gap-4 text-left">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0 mt-0.5 sm:mt-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base sm:text-lg font-bold font-display text-white">
                  Send Private Feedback or Report a Bug
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Help us refine Aurenix Research. Share your feature ideas, UI/UX impressions, or report technical bugs directly to our research and engineering team.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shrink-0 shadow-md hover:shadow-emerald-950/40"
          >
            <Bug className="w-4 h-4" />
            <span>Send Feedback / Bug Report</span>
          </button>
        </div>

        {/* Bottom row: Copyright and Socials */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-6 pt-0">
          <p className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left leading-relaxed">
            © {new Date().getFullYear()} Aurenix Research. Advancing Bioenergy Research and Environmental Sustainability. All Rights Reserved.
          </p>

          <div className="flex items-center gap-3">
            <a 
              href={CONTACT_INFO.socials.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-all duration-200 border border-slate-800/60"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href={CONTACT_INFO.socials.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-all duration-200 border border-slate-800/60"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href={CONTACT_INFO.socials.tiktok} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-all duration-200 border border-slate-800/60 flex items-center justify-center"
              title="TikTok"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.28 0 .54.04.79.1V9.41a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 1 0 6.34 6.34V9.25a8.16 8.16 0 0 0 4.77 1.52A8.13 8.13 0 0 0 21 10.66v-3.41a4.86 4.86 0 0 1-1.41-.56z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </footer>
  );
}
