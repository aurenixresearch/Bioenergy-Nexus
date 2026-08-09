import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  likeCommunityPost, 
  commentCommunityPost,
  updateCommunityComments,
  updateCommunityPost,
  deleteCommunityPost 
} from '../services/db';
import { SEED_RESEARCHERS } from '../services/researchersSeed';
import { CommunityPost, CommunityComment } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Globe, 
  Send, 
  UserPlus, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Link2, 
  Image as ImageIcon,
  FileText,
  Paperclip,
  X,
  UploadCloud,
  CheckCircle,
  Filter,
  Sparkles,
  Info,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';

interface CommunityPageProps {
  user: FirebaseUser | null;
  userProfile?: any | null;
}

const TRENDING_TOPICS = [
  'Renewable energy',
  'Waste-to-energy',
  'Solar energy',
  'Climate technology',
  'Energy storage',
  'Sustainable agriculture'
];

const UPCOMING_EVENTS: any[] = [];

export default function CommunityPage({ user, userProfile }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  
  // Post inputs
  const [postContent, setPostContent] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [showAttachmentFields, setShowAttachmentFields] = useState(false);
  const [feedFilter, setFeedFilter] = useState<string | null>(null);

  // File input refs for device uploading
  const imageFileInputRef = React.useRef<HTMLInputElement>(null);
  const docFileInputRef = React.useRef<HTMLInputElement>(null);

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

  // Expanded comments for specific post IDs
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Followed researchers list
  const [followedResearchers, setFollowedResearchers] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_followed_researchers');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved/Bookmarked community posts
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_saved_community_posts');
    return saved ? JSON.parse(saved) : [];
  });

  // Share indicator
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

  // Success state for posting
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetched = await getCommunityPosts();
      setPosts(fetched);
    } catch (err) {
      console.error('Error fetching community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Persist followed state
  useEffect(() => {
    localStorage.setItem('nexus_followed_researchers', JSON.stringify(followedResearchers));
  }, [followedResearchers]);

  // Persist saved state
  useEffect(() => {
    localStorage.setItem('nexus_saved_community_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    if (!user) {
      alert('Please sign in to publish community updates.');
      return;
    }

    try {
      setSubmittingPost(true);
      const authorName = userProfile?.fullName || user?.displayName || 'Scholar Guest';
      const authorInstitution = userProfile?.institution || 'Aurenix Network';
      const authorCountry = userProfile?.country || 'Global';
      const authorAvatar = user?.photoURL || '';

      const researchLinkPayload = postLink || (attachedDoc ? attachedDoc.name : undefined);
      const contentPayload = attachedDoc ? `${postContent}\n\n📎 Attached Document: ${attachedDoc.name} (${attachedDoc.size})` : postContent;

      const postPayload = {
        authorName,
        authorInstitution,
        authorCountry,
        authorAvatar,
        content: contentPayload,
        researchLink: researchLinkPayload,
        imageUrl: postImageUrl || undefined,
        createdAt: new Date().toISOString()
      };

      await createCommunityPost(user.uid, postPayload);
      
      // Clear forms
      setPostContent('');
      setPostLink('');
      setPostImageUrl('');
      setAttachedDoc(null);
      setShowAttachmentFields(false);
      setSuccessMessage('Your research update was shared with the scholar community!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);

      // Reload feed
      await loadPosts();
    } catch (err) {
      console.error('Error sharing community post:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Toggle follow researcher
  const toggleFollow = (researcherId: string) => {
    setFollowedResearchers(prev => 
      prev.includes(researcherId) 
        ? prev.filter(id => id !== researcherId)
        : [...prev, researcherId]
    );
  };

  // Toggle save post
  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Handle like post
  const handleLike = async (post: CommunityPost) => {
    const currentUserId = user?.uid || 'anonymous';
    try {
      // Optimistic update
      const likes = post.likes || [];
      const updatedLikes = likes.includes(currentUserId)
        ? likes.filter(id => id !== currentUserId)
        : [...likes, currentUserId];

      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: updatedLikes } : p));
      await likeCommunityPost(currentUserId, post.id, post);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Editing comment state
  const [editingComment, setEditingComment] = useState<{ postId: string; commentIndex: number; content: string } | null>(null);

  // Editing post state
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);

  // Inline delete confirmation states
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingCommentKey, setDeletingCommentKey] = useState<{ postId: string; commentIndex: number } | null>(null);

  // Helper to verify if current user authored the post
  const isMyPost = (post: CommunityPost) => {
    if (user && post.userId === user.uid) return true;
    if (!user && post.userId === 'anonymous') return true;
    const currentUserName = userProfile?.fullName || user?.displayName;
    if (currentUserName && post.authorName === currentUserName) return true;
    return false;
  };

  // Chats/Posts shouldn't be editable after 5 minutes
  const canEditPost = (post: CommunityPost) => {
    if (!isMyPost(post)) return false;
    const elapsed = Date.now() - new Date(post.createdAt).getTime();
    return elapsed < 5 * 60 * 1000;
  };

  // Chats/Posts shouldn't be deletable after 24 hours
  const canDeletePost = (post: CommunityPost) => {
    if (!isMyPost(post)) return false;
    const elapsed = Date.now() - new Date(post.createdAt).getTime();
    return elapsed < 24 * 60 * 60 * 1000;
  };

  const handleDeletePostConfirm = async (post: CommunityPost) => {
    if (!canDeletePost(post)) {
      alert('This chat/post can no longer be deleted as more than 24 hours have passed since it was uploaded.');
      setDeletingPostId(null);
      return;
    }
    const currentUserId = user?.uid || 'anonymous';
    setDeletingPostId(null);
    // Optimistic UI update
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

    if (!canEditPost(originalPost)) {
      alert('This chat/post can no longer be edited as more than 5 minutes have passed since it was uploaded.');
      setEditingPost(null);
      return;
    }

    const updatedPost = {
      ...originalPost,
      content: editingPost.content.trim()
    };

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    setEditingPost(null);

    try {
      await updateCommunityPost(currentUserId, postId, updatedPost);
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  // Helper to verify if current user authored the comment
  const isMyComment = (comment: CommunityComment) => {
    if (user && comment.userId === user.uid) return true;
    if (!user && comment.userId === 'anonymous') return true;
    const currentUserName = userProfile?.fullName || user?.displayName;
    if (currentUserName && comment.userName === currentUserName) return true;
    return false;
  };

  // Handle comment submit
  const handleAddComment = async (post: CommunityPost, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newCommentText[post.id]?.trim();
    if (!commentText) return;

    const currentUserId = user?.uid || 'anonymous';
    const userName = userProfile?.fullName || user?.displayName || 'Scholar Guest';
    const userAvatar = user?.photoURL || '';

    const newComment: CommunityComment = {
      id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: currentUserId,
      userName,
      userAvatar: userAvatar || undefined,
      content: commentText,
      createdAt: new Date().toISOString()
    };

    try {
      // Optimistic update
      const existingComments = post.comments || [];
      const updatedComments = [...existingComments, newComment];
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: updatedComments } : p));
      
      // Clear input
      setNewCommentText(prev => ({ ...prev, [post.id]: '' }));

      await commentCommunityPost(currentUserId, post.id, post, newComment);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  // Handle save edited comment
  const handleSaveEditComment = async (post: CommunityPost, commentIndex: number) => {
    if (!editingComment || !editingComment.content.trim()) return;
    const currentUserId = user?.uid || 'anonymous';
    const commentsList = post.comments || [];
    if (!commentsList[commentIndex]) return;

    const updatedComments = commentsList.map((c, i) => 
      i === commentIndex 
        ? { ...c, content: editingComment.content.trim() } 
        : c
    );

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: updatedComments } : p));
    setEditingComment(null);

    try {
      await updateCommunityComments(currentUserId, post.id, post, updatedComments);
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  // Handle delete comment
  const handleDeleteCommentConfirm = async (post: CommunityPost, commentIndex: number) => {
    const currentUserId = user?.uid || 'anonymous';
    setDeletingCommentKey(null);
    const commentsList = post.comments || [];
    const updatedComments = commentsList.filter((_, i) => i !== commentIndex);

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: updatedComments } : p));
    if (editingComment?.postId === post.id && editingComment?.commentIndex === commentIndex) {
      setEditingComment(null);
    }

    try {
      await updateCommunityComments(currentUserId, post.id, post, updatedComments);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Copy link
  const handleShare = (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSharedPostId(post.id);
      setTimeout(() => {
        setSharedPostId(null);
      }, 3000);
    });
  };

  // Filter feed by trending tag or search
  const filteredPosts = feedFilter
    ? posts.filter(p => 
        p.content.toLowerCase().includes(feedFilter.toLowerCase()) || 
        (p.researchLink && p.researchLink.toLowerCase().includes(feedFilter.toLowerCase()))
      )
    : posts;

  // Selected connections (exclude self or already followed optionally)
  const suggestedConnections = SEED_RESEARCHERS.slice(0, 3);

  // Selected featured researchers
  const featuredResearchers = SEED_RESEARCHERS.slice(1, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header section with distinct premium layout */}
      <div className="bg-white border border-slate-100 rounded-3xl relative overflow-hidden p-8 sm:p-10 mb-8 shadow-xs">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
              Nexus Network Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900">
              Scholar <span className="text-emerald-600">Community</span> Feed
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Connect, collaborate, and share dynamic updates with renewable energy researchers, waste valorization engineers, and climate scholars.
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => { setFeedFilter(null); loadPosts(); }}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition duration-150 flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-slate-500" />
              Reset Feed
            </button>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {posts.length} Active Posts
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Middle: Post Form & Community Feed (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post Creation Card */}
          {user ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs text-left">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex items-start gap-4">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center uppercase border border-emerald-200">
                      {user.email?.charAt(0) || 'S'}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your latest research breakthrough, field findings, or question..."
                      maxLength={5000}
                      className="w-full min-h-[90px] border-none focus:ring-0 p-0 text-slate-800 placeholder-slate-400 text-sm leading-relaxed resize-none focus:outline-hidden"
                      style={{ borderStyle: 'none' }}
                      required
                    />
                  </div>
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

                {/* Optional Link and Image URL Fields */}
                {showAttachmentFields && (
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Research Reference Link</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={postLink}
                          onChange={(e) => setPostLink(e.target.value)}
                          placeholder="https://aurenix-research.org/papers/your-study"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden text-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Image Attachment URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={postImageUrl}
                          onChange={(e) => setPostImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... or similar photo URL"
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

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Device Image Upload Button */}
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition duration-150 border border-slate-100/80 shadow-2xs cursor-pointer"
                      title="Upload Image from Device"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Photo</span>
                    </button>

                    {/* Device Document Upload Button */}
                    <button
                      type="button"
                      onClick={() => docFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-800 transition duration-150 border border-slate-100/80 shadow-2xs cursor-pointer"
                      title="Upload Document from Device"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Document</span>
                    </button>

                    {/* URL Link Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentFields(!showAttachmentFields)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 cursor-pointer ${
                        showAttachmentFields 
                          ? 'bg-slate-100 text-slate-800 border border-slate-200' 
                          : 'text-slate-500 hover:bg-slate-50 border border-slate-100/80'
                      }`}
                      title="Add URL Link"
                    >
                      <Link2 className="w-4 h-4 text-emerald-600" />
                      <span>Link</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-[11px]">
                      {5000 - postContent.length} characters left
                    </span>
                    <button
                      type="submit"
                      disabled={submittingPost || !postContent.trim()}
                      className="px-5 py-2 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition duration-150 flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-slate-900"
                    >
                      {submittingPost ? 'Publishing...' : 'Share Update'}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left flex items-center gap-4">
              <Info className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">Interested in sharing updates?</h4>
                <p className="text-xs text-slate-500 mt-0.5">Please sign in to join the discussion and post research articles.</p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 text-left flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Filter Status Bar */}
          {feedFilter && (
            <div className="bg-slate-100 text-slate-800 rounded-2xl px-4 py-2.5 text-left flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                <span>Showing posts matching: <strong>"{feedFilter}"</strong></span>
              </div>
              <button 
                onClick={() => setFeedFilter(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Community Feed */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Synchronizing community discussions...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-xs">
              <Globe className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                {feedFilter ? 'No updates matching your filter' : 'No community activity yet.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {feedFilter ? 'Clear active filters to view other scholarly discussions.' : 'Be the first researcher, institution, or industry partner to post on the network feed.'}
              </p>
              {feedFilter && (
                <button
                  onClick={() => setFeedFilter(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => {
                const likedByMe = (post.likes || []).includes(user?.uid || 'anonymous');
                const isSaved = savedPostIds.includes(post.id);
                const hasComments = (post.comments || []).length > 0;
                const commentsList = post.comments || [];
                const showComments = expandedComments[post.id] === true;

                return (
                  <div 
                    key={post.id} 
                    id={`post-${post.id}`}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-left hover:border-slate-200 transition duration-150"
                  >
                    {/* Post Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {post.authorAvatar ? (
                          <img 
                            src={post.authorAvatar} 
                            alt={post.authorName} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center uppercase border border-emerald-100">
                            {post.authorName.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {post.authorName}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            {post.authorInstitution} • {post.authorCountry}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-[11px] text-slate-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {isMyPost(post) && (
                          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
                            {deletingPostId === post.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/80 animate-fadeIn">
                                <span className="text-[10px] text-rose-700 font-bold mr-0.5">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePostConfirm(post)}
                                  className="p-0.5 text-rose-600 hover:text-rose-800 rounded-md transition cursor-pointer"
                                  title="Confirm delete"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingPostId(null)}
                                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                {canEditPost(post) ? (
                                  <button
                                    type="button"
                                    onClick={() => setEditingPost({ id: post.id, content: post.content })}
                                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                    title="Edit post content (only available for 5 mins after posting)"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1 text-slate-300 cursor-not-allowed"
                                    title="Editing is locked (5 minutes elapsed since posting)"
                                  >
                                    <Pencil className="w-3.5 h-3.5 opacity-30" />
                                  </button>
                                )}

                                {canDeletePost(post) ? (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingPostId(post.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Delete post (only available for 24 hours after posting)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1 text-slate-300 cursor-not-allowed"
                                    title="Deletion is locked (24 hours elapsed since posting)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 opacity-30" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    {editingPost?.id === post.id ? (
                      <div className="space-y-3.5 mb-4">
                        <textarea
                          value={editingPost.content}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          className="w-full p-3.5 bg-slate-50 border border-emerald-300 focus:border-emerald-500 rounded-2xl text-sm text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 resize-none min-h-[120px]"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPost(null)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditPost(post.id)}
                            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-700 leading-relaxed space-y-4 mb-4 whitespace-pre-wrap">
                        <p>{post.content}</p>
                      
                      {/* Attached Image */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 max-h-[360px] flex items-center justify-center">
                          <img 
                            src={post.imageUrl} 
                            alt="Attachment" 
                            className="w-full object-cover max-h-[360px]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Reference link */}
                      {post.researchLink && (
                        <a 
                          href={post.researchLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 transition duration-150"
                        >
                          <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-md">Reference Link: {post.researchLink}</span>
                        </a>
                      )}
                    </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1 sm:gap-4">
                        
                        {/* Like Action */}
                        <button
                          onClick={() => handleLike(post)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150 ${
                            likedByMe 
                              ? 'bg-rose-50 text-rose-700' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedByMe ? 'fill-rose-600 text-rose-700' : ''}`} />
                          <span>{(post.likes || []).length}</span>
                        </button>

                        {/* Comment Toggle */}
                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !showComments }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150 ${
                            showComments 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{commentsList.length}</span>
                        </button>

                        {/* Share link to clipboard */}
                        <button
                          onClick={() => handleShare(post)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150 ${
                            sharedPostId === post.id 
                              ? 'bg-slate-900 text-white' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{sharedPostId === post.id ? 'Copied' : 'Share'}</span>
                        </button>
                      </div>

                      {/* Save community post */}
                      <button
                        onClick={() => toggleSavePost(post.id)}
                        className={`p-2 rounded-xl transition duration-150 ${
                          isSaved 
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Bookmark Post'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700' : ''}`} />
                      </button>
                    </div>

                    {/* Comments Drawer / Section */}
                    {showComments && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                        
                        {/* New Comment Input */}
                        <form 
                          onSubmit={(e) => handleAddComment(post, e)} 
                          className="flex items-start gap-3"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={newCommentText[post.id] || ''}
                              onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Write a scholarly response..."
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs text-slate-700 focus:outline-hidden"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition duration-150 flex items-center justify-center shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>

                        {/* List comments */}
                        {hasComments ? (
                          <div className="space-y-3.5 pt-2">
                            {commentsList.map((comment, index) => {
                              const isMine = isMyComment(comment);
                              const isEditingThis = editingComment?.postId === post.id && editingComment?.commentIndex === index;

                              return (
                                <div key={comment.id || index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl text-xs relative group">
                                  {comment.userAvatar ? (
                                    <img 
                                      src={comment.userAvatar} 
                                      alt={comment.userName} 
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center uppercase border border-slate-300 shrink-0">
                                      {comment.userName.charAt(0)}
                                    </div>
                                  )}
                                  <div className="flex-1 text-left space-y-1.5 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-800">{comment.userName}</span>
                                        {isMine && (
                                          <span className="px-1.5 py-0.5 bg-emerald-100/80 text-emerald-800 text-[9px] font-extrabold rounded-md">
                                            You
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>

                                        {/* Edit / Delete action buttons for author */}
                                        {isMine && !isEditingThis && (
                                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {deletingCommentKey?.postId === post.id && deletingCommentKey?.commentIndex === index ? (
                                              <div className="flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-100/80 animate-fadeIn shrink-0">
                                                <span className="text-[9px] text-rose-700 font-bold mr-0.5">Delete?</span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteCommentConfirm(post, index)}
                                                  className="p-0.5 text-rose-600 hover:text-rose-800 rounded-md transition cursor-pointer"
                                                  title="Confirm delete comment"
                                                >
                                                  <Check className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setDeletingCommentKey(null)}
                                                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
                                                  title="Cancel"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ) : (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => setEditingComment({ postId: post.id, commentIndex: index, content: comment.content })}
                                                  className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100/60 rounded-md transition cursor-pointer"
                                                  title="Edit comment"
                                                >
                                                  <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setDeletingCommentKey({ postId: post.id, commentIndex: index })}
                                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-md transition cursor-pointer"
                                                  title="Delete comment"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Comment Content or Edit Form */}
                                    {isEditingThis ? (
                                      <div className="space-y-2 pt-1">
                                        <textarea
                                          value={editingComment.content}
                                          onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                          className="w-full p-2 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 resize-none min-h-[60px]"
                                          autoFocus
                                        />
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => setEditingComment(null)}
                                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSaveEditComment(post, index)}
                                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                                          >
                                            <Check className="w-3 h-3" />
                                            Save
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                                        {comment.content}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 text-center py-2">No comments published yet. Be the first to start the discussion!</p>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Sidebar: Featured Researchers, Connections, Events (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Featured Researchers Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
              Featured Researchers
            </h3>
            <div className="space-y-4">
              {featuredResearchers.map((res) => {
                const followed = followedResearchers.includes(res.id);
                return (
                  <div key={res.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={res.profilePhoto} 
                        alt={res.fullName} 
                        className="w-9 h-9 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{res.fullName}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{res.institution}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollow(res.id)}
                      className={`p-1.5 rounded-lg shrink-0 transition duration-150 ${
                        followed 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title={followed ? 'Following' : 'Follow'}
                    >
                      {followed ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Connections Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-emerald-600" />
              Suggested Connections
            </h3>
            <div className="space-y-4">
              {suggestedConnections.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No researchers in network yet.</p>
              ) : (
                suggestedConnections.map((res) => {
                  const followed = followedResearchers.includes(res.id);
                  return (
                    <div key={res.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={res.profilePhoto} 
                          alt={res.fullName} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{res.fullName}</h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {res.researchInterests.slice(0, 2).join(' • ')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollow(res.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition duration-150 ${
                          followed 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-900 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {followed ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-emerald-600" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {UPCOMING_EVENTS.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No upcoming events scheduled.</p>
              ) : (
                UPCOMING_EVENTS.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-left border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-md">
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{ev.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{ev.title}</h4>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-[10px] text-slate-500">
                      <span className="truncate max-w-[150px]">{ev.organizer}</span>
                      <span className="font-semibold text-emerald-700">{ev.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
