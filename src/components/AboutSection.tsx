import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Activity, 
  Milestone, 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  Workflow, 
  Settings, 
  FileText,
  Clock
} from 'lucide-react';
import { FOUNDER_INFO } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  description: string;
  keyProjects: string[];
  metric: { value: string; label: string };
  color: string;
}

export default function AboutSection() {
  const [activePillar, setActivePillar] = useState<string>('research');

  const pillars: Pillar[] = [
    {
      id: 'research',
      title: 'Empirical Research',
      subtitle: 'Scientific Foundation',
      icon: BookOpen,
      description: 'Our core research focuses on optimization of anaerobic digestion biochemistry, analyzing indigenous biomass profiles, and compiling local organic waste datasets across Nigerian urban centers.',
      keyProjects: [
        'Decentralized agricultural residue cataloging',
        'Co-digestion ratio optimization studies',
        'Thermal conversion efficiency calculations'
      ],
      metric: { value: '100%', label: 'Peer-reviewed precision' },
      color: 'emerald'
    },
    {
      id: 'engineering',
      title: 'Engineering Feasibility',
      subtitle: 'Operational Design',
      icon: Settings,
      description: 'Translating biological concepts into robust physical assets. We design localized anaerobic digesters, model piping layouts, formulate safety valve criteria, and conduct municipal-scale feed waste audits.',
      keyProjects: [
        'MMA Airport waste biodigester design',
        'Decentralized gas distribution modeling',
        'Safety relief and flame arrestor validation'
      ],
      metric: { value: '1:1', label: 'Field-to-model ratio' },
      color: 'teal'
    },
    {
      id: 'training',
      title: 'Capacity Training',
      subtitle: 'Institutional Empowerment',
      icon: GraduationCap,
      description: 'We host interactive workshops, safety drills, and specialized renewable modules for key state institutions, corporate teams, and academic research departments to cultivate local energy sovereignty.',
      keyProjects: [
        'National renewability training for NSCDC officers',
        'Industrial bio-safety curriculum design',
        'Practical community waste sorting seminars'
      ],
      metric: { value: '250+', label: 'Trained technical personnel' },
      color: 'emerald'
    },
    {
      id: 'policy',
      title: 'Circular Policy Advisory',
      subtitle: 'Framework & Compliance',
      icon: FileText,
      description: 'Bridging technical reality with regional governance. We formulate zero-waste actionable policy blueprints, calculate precise greenhouse gas reduction metrics, and review national environmental standards.',
      keyProjects: [
        'Carbon footprint accounting spreadsheets',
        'Municipal zero-waste roadmap blueprints',
        'Sustainable land-use guidelines'
      ],
      metric: { value: 'Net-0', label: 'Emission planning alignment' },
      color: 'slate'
    }
  ];

  const milestones = [
    {
      year: '2021',
      title: 'Chemical Foundations',
      subtitle: 'B.Sc. Industrial Chemistry Research',
      desc: 'Conducted empirical analysis on biomass decomposition rates, identifying chemical reaction barriers in municipal waste streams.',
      tags: ['Chemical Kinetics', 'Biomass Analysis']
    },
    {
      year: '2022',
      title: 'Bio-Safety Frameworks',
      subtitle: 'Valves & Safety Implementations',
      desc: 'Formulated low-pressure bio-safety specifications, introducing enhanced gas pressure safety-valve layouts for localized bio-reactors.',
      tags: ['Safety Design', 'Biochemical Systems']
    },
    {
      year: '2023',
      title: 'Institutional Training Appoint',
      subtitle: 'National Renewables Capacity Building',
      desc: 'Selected to develop and facilitate specialized renewable energy and biochemical hazard training modules for NSCDC officers.',
      tags: ['NSCDC Collaboration', 'Technical Advocacy']
    },
    {
      year: '2024',
      title: 'Lagos Airport Deployment',
      subtitle: 'MMA Airport Biodigester Design',
      desc: 'Co-configured and optimized the organic waste biodigester operational parameters at Murtala Muhammed International Airport, Ikeja.',
      tags: ['Municipal Waste Audit', 'MMA Ikeja Project']
    },
    {
      year: '2025',
      title: 'Aurenix Research Digital Hub',
      subtitle: 'Platform & Regional Launch',
      desc: 'Launched the integrated collaborative portal to streamline resource inquiries, publish peer-reviewed papers, and expand research access.',
      tags: ['Digital Resource Hub', 'Open Science Portal']
    }
  ];

  const selectedPillar = pillars.find(p => p.id === activePillar) || pillars[0];

  return (
    <section className="bg-white" id="about_main_section">
      
      {/* 1. Core Corporate Identity & Mission */}
      <div className="py-20 w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm" id="about_intro_badge">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Who We Are
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight" id="about_heading">
            Advancing Practical Energy Solutions Across Africa
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto px-2 sm:px-0" id="about_subheading">
            Aurenix Research is an independent digital and technical advisory hub. We bridge the critical gap between academic chemical research and the industrial-scale implementation of sustainable bio-waste systems in Nigeria.
          </p>
        </div>

        {/* Bento Grid layout for core statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Statement card */}
          <div className="lg:col-span-7 bg-slate-50/70 p-8 sm:p-10 rounded-3xl border border-slate-100/80 flex flex-col justify-between relative overflow-hidden" id="mission_card">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="space-y-6 relative z-10 text-left">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl w-fit shadow-md">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-extrabold text-slate-900">
                Our Foundational Mission
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm md:text-base font-normal">
                {FOUNDER_INFO.mission}
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="flex gap-3.5 text-left">
                <div className="p-2 bg-white rounded-xl text-emerald-600 border border-slate-100 shadow-sm shrink-0 h-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 font-display uppercase tracking-wider">Local Sovereignty</span>
                  <span className="block text-xs text-slate-500 mt-1 leading-relaxed">Engineered by local African scientists specifically for domestic soils, wastes, and climates.</span>
                </div>
              </div>
              <div className="flex gap-3.5 text-left">
                <div className="p-2 bg-white rounded-xl text-emerald-600 border border-slate-100 shadow-sm shrink-0 h-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 font-display uppercase tracking-wider">Scientific Rigor</span>
                  <span className="block text-xs text-slate-500 mt-1 leading-relaxed">No speculative estimates. Every recommendation relies on verifiable biochemical compositions.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick numbers & core values sidebar card */}
          <div className="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-xl" id="empirical_values_card">
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-950/80 rounded-full blur-3xl opacity-80"></div>
            
            <div className="space-y-5 relative z-10 text-left">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                RESEARCH-DRIVEN IMPACT
              </div>
              <h3 className="text-2xl font-display font-extrabold tracking-tight text-white leading-tight">
                Advancing Africa's Energy & Climate Future
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                Aurenix Research connects African researchers, innovators, institutions, and global stakeholders to accelerate practical solutions for Africa's energy and climate challenges. By connecting research with collaboration, knowledge-sharing, and real-world application, we help turn African expertise and innovation into sustainable impact.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-800/80 relative z-10 text-left">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                <span className="text-xs font-medium text-slate-200">Research-driven solutions for Africa's energy and climate challenges</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                <span className="text-xs font-medium text-slate-200">Connecting African researchers with global opportunities and partnerships</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                <span className="text-xs font-medium text-slate-200">Supporting knowledge-sharing, innovation, and practical impact</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Interactive Focus Pillars of Excellence */}
      <div className="py-20 bg-slate-50/45 border-b border-slate-100" id="pillars_of_excellence_section">
        <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Milestone className="w-3.5 h-3.5 text-emerald-600" />
              Strategic Dimensions
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Operational Spheres of Influence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select an operational pillar below to explore our projects, credentials, and performance ratios.
            </p>
          </div>

          {/* Interactive Pillars Component */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Navigation Buttons */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2 sm:gap-3 lg:gap-0 lg:space-y-3 text-left">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                const isSelected = activePillar === pillar.id;
                
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillar(pillar.id)}
                    className={`w-full flex items-center justify-between p-3 sm:p-3.5 lg:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-left focus:outline-none ${
                      isSelected 
                        ? 'bg-white border-emerald-600/35 shadow-md ring-1 ring-emerald-500/10' 
                        : 'bg-transparent border-slate-200/60 hover:bg-white/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-4 min-w-0">
                      <div className={`p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl transition-colors duration-200 shrink-0 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="hidden lg:block text-[11px] font-mono uppercase tracking-widest text-slate-400 leading-none mb-1">
                          {pillar.subtitle}
                        </span>
                        <span className="block text-[10px] sm:text-xs lg:text-sm font-bold text-slate-800 font-display leading-tight truncate sm:whitespace-normal">
                          {pillar.title}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`hidden lg:block w-4 h-4 transition-transform duration-200 ${
                      isSelected ? 'text-emerald-600 translate-x-1' : 'text-slate-300'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Display Panel with animations */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPillar.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs sm:shadow-sm text-left flex flex-col justify-between min-h-0 sm:min-h-[300px] lg:min-h-[380px]"
                >
                  <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4 lg:pb-5">
                      <div>
                        <span className="inline-block text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                          {selectedPillar.subtitle}
                        </span>
                        <h4 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 mt-1 sm:mt-2 font-display leading-tight">
                          {selectedPillar.title}
                        </h4>
                      </div>
                      
                      {/* Metric Banner */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="block text-lg sm:text-xl lg:text-2xl font-mono font-extrabold text-emerald-600 leading-none">
                          {selectedPillar.metric.value}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">
                          {selectedPillar.metric.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                      {selectedPillar.description}
                    </p>

                    {/* Bullet projects */}
                    <div className="space-y-2 sm:space-y-3">
                      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                        Key Deliverables & Initiatives
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                        {selectedPillar.keyProjects.map((proj, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{proj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-5 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-5 text-[10px] sm:text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ACTIVELY UPDATED FOR NIGERIAN ECOLOGICAL POLICY COMPLIANCE
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>



      {/* 4. Professional Milestone Timeline & Journey */}
      <div className="py-24 bg-white dark:bg-white" id="experience_timeline">
        <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs border border-transparent dark:border-emerald-800/50">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Organizational Chronology
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              How Aurenix Research transitioned from conceptual laboratory testing to practical state training and municipal-scale deployment.
            </p>
          </div>

          {/* Timeline Layout */}
          <div className="relative max-w-3xl mx-auto">
            {/* Center line */}
            <div className="timeline-line absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-emerald-500/60 shadow-xs"></div>

            <div className="space-y-12">
              {milestones.map((item, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}>
                    {/* Timeline Node Point */}
                    <div className="timeline-node absolute left-4 sm:left-1/2 -translate-x-1.5 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-emerald-600 dark:bg-emerald-400 border-4 border-white dark:border-slate-900 shadow-md z-10"></div>

                    {/* Left Space for Desktop / Card Wrapper */}
                    <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${
                      isEven ? 'sm:pl-8 text-left' : 'sm:pr-8 text-left sm:text-right'
                    }`}>
                      <div className="timeline-card bg-white p-6 rounded-2xl border border-slate-100 dark:border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/* Header info */}
                        <div className={`flex flex-col mb-3 ${
                          isEven ? 'items-start' : 'items-start sm:items-end'
                        }`}>
                          <span className="text-emerald-700 font-mono font-extrabold text-base leading-none">
                            {item.year}
                          </span>
                          <span className="text-sm font-bold text-slate-800 font-display mt-2">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-medium">
                            {item.subtitle}
                          </span>
                        </div>

                        {/* Description */}
                        <p className={`text-xs text-slate-500 leading-relaxed font-sans mb-4 ${
                          isEven ? 'text-left' : 'text-left sm:text-right'
                        }`}>
                          {item.desc}
                        </p>

                        {/* Tags */}
                        <div className={`flex flex-wrap gap-1.5 ${
                          isEven ? 'justify-start' : 'justify-start sm:justify-end'
                        }`}>
                          {item.tags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
