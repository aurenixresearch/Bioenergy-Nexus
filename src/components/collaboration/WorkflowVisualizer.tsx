import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle, 
  Play, 
  GitBranch, 
  Activity, 
  FlaskConical, 
  Briefcase, 
  Globe, 
  Coins, 
  FileText, 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  Layers, 
  Eye, 
  Sparkles, 
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WorkflowStep {
  label: string;
  desc: string;
  icon: React.ElementType;
}

interface WorkflowVisualizerProps {
  onNavigateToConsole?: () => void;
}

export default function WorkflowVisualizer({ onNavigateToConsole }: WorkflowVisualizerProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<'funding' | 'lab' | 'industry' | 'government' | 'lifecycle'>('funding');
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 320; // Scroll by roughly one card width + gap
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fundingSteps: WorkflowStep[] = [
    { label: 'Publish Opportunity', desc: 'Organization details scope, criteria, and available funding', icon: Coins },
    { label: 'Researchers Apply', desc: 'Scholars submit structured projects with budget and TRL benchmarks', icon: FileText },
    { label: 'Review Applications', desc: 'Peer-review panel scores and matches alignments', icon: Search },
    { label: 'Interview', desc: 'Live video sync to discuss technical milestones', icon: Users },
    { label: 'Accept Project', desc: 'Joint notification and workspace generation', icon: CheckCircle },
    { label: 'Milestone Agreement', desc: 'Formulate timeline, deliverables, and release gates', icon: Calendar },
    { label: 'Funding Released', desc: 'Seed funding disbursed securely per milestone', icon: Sparkles },
    { label: 'Progress Reports', desc: 'Research team uploads continuous notes and lab chromatography', icon: Activity },
    { label: 'Completion', desc: 'Closing evaluations and prototype validation reports', icon: Award },
    { label: 'Publication', desc: 'Open-access paper published to Aurenix repository', icon: Layers },
    { label: 'Impact Report', desc: 'Quantified social and environmental offset metrics logged', icon: Globe }
  ];

  const labSteps: WorkflowStep[] = [
    { label: 'Publishes Lab Availability', desc: 'University details equipment like chromatographs and HPLC', icon: FlaskConical },
    { label: 'Researchers Apply', desc: 'Researchers detail specific testing schedules and substrate quantities', icon: FileText },
    { label: 'Laboratory Review', desc: 'Lab Director verifies safety compliance and slot availability', icon: Search },
    { label: 'Booking', desc: 'Slots scheduled on the shared institutional calendar', icon: Calendar },
    { label: 'Testing', desc: 'Active research on-site utilizing advanced equipment', icon: FlaskConical },
    { label: 'Results Uploaded', desc: 'Raw chromatography and biochemical kinetics reports compiled', icon: Activity },
    { label: 'Research Updated', desc: 'Ecosystem project updated with validated parameters', icon: CheckCircle }
  ];

  const industrySteps: WorkflowStep[] = [
    { label: 'Research Need Published', desc: 'Corporate partner details a specific scaling or purification hurdle', icon: Briefcase },
    { label: 'Researchers Apply', desc: 'Scholars pitch process kinetics or pilot-ready prototypes', icon: FileText },
    { label: 'Industry Reviews', desc: 'Venture team assesses economic feasibility and scaling factor', icon: Search },
    { label: 'Prototype Development', desc: 'Joint fabrication and chemical parameter tuning', icon: Layers },
    { label: 'Testing', desc: 'Operational pilot testing at airport or agricultural coop sites', icon: Activity },
    { label: 'Commercialization', desc: 'License distribution and high-volume local deployment', icon: Award }
  ];

  const governmentSteps: WorkflowStep[] = [
    { label: 'Policy Challenge Published', desc: 'Ministry identifies bioenergy safety or regulatory bottleneck', icon: Globe },
    { label: 'Policy Brief Submission', desc: 'Scholars submit data-driven regulatory guidelines', icon: FileText },
    { label: 'Evaluation', desc: 'Policy analysts audit carbon-offset projections and community safety', icon: Search },
    { label: 'Selection', desc: 'Best proposals chosen for pilot municipal implementation', icon: CheckCircle },
    { label: 'Implementation', desc: 'New directives rolled out to regional waste centers', icon: Calendar },
    { label: 'Policy Impact', desc: 'Quantified municipal circular statistics monitored and logged', icon: Award }
  ];

  const lifecycleSteps: WorkflowStep[] = [
    { label: 'Idea', desc: 'Conceptual process kinetics and literature review', icon: Layers },
    { label: 'Research', desc: 'Continuous lab experiments and substrate calculations', icon: Search },
    { label: 'Prototype', desc: 'Small bench-scale continuous digester validation', icon: FlaskConical },
    { label: 'Funding', desc: 'Acquiring grants or green venture investment rounds', icon: Coins },
    { label: 'Laboratory Validation', desc: 'ISO-certified gas chromatography confirmation', icon: CheckCircle },
    { label: 'Industry Partnership', desc: 'Licensing technology to commercial operators', icon: Briefcase },
    { label: 'Pilot Project', desc: 'Full-scale setup (e.g. airport or farm digesters)', icon: GitBranch },
    { label: 'Commercialization', desc: 'Market expansion and local equipment manufacturing', icon: Award },
    { label: 'Policy Adoption', desc: 'Direct contribution to regional renewable energy laws', icon: Globe },
    { label: 'Impact Tracking', desc: 'Methane captured and coal offset metrics analyzed', icon: Activity },
    { label: 'Published Success Story', desc: 'Permanent cataloging as an African circular benchmark', icon: Sparkles }
  ];

  const getActiveSteps = () => {
    switch (activeWorkflow) {
      case 'funding': return fundingSteps;
      case 'lab': return labSteps;
      case 'industry': return industrySteps;
      case 'government': return governmentSteps;
      case 'lifecycle': return lifecycleSteps;
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/60 shadow-xs" id="workflow_visualizer">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-100 pb-5 sm:pb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest block mb-1">Interactive Systems</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-display font-extrabold text-slate-900 leading-tight">Operational Integration Workflows</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Select a workflow to visualize the animated timeline of collaboration, testing, and scaling.</p>
        </div>
        
        {/* Workflow Tabs Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/60 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {(['funding', 'lab', 'industry', 'government', 'lifecycle'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveWorkflow(key)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer capitalize flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeWorkflow === key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {key === 'lifecycle' && <GitBranch className="w-3.5 h-3.5" />}
              {key === 'funding' && <Coins className="w-3.5 h-3.5" />}
              {key === 'lab' && <FlaskConical className="w-3.5 h-3.5" />}
              {key === 'industry' && <Briefcase className="w-3.5 h-3.5" />}
              {key === 'government' && <Globe className="w-3.5 h-3.5" />}
              {key === 'lifecycle' ? 'Lifecycle' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Steps Visualizer Container with Scroll Buttons */}
      <div className="relative group/scroll mt-2 sm:mt-4">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shrink-0"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* The scrolling container */}
        <div 
          ref={containerRef}
          className="relative overflow-x-auto no-scrollbar py-2 sm:py-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-stretch gap-3 sm:gap-6 min-w-max px-1">
            {getActiveSteps().map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={idx}>
                  {/* Connected step card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 25 }}
                    className="w-56 sm:w-64 bg-slate-50/70 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/60 flex flex-col justify-between hover:bg-white hover:shadow-md hover:border-emerald-200 transition-all duration-300 relative group"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      {/* Number Badge and Icon */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                          Step {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Step Title & Description */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display group-hover:text-emerald-700 transition-colors duration-200 leading-tight">
                          {step.label}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {/* Flow progress dot at bottom */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />
                      <span>Real-time Active Stage</span>
                    </div>
                  </motion.div>

                  {/* Arrow connector */}
                  {idx < getActiveSteps().length - 1 && (
                    <div className="flex items-center justify-center text-slate-300 shrink-0">
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600/50" />
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shrink-0"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Dynamic Summary Panel */}
      <div className="mt-6 sm:mt-8 bg-emerald-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 text-left">
        <div className="flex items-start gap-3">
          <div className="p-2.5 sm:p-3 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h5 className="text-[11px] sm:text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">Dynamic Integration System</h5>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              When an application matches or is submitted to an Alliance Opportunity, the platform auto-indexes the research parameters and launches the corresponding workflow tracking. Accepted applications automatically trigger a complete collaborative workspace.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onNavigateToConsole) {
              onNavigateToConsole();
            } else {
              const el = document.getElementById('alliance_marketplace_section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all duration-200 cursor-pointer text-center whitespace-nowrap shrink-0 min-h-[44px] flex items-center justify-center"
        >
          Explore Alliances Now
        </button>
      </div>
    </div>
  );
}
