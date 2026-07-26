import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MousePointer } from 'lucide-react';

export const TrustedLeadersBanner: React.FC = () => {
  const scrollToTestimonials = () => {
    const el = document.getElementById('endorsements');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-left">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-slate-200/80 shadow-xs p-6 sm:p-10 lg:p-14 relative overflow-hidden min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
        
        {/* Subtle Background Vertical Grid Columns & Ghost Cards */}
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-9 md:grid-cols-11 divide-x divide-slate-100/80 pointer-events-none z-0">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="h-full flex flex-col items-center pt-3 sm:pt-4">
              <div className="w-[85%] h-14 sm:h-20 bg-slate-100/40 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Gallery Arch Overlay - Desktop & Tablet Layout */}
        <div className="relative z-10 w-full max-w-6xl mx-auto pt-2 pb-6">
          
          {/* Top/Side Floating Avatar Cards Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-3 sm:gap-4 items-start mb-6 sm:mb-10 opacity-95">
            
            {/* Column 1 - Far Left */}
            <div className="space-y-3 hidden sm:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5 }
                }}
                whileHover={{ scale: 1.05, y: -8, rotate: -1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  width="300"
                  height="375"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -8, rotate: 1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 2 - Mid Left Outer */}
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.05, y: -8, rotate: -1.5 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -8, rotate: 1.5 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 3 - Mid Left Inner */}
            <div className="pt-4 sm:pt-8 hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -7, 0] }}
                transition={{
                  y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.06, y: -8, rotate: -1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 4 - Top Left Arch Center */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.06, y: -8, rotate: 1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 5 - Center Apex */}
            <div className="hidden lg:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -9, 0] }}
                transition={{
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.08, y: -10 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 6 - Top Right Arch Center */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.06, y: -8, rotate: -1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 7 - Mid Right Inner */}
            <div className="pt-4 sm:pt-8 hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -7, 0] }}
                transition={{
                  y: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.06, y: -8, rotate: 1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Column 8 - Mid Right Outer with Tilt & Mouse Pointer */}
            <div className="space-y-3 relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.05, y: -8, rotate: -1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
              {/* Tilted Card with Cursor Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.08, rotate: 0, y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-white/80 relative cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <motion.div
                  animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-3 right-3 z-20 pointer-events-none"
                >
                  <MousePointer className="w-5 h-5 text-slate-900 fill-slate-900 drop-shadow-md" />
                </motion.div>
              </motion.div>
            </div>

            {/* Column 9 - Far Right */}
            <div className="space-y-3 hidden sm:block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                  opacity: { duration: 0.5 },
                }}
                whileHover={{ scale: 1.05, y: -8, rotate: 1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -8, rotate: -1 }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            </div>

          </div>

          {/* Center Main Text Content */}
          <div className="text-center max-w-2xl mx-auto space-y-4 pt-4 sm:pt-6 pb-2">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center px-4 py-1.5 bg-slate-100/90 text-slate-700 rounded-full text-xs font-semibold tracking-wide border border-slate-200/80 shadow-2xs mx-auto">
              Testimonials
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Trusted by leaders<br />
              <span className="text-slate-400 font-normal">from various industries</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
              Learn why professionals trust our solutions to complete their customer journeys.
            </p>

            {/* Call to Action Button */}
            <div className="pt-2">
              <button
                onClick={scrollToTestimonials}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Read Success Stories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
