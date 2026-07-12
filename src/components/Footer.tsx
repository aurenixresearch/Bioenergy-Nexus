import React from 'react';
import { Leaf, Mail, Phone, Clock, MapPin, Linkedin, Twitter, Github } from 'lucide-react';
import { CONTACT_INFO } from '../data';
import { motion } from 'motion/react';

interface FooterProps {
  onNavClick: (sectionId: string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-16 pb-8 text-left" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top footer row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12">
          
          {/* Logo and About column */}
          <div className="md:col-span-5 space-y-5">
            <button 
              onClick={() => { onNavClick('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
            >
              <div className="p-2 bg-emerald-950 rounded-xl text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-display font-bold tracking-tight text-white leading-none">
                  Bioenergy <span className="text-emerald-400">Nexus</span>
                </span>
                <span className="block text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">
                  Research & Sustainability
                </span>
              </div>
            </button>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Bioenergy Nexus is Nigeria's specialized research and training hub dedicated to helping public utilities and private entities transition safely and profitably to biomass, biogas, and waste-to-energy technologies.
            </p>
          </div>

          {/* Quick Menu column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { label: 'Home', id: 'home' },
                { label: 'About Us', id: 'about' },
                { label: 'Services & Advisory', id: 'services' },
                { label: 'Research Repository', id: 'research' },
                { label: 'Collaboration Network', id: 'collaboration' },
                { label: 'Contact Us', id: 'contact' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavClick(link.id)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
              Nexus HQ & Contact
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-sans leading-relaxed">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-slate-300 hover:text-white transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-slate-300 hover:text-white transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-sans">{CONTACT_INFO.hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom row: Copyright and Socials */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} Bioenergy Nexus. Advancing Bioenergy Research and Environmental Sustainability. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4">
            <motion.a 
              href={CONTACT_INFO.socials.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border-0"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </motion.a>
            <motion.a 
              href={CONTACT_INFO.socials.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border-0"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </motion.a>
            <motion.a 
              href={CONTACT_INFO.socials.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border-0"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </motion.a>
          </div>
        </div>

      </div>
    </footer>
  );
}
