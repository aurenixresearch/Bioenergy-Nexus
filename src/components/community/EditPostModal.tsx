import React, { useState } from 'react';
import { CommunityPost } from '../../types';
import { X, Edit3, Tag, Link2, Sparkles, AlertCircle } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onSave: (postId: string, updatedData: { title: string; content: string; flair?: string; researchLink?: string }) => Promise<void>;
}

const FLAIR_OPTIONS = [
  'Research Paper',
  'Breakthrough',
  'Empirical Data',
  'Discussion',
  'Methodology',
  'Grant Opportunity',
  'Conference',
  'Bioenergy News'
];

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave
}: EditPostModalProps) {
  if (!isOpen || !post) return null;

  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [flair, setFlair] = useState(post.flair || 'Discussion');
  const [researchLink, setResearchLink] = useState(post.researchLink || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(post.id, {
        title: title.trim(),
        content: content.trim(),
        flair,
        researchLink: researchLink.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError('Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Research Post</h2>
              <p className="text-xs text-slate-500">Update title, discussion content, flair, or links</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Post Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              placeholder="e.g. Breakthrough in Enzymatic Cellulose Hydrolysis"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic / Research Flair
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FLAIR_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlair(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    flair === f
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Content & Discussion *
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              placeholder="Describe your research, methodology, findings, or questions for the community..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              External Research Link (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={researchLink}
                onChange={(e) => setResearchLink(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="https://doi.org/... or https://arxiv.org/..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
