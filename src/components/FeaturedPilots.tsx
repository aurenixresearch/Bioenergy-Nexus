import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Building, FlaskConical, CheckCircle2 } from 'lucide-react';

const PILOTS = [
  {
    id: 'mma-airport',
    type: 'Operational Pilot',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    location: 'Lagos, Nigeria',
    title: 'Murtala Muhammed Airport Biodigester',
    description:
      'Configured and optimized the daily feedstock loading and biochemical digestion parameters for localized aviation waste-to-energy conversion, providing clean, secondary electrical and gas backup.',
    achievements: [
      '100% locally managed bioenergy operational workflow.',
      'Capacity-building programs delivered to technical site engineers.',
      'Successful organic methane yield tuning in tropical conditions.',
    ],
    Icon: Building,
  },
  {
    id: 'lagos-audit',
    type: 'Analytical Case Study',
    badgeClass: 'bg-teal-100 text-teal-800',
    location: 'Metropolitan Lagos',
    title: 'Municipal Solid Waste Audit',
    description:
      'Conducted complete chemical assessment of metropolitan Lagos solid waste streams. Assessed biochemical vs thermochemical pathways to structure high-yield investment roadmaps for urban suburbs.',
    achievements: [
      'Published peer-reviewed chemical compositions of local feedstocks.',
      'Quantified exact carbon-offset metrics for regional green funds.',
      'Presented policy benchmarks directly to municipal waste bodies.',
    ],
    Icon: FlaskConical,
  },
];

export default function FeaturedPilots() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PILOTS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentPilot = PILOTS[activeIndex];
  const IconComponent = currentPilot.Icon;

  return (
    <section className="py-20 bg-slate-50 text-left" id="featured_pilots">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Proven Field Deployments
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Real-World Bioenergy Impact
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto px-2 sm:px-0">
            We don't just write papers. Our technical team works on-site at major high-traffic facilities and municipal centers to configure, audit, and optimize bioenergy reactors.
          </p>
        </div>

        {/* Desktop View: Two individual cards side-by-side (lg screen and above) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PILOTS.map((pilot) => {
            const Icon = pilot.Icon;
            return (
              <motion.div
                key={pilot.id}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-7 lg:p-8 border border-slate-200/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Icon className="w-32 h-32 text-emerald-900" />
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pilot.badgeClass}`}>
                      {pilot.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{pilot.location}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 font-display">{pilot.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pilot.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Project Achievements:</h4>
                    <ul className="space-y-2">
                      {pilot.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile/Tablet View: Single auto-rotating card container */}
        <div className="block lg:hidden max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPilot.id}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
                mass: 0.6,
                opacity: { duration: 0.25 }
              }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[380px]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <IconComponent className="w-32 h-32 text-emerald-900" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentPilot.badgeClass}`}>
                    {currentPilot.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{currentPilot.location}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 font-display">{currentPilot.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentPilot.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Project Achievements:</h4>
                  <ul className="space-y-2">
                    {currentPilot.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots navigation / active indicator */}
          <div className="flex justify-center items-center gap-2 mt-6" id="pilots_carousel_indicators">
            {PILOTS.map((pilot, idx) => (
              <button
                key={pilot.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'bg-emerald-600 w-8' : 'bg-slate-300 hover:bg-slate-400 w-2.5'
                }`}
                title={`Switch to ${pilot.title}`}
                aria-label={`Switch to ${pilot.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
