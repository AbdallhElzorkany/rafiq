import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

export interface PatientAttempt {
  id: number;
  sessionId: number;
  patientId: number;
  patientName?: string;
  sessionTitle?: string;
  videoUrl?: string;
  status: string;
  submittedAt?: string;
  doctorFeedback?: string;
  scoreAwarded?: number | null;
}

export interface ReviewPayload {
  attemptId: number;
  status: "Approved" | "Rejected";
  doctorFeedback: string;
  scoreAwarded?: number;
}

function normalizeAttempt(raw: Record<string, unknown>): PatientAttempt {
  return {
    id: Number(raw.id ?? raw.attemptId),
    sessionId: Number(raw.sessionId ?? 0),
    patientId: Number(raw.patientId ?? 0),
    patientName: String(raw.patientName ?? raw.childName ?? ""),
    sessionTitle: String(raw.sessionTitle ?? raw.sessionName ?? ""),
    videoUrl: raw.videoUrl ? String(raw.videoUrl) : undefined,
    status: String(raw.status ?? "Pending"),
    submittedAt: raw.submittedAt ? String(raw.submittedAt) : undefined,
    doctorFeedback: raw.doctorFeedback ? String(raw.doctorFeedback) : undefined,
    scoreAwarded:
      raw.scoreAwarded !== null && raw.scoreAwarded !== undefined
        ? Number(raw.scoreAwarded)
        : null,
  };
}

/** Fetch all pending attempts for a specialist */
export function usePendingAttempts(specialistId: string | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["PatientAttempts", "pending", specialistId],
    enabled: !!specialistId && !!token,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/PatientAttempts/pending/${specialistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch pending attempts");
      const data = (await res.json()) as unknown;
      const list: Record<string, unknown>[] = Array.isArray(data)
        ? (data as Record<string, unknown>[])
        : ((data as { data?: Record<string, unknown>[] })?.data ??
          (data as { value?: Record<string, unknown>[] })?.value ??
          []);
      return list.map(normalizeAttempt);
    },
  });
}

/** Fetch all attempts for a specific patient */
export function usePatientAttempts(patientId: string | number | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["PatientAttempts", "patient", patientId],
    enabled: !!patientId && !!token,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/PatientAttempts/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch patient attempts");
      const data = (await res.json()) as unknown;
      const list: Record<string, unknown>[] = Array.isArray(data)
        ? (data as Record<string, unknown>[])
        : ((data as { data?: Record<string, unknown>[] })?.data ??
          (data as { value?: Record<string, unknown>[] })?.value ??
          []);
      return list.map(normalizeAttempt);
    },
  });
}

/** Submit a review (approve / reject) for an attempt */
export function useReviewAttempt() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const body: Record<string, unknown> = {
        attemptId: payload.attemptId,
        status: payload.status,
        doctorFeedback: payload.doctorFeedback,
      };

      if (payload.scoreAwarded !== undefined) {
        body.scoreAwarded = payload.scoreAwarded;
      }

      const res = await fetch(`${API_BASE}/PatientAttempts/review`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      if (res.status === 204) return null;
      return res.json().catch(() => null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["PatientAttempts"],
      });
    },
  });
}
