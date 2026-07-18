import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageSquare, 
  ExternalLink, 
  Eye, 
  Sparkles,
  TrendingUp,
  MapPin,
  X
} from 'lucide-react';
import { getResearchers, followResearcher } from '../../services/db';
import { Researcher } from '../../types';

interface NetworkPanelProps {
  userId: string;
  onNavigateToView: (view: any) => void;
}

export default function NetworkPanel({
  userId,
  onNavigateToView,
}: NetworkPanelProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    async function loadNetwork() {
      setLoading(true);
      try {
        const list = await getResearchers();
        setResearchers(list);
        
        // Find which researchers this user already follows (mocking based on followers field containing userId)
        const followed = list.filter(r => r.followers?.includes(userId)).map(r => r.id);
        setFollowingIds(followed);
      } catch (err) {
        console.error('Error loading researchers in network:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetwork();
  }, [userId]);

  const handleFollowToggle = async (researcherId: string) => {
    try {
      const success = await followResearcher(userId, researcherId);
      if (success) {
        setFollowingIds(prev => 
          prev.includes(researcherId) 
            ? prev.filter(id => id !== researcherId) 
            : [...prev, researcherId]
        );
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // Split researchers into "Recent Followers" and "Suggested Connections"
  // Let's get up to 3 for each
  const recentFollowers = researchers.slice(0, 3);
  const suggestedConnections = researchers.slice(3, 7);

  return (
    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6" id="network_panel">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Followers & Network
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-sans font-medium mt-0.5">
            Engage with leading experts, co-authors, and global circular economy sponsors.
          </p>
        </div>
        
        <div className="flex gap-2 text-xs font-bold text-slate-700 dark:text-slate-700">
          <button 
            onClick={() => onNavigateToView('researchers')} 
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-200 dark:border-slate-200 rounded-xl transition cursor-pointer text-[10px]"
          >
            Explore All
          </button>
        </div>
      </div>

      {/* Network Stats Card */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <button 
          onClick={() => setActiveModal('followers')}
          className="p-4 bg-emerald-50/50 hover:bg-emerald-100/50 dark:bg-emerald-50/50 dark:hover:bg-emerald-100/50 border border-emerald-100 rounded-2xl transition-all cursor-pointer hover:scale-[1.02] text-center"
          title="See Your Followers"
        >
          <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-600 font-mono">142</span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase mt-1">Followers</span>
        </button>
        <button 
          onClick={() => setActiveModal('following')}
          className="p-4 bg-teal-50/50 hover:bg-teal-100/50 dark:bg-teal-50/50 dark:hover:bg-teal-100/50 border border-teal-100 rounded-2xl transition-all cursor-pointer hover:scale-[1.02] text-center"
          title="See Who You Are Following"
        >
          <span className="block text-2xl font-black text-teal-600 dark:text-teal-600 font-mono">{followingIds.length + 18}</span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase mt-1">Following</span>
        </button>
        <div className="p-4 bg-blue-50/50 dark:bg-blue-50/50 border border-blue-100 rounded-2xl">
          <span className="block text-2xl font-black text-blue-600 dark:text-blue-600 font-mono flex items-center justify-center gap-1">
            <Eye className="w-4 h-4 text-blue-500 shrink-0" />
            927
          </span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase mt-1">Profile Views</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Recent Followers Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Recent Followers
          </h4>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-100 rounded-full"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3 bg-slate-100 dark:bg-slate-100 rounded"></div>
                    <div className="w-16 h-2 bg-slate-50 dark:bg-slate-50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentFollowers.map((res) => {
                const isFollowing = followingIds.includes(res.id);
                return (
                  <div key={res.id} className="p-3 bg-emerald-50/10 dark:bg-emerald-50/10 border border-emerald-100/60 dark:border-emerald-100/60 rounded-2xl flex items-center justify-between gap-3 font-sans">
                    <div className="flex items-center gap-3 truncate">
                      {res.profilePhoto ? (
                        <img 
                          src={res.profilePhoto} 
                          alt={res.fullName} 
                          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs border border-emerald-100" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-100">
                          {res.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="truncate text-left">
                        <span className="block text-xs font-bold text-slate-900 dark:text-slate-900 truncate leading-snug">{res.fullName}</span>
                        <span className="block text-[10px] text-emerald-700 dark:text-emerald-700 font-mono font-bold truncate mt-0.5">{res.role}</span>
                        <span className="block text-[9px] text-slate-500 dark:text-slate-500 truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-600" /> {res.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFollowToggle(res.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isFollowing 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        }`}
                        title={isFollowing ? 'You are following' : 'Follow Back'}
                      >
                        {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onNavigateToView('profile')}
                        className="p-1.5 bg-white dark:bg-white text-emerald-700 hover:text-emerald-800 border border-slate-200 dark:border-slate-200 rounded-lg transition hover:bg-slate-50"
                        title="Visit Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggested Connections Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Suggested Connections
          </h4>

          <div className="space-y-3">
            {suggestedConnections.map((res) => {
              const isFollowing = followingIds.includes(res.id);
              return (
                <div key={res.id} className="p-3 bg-emerald-50/10 dark:bg-emerald-50/10 border border-emerald-100/60 dark:border-emerald-100/60 rounded-2xl flex items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-3 truncate">
                    {res.profilePhoto ? (
                      <img 
                        src={res.profilePhoto} 
                        alt={res.fullName} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs border border-emerald-100" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-100">
                        {res.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="truncate text-left">
                      <span className="block text-xs font-bold text-slate-900 dark:text-slate-900 truncate leading-snug">{res.fullName}</span>
                      <span className="block text-[10px] text-slate-600 dark:text-slate-600 font-semibold truncate mt-0.5">{res.institution}</span>
                      <span className="block text-[9px] text-emerald-700 dark:text-emerald-700 truncate mt-0.5 font-mono font-bold">{res.researchInterests?.[0] || 'Clean Tech'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFollowToggle(res.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isFollowing 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      }`}
                      title={isFollowing ? 'Following' : 'Connect'}
                    >
                      {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    {/* Network Modal */}
    {activeModal && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-xl w-full max-w-md max-h-[80vh] flex flex-col text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {activeModal === 'followers' ? 'Your Followers' : 'Researchers You Follow'}
              </h3>
              <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">
                {activeModal === 'followers' 
                  ? '142 global experts and scholars following your research'
                  : `Active connections and updates from ${followingIds.length + 18} scholars`}
              </p>
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body / List */}
          <div className="overflow-y-auto py-4 space-y-3 flex-1 min-h-[300px]">
            {activeModal === 'followers' ? (
              /* Followers List */
              researchers.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono text-center py-8">Loading followers...</p>
              ) : (
                researchers.map((res) => {
                  const isFollowing = followingIds.includes(res.id);
                  return (
                    <div key={res.id} className="p-3 bg-emerald-50/10 border border-emerald-100/60 rounded-2xl flex items-center justify-between gap-3 font-sans">
                      <div className="flex items-center gap-3 truncate">
                        {res.profilePhoto ? (
                          <img 
                            src={res.profilePhoto} 
                            alt={res.fullName} 
                            className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs border border-emerald-100" 
                          />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-100">
                            {res.fullName.charAt(0)}
                          </div>
                        )}
                        <div className="truncate text-left">
                          <span className="block text-xs font-bold text-slate-900 truncate leading-snug">{res.fullName}</span>
                          <span className="block text-[10px] text-emerald-700 font-mono font-bold truncate mt-0.5">{res.role}</span>
                          <span className="block text-[9px] text-slate-500 truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-600" /> {res.country}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFollowToggle(res.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isFollowing 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          }`}
                          title={isFollowing ? 'Following' : 'Follow Back'}
                        >
                          {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Following List */
              (() => {
                const followedList = researchers.filter(r => followingIds.includes(r.id));
                if (followedList.length === 0) {
                  return (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-xs text-slate-500 font-sans">You are not following any scholars yet.</p>
                      <p className="text-[10px] text-slate-400 font-mono">Use the network panel below to connect with peers!</p>
                    </div>
                  );
                }
                return followedList.map((res) => (
                  <div key={res.id} className="p-3 bg-teal-50/10 border border-teal-100/60 rounded-2xl flex items-center justify-between gap-3 font-sans">
                    <div className="flex items-center gap-3 truncate">
                      {res.profilePhoto ? (
                        <img 
                          src={res.profilePhoto} 
                          alt={res.fullName} 
                          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs border border-teal-100" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-teal-50 text-teal-850 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-teal-100">
                          {res.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="truncate text-left">
                        <span className="block text-xs font-bold text-slate-900 truncate leading-snug">{res.fullName}</span>
                        <span className="block text-[10px] text-teal-700 font-mono font-bold truncate mt-0.5">{res.role}</span>
                        <span className="block text-[9px] text-slate-500 truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-teal-600" /> {res.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFollowToggle(res.id)}
                        className="p-1.5 rounded-lg border bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                        title="Unfollow"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-100 pt-3 text-right">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </div>
  );
}
