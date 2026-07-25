import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Users, 
  Handshake, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  ExternalLink
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
  formatRelativeTime 
} from '../../services/notificationService';

interface NotificationBellProps {
  user: FirebaseUser | null;
  setView: (view: any) => void;
  theme?: 'light' | 'dark';
}

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'research':
      return { Icon: FileText, bgClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/50' };
    case 'messaging':
      return { Icon: MessageSquare, bgClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/50' };
    case 'followers':
      return { Icon: Users, bgClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/50' };
    case 'collaboration':
      return { Icon: Handshake, bgClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200/50' };
    case 'funding':
      return { Icon: Coins, bgClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/50' };
    case 'challenge':
      return { Icon: Sparkles, bgClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/50' };
    case 'admin':
    default:
      return { Icon: ShieldCheck, bgClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/50' };
  }
};

export default function NotificationBell({ user, setView }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeNotifications(user.uid, (updatedNotifs) => {
      setNotifications(updatedNotifs);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  const handleMarkAllRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead(user.uid);
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!user) return;
    
    if (!notification.isRead) {
      // Optimistically mark as read in UI state immediately
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      // Persist to Firestore with read: true, isRead: true, readAt: serverTimestamp()
      markNotificationAsRead(user.uid, notification.id).catch(err => {
        console.error('Failed to update notification read status in Firestore:', err);
      });
    }

    setIsOpen(false);

    // Route to destination page if available
    if (notification.actionUrl) {
      const cleanUrl = notification.actionUrl.replace('/', '');
      setView(cleanUrl || 'dashboard');
    } else if (notification.type === 'messaging') {
      setView('messages');
    } else if (notification.type === 'research') {
      setView('research');
    } else if (notification.type === 'collaboration' || notification.type === 'funding' || notification.type === 'challenge') {
      setView('collaboration');
    } else if (notification.type === 'followers') {
      setView('researchers');
    } else if (notification.type === 'admin') {
      setView('profile');
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!user) return;
    await deleteNotification(user.uid, notificationId);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="notification_bell_container">
      {/* Bell trigger button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-800 focus:outline-none"
        title="Notifications"
        aria-label="Toggle notifications dropdown"
        id="notification_bell_button"
      >
        <Bell className="w-5 h-5 shrink-0" />

        {/* Real-time Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-in zoom-in-50 duration-200">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left"
            id="notification_dropdown_panel"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer transition-colors"
                  title="Mark all notifications as read"
                  id="notif_mark_all_read_btn"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification Scrollable List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="w-5 h-5 opacity-50" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Notifications Yet</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Activity and platform alerts will appear here in real time.</p>
                </div>
              ) : (
                notifications.slice(0, 8).map((notif) => {
                  const { Icon, bgClass } = getNotificationIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group flex items-start gap-3 ${
                        !notif.isRead ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Read status indicator bar */}
                      {!notif.isRead && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className={`p-2 rounded-xl shrink-0 border ${bgClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-xs truncate ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                            {notif.title}
                          </p>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                          {notif.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {formatRelativeTime(notif.createdAt)}
                          </span>

                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-semibold">
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>

                      {/* Delete on hover */}
                      <button
                        onClick={(e) => handleDeleteItem(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all cursor-pointer self-center"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setView('notifications');
                }}
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                id="view_all_notifications_btn"
              >
                <span>View All Notifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
