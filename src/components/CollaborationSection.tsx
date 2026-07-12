import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  GraduationCap, 
  Zap, 
  Briefcase, 
  Heart, 
  FileText, 
  Coins,
  ArrowRight,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  FlaskConical,
  Globe,
  Building,
  Target
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { PartnershipSubmission } from '../types';
import { STAKEHOLDER_CATEGORIES, COLLABORATION_AREAS, FOUNDER_INFO } from '../data';
import { submitPartnership, getUserPartnerships } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

interface CollaborationSectionProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  activePartnerships: PartnershipSubmission[];
  setActivePartnerships: React.Dispatch<React.SetStateAction<PartnershipSubmission[]>>;
}

// Interactive Pathfinder Data
interface PathfinderSector {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  nexusProvides: string[];
  jointObjectives: string[];
  caseStudy: string;
}

const PATHFINDER_SECTORS: PathfinderSector[] = [
  {
    id: 'academic',
    title: 'University & Research Institute',
    badge: 'Scientific Co-authorship & Lab Access',
    tagline: 'Bridging fundamental biotechnology with real-world process chemistry.',
    nexusProvides: [
      'Access to feedstock chemical profiles and gas chromatography databases.',
      'Practical field sites for student internships & doctoral waste-to-energy auditing.',
      'Collaboration on peer-reviewed chemical and process engineering papers.'
    ],
    jointObjectives: [
      'Publish high-impact studies on African circular bioeconomy solutions.',
      'Acquire international academic climate grants (e.g., Horizon Europe, GIZ).',
      'Translate bench-scale anaerobic research into local commercial systems.'
    ],
    caseStudy: 'Collaborating with local process chemists to analyze municipal solid waste (MSW) in Lagos.'
  },
  {
    id: 'industry',
    title: 'Energy Companies & Industry',
    badge: 'Commercial Scaling & Technology Pilots',
    tagline: 'Partnering with commercial farmers, waste aggregators, and energy providers.',
    nexusProvides: [
      'Bespoke biodigester process optimization and feedstock loading charts.',
      'Comprehensive life-cycle economic modeling & carbon accounting.',
      'Operational capacity-building modules for site supervisors.'
    ],
    jointObjectives: [
      'Scale and de-risk anaerobic digestion pilots at airports and large factories.',
      'Reduce corporate Scope 1 & Scope 2 emission profiles sustainably.',
      'Develop continuous-flow gas purification systems for standard generators.'
    ],
    caseStudy: 'Optimizing and training team operators at high-traffic hubs like Lagos MMA Airport.'
  },
  {
    id: 'government',
    title: 'Funding & Government Bodies',
    badge: 'Policy Frameworks & Impact Reports',
    tagline: 'Supporting municipal regulators, ministries, and development funds.',
    nexusProvides: [
      'Rigorous environmental impact analysis & carbon offset potential reports.',
      'Evidence-based data matrices on municipal waste composition.',
      'Bespoke standard operating guidelines for bioenergy safety.'
    ],
    jointObjectives: [
      'Draft national bioenergy safety benchmarks & regulatory roadmaps.',
      'Establish clean energy waste diversion programs for urban suburbs.',
      'Leverage climate finance packages for sovereign grid improvements.'
    ],
    caseStudy: 'Delivering data-driven insights on West African biofuels policy alignment.'
  },
  {
    id: 'ngo',
    title: 'NGO & Civil Society',
    badge: 'Community Action & Green Jobs',
    tagline: 'Empowering smallholder farming clusters and local circular collectives.',
    nexusProvides: [
      'Simple, low-cost biodigester blueprints and maintenance kits.',
      'Bilingual train-the-trainer workshops on composting & organic slurry fertilizers.',
      'Independent carbon footprint audits for local advocacy campaigns.'
    ],
    jointObjectives: [
      'Replace traditional biomass cooking with safe, clean biogas.',
      'Introduce organic digestate as nutrient-rich, commercial agricultural fertilizer.',
      'Create circular-economy micro-enterprises for local youth and women.'
    ],
    caseStudy: 'Empowering regional farming cooperatives with decentralized, clean organic digesters.'
  }
];

export default function CollaborationSection({ 
  user, 
  onSignIn,
  activePartnerships,
  setActivePartnerships
}: CollaborationSectionProps) {
  // Form State
  const [partnerName, setPartnerName] = useState('');
  const [stakeholderType, setStakeholderType] = useState<PartnershipSubmission['stakeholderType']>('University & Research Institute');
  const [collaborationArea, setCollaborationArea] = useState('Industry Partnerships');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // UI Interactive States
  const [activePathfinder, setActivePathfinder] = useState<string>('academic');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load submissions from Firestore
  const loadPartnerships = async () => {
    if (!user) return;
    try {
      const data = await getUserPartnerships(user.uid);
      setActivePartnerships(data);
    } catch (err) {
      console.error('Error loading partnerships:', err);
    }
  };

  useEffect(() => {
    loadPartnerships();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }

    if (!partnerName || !message) {
      setErrorMsg('Partner name and alliance details are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await submitPartnership({
        userId: user.uid,
        userEmail: user.email || '',
        partnerName,
        stakeholderType,
        collaborationArea,
        message,
      });

      setSuccess(true);
      setPartnerName('');
      setMessage('');
      
      // Reload active list
      await loadPartnerships();
      
      // Auto-dismiss success notification
      setTimeout(() => {
        setSuccess(false);
      }, 6000);
    } catch (err) {
      console.error('Partnership submission error:', err);
      setErrorMsg('Could not submit collaboration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStakeholderIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-emerald-600" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-emerald-600" />;
      default: return <Users className="w-5 h-5 text-emerald-600" />;
    }
  };

  const currentPathfinderSector = PATHFINDER_SECTORS.find(s => s.id === activePathfinder) || PATHFINDER_SECTORS[0];

  const FAQS = [
    {
      q: "Who retains the Intellectual Property (IP) in our research collaboration?",
      a: "Our core framework operates under a co-creation system. Intellectual property produced during joint projects is typically shared proportionally based on institutional contributions, and formalized through transparent, written Memorandums of Understanding (MoUs)."
    },
    {
      q: "Can international research centers partner with Bioenergy Nexus?",
      a: "Absolutely. We routinely collaborate with international climate networks, academic institutions, and NGOs seeking credible, hands-on scientific partnerships on West African feedstock composition, digester chemical modeling, and municipal policy auditing."
    },
    {
      q: "Does Bioenergy Nexus provide direct research funding?",
      a: "While we do not act as a direct seed fund, we serve as an active technical partner. We co-write research proposals, structure feasibility matrices, and share institutional credentials to successfully acquire high-ticket international climate grants and development funds."
    },
    {
      q: "How are municipal or industrial waste audits scheduled?",
      a: "Once an alliance is initialized and scoped, our analytical field teams arrange on-site safety assessments. We measure feedstock availability, moisture/chemical composition, and design constraints directly in accordance with regional standards."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50 text-left relative overflow-hidden" id="collaboration">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-teal-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* ================= SECTION HERO & METRICS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              The Nexus Global Alliance
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Uniting Science, Industry & Policy to Power <span className="text-emerald-600">Africa’s Bioeconomy</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Bioenergy Nexus bridges the gap between laboratory research and commercial clean energy projects. We connect academic minds, waste management organizations, and policy authorities to launch sustainable, locally operational green initiatives.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#pathfinder_tool"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg border-0 cursor-pointer"
              >
                Find Your Track
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#partnership_form_container"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Submit Proposal
              </a>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 text-center sm:text-left">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl w-fit mx-auto sm:mx-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">10+ Papers</h3>
              <p className="text-[11px] text-slate-400 font-medium">Peer-Reviewed Publications</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 text-center sm:text-left">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl w-fit mx-auto sm:mx-0">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">4 Pilots</h3>
              <p className="text-[11px] text-slate-400 font-medium">Operational Bioenergy Hubs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 text-center sm:text-left">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit mx-auto sm:mx-0">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">24h Response</h3>
              <p className="text-[11px] text-slate-400 font-medium">On Direct Inquiries</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 text-center sm:text-left">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-xl w-fit mx-auto sm:mx-0">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">100% Local</h3>
              <p className="text-[11px] text-slate-400 font-medium">African-Led Science</p>
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE NEXUS PATHFINDER ================= */}
        <div id="pathfinder_tool" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/50 shadow-xs space-y-8 relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden md:block">
            <Target className="w-40 h-40 text-emerald-900" />
          </div>

          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">NEXUS TRACK FINDER</span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-2">
              How Can We Collaboratively Amplify Your Goals?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Select your sector below to instantly see the specific lab tools, deployment blueprints, and academic resources Bioenergy Nexus can deliver, along with shared objectives.
            </p>
          </div>

          {/* Selector tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            {PATHFINDER_SECTORS.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setActivePathfinder(sector.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePathfinder === sector.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {sector.title}
              </button>
            ))}
          </div>

          {/* Animated Pathfinder Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePathfinder}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Core Offerings */}
              <div className="md:col-span-7 space-y-5">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {currentPathfinderSector.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {currentPathfinderSector.tagline}
                  </h3>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">What we deliver to your team:</h4>
                  <ul className="space-y-2.5">
                    {currentPathfinderSector.nexusProvides.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Shared Outcomes & Case Context */}
              <div className="md:col-span-5 space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Our mutual alliance outcomes:</h4>
                  <ul className="space-y-2.5">
                    {currentPathfinderSector.jointObjectives.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-700 leading-relaxed font-semibold">
                        <span className="text-emerald-600 font-bold shrink-0">❖</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">ACTIVE REAL-WORLD EXAMPLE</span>
                  <p className="text-xs text-slate-500 italic leading-relaxed mt-1">
                    "{currentPathfinderSector.caseStudy}"
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ================= SECTOR CATEGORIES & DETAILS ================= */}
        <div className="space-y-8 text-center">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">NEXUS SECTORS</span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              Stakeholders of the Green Revolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We coordinate resource exchange, laboratory modeling, and regulatory lobbying across four essential stakeholder domains.
            </p>
          </div>

          {/* Stakeholder categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stakeholders_grid">
            {STAKEHOLDER_CATEGORIES.map((cat) => (
              <motion.div 
                key={cat.id}
                whileHover={{ y: -6, scale: 1.01 }}
                className="p-6 bg-white rounded-2xl text-left border border-slate-200/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
                id={`stakeholder_card_${cat.id}`}
              >
                <div className="space-y-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl w-fit">
                    {renderStakeholderIcon(cat.iconName)}
                  </div>
                  <h4 className="text-sm font-display font-bold text-slate-900 leading-tight">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                
                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-emerald-700 font-bold border-t border-slate-50">
                  <span>ACTIVE COOPERATIVE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ================= STEP-BY-STEP FLOW ROADMAP ================= */}
        <div className="space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">OUR COLLABORATIVE LIFECYCLE</span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              The Journey to Localized Energy Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Establishing a rigorous bioenergy project involves scientific auditing and continuous operational optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Submit Inquiry",
                desc: "Describe your feedstock parameters, research objectives, or pilot facility criteria in our secure portal below."
              },
              {
                num: "02",
                title: "Feasibility Review",
                desc: "We analyze technical feasibility, organic solid waste chemistry profiles, and physical layout designs."
              },
              {
                num: "03",
                title: "Co-Author Scoping",
                desc: "Draft custom standard operating blueprints, set clear milestone expectations, and coordinate policy benchmarks."
              },
              {
                num: "04",
                title: "Operational Impact",
                desc: "Launch waste digesters, publish peer-reviewed papers, and train regional operations staff continuously."
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs text-left relative space-y-3">
                <div className="text-3xl font-mono font-extrabold text-slate-200">
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ALLIANCE GATEWAY PORTAL WITH LIVE CARD ================= */}
        <div id="partnership_form_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Form Submission */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/50 shadow-xs space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
                Nexus Partnership Proposal
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Join our active registry of African renewable energy stakeholders. Formulate your alliance objective below. Proposals are securely routed and actively reviewed.
              </p>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Application Transmitted Successfully!</h4>
                  <p className="text-xs text-slate-500">
                    Your proposal card has been saved. Our Lead Analyst, <strong>{FOUNDER_INFO.name}</strong>, will email you back shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Create Another Proposal
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Secure auth status banner */}
                {!user && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left space-y-2.5">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Sign-In Required:</strong> You are currently exploring in Guest Mode. Please sign in with Google to securely register, archive, and monitor updates for your alliance proposals.
                    </p>
                    <motion.button
                      type="button"
                      onClick={onSignIn}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors border-0 cursor-pointer"
                    >
                      Sign In with Google
                    </motion.button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Partner Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!user || loading}
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. University of Lagos, Biotech Dept"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Stakeholder Category
                    </label>
                    <select
                      disabled={!user || loading}
                      value={stakeholderType}
                      onChange={(e) => setStakeholderType(e.target.value as PartnershipSubmission['stakeholderType'])}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="University & Research Institute">University & Research Institute</option>
                      <option value="Energy Companies & Industry">Energy Companies & Industry</option>
                      <option value="Funding & Government Bodies">Funding & Government Bodies</option>
                      <option value="NGO & Civil Society">NGO & Civil Society</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Primary Collaboration Area
                  </label>
                  <select
                    disabled={!user || loading}
                    value={collaborationArea}
                    onChange={(e) => setCollaborationArea(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="Industry Partnerships">Industry Partnerships</option>
                    <option value="Policy & Advocacy">Policy & Advocacy</option>
                    <option value="Funding & Joint Proposals">Funding & Joint Proposals</option>
                    <option value="Knowledge Exchange & Events">Knowledge Exchange & Events</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Alliance Objective & Resource Capabilities
                  </label>
                  <textarea
                    rows={4}
                    required
                    disabled={!user || loading}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what specific biomass material, lab equipment, municipal policy support, or pilot test coordinates your institution can provide..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submissions are strictly confidential and protected under local research data policies.</span>
                </div>

                {user && (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-800/50 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer text-sm border-0"
                    id="submit_partnership_btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Transmitting Proposal...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Partnership Application
                      </>
                    )}
                  </motion.button>
                )}
              </form>
            )}
          </div>

          {/* Right Block: Live Badge Preview (Aesthetic Craft) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Live Transmission Blueprint</span>
              <h4 className="text-sm font-bold text-slate-800">Your Alliance Proposal Badge</h4>
            </div>

            {/* Premium Badge Frame */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-slate-800/50">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30"></div>
              
              <div className="relative z-10 space-y-6">
                
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Bioenergy Registry</span>
                  </div>
                  <div className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-mono tracking-wider font-bold">
                    {user ? 'READY TO TRANSMIT' : 'DRAFT VIEW'}
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">PARTNER ENTITY</span>
                    <h3 className="text-base font-bold font-display text-white line-clamp-1">
                      {partnerName || 'Your Institution / Center Name'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">CATEGORY</span>
                      <span className="text-xs font-semibold text-emerald-400 block line-clamp-1">
                        {stakeholderType}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">COLLABORATION FIELD</span>
                      <span className="text-xs font-semibold text-teal-300 block line-clamp-1">
                        {collaborationArea}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">OBJECTIVE BRIEF</span>
                    <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed font-light italic">
                      {message || '"Please start drafting your alliance objectives and capabilities in the form on the left. This digital card will map your strategic inputs in real-time."'}
                    </p>
                  </div>
                </div>

                {/* Stamp Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 text-[9px] font-mono text-slate-500">
                  <div className="space-y-0.5">
                    <span>TRANSMISSION HUB</span>
                    <span className="block text-slate-400 font-bold uppercase">LAGOS HQ // SECURE</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span>SECURITY STATUS</span>
                    <span className="block text-emerald-400 font-bold uppercase">{user ? 'SECURED LINK' : 'GUEST PORT'}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/40 text-left space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Tips for high-impact proposals:
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Provide quantitative metrics where possible, such as local daily organic waste volumes, chemical reactor sizing constraints, or previous research co-authorships.
              </p>
            </div>
          </div>

        </div>

        {/* ================= ACTIVE USER PROPOSALS SECTION ================= */}
        {user && activePartnerships.length > 0 && (
          <div className="text-left border-t border-slate-200 pt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-lg font-display font-extrabold text-slate-900">
                  Your Active Alliance Proposals ({activePartnerships.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Monitor reviewed statuses and updates for your submitted strategic collaborations.
                </p>
              </div>
              <button
                onClick={loadPartnerships}
                className="p-2.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all border border-slate-200/60 cursor-pointer"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePartnerships.map((sub) => (
                <motion.div 
                  key={sub.id} 
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="p-5 bg-white rounded-2xl border border-slate-200/50 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100">
                        IN REVIEW
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-sm font-extrabold text-slate-900">{sub.partnerName}</span>
                      <span className="block text-xs font-semibold text-emerald-700">{sub.stakeholderType}</span>
                      <span className="block text-[10px] font-mono text-slate-400">Area: {sub.collaborationArea}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 italic leading-relaxed">
                      "{sub.message}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ================= INTERACTIVE FAQs ================= */}
        <div className="bg-slate-100/50 rounded-3xl p-6 sm:p-10 border border-slate-200/40 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">ALLIANCE QUESTIONS</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              Partnership Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find detailed explanations regarding regulatory policies, intellectual property, and cooperative operations.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3" id="collaboration_faq_accordion">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/60 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-slate-800 text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-500 leading-relaxed text-left bg-slate-50/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
