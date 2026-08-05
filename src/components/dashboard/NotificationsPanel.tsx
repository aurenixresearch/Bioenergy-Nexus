import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Trash2, 
  Check, 
  Mail, 
  UserPlus, 
  Award, 
  FileText, 
  CheckCheck,
  X,
  MessageSquare
} from 'lucide-react';
import { UserNotification } from '../../services/db';

interface NotificationsPanelProps {
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => Promise<any>;
  onDeleteNotification: (id: string) => Promise<any>;
  onClearAll: () => Promise<any>;
}

export default function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onClearAll,
}: NotificationsPanelProps) {
  const getIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'follower':
        return { icon: UserPlus, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' };
      case 'alliance':
        return { icon: Mail, color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40' };
      case 'grant':
        return { icon: Award, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' };
      case 'citation':
        return { icon: FileText, color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40' };
      default:
        return { icon: Bell, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-emerald-100/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-left space-y-6" id="notifications_panel_section">
      <div className="flex items-center justify-between border-b border-emerald-100/60 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            Recent Notifications {unreadCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-black font-mono px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
            Check your peer citations, co-author messages, and regulatory review results.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition border-0 bg-transparent"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Clear All
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => {
              const cfg = getIcon(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 text-left relative group font-sans ${
                    notif.isRead 
                      ? 'bg-white dark:bg-slate-900/40 border-emerald-100/80 dark:border-slate-800/80 opacity-80' 
                      : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 shadow-xs'
                  }`}
                >
                  {/* Category icon */}
                  <div className={`p-2 rounded-xl border shrink-0 ${cfg.color}`}>
                    <cfg.icon className="w-4 h-4" />
                  </div>

                  {/* Body */}
                  <div className="space-y-1 flex-1 min-w-0 pr-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
                        {notif.title}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium pr-2">
                      {notif.message}
                    </p>
                  </div>

                  {/* Individual actions (absolute or group hover) */}
                  <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
                    {!notif.isRead && (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-lg cursor-pointer transition border-0 bg-transparent"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotification(notif.id)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition border-0 bg-transparent"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-12 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-700">All caught up!</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto">
              There are no new updates or inbox notifications right now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
