import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, MousePointer } from 'lucide-react';

export const TrustedLeadersBanner: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToTestimonials = () => {
    const el = document.getElementById('endorsements');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation parameters
  const disableFloat = shouldReduceMotion || isMobile;

  const cardHover = shouldReduceMotion ? {} : {
    scale: 1.04,
    y: -4,
    boxShadow: "0 12px 24px -6px rgba(16, 185, 129, 0.18)",
    transition: { duration: 0.25, ease: "easeOut" }
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-left">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-slate-200/80 shadow-xs p-6 sm:p-10 lg:p-14 relative overflow-hidden min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
        
        {/* Animated Ambient Background Blobs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />
        <div className="absolute -bottom-24 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-7000" />

        {/* Subtle Background Vertical Grid Columns & Ghost Cards */}
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-9 md:grid-cols-11 divide-x divide-slate-100/80 pointer-events-none z-0">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="h-full flex flex-col items-center pt-3 sm:pt-4">
              <div className="w-[85%] h-14 sm:h-20 bg-slate-100/50 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Gallery Arch Overlay - Desktop & Tablet Layout */}
        <div className="relative z-10 w-full max-w-6xl mx-auto pt-2 pb-6">
          
          {/* Top/Side Floating Avatar Cards Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-3 sm:gap-4 items-start mb-6 sm:mb-10 opacity-100">
            
            {/* Column 1 - Far Left */}
            <div className="space-y-3 hidden sm:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.05, ease: "easeOut" },
                  y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  width="300"
                  height="375"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -5, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.1, ease: "easeOut" },
                  y: { duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  width="300"
                  height="375"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 2 - Mid Left Outer */}
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -7, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.15, ease: "easeOut" },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  width="300"
                  height="375"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -5, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.2, ease: "easeOut" },
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  width="300"
                  height="375"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 3 - Mid Left Inner */}
            <div className="pt-4 sm:pt-8 hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.25, ease: "easeOut" },
                  y: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 4 - Top Left Arch Center */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.3, ease: "easeOut" },
                  y: { duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 5 - Center Apex */}
            <div className="hidden lg:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -8, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.35, ease: "easeOut" },
                  y: { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 6 - Top Right Arch Center */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.4, ease: "easeOut" },
                  y: { duration: 5.9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 7 - Mid Right Inner */}
            <div className="pt-4 sm:pt-8 hidden md:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -5, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.45, ease: "easeOut" },
                  y: { duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 8 - Mid Right Outer with Tilt & Mouse Pointer */}
            <div className="space-y-3 relative">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -5, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.5, ease: "easeOut" },
                  y: { duration: 6.1, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
              {/* Tilted Card with Cursor Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, rotate: 3 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, scale: 1, rotate: 3 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.55, ease: "easeOut" },
                  y: { duration: 5.3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05, rotate: 0, y: -4, boxShadow: "0 12px 24px -6px rgba(16, 185, 129, 0.18)" }}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-white/80 relative cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <motion.div
                  animate={disableFloat ? {} : { x: [0, 4, 0], y: [0, -4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none p-1 bg-white/90 rounded-full shadow-md"
                >
                  <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 fill-emerald-600 drop-shadow-md" />
                </motion.div>
              </motion.div>
            </div>

            {/* Column 9 - Far Right */}
            <div className="space-y-3 hidden sm:block">
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -6, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.6, ease: "easeOut" },
                  y: { duration: 5.7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                animate={disableFloat ? { opacity: 1, y: 0 } : { y: [0, -5, 0] }}
                transition={{
                  initial: { duration: 0.6, delay: 0.65, ease: "easeOut" },
                  y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                }}
                whileHover={cardHover}
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xs border border-white/80 cursor-pointer group transition-shadow duration-300"
              >
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" 
                  alt="Leader" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </div>

          </div>

          {/* Center Main Text Content */}
          <div className="text-center max-w-2xl mx-auto space-y-4 pt-4 sm:pt-6 pb-2">
            
            {/* Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="inline-flex items-center px-4 py-1.5 bg-slate-100/90 text-slate-700 rounded-full text-xs font-semibold tracking-wide border border-slate-200/80 shadow-2xs mx-auto"
            >
              Testimonials
            </motion.div>

            {/* Main Headline */}
            <motion.h2 
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.15]"
            >
              Trusted by leaders<br />
              <span className="text-slate-400 font-normal">from various industries</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-xs sm:text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto leading-relaxed"
            >
              Learn why professionals trust our solutions to complete their customer journeys.
            </motion.p>

            {/* Call to Action Button */}
            <motion.div 
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="pt-2"
            >
              <motion.button
                onClick={scrollToTestimonials}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Read Success Stories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};

