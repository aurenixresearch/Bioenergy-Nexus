import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Coins, 
  Calendar, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Building, 
  ChevronRight, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { InnovationChallenge, Project } from './types';
import { getChallenges, submitApplication, getProjects } from '../../services/collaborationDb';

interface ChallengesSectionProps {
  user: any;
  onSignIn: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChallengesSection({ user, onSignIn, onSuccess }: ChallengesSectionProps) {
  const [challenges, setChallenges] = useState<InnovationChallenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<InnovationChallenge | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      const chList = await getChallenges();
      setChallenges(chList);
      if (user) {
        const prList = await getProjects(user.uid);
        setProjects(prList);
      }
    }
    loadData();
  }, [user]);

  const handleApplyClick = (challenge: InnovationChallenge) => {
    if (!user) {
      onSignIn();
      return;
    }
    setSelectedChallenge(challenge);
    setErrorMsg('');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setErrorMsg('Please select a project to associate with your challenge application.');
      return;
    }
    if (!selectedChallenge) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const matchedProject = projects.find(p => p.id === selectedProjectId);
      await submitApplication({
        projectId: selectedProjectId,
        challengeId: selectedChallenge.id,
        applicantId: user.uid,
        applicantName: user.displayName || 'Lead Scholar',
        projectTitle: matchedProject?.title || 'Joint Proposal',
        status: 'Submitted',
        timelineStep: 1
      });

      onSuccess(`Successfully applied to challenge: ${selectedChallenge.title}!`);
      setSelectedChallenge(null);
      setSelectedProjectId('');
    } catch (err) {
      setErrorMsg('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 text-left" id="innovation_challenges_section">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm border border-teal-200/50">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          Active Hackathons & Global Challenges
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Solve High-Impact Innovation Challenges
        </h2>
        <p className="text-base text-slate-600 leading-relaxed">
          Governments and international climate funds post specific hurdles. Submit your research designs, secure accelerated funding, and gain licensing contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-6">
              {/* Org Details & Badge */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={challenge.logo} 
                      alt={challenge.orgName} 
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wide">{challenge.orgName}</h4>
                    <span className="text-[10px] bg-teal-100 text-teal-800 rounded-full px-2 py-0.5 font-bold uppercase mt-1 inline-block">Active Challenge</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-teal-700 justify-end">
                    <Coins className="w-4 h-4 text-teal-600" />
                    <span className="text-lg font-extrabold font-display">{challenge.funding}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Contract Award</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-teal-700 transition-colors duration-200">
                  {challenge.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              {/* Lists of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Resources available */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Resources Available:</h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {(challenge.resourcesAvailable || []).map((res, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected deliverables */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Expected Deliverables:</h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {(challenge.expectedDeliverables || []).map((del, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Meta & Button */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Due: {challenge.deadline}
                </span>
                <span>•</span>
                <span>{challenge.timeline}</span>
              </div>
              <button
                onClick={() => handleApplyClick(challenge)}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                Apply to Challenge
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK APPLY CHALLENGE MODAL */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-6 right-6 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Fast Challenge Application</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Apply with active research
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are applying to: <strong className="text-slate-700">{selectedChallenge.title}</strong>
                </p>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Select Active Project</label>
                    {projects.length > 0 ? (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-teal-600 outline-none transition bg-white"
                      >
                        <option value="">-- Choose project --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-xs text-slate-500">You don't have any published projects yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChallenge(null);
                            const btn = document.getElementById('btn_publish_collab_project');
                            if (btn) btn.click();
                          }}
                          className="mt-2.5 text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                        >
                          + Create a Project first
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedChallenge(null)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || projects.length === 0}
                      className="flex-grow py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
