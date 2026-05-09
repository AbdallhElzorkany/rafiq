import { useState } from "react";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  BellOff,
  Clock,
  Circle,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  useNotifications,
  formatNotificationRelativeTime,
  getNotificationHref,
} from "../hooks/useNotifications";
import type { Notification } from "../hooks/useNotifications";

type FilterTab = "all" | "unread" | "read";

function getNotificationIcon(type: string) {
  const base =
    "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-slate-100 text-primary-dark";
  const t = (type || "").toLowerCase();

  if (t.includes("session") || t.includes("newsession")) {
    return (
      <div
        className={`${base} bg-linear-to-br from-primary-light/15 to-primary-dark/10 text-primary-dark`}
      >
        <CalendarDays className="w-5 h-5" strokeWidth={2} />
      </div>
    );
  }
  if (t.includes("attempt")) {
    return (
      <div
        className={`${base} bg-linear-to-br from-primary-light/15 to-primary-dark/10 text-primary-dark`}
      >
        <UserRound className="w-5 h-5" strokeWidth={2} />
      </div>
    );
  }
  if (t.includes("message") || t.includes("chat")) {
    return (
      <div className={`${base} text-primary-dark`}>
        <span className="text-lg leading-none">💬</span>
      </div>
    );
  }
  if (t.includes("community")) {
    return (
      <div className={`${base} text-primary-dark`}>
        <span className="text-lg leading-none">🌍</span>
      </div>
    );
  }
  if (t.includes("resource") || t.includes("library")) {
    return (
      <div className={`${base} text-primary-dark`}>
        <span className="text-lg leading-none">📚</span>
      </div>
    );
  }
  if (t.includes("alert") || t.includes("warning")) {
    return (
      <div className={`${base} text-red-600 bg-red-50`}>
        <span className="text-lg leading-none">⚠️</span>
      </div>
    );
  }
  return (
    <div
      className={`${base} bg-linear-to-br from-primary-light/15 to-primary-dark/10`}
    >
      <Bell className="w-5 h-5" strokeWidth={2} />
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onNavigate: (n: Notification) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!notification.isRead) onMarkRead(notification.id);
          onNavigate(notification);
        }
      }}
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer
        ${
          !notification.isRead
            ? "bg-primary-dark/4 border-primary-light/25 hover:bg-primary-dark/6"
            : "bg-white border-slate-100 hover:bg-slate-50"
        }`}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification.id);
        onNavigate(notification);
      }}
    >
      {/* Icon */}
      {getNotificationIcon(notification.type)}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${!notification.isRead ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}
          >
            {notification.title}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1 mt-0.5 shrink-0">
            <Clock className="w-3 h-3" />
            {notification.timeAgo ||
              formatNotificationRelativeTime(notification.createdAt)}
          </span>
        </div>
        {notification.message && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {notification.message}
          </p>
        )}
        {notification.doctorFeedback && (
          <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
              Doctor feedback
            </p>
            <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
              {notification.doctorFeedback}
            </p>
          </div>
        )}
        {notification.type && (
          <span className="inline-block mt-2 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-primary-dark/70">
            {notification.type.replace(/([A-Z])/g, " $1").trim()}
          </span>
        )}
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="mt-1 shrink-0">
          <Circle className="w-2.5 h-2.5 fill-primary-light text-primary-light" />
        </div>
      )}
    </div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isPending,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications();

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "read") return n.isRead;
    return true;
  });

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read" },
  ];

  function handleNotificationNavigate(n: Notification) {
    const href = getNotificationHref(n, user);
    if (href) navigate(href);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-primary-light to-primary-dark shadow-md shadow-green-500/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-13">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="cursor-pointer p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-primary-light to-primary-dark text-white text-sm font-medium shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100"
            >
              <CheckCheck className="w-4 h-4" />
              {isMarkingAllRead ? "Marking…" : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key
                    ? tab.key === "unread"
                      ? "bg-primary-dark/10 text-primary-dark"
                      : "bg-slate-100 text-slate-600"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isPending ? (
        // Skeleton loader
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        // Error state
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Couldn't load notifications
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-dark/5 flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-primary-light" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            {activeTab === "unread"
              ? "No unread notifications"
              : activeTab === "read"
                ? "No read notifications"
                : "No notifications yet"}
          </h3>
          <p className="text-sm text-slate-400">
            {activeTab === "unread"
              ? "You're all caught up! Check back later."
              : "Notifications will appear here when you receive them."}
          </p>
        </div>
      ) : (
        // Notification list
        <div className="space-y-2">
          {filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
              onNavigate={handleNotificationNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
