import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Award,
  Globe,
  Building2,
  User,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Testimonial } from '../../types';
import {
  getAllTestimonialsAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} from '../../services/db';

interface TestimonialsManagementProps {
  theme?: 'light' | 'dark';
}

export default function TestimonialsManagement({ theme = 'light' }: TestimonialsManagementProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await getAllTestimonialsAdmin();
      setTestimonials(data);
    } catch (err) {
      console.error('Error fetching admin testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await updateTestimonialAdmin(id, { approved: true });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: true } : t));
      showNotice('Testimonial approved and published.');
    } catch (err) {
      console.error('Failed to approve testimonial:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await updateTestimonialAdmin(id, { approved: false, featured: false });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: false, featured: false } : t));
      showNotice('Testimonial unapproved / rejected.');
    } catch (err) {
      console.error('Failed to reject testimonial:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFeature = async (id: string, currentFeatured: boolean) => {
    setProcessingId(id);
    try {
      await updateTestimonialAdmin(id, { featured: !currentFeatured });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: !currentFeatured } : t));
      showNotice(currentFeatured ? 'Removed from featured.' : 'Marked as featured testimonial!');
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this testimonial?')) return;
    setProcessingId(id);
    try {
      await deleteTestimonialAdmin(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      showNotice('Testimonial deleted permanently.');
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered & Searched testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => {
      // Status filter
      if (statusFilter === 'pending' && t.approved) return false;
      if (statusFilter === 'approved' && !t.approved) return false;
      if (statusFilter === 'featured' && (!t.featured || !t.approved)) return false;

      // Rating filter
      if (ratingFilter !== 'all' && t.rating !== ratingFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.fullName?.toLowerCase().includes(q);
        const matchesOccupation = t.occupation?.toLowerCase().includes(q);
        const matchesInst = t.institution?.toLowerCase().includes(q);
        const matchesCountry = t.country?.toLowerCase().includes(q);
        const matchesMsg = t.message?.toLowerCase().includes(q);
        if (!matchesName && !matchesOccupation && !matchesInst && !matchesCountry && !matchesMsg) {
          return false;
        }
      }

      return true;
    });
  }, [testimonials, statusFilter, ratingFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: testimonials.length,
      pending: testimonials.filter(t => !t.approved).length,
      approved: testimonials.filter(t => t.approved).length,
      featured: testimonials.filter(t => t.featured).length,
    };
  }, [testimonials]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Public Testimonials Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Firebase Collection: <code className="text-emerald-600 dark:text-emerald-400 font-bold">testimonials</code> • Strict Admin Approval Workflow
          </p>
        </div>

        <button
          onClick={fetchTestimonials}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, institution, country, message..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="md:col-span-4 flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'featured', label: 'Featured', count: counts.featured }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                statusFilter === tab.id
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Rating Filter */}
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-xs text-slate-500 font-mono">Loading testimonials from Firebase...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No testimonials found</h3>
          <p className="text-xs text-slate-500 font-mono">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No testimonials have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTestimonials.map(t => (
            <div
              key={t.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                t.approved
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50'
              }`}
            >
              {/* Header card row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt={t.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {t.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{t.occupation}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= t.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    {!t.approved ? (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-full font-bold">
                        Pending Review
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">
                        Published
                      </span>
                    )}

                    {t.featured && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 rounded-full font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Institution and Country tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-500" />
                  <span>{t.institution}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span>{t.country}</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}</span>
                </span>
              </div>

              {/* Testimonial Message Body */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{t.message}"
              </div>

              {/* External Links if provided */}
              {(t.website || t.socialProfile) && (
                <div className="flex items-center gap-3 text-[11px]">
                  {t.website && (
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  )}
                  {t.socialProfile && (
                    <a
                      href={t.socialProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Social Profile</span>
                    </a>
                  )}
                </div>
              )}

              {/* Admin Actions Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFeature(t.id, !!t.featured)}
                  disabled={processingId === t.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    t.featured
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{t.featured ? 'Unfeature' : 'Feature'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={processingId === t.id}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!t.approved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(t.id)}
                      disabled={processingId === t.id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReject(t.id)}
                      disabled={processingId === t.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject / Unpublish</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
