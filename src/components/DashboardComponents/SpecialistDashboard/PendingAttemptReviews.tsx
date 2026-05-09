import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  Video,
  XCircle,
} from "lucide-react";
import {
  usePendingAttempts,
  useReviewAttempt,
  type PatientAttempt,
} from "../../../hooks/usePatientAttempts";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../hooks/useToast";

function ReviewCard({
  attempt,
  maxScore,
}: {
  attempt: PatientAttempt;
  maxScore?: number;
}) {
  const { showToast } = useToast();
  const { mutate: reviewAttempt, isPending } = useReviewAttempt();
  const [status, setStatus] = useState<"Approved" | "Rejected" | null>(null);
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [scoreAwarded, setScoreAwarded] = useState("");

  const handleSubmit = () => {
    if (!status) return;

    const parsedScore = scoreAwarded.trim() === "" ? undefined : Number(scoreAwarded);
    if (
      parsedScore !== undefined &&
      (Number.isNaN(parsedScore) ||
        parsedScore < 0 ||
        (maxScore !== undefined && parsedScore > maxScore))
    ) {
      showToast(
        `Score must be between 0 and ${maxScore ?? 100}`,
        "error",
      );
      return;
    }

    reviewAttempt(
      {
        attemptId: attempt.id,
        status,
        doctorFeedback: doctorFeedback.trim(),
        scoreAwarded: parsedScore,
      },
      {
        onSuccess: () => {
          showToast(`Attempt ${status === "Approved" ? "approved" : "rejected"} successfully`, "success");
          setStatus(null);
          setDoctorFeedback("");
          setScoreAwarded("");
        },
        onError: () => {
          showToast("Failed to submit review. Please try again.", "error");
        },
      },
    );
  };

  return (
    <div className="rounded-3xl border border-amber-200/70 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-5 bg-linear-to-br from-amber-50 via-white to-amber-50/30 border-b border-amber-100/80">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">
              {attempt.sessionTitle || `Session #${attempt.sessionId}`}
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              {attempt.patientName ? `Patient: ${attempt.patientName}` : "Pending specialist review"}
            </p>
            {attempt.submittedAt && (
              <p className="text-xs text-slate-400 mt-1.5">
                Submitted {format(new Date(attempt.submittedAt), "MMM d, yyyy · h:mm a")}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>
        {attempt.videoUrl && (
          <a
            href={attempt.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Watch submitted video
          </a>
        )}
      </div>

      <div className="p-5 space-y-3.5">
        {!status ? (
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("Approved")}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.99] transition-all shadow-sm shadow-green-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => setStatus("Rejected")}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.99] transition-all shadow-sm shadow-red-200"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        ) : (
          <>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === "Approved"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {status === "Approved" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Decision: {status}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                <Star className="w-3 h-3 inline mr-1" />
                Score{" "}
                <span className="normal-case font-normal text-slate-400">
                  {maxScore !== undefined ? `(out of ${maxScore})` : "(optional)"}
                </span>
              </label>
              <input
                type="number"
                min="0"
                max={maxScore}
                value={scoreAwarded}
                onChange={(e) => setScoreAwarded(e.target.value)}
                placeholder={maxScore !== undefined ? `0 - ${maxScore}` : "Enter score"}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light/50 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Feedback (optional)
              </label>
              <textarea
                rows={2}
                value={doctorFeedback}
                onChange={(e) => setDoctorFeedback(e.target.value)}
                placeholder="Add your review notes..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light/50 transition resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${
                  status === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Confirm {status}</>
                )}
              </button>
              <button
                onClick={() => {
                  setStatus(null);
                  setDoctorFeedback("");
                  setScoreAwarded("");
                }}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PendingAttemptReviews() {
  const { user, token } = useAuth();
  const specialistProfileId = user?.specialistId || user?.id;
  const { data, isLoading, isError, refetch, isFetching } =
    usePendingAttempts(specialistProfileId);

  const pendingAttempts = useMemo(
    () =>
      (data ?? []).filter((attempt) => {
        const status = attempt.status.toLowerCase();
        return status === "pending" || status === "pendingreview";
      }),
    [data],
  );
  const sessionIds = useMemo(
    () =>
      Array.from(
        new Set(pendingAttempts.map((attempt) => attempt.sessionId).filter(Boolean)),
      ),
    [pendingAttempts],
  );

  const sessionScoreQueries = useQueries({
    queries: sessionIds.map((sessionId) => ({
      queryKey: ["SessionScore", sessionId],
      enabled: !!token,
      staleTime: 60_000,
      queryFn: async () => {
        const response = await fetch(
          `https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/Session/SessionDetails/${sessionId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );
        if (!response.ok) return undefined;
        const payload = (await response.json()) as {
          data?: { score?: number | string };
          score?: number | string;
        };
        const rawScore = payload?.data?.score ?? payload?.score;
        if (rawScore === undefined || rawScore === null) return undefined;
        const parsed = Number(rawScore);
        return Number.isFinite(parsed) ? parsed : undefined;
      },
    })),
  });

  const sessionScoreById = useMemo(() => {
    const scoreMap = new Map<number, number>();
    sessionIds.forEach((sessionId, index) => {
      const score = sessionScoreQueries[index]?.data;
      if (typeof score === "number") {
        scoreMap.set(sessionId, score);
      }
    });
    return scoreMap;
  }, [sessionIds, sessionScoreQueries]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary-dark" />
            Pending Attempt Reviews
            {pendingAttempts.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingAttempts.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Approve or reject patient submissions with optional score and notes.
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      ) : isError ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-3">Failed to load pending attempts.</p>
          <button
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : pendingAttempts.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No pending attempts right now</p>
          <p className="text-xs text-slate-400 mt-1">
            New parent submissions will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingAttempts.map((attempt) => (
            <ReviewCard
              key={attempt.id}
              attempt={attempt}
              maxScore={sessionScoreById.get(attempt.sessionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
