import React from 'react';
import { ArrowRight, BookOpen, FileText, Globe, Shield, Sparkles, Leaf, User } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreResearch: () => void;
  onRequestConsulting: () => void;
  onSignIn: () => void;
  user: any;
}

export default function Hero({ onExploreResearch, onRequestConsulting, onSignIn, user }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24" id="hero">
      {/* Decorative background grid and organic glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
      
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-60 -left-40 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-40"></div>

      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider mx-auto lg:mx-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Empowering Africa's Energy Future</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-none">
              Advancing Clean Energy <br className="hidden sm:inline" />
              Through <span className="text-emerald-600 relative inline-block">
                Rigorous Research
                <span className="absolute left-0 bottom-1.5 w-full h-1 bg-emerald-100 -z-10 rounded-full"></span>
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-sm sm:text-lg text-slate-600 leading-relaxed mx-auto lg:mx-0">
              Aurenix Research is Nigeria’s research, training, and consulting hub dedicated to accelerating waste-to-energy technologies and circular economy principles. We equip scientists, developers, and governments with verified environmental studies and sustainable feasibility insights.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={user ? onExploreResearch : onSignIn}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99] rounded-xl font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer text-xs sm:text-base"
                id="hero_start_documenting_btn"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Start Documenting</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              
              <button
                onClick={onExploreResearch}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-white text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/50 active:scale-[0.99] rounded-xl font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer text-xs sm:text-base border border-slate-200/80"
                id="hero_explore_btn"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 shrink-0" />
                <span>Explore Research Hub</span>
              </button>
            </div>

            {/* Trust Metrics / Badges */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display">4+</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500">Core Areas of Service</span>
              </div>
              <div className="border-x border-slate-200 px-1.5 sm:px-4 py-0 text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display whitespace-nowrap">3 Months</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500">Typical Project Cycle</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display">Pan</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500">African Focus & Reach</span>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative" id="hero_graphic_container">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Main Glowing Leaf Card */}
              <div className="relative p-6 sm:p-8 bg-white rounded-3xl shadow-lg z-10 overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Visual energy recycling circle */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto flex items-center justify-center mb-6">
                  {/* Rotating dashed ring */}
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_40s_linear_infinite]"></div>
                  {/* Solid accent circles */}
                  <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center"></div>
                  <div className="absolute inset-8 bg-white rounded-full shadow-xs flex items-center justify-center p-3">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                      alt="Aurenix Research Icon Logo" 
                      referrerPolicy="no-referrer"
                      width="56"
                      height="56"
                      fetchPriority="high"
                      className="w-14 h-14 object-contain opacity-90"
                    />
                  </div>
                </div>

                {/* Status indicator badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800">Verified Technical Studies</div>
                      <div className="text-[10px] font-mono text-slate-400">100% Local Research Standards</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800">Waste-to-Energy Advocacy</div>
                      <div className="text-[10px] font-mono text-slate-400">Zero Emission Acceleration</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative side badge */}
              <div className="absolute -bottom-6 left-0 sm:-left-6 bg-slate-950 text-white px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-md z-20 flex items-center gap-3 max-w-[210px] sm:max-w-xs transition-transform duration-200 hover:-translate-y-0.5">
                <div className="p-2 bg-emerald-600 rounded-xl text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-100">Base in Nigeria</span>
                  <span className="block text-[10px] font-mono text-slate-400">Lagos HQ • Global Scope</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Collaborating & Research Institutions (Social Proof Trust Bar) */}
      <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 overflow-hidden w-full px-0">
        <p className="text-center text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-2 px-4 sm:px-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="hidden sm:inline">Trusted Technical Partner & Aligned with Leading African Institutions</span>
          <span className="sm:hidden">Aligned with Leading African Institutions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        </p>
        <div className="relative w-full overflow-hidden py-3 lg:[mask-image:_linear-gradient(to_right,transparent_0,_black_80px,_black_calc(100%-80px),transparent_100%)]">
            <div className="animate-marquee flex items-center gap-5 py-2 cursor-pointer">
              {/* Set 1 */}
              <div className="flex items-center gap-5 shrink-0">
                {[
                  { name: 'UNIVERSITY OF CAPE TOWN', tag: 'UCT', location: 'South Africa', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-500' },
                  { name: 'MAKERERE UNIVERSITY', tag: 'MAK', location: 'Uganda', bg: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/80 dark:text-sky-300', dot: 'bg-sky-500' },
                  { name: 'KNUST GHANA', tag: 'KNUST', location: 'Ghana', bg: 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/80 dark:text-amber-300', dot: 'bg-amber-500' },
                  { name: 'UNIVERSITY OF LAGOS', tag: 'UNILAG', location: 'Nigeria', bg: 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/80 dark:text-teal-300', dot: 'bg-teal-500' },
                  { name: 'STELLENBOSCH UNIVERSITY', tag: 'SUN', location: 'South Africa', bg: 'border-indigo-200 bg-indigo-50/70 text-indigo-800 dark:border-indigo-800/80 dark:bg-indigo-950/80 dark:text-indigo-300', dot: 'bg-indigo-500' },
                  { name: 'CAIRO UNIVERSITY', tag: 'CU', location: 'Egypt', bg: 'border-cyan-200 bg-cyan-50/70 text-cyan-800 dark:border-cyan-800/80 dark:bg-cyan-950/80 dark:text-cyan-300', dot: 'bg-cyan-500' },
                  { name: 'UNIVERSITY OF NAIROBI', tag: 'UoN', location: 'Kenya', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-500' },
                  { name: 'UNIVERSITY OF IBADAN', tag: 'UI', location: 'Nigeria', bg: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-800/80 dark:bg-violet-950/80 dark:text-violet-300', dot: 'bg-violet-500' },
                  { name: 'AFRICAN DEVELOPMENT BANK', tag: 'AfDB', location: 'Multilateral', bg: 'border-blue-200 bg-blue-50/70 text-blue-800 dark:border-blue-800/80 dark:bg-blue-950/80 dark:text-blue-300', dot: 'bg-blue-600' },
                  { name: 'ECOWAS ECREEE', tag: 'ECREEE', location: 'West Africa', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-600' },
                  { name: 'AUDA-NEPAD', tag: 'NEPAD', location: 'Pan-African', bg: 'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-800/80 dark:bg-rose-950/80 dark:text-rose-300', dot: 'bg-rose-500' },
                  { name: 'IEA BIOMASS', tag: 'IEA', location: 'Global', bg: 'border-lime-200 bg-lime-50/70 text-lime-900 dark:border-lime-800/80 dark:bg-lime-950/80 dark:text-lime-300', dot: 'bg-lime-600' },
                  { name: 'FAAN NIGERIA', tag: 'FAAN', location: 'Aviation', bg: 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/80 dark:text-teal-300', dot: 'bg-teal-500' },
                ].map((item, idx) => (
                  <div key={`set1-${idx}`} className="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/80 hover:shadow-md transition-all shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                    <span className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.bg} whitespace-nowrap`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Set 2 (Duplicate for Seamless Infinite Loop) */}
              <div className="flex items-center gap-5 shrink-0">
                {[
                  { name: 'UNIVERSITY OF CAPE TOWN', tag: 'UCT', location: 'South Africa', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-500' },
                  { name: 'MAKERERE UNIVERSITY', tag: 'MAK', location: 'Uganda', bg: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/80 dark:text-sky-300', dot: 'bg-sky-500' },
                  { name: 'KNUST GHANA', tag: 'KNUST', location: 'Ghana', bg: 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/80 dark:text-amber-300', dot: 'bg-amber-500' },
                  { name: 'UNIVERSITY OF LAGOS', tag: 'UNILAG', location: 'Nigeria', bg: 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/80 dark:text-teal-300', dot: 'bg-teal-500' },
                  { name: 'STELLENBOSCH UNIVERSITY', tag: 'SUN', location: 'South Africa', bg: 'border-indigo-200 bg-indigo-50/70 text-indigo-800 dark:border-indigo-800/80 dark:bg-indigo-950/80 dark:text-indigo-300', dot: 'bg-indigo-500' },
                  { name: 'CAIRO UNIVERSITY', tag: 'CU', location: 'Egypt', bg: 'border-cyan-200 bg-cyan-50/70 text-cyan-800 dark:border-cyan-800/80 dark:bg-cyan-950/80 dark:text-cyan-300', dot: 'bg-cyan-500' },
                  { name: 'UNIVERSITY OF NAIROBI', tag: 'UoN', location: 'Kenya', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-500' },
                  { name: 'UNIVERSITY OF IBADAN', tag: 'UI', location: 'Nigeria', bg: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-800/80 dark:bg-violet-950/80 dark:text-violet-300', dot: 'bg-violet-500' },
                  { name: 'AFRICAN DEVELOPMENT BANK', tag: 'AfDB', location: 'Multilateral', bg: 'border-blue-200 bg-blue-50/70 text-blue-800 dark:border-blue-800/80 dark:bg-blue-950/80 dark:text-blue-300', dot: 'bg-blue-600' },
                  { name: 'ECOWAS ECREEE', tag: 'ECREEE', location: 'West Africa', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300', dot: 'bg-emerald-600' },
                  { name: 'AUDA-NEPAD', tag: 'NEPAD', location: 'Pan-African', bg: 'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-800/80 dark:bg-rose-950/80 dark:text-rose-300', dot: 'bg-rose-500' },
                  { name: 'IEA BIOMASS', tag: 'IEA', location: 'Global', bg: 'border-lime-200 bg-lime-50/70 text-lime-900 dark:border-lime-800/80 dark:bg-lime-950/80 dark:text-lime-300', dot: 'bg-lime-600' },
                  { name: 'FAAN NIGERIA', tag: 'FAAN', location: 'Aviation', bg: 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/80 dark:text-teal-300', dot: 'bg-teal-500' },
                ].map((item, idx) => (
                  <div key={`set2-${idx}`} className="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/80 hover:shadow-md transition-all shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                    <span className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.bg} whitespace-nowrap`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
