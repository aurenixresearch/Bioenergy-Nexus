import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  Users, 
  Sparkles, 
  Leaf, 
  Globe, 
  Sun, 
  Flame, 
  Wheat, 
  Zap, 
  Atom, 
  Microscope,
  ChevronRight,
  Crown
} from 'lucide-react';
import { CommunitySubreddit } from '../../types';

interface MobileCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: CommunitySubreddit[];
  joinedCommunityIds: string[];
  myCreatedCommunities?: CommunitySubreddit[];
  selectedCommunityId: string | null;
  onSelectCommunity: (communityId: string | null) => void;
  onToggleJoin: (communityId: string) => void;
  onOpenCreateCommunity: () => void;
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

export default function MobileCommunitiesModal({
  isOpen,
  onClose,
  communities,
  joinedCommunityIds,
  myCreatedCommunities = [],
  selectedCommunityId,
  onSelectCommunity,
  onToggleJoin,
  onOpenCreateCommunity,
  onOpenMyCommunities
}: MobileCommunitiesModalProps) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'joined' | 'unjoined' | 'mine'>('all');

  if (!isOpen) return null;

  const myCreatedIds = new Set(myCreatedCommunities.map(c => c.id));

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'joined') {
      return joinedCommunityIds.includes(c.id);
    }
    if (filterTab === 'unjoined') {
      return !joinedCommunityIds.includes(c.id);
    }
    if (filterTab === 'mine') {
      return myCreatedIds.has(c.id);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden text-left animate-fadeIn"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Scholar Communities</h2>
              <p className="text-xs text-slate-500 font-medium">Join hubs to curate your feed on mobile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Tabs */}
        <div className="p-4 border-b border-slate-100 space-y-3 shrink-0 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hubs by topic, category, or title..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`flex-1 min-w-[70px] py-1.5 text-xs font-bold rounded-xl transition text-center ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All ({communities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unjoined')}
              className={`flex-1 min-w-[70px] py-1.5 text-xs font-bold rounded-xl transition text-center ${
                filterTab === 'unjoined'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Discover
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('joined')}
              className={`flex-1 min-w-[70px] py-1.5 text-xs font-bold rounded-xl transition text-center ${
                filterTab === 'joined'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Joined ({joinedCommunityIds.length})
            </button>
            {myCreatedCommunities.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab('mine')}
                className={`flex-1 min-w-[70px] py-1.5 text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1 ${
                  filterTab === 'mine'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100/70'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>My Hubs ({myCreatedCommunities.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Communities List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredCommunities.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No communities found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search filter</p>
            </div>
          ) : (
            filteredCommunities.map((comm) => {
              const isJoined = joinedCommunityIds.includes(comm.id);
              const isCurrent = selectedCommunityId === comm.id;
              const IconComp = ICON_MAP[comm.icon] || Leaf;

              return (
                <div
                  key={comm.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col gap-3 ${
                    isCurrent 
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' 
                      : 'bg-white hover:bg-slate-50/70 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left icon and details */}
                    <div 
                      onClick={() => {
                        onSelectCommunity(comm.id);
                        onClose();
                      }}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${comm.bannerColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900 hover:text-emerald-700 truncate">
                            {comm.name.replace(/^r\//, 'a/')}
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                            {comm.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-1">{comm.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {comm.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Metrics Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                      <span>👥 {comm.membersCount.toLocaleString()} members</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {comm.onlineCount || 24} online
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCommunity(comm.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleJoin(comm.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isJoined
                            ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isJoined ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Joined</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with Create Community and My Communities */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {onOpenMyCommunities ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMyCommunities();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Crown className="w-4 h-4 text-amber-600" />
              <span>My Communities Hub ({myCreatedCommunities.length})</span>
            </button>
          ) : (
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Looking for a specific topic not listed?
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateCommunity();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Create a Community</span>
          </button>
        </div>
      </div>
    </div>
  );
}
