import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../contexts/AuthContext";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

const NOTIFICATIONS_POLL_MS = 30_000;

export interface Notification {
  id: number;
  title: string;
  message: string;
  doctorFeedback?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
  payloadData?: Record<string, unknown> | null;
}

function parsePayload(payload: unknown): Record<string, unknown> | null {
  if (payload == null || payload === "") return null;
  if (typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function readStringField(
  source: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function extractDoctorFeedback(
  raw: Record<string, unknown>,
  payloadData: Record<string, unknown> | null,
): string | undefined {
  const feedbackKeys = [
    "doctorFeedback",
    "feedback",
    "specialistFeedback",
    "reviewNotes",
    "notes",
    "comment",
  ];

  if (payloadData) {
    const fromPayload = readStringField(payloadData, feedbackKeys);
    if (fromPayload) return fromPayload;
  }

  return readStringField(raw, feedbackKeys);
}

export function normalizeNotification(raw: Record<string, unknown>): Notification {
  const typeRaw =
    raw.typeOfNotification ?? raw.typeofNotification ?? raw.type ?? "";
  const payloadData = parsePayload(raw.payload);
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    message: String(raw.message ?? ""),
    doctorFeedback: extractDoctorFeedback(raw, payloadData),
    type: String(typeRaw),
    isRead: Boolean(raw.isRead),
    createdAt: String(raw.createdAt ?? ""),
    payloadData,
  };
}

export function getNotificationHref(
  n: Notification,
  user: User | null
): string | null {
  const p = n.payloadData;
  if (!p) return null;
  const sessionId = p.sessionId ?? p.sessionid;
  const patientId = p.patientId ?? p.patientid;
  const isFamily = user?.roles?.includes("Family") ?? false;
  const typeLower = n.type.toLowerCase();

  if (
    !isFamily &&
    patientId != null &&
    patientId !== "" &&
    typeLower.includes("attempt")
  ) {
    return `/patients/${String(patientId)}`;
  }
  if (sessionId != null && sessionId !== "") {
    return `/sessions/${String(sessionId)}`;
  }
  if (!isFamily && patientId != null && patientId !== "") {
    return `/patients/${String(patientId)}`;
  }
  return null;
}

function normalizeUnreadCount(data: unknown): number {
  if (typeof data === "number" && !Number.isNaN(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const c = o.count ?? o.unreadCount ?? o.unread;
    if (typeof c === "number" && !Number.isNaN(c)) return c;
  }
  return 0;
}

export function formatNotificationRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function useNotifications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: fetchedNotifications,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["Notifications"],
    staleTime: NOTIFICATIONS_POLL_MS,
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/Notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json() as Promise<unknown>;
    },
    enabled: !!token,
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ["Notifications", "unread-count"],
    staleTime: NOTIFICATIONS_POLL_MS,
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/Notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      return res.json() as Promise<unknown>;
    },
    enabled: !!token,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await fetch(
        `${API_BASE}/Notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to mark notification as read");
      if (res.status !== 204) {
        return res.json().catch(() => ({}));
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/Notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      if (res.status !== 204) {
        return res.json().catch(() => ({}));
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Notifications"] });
    },
  });

  const rawList: Record<string, unknown>[] = Array.isArray(fetchedNotifications)
    ? (fetchedNotifications as Record<string, unknown>[])
    : ((fetchedNotifications as { data?: Record<string, unknown>[] })?.data ??
      []);

  const notifications: Notification[] = rawList.map(normalizeNotification);

  const unreadCount: number =
    unreadCountData !== undefined
      ? normalizeUnreadCount(unreadCountData)
      : notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isPending,
    isError,
    refetch,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
  };
}
