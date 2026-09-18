import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Search, 
  FileText, 
  MessageSquare, 
  Users, 
  Handshake, 
  Coins, 
  ShieldCheck, 
  AlertTriangle,
  X,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppNotification, 
  NotificationType, 
  subscribeNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications, 
  formatRelativeTime 
} from '../services/notificationService';
import { getNotificationIcon } from './notifications/NotificationBell';

interface NotificationsPageProps {
  user: FirebaseUser | null;
  onNavigateToView: (view: any) => void;
  theme?: 'light' | 'dark';
}

type FilterCategory = 'all' | 'unread' | 'research' | 'messaging' | 'collaboration' | 'funding' | 'admin';

export default function NotificationsPage({ user, onNavigateToView }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeNotifications(user.uid, (updated) => {
      setNotifications(updated);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  // Filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = (searchQuery || '').toLowerCase();
      const matchTitle = (notif.title || '').toLowerCase().includes(q);
      const matchDesc = (notif.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Category filter
    if (activeFilter === 'unread') return !notif.isRead;
    if (activeFilter === 'research') return notif.type === 'research';
    if (activeFilter === 'messaging') return notif.type === 'messaging';
    if (activeFilter === 'collaboration') return notif.type === 'collaboration' || notif.type === 'followers';
    if (activeFilter === 'funding') return notif.type === 'funding' || notif.type === 'challenge';
    if (activeFilter === 'admin') return notif.type === 'admin';

    return true;
  });

  const handleMarkAllRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead(user.uid);
  };

  const handleClearAll = async () => {
    if (!user) return;
    setIsClearing(true);
    setNotifications([]);
    await clearAllNotifications(user.uid);
    setIsClearing(false);
    setShowClearModal(false);
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!user) return;
    if (!notif.isRead) {
      // Optimistically update read state
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      markNotificationAsRead(user.uid, notif.id).catch(err => {
        console.error('Failed to update notification read status in Firestore:', err);
      });
    }

    if (notif.actionUrl) {
      const cleanUrl = notif.actionUrl.replace('/', '');
      onNavigateToView(cleanUrl || 'dashboard');
    } else if (notif.type === 'messaging') {
      onNavigateToView('messages');
    } else if (notif.type === 'research') {
      onNavigateToView('research');
    } else if (notif.type === 'collaboration' || notif.type === 'funding' || notif.type === 'challenge') {
      onNavigateToView('collaboration');
    } else if (notif.type === 'followers') {
      onNavigateToView('researchers');
    } else if (notif.type === 'admin') {
      onNavigateToView('profile');
    }
  };

  const handleToggleReadStatus = async (e: React.MouseEvent, notif: AppNotification) => {
    e.stopPropagation();
    if (!user) return;
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      await markNotificationAsRead(user.uid, notif.id);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    if (!user) return;
    await deleteNotification(user.uid, notifId);
  };

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-left font-sans bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-neutral-800 shadow-xs relative overflow-hidden bg-white dark:bg-[#000000]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Bell className="w-48 h-48 text-emerald-900 dark:text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 dark:bg-emerald-900/60 text-white rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Live Platform Stream
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                Notifications & Activity Center
              </h1>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
                Stay informed with real-time updates regarding research papers, messaging, research alliances, grant opportunities, and account verifications.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  id="page_mark_all_read_btn"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mark All as Read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearModal(true)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  id="page_clear_all_btn"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-neutral-900">
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Total Notifications</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{notifications.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">Unread Items</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{unreadCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-white col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Read & Archived</span>
              <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{readCount}</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000000]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'research', label: 'Research', count: notifications.filter(n => n.type === 'research').length },
              { id: 'messaging', label: 'Messages', count: notifications.filter(n => n.type === 'messaging').length },
              { id: 'collaboration', label: 'Alliances', count: notifications.filter(n => n.type === 'collaboration' || n.type === 'followers').length },
              { id: 'funding', label: 'Funding & Grants', count: notifications.filter(n => n.type === 'funding' || n.type === 'challenge').length },
              { id: 'admin', label: 'Admin', count: notifications.filter(n => n.type === 'admin').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900'
                }`}
                id={`filter_tab_${tab.id}`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] ${
                    activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Main List */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs divide-y divide-slate-100 dark:divide-neutral-900 overflow-hidden bg-white dark:bg-[#000000]">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white dark:bg-[#000000]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-900 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery ? 'No Notifications Found' : "You're all caught up."}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery ? 'No results matched your search query.' : 'No new notifications to report at this time.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const { Icon, bgClass } = getNotificationIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className="p-5 hover:bg-slate-50/80 dark:hover:bg-neutral-950 transition-all cursor-pointer relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#000000]"
                  id={`notif_card_${notif.id}`}
                >
                  {/* Left accent bar for unread status */}
                  {!notif.isRead && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-2xl shrink-0 border ${bgClass} mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Main Content */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 rounded-md">
                          {notif.type}
                        </span>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {!notif.isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                            Unread
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {notif.title}
                      </h3>

                      <p className="text-xs leading-relaxed max-w-3xl text-slate-600 dark:text-slate-400">
                        {notif.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right Column */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleToggleReadStatus(e, notif)}
                        className="px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-neutral-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleItemClick(notif)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteItem(e, notif.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Clear All Notifications?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">This action will remove all items from your activity log.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete all notification records? You won't be able to recover these activity records once cleared.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={isClearing}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  id="confirm_clear_all_btn"
                >
                  {isClearing ? (
                    <span>Clearing...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Yes, Clear All</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
