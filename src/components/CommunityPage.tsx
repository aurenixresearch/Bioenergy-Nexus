import React, { useState, useEffect, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  voteCommunityPost,
  likeCommunityPost, 
  commentCommunityPost,
  updateCommunityComments,
  updateCommunityPost,
  deleteCommunityPost,
  getCommunitySubreddits,
  createCommunitySubreddit,
  getUserJoinedCommunityIds,
  toggleJoinCommunitySubreddit,
  DEFAULT_SUBREDDITS
} from '../services/db';
import { SEED_RESEARCHERS } from '../services/researchersSeed';
import { CommunityPost, CommunityComment, CommunitySubreddit } from '../types';
import CreateCommunityModal from './community/CreateCommunityModal';
import RedditSidebar from './community/RedditSidebar';
import { 
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare, 
  Share2, 
  Bookmark, 
  Globe, 
  Send, 
  Plus, 
  Check, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Filter, 
  Link2, 
  Image as ImageIcon,
  FileText,
  X,
  Pencil,
  Trash2,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Tag,
  ChevronDown
} from 'lucide-react';

interface CommunityPageProps {
  user: FirebaseUser | null;
  userProfile?: any | null;
}

const POST_FLAIRS = [
  '🔬 Research Paper',
  '🚀 Breakthrough',
  '💡 Discussion',
  '📊 Dataset',
  '❓ Question',
  '📰 News & Policy'
];

export default function CommunityPage({ user, userProfile }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [communities, setCommunities] = useState<CommunitySubreddit[]>(DEFAULT_SUBREDDITS);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top' | 'rising'>('hot');
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Post creation inputs
  const [targetCommunityId, setTargetCommunityId] = useState<string>('bioenergy');
  const [postTitle, setPostTitle] = useState('');
  const [postFlair, setPostFlair] = useState(POST_FLAIRS[0]);
  const [postContent, setPostContent] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [showAttachmentFields, setShowAttachmentFields] = useState(false);
  const [feedFilter, setFeedFilter] = useState<string | null>(null);

  // Success and feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

  // File input refs
  const imageFileInputRef = React.useRef<HTMLInputElement>(null);
  const docFileInputRef = React.useRef<HTMLInputElement>(null);
  const createPostFormRef = React.useRef<HTMLDivElement>(null);

  // Comments and interactions
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_saved_community_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Edit / Delete states
  const [editingComment, setEditingComment] = useState<{ postId: string; commentIndex: number; content: string } | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string; content: string; title?: string } | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingCommentKey, setDeletingCommentKey] = useState<{ postId: string; commentIndex: number } | null>(null);

  // Initialize data
  useEffect(() => {
    loadCommunitiesAndPosts();
    const joined = getUserJoinedCommunityIds(user?.uid);
    setJoinedCommunityIds(joined);
  }, [user]);

  // Sync selected community with target community in post creator
  useEffect(() => {
    if (selectedCommunityId && selectedCommunityId !== 'joined' && selectedCommunityId !== 'all') {
      setTargetCommunityId(selectedCommunityId);
    }
  }, [selectedCommunityId]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('nexus_saved_community_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  const loadCommunitiesAndPosts = async () => {
    try {
      setLoading(true);
      const [fetchedPosts, fetchedCommunities] = await Promise.all([
        getCommunityPosts(),
        getCommunitySubreddits()
      ]);
      setPosts(fetchedPosts);
      if (fetchedCommunities && fetchedCommunities.length > 0) {
        setCommunities(fetchedCommunities);
      }
    } catch (err) {
      console.error('Error loading community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPostImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeviceDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedDoc({
        name: file.name,
        size: `${sizeMB} MB`,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // CREATE POST HANDLER (Optimistic UI + Guaranteed Instant Render)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postTitle.trim()) return;

    try {
      setSubmittingPost(true);
      
      // Determine user identity
      let currentUserId = user?.uid;
      if (!currentUserId) {
        let cachedGuestId = localStorage.getItem('nexus_guest_id');
        if (!cachedGuestId) {
          cachedGuestId = 'scholar_' + Math.random().toString(36).substring(2, 8);
          localStorage.setItem('nexus_guest_id', cachedGuestId);
        }
        currentUserId = cachedGuestId;
      }

      const authorName = userProfile?.fullName || user?.displayName || 'Dr. Alex Vance';
      const authorInstitution = userProfile?.institution || 'Aurenix Clean Energy Alliance';
      const authorCountry = userProfile?.country || 'Global';
      const authorAvatar = user?.photoURL || '';

      // Locate target community
      const commObj = communities.find(c => c.id === targetCommunityId) || communities[0] || DEFAULT_SUBREDDITS[0];
      const commId = commObj.id;
      const commName = commObj.name;

      const titleResolved = postTitle.trim() || (postContent.trim().length > 70 
        ? postContent.trim().substring(0, 70) + '...' 
        : postContent.trim());

      const researchLinkPayload = postLink || (attachedDoc ? attachedDoc.name : undefined);
      const contentPayload = attachedDoc 
        ? `${postContent}\n\n📎 Attached Document: ${attachedDoc.name} (${attachedDoc.size})` 
        : postContent;

      const postPayload = {
        authorName,
        authorInstitution,
        authorCountry,
        authorAvatar,
        communityId: commId,
        communityName: commName,
        title: titleResolved,
        flair: postFlair,
        content: contentPayload,
        researchLink: researchLinkPayload,
        imageUrl: postImageUrl || undefined,
        createdAt: new Date().toISOString()
      };

      // Call database service
      const newPostId = await createCommunityPost(currentUserId, postPayload);

      // Instant optimistic update so the post appears in the feed immediately
      const newlyCreatedPost: CommunityPost = {
        id: newPostId,
        userId: currentUserId,
        authorName,
        authorInstitution,
        authorCountry,
        authorAvatar,
        communityId: commId,
        communityName: commName,
        title: titleResolved,
        flair: postFlair,
        content: contentPayload,
        researchLink: researchLinkPayload,
        imageUrl: postImageUrl || undefined,
        createdAt: postPayload.createdAt,
        likes: [currentUserId],
        upvotes: [currentUserId],
        downvotes: [],
        comments: []
      };

      setPosts(prev => [newlyCreatedPost, ...prev.filter(p => p.id !== newPostId)]);

      // Reset form
      setPostTitle('');
      setPostContent('');
      setPostLink('');
      setPostImageUrl('');
      setAttachedDoc(null);
      setShowAttachmentFields(false);

      // Success notification
      setSuccessMessage(`🎉 Post published successfully to ${commName}! Your research update is now visible in the community feed.`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (err) {
      console.error('Error creating community post:', err);
      alert('Unable to share post right now. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // REDDIT-STYLE VOTING
  const handleVote = async (post: CommunityPost, voteType: 'up' | 'down') => {
    let currentUserId = user?.uid;
    if (!currentUserId) {
      let cached = localStorage.getItem('nexus_guest_id');
      if (!cached) {
        cached = 'scholar_' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('nexus_guest_id', cached);
      }
      currentUserId = cached;
    }

    // Optimistic local state update
    let upvotes = post.upvotes ? [...post.upvotes] : (post.likes ? [...post.likes] : []);
    let downvotes = post.downvotes ? [...post.downvotes] : [];

    const hasUpvoted = upvotes.includes(currentUserId);
    const hasDownvoted = downvotes.includes(currentUserId);

    if (voteType === 'up') {
      if (hasUpvoted) {
        upvotes = upvotes.filter(id => id !== currentUserId);
      } else {
        upvotes.push(currentUserId);
        downvotes = downvotes.filter(id => id !== currentUserId);
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        downvotes = downvotes.filter(id => id !== currentUserId);
      } else {
        downvotes.push(currentUserId);
        upvotes = upvotes.filter(id => id !== currentUserId);
      }
    }

    const updatedPost: CommunityPost = {
      ...post,
      upvotes,
      downvotes,
      likes: upvotes
    };

    setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));

    try {
      await voteCommunityPost(currentUserId, post.id, post, voteType);
    } catch (err) {
      console.error('Error voting on post:', err);
    }
  };

  // JOIN / LEAVE COMMUNITY
  const handleToggleJoin = async (communityId: string) => {
    const isCurrentlyJoined = joinedCommunityIds.includes(communityId);
    const currentUserId = user?.uid;

    if (isCurrentlyJoined) {
      setJoinedCommunityIds(prev => prev.filter(id => id !== communityId));
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, membersCount: Math.max(1, c.membersCount - 1) } : c));
    } else {
      setJoinedCommunityIds(prev => Array.from(new Set([...prev, communityId])));
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, membersCount: c.membersCount + 1 } : c));
    }

    try {
      await toggleJoinCommunitySubreddit(currentUserId, communityId, !isCurrentlyJoined);
    } catch (err) {
      console.warn('Toggle join error:', err);
    }
  };

  // CREATE NEW COMMUNITY
  const handleCreateCommunity = async (
    communityData: Omit<CommunitySubreddit, 'id' | 'createdAt' | 'membersCount' | 'onlineCount'>
  ) => {
    const currentUserId = user?.uid || 'scholar-admin';
    const newComm = await createCommunitySubreddit(currentUserId, communityData);
    setCommunities(prev => [newComm, ...prev.filter(c => c.id !== newComm.id)]);
    setJoinedCommunityIds(prev => Array.from(new Set([...prev, newComm.id])));
    setSelectedCommunityId(newComm.id);
    setTargetCommunityId(newComm.id);
    setSuccessMessage(`✨ ${newComm.name} created and joined successfully!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Post authorship check
  const isMyPost = (post: CommunityPost) => {
    if (user && post.userId === user.uid) return true;
    const cachedGuestId = localStorage.getItem('nexus_guest_id');
    if (cachedGuestId && post.userId === cachedGuestId) return true;
    const currentUserName = userProfile?.fullName || user?.displayName;
    if (currentUserName && post.authorName === currentUserName) return true;
    return false;
  };

  const canEditPost = (post: CommunityPost) => {
    if (!isMyPost(post)) return false;
    const elapsed = Date.now() - new Date(post.createdAt).getTime();
    return elapsed < 5 * 60 * 1000;
  };

  const canDeletePost = (post: CommunityPost) => {
    if (!isMyPost(post)) return false;
    const elapsed = Date.now() - new Date(post.createdAt).getTime();
    return elapsed < 24 * 60 * 60 * 1000;
  };

  const handleDeletePostConfirm = async (post: CommunityPost) => {
    if (!canDeletePost(post)) {
      alert('This post can no longer be deleted as more than 24 hours have passed.');
      setDeletingPostId(null);
      return;
    }
    const currentUserId = user?.uid || 'anonymous';
    setDeletingPostId(null);
    setPosts(prev => prev.filter(p => p.id !== post.id));
    try {
      await deleteCommunityPost(currentUserId, post.id);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleSaveEditPost = async (postId: string) => {
    if (!editingPost || !editingPost.content.trim()) return;
    const currentUserId = user?.uid || 'anonymous';
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    const updatedPost = {
      ...originalPost,
      content: editingPost.content.trim(),
      title: editingPost.title ? editingPost.title.trim() : originalPost.title
    };

    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    setEditingPost(null);

    try {
      await updateCommunityPost(currentUserId, postId, updatedPost);
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  // Add Comment
  const handleAddComment = async (post: CommunityPost, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newCommentText[post.id]?.trim();
    if (!commentText) return;

    let currentUserId = user?.uid;
    if (!currentUserId) {
      let cached = localStorage.getItem('nexus_guest_id');
      if (!cached) {
        cached = 'scholar_' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('nexus_guest_id', cached);
      }
      currentUserId = cached;
    }

    const userName = userProfile?.fullName || user?.displayName || 'Scholar Peer';
    const userAvatar = user?.photoURL || '';

    const newComment: CommunityComment = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: currentUserId,
      userName,
      userAvatar: userAvatar || undefined,
      content: commentText,
      createdAt: new Date().toISOString(),
      upvotes: [currentUserId]
    };

    const existingComments = post.comments || [];
    const updatedComments = [...existingComments, newComment];
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: updatedComments } : p));
    setNewCommentText(prev => ({ ...prev, [post.id]: '' }));

    try {
      await commentCommunityPost(currentUserId, post.id, post, newComment);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleShare = (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSharedPostId(post.id);
      setTimeout(() => setSharedPostId(null), 3000);
    });
  };

  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Filter & Sort Posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by community
    if (selectedCommunityId === 'joined') {
      result = result.filter(p => p.communityId && joinedCommunityIds.includes(p.communityId));
    } else if (selectedCommunityId && selectedCommunityId !== 'all') {
      result = result.filter(p => p.communityId === selectedCommunityId);
    }

    // Filter by search / text keyword
    if (feedFilter) {
      const q = feedFilter.toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        p.content.toLowerCase().includes(q) ||
        (p.communityName && p.communityName.toLowerCase().includes(q)) ||
        (p.flair && p.flair.toLowerCase().includes(q))
      );
    }

    // Sort according to Reddit tabs
    if (activeSort === 'new') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeSort === 'top') {
      result.sort((a, b) => {
        const scoreA = (a.upvotes?.length || a.likes?.length || 0) - (a.downvotes?.length || 0);
        const scoreB = (b.upvotes?.length || b.likes?.length || 0) - (b.downvotes?.length || 0);
        return scoreB - scoreA;
      });
    } else if (activeSort === 'rising') {
      result.sort((a, b) => {
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        return commentsB - commentsA;
      });
    } else {
      // 'hot' - balance score and recency
      result.sort((a, b) => {
        const scoreA = (a.upvotes?.length || a.likes?.length || 0) - (a.downvotes?.length || 0);
        const scoreB = (b.upvotes?.length || b.likes?.length || 0) - (b.downvotes?.length || 0);
        const ageHoursA = Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / (3600 * 1000));
        const ageHoursB = Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (3600 * 1000));
        const hotA = scoreA / Math.pow(ageHoursA + 2, 1.2);
        const hotB = scoreB / Math.pow(ageHoursB + 2, 1.2);
        return hotB - hotA;
      });
    }

    return result;
  }, [posts, selectedCommunityId, joinedCommunityIds, feedFilter, activeSort]);

  // Currently active community object (if selected)
  const activeCommunityObj = useMemo(() => {
    if (!selectedCommunityId || selectedCommunityId === 'all' || selectedCommunityId === 'joined') return null;
    return communities.find(c => c.id === selectedCommunityId) || null;
  }, [selectedCommunityId, communities]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* 1. TOP REDDIT-STYLE COMMUNITY HEADER / BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl relative overflow-hidden mb-6 shadow-xs">
        {/* If viewing a specific subreddit, show that subreddit's banner */}
        {activeCommunityObj ? (
          <div>
            <div className={`h-28 bg-gradient-to-r ${activeCommunityObj.bannerColor || 'from-emerald-600 to-teal-700'} relative p-6 flex items-end justify-between`}>
              <div className="flex items-center gap-4 relative top-6">
                <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 flex items-center justify-center">
                  <div className={`w-full h-full rounded-xl bg-gradient-to-r ${activeCommunityObj.bannerColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center font-black text-xl`}>
                    a/
                  </div>
                </div>
                <div className="text-left pt-6">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeCommunityObj.name.replace(/^r\//, 'a/')}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      {activeCommunityObj.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{activeCommunityObj.title}</p>
                </div>
              </div>

              {/* Join / Leave button on banner */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleJoin(activeCommunityObj.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-2 cursor-pointer shadow-md ${
                    joinedCommunityIds.includes(activeCommunityObj.id)
                      ? 'bg-white text-slate-800 border border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {joinedCommunityIds.includes(activeCommunityObj.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Join Community</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-8 px-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed text-left">
                {activeCommunityObj.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold shrink-0">
                <span>👥 {activeCommunityObj.membersCount.toLocaleString()} Members</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activeCommunityObj.onlineCount || 24} Online
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Default All-Communities Hub Banner */
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Nexus Scholar Community
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Renewable Energy & Climate <span className="text-emerald-600">Reddit-Style Feed</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Join specialized sub-communities, post peer findings, engage in constructive discussions, and upvote high-impact research.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition duration-150 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Community
                </button>

                <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{posts.length} Research Posts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBREDDIT NAVIGATION BAR */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCommunityId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCommunityId === null 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            a/all (All Hubs)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCommunityId('joined')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCommunityId === 'joined' 
                ? 'bg-emerald-600 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            ⭐ My Joined ({joinedCommunityIds.length})
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

          {/* Quick Subreddit Chips */}
          {communities.map((c) => {
            const isSelected = selectedCommunityId === c.id;
            const isJoined = joinedCommunityIds.includes(c.id);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCommunityId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-2xs' 
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                <span>{c.name.replace(/^r\//, 'a/')}</span>
                {isJoined && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer shrink-0 flex items-center gap-1 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Community</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT (Main Feed + Reddit Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Feed Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* POST CREATION CARD - DOM STRUCTURE PRESERVED FOR SELECTOR COMPATIBILITY */}
          <div ref={createPostFormRef} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs text-left">
            <form onSubmit={handleCreatePost} className="space-y-4">
              
              {/* Row 1: Author info & Community selector */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center uppercase border border-emerald-200">
                        {user?.email?.charAt(0) || userProfile?.fullName?.charAt(0) || 'S'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {userProfile?.fullName || user?.displayName || 'Scholar Researcher'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {userProfile?.institution || 'Aurenix Network'}
                      </p>
                    </div>
                  </div>

                  {/* Reddit Community Destination Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Post to:</span>
                    <select
                      value={targetCommunityId}
                      onChange={(e) => setTargetCommunityId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {communities.map(comm => (
                        <option key={comm.id} value={comm.id}>
                          {comm.name.replace(/^r\//, 'a/')} ({comm.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reddit Post Title Input */}
                <div>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title (e.g. Field Trial Results, Question, Breakthrough...)"
                    maxLength={140}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Flair Picker Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Flair:
                  </span>
                  {POST_FLAIRS.map(flair => {
                    const isSelected = postFlair === flair;
                    return (
                      <button
                        key={flair}
                        type="button"
                        onClick={() => setPostFlair(flair)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          isSelected 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        {flair}
                      </button>
                    );
                  })}
                </div>

                {/* Main Content Body */}
                <div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Provide experimental findings, research methodology, hypothesis, or technical questions..."
                    maxLength={5000}
                    rows={4}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Previews for attached device image or document */}
                {(postImageUrl || attachedDoc) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {postImageUrl && (
                      <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50 max-w-xs">
                        <img src={postImageUrl} alt="Preview attachment" className="h-28 w-auto object-cover rounded-2xl" />
                        <button
                          type="button"
                          onClick={() => setPostImageUrl('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition shadow-xs cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {attachedDoc && (
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs text-emerald-950 font-medium max-w-sm">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-slate-800">{attachedDoc.name}</p>
                          <p className="text-[10px] text-emerald-700">{attachedDoc.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedDoc(null)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Remove Document"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Link Field */}
                {showAttachmentFields && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/80 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Research Reference / DOI / Paper URL
                      </label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={postLink}
                          onChange={(e) => setPostLink(e.target.value)}
                          placeholder="https://doi.org/... or journal link"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden File Inputs for Device Uploads */}
                <input
                  type="file"
                  ref={imageFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleDeviceImageSelect}
                />
                <input
                  type="file"
                  ref={docFileInputRef}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.xlsx"
                  className="hidden"
                  onChange={handleDeviceDocSelect}
                />
              </div>

              {/* Toolbar - MATCHES CSS SELECTOR: div#root > ... > form:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(1) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {/* Photo upload button */}
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition duration-150 border border-slate-200/80 cursor-pointer shadow-2xs"
                    title="Upload Image from Device"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Photo</span>
                  </button>

                  {/* Document upload button */}
                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-800 transition duration-150 border border-slate-200/80 cursor-pointer shadow-2xs"
                    title="Upload Research Document from Device"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Document</span>
                  </button>

                  {/* Reference URL Link Button */}
                  <button
                    type="button"
                    onClick={() => setShowAttachmentFields(!showAttachmentFields)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 cursor-pointer ${
                      showAttachmentFields 
                        ? 'bg-slate-100 text-slate-800 border border-slate-300' 
                        : 'text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                    }`}
                    title="Add Research Reference Link"
                  >
                    <Link2 className="w-4 h-4 text-emerald-600" />
                    <span>Reference Link</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">
                    {5000 - postContent.length} left
                  </span>
                  <button
                    type="submit"
                    disabled={submittingPost || (!postContent.trim() && !postTitle.trim())}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition duration-150 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingPost ? 'Publishing...' : 'Share Update'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-left flex items-center gap-3 shadow-xs animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* REDDIT SORT TABS & SEARCH BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSort('hot')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeSort === 'hot' 
                    ? 'bg-slate-100 text-orange-600 font-extrabold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flame className={`w-4 h-4 ${activeSort === 'hot' ? 'text-orange-500 fill-orange-500' : ''}`} />
                <span>Hot</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSort('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeSort === 'new' 
                    ? 'bg-slate-100 text-emerald-700 font-extrabold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSort('top')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeSort === 'top' 
                    ? 'bg-slate-100 text-indigo-700 font-extrabold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Top</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSort('rising')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeSort === 'rising' 
                    ? 'bg-slate-100 text-teal-700 font-extrabold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Rising</span>
              </button>
            </div>

            {/* Keyword Search Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={feedFilter || ''}
                  onChange={(e) => setFeedFilter(e.target.value || null)}
                  placeholder="Search feed..."
                  className="w-44 sm:w-56 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {feedFilter && (
                  <button
                    type="button"
                    onClick={() => setFeedFilter(null)}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* POSTS LIST */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Synchronizing scholar community discussions...</p>
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center space-y-4 shadow-xs">
              <Globe className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                {feedFilter ? 'No updates matching your filter' : 'No posts in this community yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Be the first researcher to share an experimental dataset, research methodology, or breakthrough in this community!
              </p>
              <button
                type="button"
                onClick={() => {
                  createPostFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Create the First Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedPosts.map((post) => {
                const currentUserId = user?.uid || localStorage.getItem('nexus_guest_id') || 'guest';
                const upvotes = post.upvotes || post.likes || [];
                const downvotes = post.downvotes || [];
                const netScore = upvotes.length - downvotes.length;
                const hasUpvoted = upvotes.includes(currentUserId);
                const hasDownvoted = downvotes.includes(currentUserId);
                const isSaved = savedPostIds.includes(post.id);
                const commentsCount = (post.comments || []).length;
                const isCommentsOpen = expandedComments[post.id] === true;

                // Subreddit info for this post
                const postCommunity = communities.find(c => c.id === post.communityId) || {
                  id: post.communityId || 'bioenergy',
                  name: post.communityName ? post.communityName.replace(/^r\//, 'a/') : 'a/bioenergy',
                  category: 'Renewable Energy'
                };
                const isPostCommunityJoined = joinedCommunityIds.includes(postCommunity.id);

                return (
                  <div
                    key={post.id}
                    id={`post-${post.id}`}
                    className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:border-slate-300 transition duration-150 flex flex-col sm:flex-row text-left"
                  >
                    {/* REDDIT LEFT VOTING COLUMN (Desktop gutter / Mobile header) */}
                    <div className="bg-slate-50/70 border-b sm:border-b-0 sm:border-r border-slate-100 p-2 sm:p-3 flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0">
                      <div className="flex sm:flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleVote(post, 'up')}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            hasUpvoted 
                              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                              : 'text-slate-400 hover:text-orange-600 hover:bg-slate-100'
                          }`}
                          title="Upvote"
                        >
                          <ArrowBigUp className={`w-6 h-6 ${hasUpvoted ? 'fill-orange-500' : ''}`} />
                        </button>

                        <span className={`text-xs font-black min-w-[24px] text-center ${
                          hasUpvoted ? 'text-orange-600' : hasDownvoted ? 'text-blue-600' : 'text-slate-700'
                        }`}>
                          {netScore > 0 ? `+${netScore}` : netScore}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleVote(post, 'down')}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            hasDownvoted 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                          title="Downvote"
                        >
                          <ArrowBigDown className={`w-6 h-6 ${hasDownvoted ? 'fill-blue-500' : ''}`} />
                        </button>
                      </div>

                      {/* Mobile Community Pill */}
                      <div className="sm:hidden flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800">
                          {(post.communityName || 'a/bioenergy').replace(/^r\//, 'a/')}
                        </span>
                      </div>
                    </div>

                    {/* REDDIT MAIN POST CONTENT */}
                    <div className="p-5 sm:p-6 flex-1 min-w-0 space-y-3">
                      
                      {/* Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Subreddit badge */}
                          <button
                            type="button"
                            onClick={() => setSelectedCommunityId(postCommunity.id)}
                            className="font-extrabold text-slate-900 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                              a/
                            </span>
                            <span>{(post.communityName || postCommunity.name).replace(/^r\//, 'a/')}</span>
                          </button>

                          <span className="text-slate-300">•</span>

                          {/* Author info */}
                          <span className="text-slate-500 font-medium">
                            Posted by <strong className="text-slate-700 font-semibold">u/{post.authorName}</strong>
                          </span>

                          <span className="text-slate-300">•</span>

                          {/* Time */}
                          <span className="text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>

                          {/* Post Flair */}
                          {post.flair && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {post.flair}
                            </span>
                          )}
                        </div>

                        {/* Right Header Actions (Join Community if not joined, or Author Edit/Delete) */}
                        <div className="flex items-center gap-2">
                          {!isPostCommunityJoined && postCommunity.id && (
                            <button
                              type="button"
                              onClick={() => handleToggleJoin(postCommunity.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Join
                            </button>
                          )}

                          {isMyPost(post) && (
                            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                              {deletingPostId === post.id ? (
                                <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 animate-fadeIn">
                                  <span className="text-[10px] text-rose-700 font-bold">Delete?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePostConfirm(post)}
                                    className="p-0.5 text-rose-600 hover:text-rose-800"
                                    title="Confirm delete"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingPostId(null)}
                                    className="p-0.5 text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {canEditPost(post) ? (
                                    <button
                                      type="button"
                                      onClick={() => setEditingPost({ id: post.id, content: post.content, title: post.title })}
                                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-md transition cursor-pointer"
                                      title="Edit post content"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  ) : null}

                                  {canDeletePost(post) ? (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingPostId(post.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                                      title="Delete post"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Title */}
                      {post.title && (
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-emerald-800 transition cursor-pointer">
                          {post.title}
                        </h2>
                      )}

                      {/* Post Body (or inline edit form) */}
                      {editingPost?.id === post.id ? (
                        <div className="space-y-3 pt-2">
                          <textarea
                            value={editingPost.content}
                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden"
                            rows={4}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingPost(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditPost(post.id)}
                              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </div>
                      )}

                      {/* Attached Media: Image */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[380px] flex items-center justify-center">
                          <img 
                            src={post.imageUrl} 
                            alt="Attachment" 
                            className="w-full object-cover max-h-[380px]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Reference Link */}
                      {post.researchLink && (
                        <a 
                          href={post.researchLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 transition duration-150"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-md">Reference: {post.researchLink}</span>
                        </a>
                      )}

                      {/* REDDIT ACTION FOOTER BAR */}
                      <div className="flex items-center gap-2 sm:gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                        
                        {/* Comments Toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isCommentsOpen }))}
                          className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                            isCommentsOpen ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
                        </button>

                        {/* Share */}
                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="px-2.5 py-1.5 rounded-xl hover:bg-slate-50 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{sharedPostId === post.id ? 'Copied Link!' : 'Share'}</span>
                        </button>

                        {/* Bookmark / Save */}
                        <button
                          type="button"
                          onClick={() => toggleSavePost(post.id)}
                          className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                            isSaved ? 'text-amber-600 bg-amber-50' : 'hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                      {/* EXPANDABLE REDDIT COMMENTS SECTION */}
                      {isCommentsOpen && (
                        <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                          
                          {/* Add Comment Input */}
                          <form onSubmit={(e) => handleAddComment(post, e)} className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {user?.displayName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 space-y-2">
                              <textarea
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder={`Comment as u/${userProfile?.fullName || user?.displayName || 'Scholar Guest'}...`}
                                rows={2}
                                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 resize-none text-slate-800"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  disabled={!newCommentText[post.id]?.trim()}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                                >
                                  Comment
                                </button>
                              </div>
                            </div>
                          </form>

                          {/* Existing Comments List */}
                          {(post.comments || []).length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-2">
                              No comments yet. Be the first to start the discussion!
                            </p>
                          ) : (
                            <div className="space-y-3 pt-2">
                              {(post.comments || []).map((comm, cIdx) => (
                                <div key={comm.id || cIdx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800">u/{comm.userName}</span>
                                      {comm.userId === post.userId && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                                          OP
                                        </span>
                                      )}
                                      <span className="text-slate-400">•</span>
                                      <span className="text-slate-400">
                                        {new Date(comm.createdAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {comm.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Sidebar Column (4 cols on lg) */}
        <div className="lg:col-span-4 hidden lg:block">
          <RedditSidebar
            currentCommunity={activeCommunityObj}
            communities={communities}
            joinedCommunityIds={joinedCommunityIds}
            onToggleJoin={handleToggleJoin}
            onSelectCommunity={setSelectedCommunityId}
            onOpenCreateCommunity={() => setIsCreateModalOpen(true)}
            onCreatePostClick={() => {
              createPostFormRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

      </div>

      {/* CREATE COMMUNITY MODAL */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCommunity={handleCreateCommunity}
        userId={user?.uid}
      />

    </div>
  );
}
