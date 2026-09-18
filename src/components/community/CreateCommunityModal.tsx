import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Globe, 
  Sun, 
  Flame, 
  Wheat, 
  Zap, 
  Atom, 
  Microscope,
  Check
} from 'lucide-react';
import { CommunitySubreddit } from '../../types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCommunity: (data: Omit<CommunitySubreddit, 'id' | 'createdAt' | 'membersCount' | 'onlineCount'>) => Promise<void>;
  userId?: string;
}

const CATEGORIES = [
  'Renewable Energy',
  'Climate Science',
  'Solar Tech',
  'Waste Tech',
  'AgriTech',
  'Energy Storage',
  'Biomaterials',
  'General Discussion'
];

const COLOR_THEMES = [
  { id: 'emerald', label: 'Emerald', bg: 'from-emerald-600 to-teal-700', hex: '#059669' },
  { id: 'cyan', label: 'Cyan Ocean', bg: 'from-cyan-600 to-blue-700', hex: '#0891b2' },
  { id: 'amber', label: 'Solar Amber', bg: 'from-amber-500 to-orange-600', hex: '#d97706' },
  { id: 'teal', label: 'Bio Teal', bg: 'from-teal-600 to-emerald-800', hex: '#0d9488' },
  { id: 'indigo', label: 'Quantum Indigo', bg: 'from-indigo-600 to-violet-700', hex: '#4f46e5' },
  { id: 'rose', label: 'Thermal Rose', bg: 'from-rose-600 to-red-700', hex: '#e11d48' }
];

const AVAILABLE_ICONS = [
  { id: 'Leaf', label: 'Leaf', icon: Leaf },
  { id: 'Globe', label: 'Globe', icon: Globe },
  { id: 'Sun', label: 'Sun', icon: Sun },
  { id: 'Flame', label: 'Flame', icon: Flame },
  { id: 'Wheat', label: 'Wheat', icon: Wheat },
  { id: 'Zap', label: 'Zap', icon: Zap },
  { id: 'Atom', label: 'Atom', icon: Atom },
  { id: 'Microscope', label: 'Microscope', icon: Microscope }
];

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onCreateCommunity,
  userId
}: CreateCommunityModalProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]);
  const [selectedIcon, setSelectedIcon] = useState('Leaf');
  const [ruleInput, setRuleInput] = useState('');
  const [rules, setRules] = useState<string[]>([
    'Cite peer-reviewed references or lab trials',
    'Maintain respectful scholarly peer review'
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Format clean community name: e.g. "a/algae-biofuels"
  const cleanSubredditHandle = name
    .toLowerCase()
    .replace(/^[ra]\//, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');

  const handleAddRule = () => {
    if (!ruleInput.trim()) return;
    setRules([...rules, ruleInput.trim()]);
    setRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cleanSubredditHandle || cleanSubredditHandle.length < 3) {
      setError('Community name must be at least 3 characters.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a community title.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe what this community is focused on.');
      return;
    }

    try {
      setSubmitting(true);
      await onCreateCommunity({
        name: `a/${cleanSubredditHandle}`,
        title: title.trim(),
        description: description.trim(),
        category,
        bannerColor: selectedTheme.bg,
        icon: selectedIcon,
        createdBy: userId || 'anonymous',
        rules: rules.length > 0 ? rules : undefined
      });
      onClose();
    } catch (err: any) {
      console.error('Error creating community:', err);
      setError(err?.message || 'Failed to create community. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const SelectedIconComponent = AVAILABLE_ICONS.find(i => i.id === selectedIcon)?.icon || Leaf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden text-left my-8">
        
        {/* Header Preview Banner */}
        <div className={`p-6 bg-gradient-to-r ${selectedTheme.bg} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-md">
              <SelectedIconComponent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-white/80 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Scholar Community Hub
              </span>
              <h2 className="text-xl font-bold font-display text-white">
                {cleanSubredditHandle ? `a/${cleanSubredditHandle}` : 'a/new-community'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-2 font-medium">
            {title || 'Your community title will appear here'}
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Community Name <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-slate-50">
              <span className="pl-3.5 pr-1 text-slate-500 font-bold text-sm select-none">a/</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. microbial-fuel-cells"
                maxLength={32}
                className="w-full py-2.5 pr-4 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              No spaces or special characters. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Community Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Community Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Microbial Fuel Cells & Bio-Electrochemical Systems"
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Research Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Community Icon
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVAILABLE_ICONS.map(item => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Banner Theme Gradient
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_THEMES.map(th => {
                const isSelected = selectedTheme.id === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th)}
                    className={`h-9 rounded-xl bg-gradient-to-r ${th.bg} flex items-center justify-center transition border-2 cursor-pointer shadow-xs ${
                      isSelected ? 'border-slate-900 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={th.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mission & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What questions, technologies, and research problems will this community explore?"
              rows={3}
              maxLength={400}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-400 text-right mt-0.5">
              {400 - description.length} characters left
            </p>
          </div>

          {/* Community Rules */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Community Rules & Scholarly Code
            </label>
            <div className="space-y-2 mb-2">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span className="truncate">
                    <strong className="text-emerald-700 mr-1.5">{idx + 1}.</strong>
                    {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                placeholder="Add rule (e.g. 'No marketing spam')"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Add Rule
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition duration-150 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Community...' : 'Create Community'}
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
