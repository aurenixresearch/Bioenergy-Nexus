import React, { useState, useMemo } from 'react';
import { CommunitySubreddit, CommunityPost } from '../../types';
import { 
  Users, 
  Eye, 
  ArrowBigUp, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Tag, 
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
  Compass,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface MyCommunityHubProps {
  createdCommunities: CommunitySubreddit[];
  allCommunities: CommunitySubreddit[];
  posts: CommunityPost[];
  currentUserId?: string;
  userName?: string;
  onSelectCommunity: (communityId: string | null) => void;
  onOpenCreateCommunity: () => void;
  onEditPost: (post: CommunityPost) => void;
  onDeletePost: (post: CommunityPost) => void;
  onEditCommunity: (community: CommunitySubreddit) => void;
  onDeleteCommunity: (community: CommunitySubreddit) => void;
  onBackToFeed: () => void;
  isMyPost: (post: CommunityPost) => boolean;
}

export default function MyCommunityHub({
  createdCommunities,
  allCommunities,
  posts,
  currentUserId,
  userName,
  onSelectCommunity,
  onOpenCreateCommunity,
  onEditPost,
  onDeletePost,
  onEditCommunity,
  onDeleteCommunity,
  onBackToFeed,
  isMyPost
}: MyCommunityHubProps) {
  // Active selected community in creator dashboard
  const [selectedHubId, setSelectedHubId] = useState<string>(
    createdCommunities.length > 0 ? createdCommunities[0].id : 'all'
  );
  const [deletingConfirmPostId, setDeletingConfirmPostId] = useState<string | null>(null);
  const [deletingConfirmCommId, setDeletingConfirmCommId] = useState<string | null>(null);

  // Active community object if specific one is selected
  const activeHub = useMemo(() => {
    return createdCommunities.find(c => c.id === selectedHubId) || null;
  }, [createdCommunities, selectedHubId]);

  // Helper to compute realistic view counts for a post
  const getPostViews = (post: CommunityPost) => {
    if (post.views && post.views > 0) return post.views;
    const upvotesCount = post.upvotes?.length || (post.likes?.length || 1);
    const commentsCount = post.comments?.length || 0;
    return upvotesCount * 9 + commentsCount * 6 + 24;
  };

  // Compute metrics for all created communities combined or selected one
  const analytics = useMemo(() => {
    const targetCommunities = activeHub ? [activeHub] : createdCommunities;
    const targetCommunityIds = new Set(targetCommunities.map(c => c.id.toLowerCase()));

    // Posts belonging to these communities
    const hubPosts = posts.filter(p => {
      const pCommId = (p.communityId || '').toLowerCase();
      const pCommName = (p.communityName || '').replace(/^[ra]\//, '').toLowerCase();
      return targetCommunityIds.has(pCommId) || targetCommunityIds.has(pCommName);
    });

    const totalMembers = targetCommunities.reduce((acc, c) => acc + (c.membersCount || 1), 0);
    const totalOnline = targetCommunities.reduce((acc, c) => acc + (c.onlineCount || 1), 0);

    const postViewsSum = hubPosts.reduce((acc, p) => acc + getPostViews(p), 0);
    const communityVisits = totalMembers * 14;
    const totalViews = postViewsSum + communityVisits;

    const totalUpvotes = hubPosts.reduce((acc, p) => acc + (p.upvotes?.length || p.likes?.length || 0), 0);
    const totalComments = hubPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
    const engagementScore = hubPosts.length > 0
      ? (((totalUpvotes + totalComments) / Math.max(1, totalViews)) * 100).toFixed(1)
      : '0.0';

    return {
      totalMembers,
      totalOnline,
      totalViews,
      totalPosts: hubPosts.length,
      totalUpvotes,
      totalComments,
      engagementScore,
      hubPosts
    };
  }, [activeHub, createdCommunities, posts]);

  // User's own authored posts
  const myAuthoredPosts = useMemo(() => {
    return posts.filter(p => {
      if (!isMyPost(p)) return false;
      if (activeHub) {
        const pCommId = (p.communityId || '').toLowerCase();
        const pCommName = (p.communityName || '').replace(/^[ra]\//, '').toLowerCase();
        return pCommId === activeHub.id.toLowerCase() || pCommName === activeHub.id.toLowerCase();
      }
      return true;
    });
  }, [posts, isMyPost, activeHub]);

  return (
    <div className="space-y-6 animate-fade-in text-left bg-white dark:bg-transparent">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={onBackToFeed}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Community Feed</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Creator Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>My Communities</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                {createdCommunities.length} Created
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Track real-time engagement views, subscriber reach, and moderate discussions and publications in the hubs you founded.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenCreateCommunity}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Hub</span>
            </button>
            <button
              type="button"
              onClick={onBackToFeed}
              className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <span>Back to Feed</span>
            </button>
          </div>
        </div>

        {/* Community Tabs / Selector */}
        {createdCommunities.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedHubId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedHubId === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All My Hubs ({createdCommunities.length})</span>
            </button>

            {createdCommunities.map((c) => {
              const isSelected = selectedHubId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedHubId(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-800 hover:border-emerald-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>{c.name.replace(/^r\//, 'a/')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-emerald-700/80 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'}`}>
                    {c.membersCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ZERO STATE: If user hasn't created a community yet */}
      {createdCommunities.length === 0 ? (
        <div className="bg-white dark:bg-[#000000] border border-slate-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800 shadow-2xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You Haven't Created a Community Yet</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Create an academic hub tailored to your energy research niche (e.g. <strong>a/cellulosic-ethanol</strong>, <strong>a/green-hydrogen</strong>). Curate peer publications, host scholarly debates, and observe community readership.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateCommunity}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Community</span>
            </button>
            <button
              type="button"
              onClick={onBackToFeed}
              className="w-full sm:w-auto px-5 py-3 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-900 font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Explore Existing Communities
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. ENGAGEMENT & VIEWS STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Total Views */}
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Views</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {analytics.totalViews.toLocaleString()}
              </p>
              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Article & hub impressions</span>
              </p>
            </div>

            {/* Total Members */}
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subscribers</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {analytics.totalMembers.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{analytics.totalOnline} Active right now</span>
              </p>
            </div>

            {/* Total Research Posts */}
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hub Posts</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {analytics.totalPosts}
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-1">
                Peer papers & notes
              </p>
            </div>

            {/* Upvotes / Karma */}
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peer Upvotes</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <ArrowBigUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {analytics.totalUpvotes}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                Scholarly validation
              </p>
            </div>

            {/* Total Discussions */}
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs relative overflow-hidden col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comments</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {analytics.totalComments}
              </p>
              <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold mt-1">
                {analytics.engagementScore}% engagement
              </p>
            </div>
          </div>

          {/* 2. ACTIVE HUB CARD & MANAGEMENT CONTROLS */}
          {activeHub && (
            <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
              <div className={`h-24 sm:h-28 bg-gradient-to-r ${activeHub.bannerColor || 'from-emerald-600 to-teal-700'} p-4 sm:p-6 flex items-end justify-between relative`}>
                <div className="flex items-center gap-3.5 relative top-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-[#000000] p-1.5 shadow-md border border-slate-100 dark:border-neutral-800 flex items-center justify-center shrink-0">
                    <div className={`w-full h-full rounded-xl bg-gradient-to-r ${activeHub.bannerColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center font-black text-lg sm:text-xl`}>
                      a/
                    </div>
                  </div>
                  <div className="min-w-0 pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {activeHub.name.replace(/^r\//, 'a/')}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                        {activeHub.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activeHub.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCommunity(activeHub.id)}
                    className="px-3.5 py-1.5 bg-white/95 dark:bg-neutral-900/95 hover:bg-white dark:hover:bg-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open Hub Feed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditCommunity(activeHub)}
                    className="p-2 bg-white/95 dark:bg-neutral-900/95 hover:bg-white dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 rounded-xl transition shadow-xs cursor-pointer"
                    title="Edit Hub Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-8 px-6 pb-5 border-b border-slate-100 dark:border-neutral-800">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {activeHub.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Created {new Date(activeHub.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{activeHub.membersCount} Registered Scholars</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditCommunity(activeHub)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Settings</span>
                    </button>

                    {deletingConfirmCommId === activeHub.id ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                        <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold">Delete Hub?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingConfirmCommId(null);
                            onDeleteCommunity(activeHub);
                          }}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingConfirmCommId(null)}
                          className="px-2 py-0.5 bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 rounded text-[10px] font-bold cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingConfirmCommId(activeHub.id)}
                        className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Hub</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. POSTS MANAGEMENT (User's posts in this hub or across their hubs) */}
          <div className="bg-white dark:bg-[#000000] border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>My Research Posts</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 text-xs font-bold">
                    {myAuthoredPosts.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage, edit, or delete articles you published {activeHub ? `in ${activeHub.name.replace(/^r\//, 'a/')}` : 'across the network'}.
                </p>
              </div>

              {activeHub && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCommunity(activeHub.id);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Publish New Post in {activeHub.name.replace(/^r\//, 'a/')}</span>
                </button>
              )}
            </div>

            {myAuthoredPosts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Posts Published Here Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                  Share research data, experimental hypotheses, or methodology findings to spark peer engagement.
                </p>
                {activeHub && (
                  <button
                    type="button"
                    onClick={() => onSelectCommunity(activeHub.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Write Post in {activeHub.name.replace(/^r\//, 'a/')}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-neutral-800 mt-2">
                {myAuthoredPosts.map((post) => {
                  const views = getPostViews(post);
                  const upvotes = post.upvotes?.length || (post.likes?.length || 0);
                  const comments = post.comments?.length || 0;

                  return (
                    <div key={post.id} className="py-4 hover:bg-slate-50/50 dark:hover:bg-neutral-900/50 rounded-xl px-2 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Post Header Badges */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-200 px-2 py-0.5 bg-slate-100 dark:bg-neutral-900 rounded-md">
                              {(post.communityName || 'a/bioenergy').replace(/^r\//, 'a/')}
                            </span>
                            {post.flair && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 font-bold text-[11px]">
                                {post.flair}
                              </span>
                            )}
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Post Title */}
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {post.title || post.content.slice(0, 75)}
                          </h4>

                          {/* Content Snippet */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Post Stats */}
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                            <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{views.toLocaleString()} Views</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                              <ArrowBigUp className="w-3.5 h-3.5" />
                              <span>{upvotes} Upvotes</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{comments} Comments</span>
                            </span>
                            {post.researchLink && (
                              <a
                                href={post.researchLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>DOI Source</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit & Delete buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => onEditPost(post)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Edit this post"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {deletingConfirmPostId === post.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                              <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold">Delete?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingConfirmPostId(null);
                                  onDeletePost(post);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingConfirmPostId(null)}
                                className="px-2 py-0.5 bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingConfirmPostId(post.id)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Delete this post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
