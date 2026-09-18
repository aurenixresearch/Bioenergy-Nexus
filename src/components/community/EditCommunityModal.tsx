import React, { useState } from 'react';
import { CommunitySubreddit } from '../../types';
import { X, Settings, Sparkles, AlertCircle } from 'lucide-react';

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: CommunitySubreddit | null;
  onSave: (communityId: string, updatedData: Partial<CommunitySubreddit>) => Promise<void>;
}

const CATEGORIES = [
  'Bioenergy & Biofuels',
  'Solar Photovoltaics',
  'Wind & Hydro Power',
  'Green Hydrogen & Fuel Cells',
  'Carbon Capture & Storage',
  'Circular Bioeconomy',
  'Battery & Grid Storage',
  'Environmental Policy'
];

const BANNER_GRADIENTS = [
  { name: 'Emerald Forest', class: 'from-emerald-600 to-teal-700' },
  { name: 'Clean Cyan', class: 'from-teal-600 to-cyan-700' },
  { name: 'Solar Amber', class: 'from-amber-500 to-emerald-600' },
  { name: 'Deep Ocean', class: 'from-blue-600 to-indigo-800' },
  { name: 'Forest Moss', class: 'from-green-700 to-emerald-900' },
  { name: 'Violet Science', class: 'from-purple-700 to-indigo-800' },
];

export default function EditCommunityModal({
  isOpen,
  onClose,
  community,
  onSave
}: EditCommunityModalProps) {
  if (!isOpen || !community) return null;

  const [title, setTitle] = useState(community.title || '');
  const [description, setDescription] = useState(community.description || '');
  const [category, setCategory] = useState(community.category || CATEGORIES[0]);
  const [bannerColor, setBannerColor] = useState(community.bannerColor || 'from-emerald-600 to-teal-700');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a community title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a community description.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(community.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        bannerColor
      });
      onClose();
    } catch (err) {
      setError('Failed to update community. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Preview */}
        <div className={`h-24 bg-gradient-to-r ${bannerColor} relative p-4 flex items-end justify-between transition-all`}>
          <div className="flex items-center gap-3 relative top-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-slate-100 flex items-center justify-center">
              <div className={`w-full h-full rounded-lg bg-gradient-to-r ${bannerColor} text-white flex items-center justify-center font-black text-sm`}>
                a/
              </div>
            </div>
            <div className="pt-2">
              <span className="text-white text-xs font-black drop-shadow-xs">
                {community.name.replace(/^r\//, 'a/')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-black/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-5 px-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Edit Hub Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Customize your academic community details and branding</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hub Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              placeholder="e.g. Advanced Algal Biofuels Consortium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category / Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Mission *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              placeholder="Explain the scope, goals, and types of findings shared in this community..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Banner Theme Gradient
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BANNER_GRADIENTS.map((bg) => (
                <button
                  key={bg.name}
                  type="button"
                  onClick={() => setBannerColor(bg.class)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${bg.class} relative flex items-center justify-center text-[10px] font-bold text-white shadow-2xs border-2 transition cursor-pointer ${
                    bannerColor === bg.class ? 'border-slate-900 scale-102 ring-2 ring-emerald-400' : 'border-transparent opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="drop-shadow-xs">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

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
