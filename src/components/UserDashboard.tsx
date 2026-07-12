import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Bookmark, FileText, Users, ArrowLeft, Trash2, Download, ExternalLink, RefreshCw, LayoutDashboard, Calendar, Mail, ShieldCheck } from 'lucide-react';
import { ConsultationInquiry, PartnershipSubmission, ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { getSavedPaperIds, unsavePaper, getCustomPapers } from '../services/db';
import { motion } from 'motion/react';

interface UserDashboardProps {
  user: FirebaseUser;
  onBackToLanding: () => void;
  activeInquiries: ConsultationInquiry[];
  activePartnerships: PartnershipSubmission[];
  onRefreshAll: () => Promise<void>;
}

export default function UserDashboard({
  user,
  onBackToLanding,
  activeInquiries,
  activePartnerships,
  onRefreshAll
}: UserDashboardProps) {
  const [savedPapers, setSavedPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedAndCustom = async () => {
    setLoading(true);
    try {
      // Refresh parent firestore metrics
      await onRefreshAll();
      
      const savedIds = await getSavedPaperIds(user.uid);
      const customP = await getCustomPapers();
      const combined = [...RESEARCH_PAPERS, ...customP];
      
      // Filter combined papers to match saved ids
      const saved = combined.filter(paper => savedIds.includes(paper.id));
      setSavedPapers(saved);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAndCustom();
  }, [user]);

  const handleRemoveBookmark = async (paperId: string) => {
    try {
      await unsavePaper(user.uid, paperId);
      // Update local state
      setSavedPapers(prev => prev.filter(p => p.id !== paperId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleDownload = (title: string) => {
    console.log(`Downloading study: "${title}"... (Simulated)`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10" id="user_dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-bold">
        
        {/* Navigation Bar Refresh button */}
        <div className="flex items-center justify-end">
          <motion.button
            onClick={fetchSavedAndCustom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl shadow-xs transition-colors cursor-pointer border border-slate-200/60 text-xs font-semibold"
            id="refresh_dashboard_btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Reloading...' : 'Reload Dashboard'}</span>
          </motion.button>
        </div>

        {/* Dashboard Profile Hero */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden text-center sm:text-left shadow-lg">
          {/* Background overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/20 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User avatar'} 
                className="w-20 h-20 rounded-full object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-300 text-3xl font-bold shadow-lg">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-850 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Active Nexus Member
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Welcome back, {user.displayName || 'Researcher'}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-emerald-200/90 font-sans mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {new Date(user.metadata.creationTime || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 shrink-0 relative z-10 font-mono text-xs text-emerald-300">
            <div className="px-4 py-3 bg-white/5 rounded-xl text-center min-w-[70px]">
              <span className="block text-2xl font-bold text-white">{savedPapers.length}</span>
              <span>Saved Papers</span>
            </div>
            <div className="px-4 py-3 bg-white/5 rounded-xl text-center min-w-[70px]">
              <span className="block text-2xl font-bold text-white">{activeInquiries.length}</span>
              <span>Inquiries</span>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Saved papers library - Left */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-display font-extrabold text-slate-900">
                    Your Bookmarked Studies ({savedPapers.length})
                  </h3>
                </div>
              </div>

              {savedPapers.length > 0 ? (
                <div className="space-y-4" id="dashboard_saved_papers">
                  {savedPapers.map((paper) => (
                    <motion.div 
                      key={paper.id} 
                      whileHover={{ y: -3 }}
                      className="p-5 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">{paper.category}</span>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{paper.title}</h4>
                        <p className="text-xs text-slate-500">Author: {paper.author} • {paper.publishedYear}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <motion.button
                          onClick={() => handleDownload(paper.title)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 transition-colors cursor-pointer border-0 shadow-sm"
                          title="Download Study"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleRemoveBookmark(paper.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors cursor-pointer border-0 shadow-sm"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Bookmark className="w-10 h-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">No bookmarked studies</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Navigate back to the Nexus Research Repository on the main page to find and bookmark studies.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submitted inquiries and alliances - Right */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Consultation tracker widget */}
            <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Consulting Reviews ({activeInquiries.length})</h4>
                </div>
              </div>

              {activeInquiries.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {activeInquiries.map((inq) => (
                    <motion.div 
                      key={inq.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-slate-50 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase max-w-[130px] truncate">{inq.organization}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          inq.status === 'Pending' 
                            ? 'bg-amber-100 text-amber-800' 
                            : inq.status === 'In Review' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-slate-700">{inq.serviceType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{inq.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No advisory inquiries submitted yet.</p>
              )}
            </div>

            {/* Partnerships tracker widget */}
            <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Alliance Status ({activePartnerships.length})</h4>
                </div>
              </div>

              {activePartnerships.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {activePartnerships.map((sub) => (
                    <motion.div 
                      key={sub.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-slate-50 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-900 truncate max-w-[130px]">{sub.partnerName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-800">
                          Registered
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-emerald-700">{sub.stakeholderType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{sub.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No active alliance applications.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
