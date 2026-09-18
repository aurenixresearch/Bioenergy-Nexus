import React from 'react';
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Check, 
  Leaf, 
  Globe, 
  Sun, 
  Flame, 
  Wheat, 
  Zap, 
  Atom, 
  Microscope,
  Info,
  ChevronRight,
  Bookmark,
  Crown,
  BarChart3
} from 'lucide-react';
import { CommunitySubreddit } from '../../types';

interface RedditSidebarProps {
  currentCommunity: CommunitySubreddit | null;
  communities: CommunitySubreddit[];
  joinedCommunityIds: string[];
  myCreatedCommunities?: CommunitySubreddit[];
  onToggleJoin: (communityId: string) => void;
  onSelectCommunity: (communityId: string | null) => void;
  onOpenCreateCommunity: () => void;
  onCreatePostClick: () => void;
  onOpenMyCommunities?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Leaf,
  Globe,
  Sun,
  Flame,
  Wheat,
  Zap,
  Atom,
  Microscope
};

export default function RedditSidebar({
  currentCommunity,
  communities,
  joinedCommunityIds,
  myCreatedCommunities = [],
  onToggleJoin,
  onSelectCommunity,
  onOpenCreateCommunity,
  onCreatePostClick,
  onOpenMyCommunities
}: RedditSidebarProps) {
  const isCurrentJoined = currentCommunity ? joinedCommunityIds.includes(currentCommunity.id) : false;

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 0. MY FOUNDED HUBS (If user created any) */}
      {myCreatedCommunities.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">My Communities</h4>
                <p className="text-[10px] text-slate-500">{myCreatedCommunities.length} hub{myCreatedCommunities.length > 1 ? 's' : ''} founded</p>
              </div>
            </div>
            {onOpenMyCommunities && (
              <button
                type="button"
                onClick={onOpenMyCommunities}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {myCreatedCommunities.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 hover:bg-amber-100/50 transition cursor-pointer"
                onClick={() => onSelectCommunity(c.id)}
              >
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {c.name.replace(/^r\//, 'a/')}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {c.membersCount} members • {c.category}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>

          {onOpenMyCommunities && (
            <button
              type="button"
              onClick={onOpenMyCommunities}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>View Engagement & Views</span>
            </button>
          )}
        </div>
      )}
      
      {/* 1. CURRENT COMMUNITY CARD (If a specific community is selected) */}
      {currentCommunity && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Banner header */}
          <div className={`h-20 bg-gradient-to-r ${currentCommunity.bannerColor || 'from-emerald-600 to-teal-700'} relative p-4 flex items-end`}>
            <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-slate-100 flex items-center justify-center">
              <div className={`w-full h-full rounded-xl bg-gradient-to-r ${currentCommunity.bannerColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center`}>
                {React.createElement(ICON_MAP[currentCommunity.icon] || Leaf, { className: 'w-5 h-5' })}
              </div>
            </div>
          </div>

          <div className="pt-7 px-5 pb-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {currentCommunity.name}
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {currentCommunity.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{currentCommunity.title}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {currentCommunity.description}
              </p>
            </div>

            {/* Member statistics */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-center">
              <div>
                <p className="text-sm font-black text-slate-900">
                  {currentCommunity.membersCount >= 1000 
                    ? `${(currentCommunity.membersCount / 1000).toFixed(1)}k` 
                    : currentCommunity.membersCount}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Members</p>
              </div>
              <div>
                <p className="text-sm font-black text-emerald-600 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {currentCommunity.onlineCount || 24}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Online</p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onToggleJoin(currentCommunity.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                  isCurrentJoined
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 group'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isCurrentJoined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 group-hover:hidden" />
                    <span className="group-hover:hidden">Joined</span>
                    <span className="hidden group-hover:inline">Leave Community</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Community</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCreatePostClick}
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Create Post in {currentCommunity.name}</span>
              </button>
            </div>

            {/* Rules */}
            {currentCommunity.rules && currentCommunity.rules.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Community Rules
                </div>
                <div className="space-y-1.5">
                  {currentCommunity.rules.map((rule, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600 shrink-0">{idx + 1}.</span>
                      <span className="leading-snug">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. TOP SCHOLAR COMMUNITIES (Top Communities) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              a/
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scholar Communities</h3>
              <p className="text-[11px] text-slate-500">Explore & join focused hubs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectCommunity(null)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {communities.map((comm, idx) => {
            const isJoined = joinedCommunityIds.includes(comm.id);
            const isSelected = currentCommunity?.id === comm.id;
            const IconComp = ICON_MAP[comm.icon] || Leaf;

            return (
              <div 
                key={comm.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition border ${
                  isSelected 
                    ? 'bg-emerald-50/70 border-emerald-200' 
                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100'
                }`}
              >
                {/* Left info */}
                <button
                  type="button"
                  onClick={() => onSelectCommunity(comm.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <span className="text-[11px] font-black text-slate-400 w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${comm.bannerColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700">
                      {comm.name.replace(/^r\//, 'a/')}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {comm.membersCount >= 1000 
                        ? `${(comm.membersCount / 1000).toFixed(1)}k members` 
                        : `${comm.membersCount} members`}
                    </p>
                  </div>
                </button>

                {/* Join button */}
                <button
                  type="button"
                  onClick={() => onToggleJoin(comm.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ml-2 ${
                    isJoined
                      ? 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                  title={isJoined ? 'Click to Leave' : 'Click to Join'}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Community CTA */}
        <div className="pt-4 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenCreateCommunity}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Create a Community</span>
          </button>
        </div>
      </div>

      {/* 3. REDDIT SCHOLAR CODE OF CONDUCT */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Nexus Scholar Guidelines</span>
        </div>
        <ul className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 list-disc list-inside">
          <li>Remember the human & academic dignity</li>
          <li>Cite empirical peer-reviewed sources</li>
          <li>Constructive peer discourse</li>
          <li>No commercial spam or fabricated findings</li>
        </ul>
        <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Aurenix Scholar Network</span>
          <span>© 2026 Open Science</span>
        </div>
      </div>

    </div>
  );
}
