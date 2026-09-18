import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { CommunitySubreddit, CommunityPost } from '../types';
import { 
  getCommunitySubreddits, 
  getCommunityPosts, 
  createCommunitySubreddit, 
  updateCommunitySubreddit, 
  deleteCommunitySubreddit, 
  updateCommunityPost, 
  deleteCommunityPost,
  getMyCreatedCommunityIds,
  addMyCreatedCommunityId
} from '../services/db';
import MyCommunityHub from './community/MyCommunityHub';
import CreateCommunityModal from './community/CreateCommunityModal';
import EditPostModal from './community/EditPostModal';
import EditCommunityModal from './community/EditCommunityModal';
import { 
  Crown, 
  ArrowLeft, 
  Plus, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface MyCommunitiesPageProps {
  user: User | null;
  userProfile?: any;
  onNavigateToView: (view: string) => void;
  theme?: 'light' | 'dark';
}

export default function MyCommunitiesPage({
  user,
  userProfile,
  onNavigateToView
}: MyCommunitiesPageProps) {
  const [communities, setCommunities] = useState<CommunitySubreddit[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postToEditModal, setPostToEditModal] = useState<CommunityPost | null>(null);
  const [communityToEditModal, setCommunityToEditModal] = useState<CommunitySubreddit | null>(null);
  const [myCreatedCommunityIds, setMyCreatedCommunityIds] = useState<string[]>(() => {
    return getMyCreatedCommunityIds();
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedComm, fetchedPosts] = await Promise.all([
        getCommunitySubreddits(),
        getCommunityPosts()
      ]);
      setCommunities(fetchedComm);
      setPosts(fetchedPosts);

      // Auto sync user's created communities into local storage
      const currentUserId = user?.uid;
      const guestId = localStorage.getItem('nexus_guest_id');
      fetchedComm.forEach(c => {
        if ((currentUserId && c.createdBy === currentUserId) || (guestId && c.createdBy === guestId) || (!c.isDefault && c.createdBy)) {
          addMyCreatedCommunityId(c.id);
        }
      });
      setMyCreatedCommunityIds(getMyCreatedCommunityIds());
    } catch (err) {
      console.error('Failed to load my communities data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('communities-updated', handleUpdate);
    return () => window.removeEventListener('communities-updated', handleUpdate);
  }, [user]);

  // Filter user's created communities
  const myCreatedCommunities = useMemo(() => {
    const currentUserId = user?.uid;
    const guestId = localStorage.getItem('nexus_guest_id');

    return communities.filter(c => {
      if (myCreatedCommunityIds.includes(c.id)) return true;
      if (currentUserId && c.createdBy === currentUserId) return true;
      if (guestId && c.createdBy === guestId) return true;
      if (!c.isDefault && c.createdBy) return true;
      return false;
    });
  }, [communities, user, myCreatedCommunityIds]);

  // Check if post belongs to user
  const isMyPost = (post: CommunityPost) => {
    if (user && post.userId === user.uid) return true;
    const guestId = localStorage.getItem('nexus_guest_id');
    if (guestId && post.userId === guestId) return true;
    if (post.authorName === 'Guest Scholar' && !user) return true;
    return false;
  };

  // CREATE COMMUNITY
  const handleCreateCommunity = async (
    communityData: Omit<CommunitySubreddit, 'id' | 'createdAt' | 'membersCount' | 'onlineCount'>
  ) => {
    const currentUserId = user?.uid || 'anonymous';
    try {
      const newComm = await createCommunitySubreddit(currentUserId, communityData);
      setCommunities(prev => [newComm, ...prev.filter(c => c.id !== newComm.id)]);
      setMyCreatedCommunityIds(prev => Array.from(new Set([...prev, newComm.id])));
      window.dispatchEvent(new CustomEvent('communities-updated'));
      setSuccessMessage(`✨ Hub ${newComm.name} created successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error creating community:', err);
      setErrorMessage('Failed to create community. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // UPDATE COMMUNITY
  const handleUpdateCommunity = async (commId: string, updatedData: Partial<CommunitySubreddit>) => {
    const currentUserId = user?.uid || 'anonymous';
    setCommunities(prev => prev.map(c => c.id === commId ? { ...c, ...updatedData } : c));
    try {
      await updateCommunitySubreddit(currentUserId, commId, updatedData);
      window.dispatchEvent(new CustomEvent('communities-updated'));
      setSuccessMessage('Community settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error updating community:', err);
      setErrorMessage('Failed to update community settings.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // DELETE COMMUNITY
  const handleDeleteCommunity = async (comm: CommunitySubreddit) => {
    const currentUserId = user?.uid || 'anonymous';
    setCommunities(prev => prev.filter(c => c.id !== comm.id));
    setMyCreatedCommunityIds(prev => prev.filter(id => id !== comm.id));
    try {
      await deleteCommunitySubreddit(currentUserId, comm.id);
      window.dispatchEvent(new CustomEvent('communities-updated'));
      setSuccessMessage(`Community ${comm.name} deleted.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting community:', err);
      setErrorMessage('Failed to delete community.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // EDIT POST
  const handleSaveModalEditPost = async (
    postId: string,
    updatedData: { title: string; content: string; flair?: string; researchLink?: string }
  ) => {
    const currentUserId = user?.uid || 'anonymous';
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    const updatedPost: CommunityPost = {
      ...originalPost,
      ...updatedData
    };

    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    setPostToEditModal(null);

    try {
      await updateCommunityPost(currentUserId, postId, updatedPost);
      setSuccessMessage('Research post updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error updating post:', err);
      setErrorMessage('Failed to update post.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // DELETE POST
  const handleDeletePostConfirm = async (post: CommunityPost) => {
    const currentUserId = user?.uid || 'anonymous';
    setPosts(prev => prev.filter(p => p.id !== post.id));
    try {
      await deleteCommunityPost(currentUserId, post.id);
      setSuccessMessage('Post removed successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting post:', err);
      setErrorMessage('Failed to delete post.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Select a community to view in main feed
  const handleSelectCommunity = (commId: string | null) => {
    if (commId && commId !== 'all') {
      localStorage.setItem('nexus_target_community_id', commId);
    }
    onNavigateToView('community');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#000000] text-slate-900 dark:text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-white dark:border-transparent rounded-lg px-1.5 py-0.5">
              <button 
                type="button" 
                onClick={() => onNavigateToView('home')} 
                className="hover:text-emerald-700 dark:hover:text-emerald-400 transition"
              >
                Home
              </button>
              <span>/</span>
              <button 
                type="button" 
                onClick={() => onNavigateToView('community')} 
                className="hover:text-emerald-700 dark:hover:text-emerald-400 transition"
              >
                Community Feed
              </button>
              <span>/</span>
              <span className="text-emerald-800 dark:text-emerald-400 font-bold">My Communities</span>
            </div>

            <div className="flex items-center gap-3 pt-1 bg-white dark:bg-transparent border border-white dark:border-transparent rounded-2xl p-2 sm:p-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-white dark:border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  My Communities
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Manage your founded academic hubs, track publication views & engagement, and manage research publications.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToView('community')}
              className="px-4 py-2.5 bg-white dark:bg-[#000000] hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Community Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Hub</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200 animate-fade-in shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="bg-white dark:bg-[#000000] rounded-3xl border border-slate-200 dark:border-neutral-800 p-12 text-center shadow-xs">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading your communities & research engagement...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#000000] rounded-3xl border border-slate-200/90 dark:border-neutral-800 p-5 sm:p-8 shadow-xs">
            <MyCommunityHub
              createdCommunities={myCreatedCommunities}
              allCommunities={communities}
              posts={posts}
              currentUserId={user?.uid}
              userName={userProfile?.fullName || user?.displayName}
              onSelectCommunity={handleSelectCommunity}
              onOpenCreateCommunity={() => setIsCreateModalOpen(true)}
              onEditPost={(post) => setPostToEditModal(post)}
              onDeletePost={(post) => handleDeletePostConfirm(post)}
              onEditCommunity={(comm) => setCommunityToEditModal(comm)}
              onDeleteCommunity={(comm) => handleDeleteCommunity(comm)}
              onBackToFeed={() => onNavigateToView('community')}
              isMyPost={isMyPost}
            />
          </div>
        )}

      </div>

      {/* CREATE COMMUNITY MODAL */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCommunity={handleCreateCommunity}
        userId={user?.uid}
      />

      {/* EDIT POST MODAL */}
      <EditPostModal
        isOpen={!!postToEditModal}
        onClose={() => setPostToEditModal(null)}
        post={postToEditModal}
        onSave={handleSaveModalEditPost}
      />

      {/* EDIT COMMUNITY MODAL */}
      <EditCommunityModal
        isOpen={!!communityToEditModal}
        onClose={() => setCommunityToEditModal(null)}
        community={communityToEditModal}
        onSave={handleUpdateCommunity}
      />
    </div>
  );
}
