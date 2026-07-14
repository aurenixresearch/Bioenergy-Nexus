import React from 'react';
import { ArrowRight, BookOpen, FileText, Globe, Shield, Sparkles, Leaf } from 'lucide-react';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-xs font-semibold text-emerald-800 uppercase tracking-wider mx-auto lg:mx-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Empowering Africa's Energy Future
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-none">
              Advancing Clean Energy <br className="hidden sm:inline" />
              Through <span className="text-emerald-600 relative inline-block">
                Rigorous Research
                <span className="absolute left-0 bottom-1.5 w-full h-1 bg-emerald-100 -z-10 rounded-full"></span>
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed mx-auto lg:mx-0">
              Aurenix Research is Nigeria’s research, training, and consulting hub dedicated to accelerating waste-to-energy technologies and circular economy principles. We equip scientists, developers, and governments with verified environmental studies and sustainable feasibility insights.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                onClick={onExploreResearch}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-sm sm:text-base"
                id="hero_explore_btn"
              >
                <BookOpen className="w-4 h-4 sm:w-5 h-5" />
                Explore Research Hub
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                onClick={onRequestConsulting}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-white text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-sm sm:text-base"
                id="hero_consult_btn"
              >
                <FileText className="w-4 h-4 sm:w-5 h-5 text-slate-500" />
                Request Feasibility Review
              </motion.button>
            </div>

            {/* Trust Metrics / Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900 font-display">4+</span>
                <span className="block text-xs font-medium text-slate-500">Core Areas of Service</span>
              </div>
              <div className="border-x border-slate-200 px-4">
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900 font-display whitespace-nowrap">3 Months</span>
                <span className="block text-xs font-medium text-slate-500">Typical Project Cycle</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-slate-900 font-display">Pan</span>
                <span className="block text-xs font-medium text-slate-500">African Focus & Reach</span>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative" id="hero_graphic_container">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Main Glowing Leaf Card */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative p-6 sm:p-8 bg-white rounded-3xl shadow-xl z-10 overflow-hidden group hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Visual energy recycling circle */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto flex items-center justify-center mb-6">
                  {/* Rotating dashed ring */}
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_40s_linear_infinite]"></div>
                  {/* Solid accent circles */}
                  <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center"></div>
                  <div className="absolute inset-8 bg-white rounded-full shadow-md flex items-center justify-center p-3">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                      alt="Aurenix Research Icon Logo" 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-contain animate-pulse"
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
              </motion.div>

              {/* Decorative side badge (floating) */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.03 }}
                className="absolute -bottom-6 -left-6 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-lg z-20 flex items-center gap-3 max-w-[210px] sm:max-w-xs transition-transform"
              >
                <div className="p-2 bg-emerald-600 rounded-xl text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-100">Base in Nigeria</span>
                  <span className="block text-[10px] font-mono text-slate-400">Lagos HQ • Global Scope</span>
                </div>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Collaborating & Research Institutions (Social Proof Trust Bar) */}
        <div className="mt-20 pt-10 border-t border-slate-200/50">
          <p className="text-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
            Trusted Technical Partner & Aligned with Leading Clean Energy Authorities
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-slate-700 text-sm tracking-tight">FAAN NIGERIA</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-slate-700 text-sm tracking-tight">IEA BIOMASS</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-slate-700 text-sm tracking-tight">UNIVERSITY OF LAGOS</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-slate-700 text-sm tracking-tight">LAWMA CLEANUP</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-slate-700 text-sm tracking-tight">ECOWAS BIOENERGY</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
