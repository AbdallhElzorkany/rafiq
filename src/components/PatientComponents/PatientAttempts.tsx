import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Star,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import {
  usePatientAttempts,
  useReviewAttempt,
} from "../../hooks/usePatientAttempts";
import type { PatientAttempt } from "../../hooks/usePatientAttempts";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "approved")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function isPendingAttempt(status: string) {
  const normalized = status.toLowerCase();
  return normalized === "pending" || normalized === "pendingreview";
}


function PendingActions({
  attempt,
  maxScore,
}: {
  attempt: PatientAttempt;
  maxScore?: number;
}) {
  const [decision, setDecision] = useState<"Approved" | "Rejected" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const { mutate: review, isPending: isSubmitting } = useReviewAttempt();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!decision) return;
    const parsedScore = score.trim() === "" ? undefined : Number(score);
    if (
      parsedScore !== undefined &&
      (Number.isNaN(parsedScore) ||
        parsedScore < 0 ||
        (maxScore !== undefined && parsedScore > maxScore))
    ) {
      showToast(`Score must be between 0 and ${maxScore ?? 100}`, "error");
      return;
    }

    review(
      {
        attemptId: attempt.id,
        status: decision,
        doctorFeedback: feedback.trim(),
        scoreAwarded: parsedScore,
      },
      {
        onSuccess: () => {
          showToast(
            `Attempt ${decision === "Approved" ? "accepted" : "rejected"} successfully`,
            "success"
          );
          setDecision(null);
          setFeedback("");
          setScore("");
        },
        onError: () => {
          showToast("Failed to submit review. Please try again.", "error");
        },
      }
    );
  };

  return (
    <div className="border-t border-amber-100 bg-amber-50/20 px-4 pb-4 pt-3 space-y-3">
      {/* Video link */}
      {attempt.videoUrl && (
        <a
          href={attempt.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Watch submitted video
        </a>
      )}

      {/* Step 1 — two action buttons */}
      {!decision && (
        <div className="flex gap-2">
          <button
            onClick={() => setDecision("Approved")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-sm shadow-green-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => setDecision("Rejected")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all duration-200 shadow-sm shadow-red-200"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}

      {/* Step 2 — optional feedback + confirm */}
      {decision && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Decision pill */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold w-fit ${
              decision === "Approved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {decision === "Approved" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {decision === "Approved" ? "Accepting" : "Rejecting"} this attempt
          </div>

          {/* Score */}
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
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={maxScore !== undefined ? `0 - ${maxScore}` : "Enter score"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Feedback{" "}
              <span className="normal-case font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave a note for the family…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition resize-none"
            />
          </div>

          {/* Confirm / Back */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${
                decision === "Approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : decision === "Approved" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Accept
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Confirm Reject
                </>
              )}
            </button>
            <button
              onClick={() => {
                setDecision(null);
                setFeedback("");
                setScore("");
              }}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AttemptCard({
  attempt,
  maxScore,
}: {
  attempt: PatientAttempt;
  maxScore?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPendingStatus = isPendingAttempt(attempt.status);

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${
        isPendingStatus
          ? "border-amber-200 shadow-amber-100"
          : "border-slate-100 hover:shadow-md"
      }`}
    >
      {/* Card Header */}
      <div
        className={`flex items-start gap-3 p-4 ${
          !isPendingStatus ? "cursor-pointer" : ""
        }`}
        onClick={() => !isPendingStatus && setExpanded((v) => !v)}
      >
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isPendingStatus
              ? "bg-amber-100 text-amber-600"
              : attempt.status.toLowerCase() === "approved"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          <Video className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {attempt.sessionTitle || `Session #${attempt.sessionId}`}
            </p>
            {statusBadge(attempt.status)}
          </div>
          {attempt.submittedAt && (
            <p className="text-xs text-slate-400 mt-0.5">
              Submitted{" "}
              {format(new Date(attempt.submittedAt), "MMM d, yyyy · h:mm a")}
            </p>
          )}
        </div>

        {/* Expand toggle — only for reviewed */}
        {!isPendingStatus && (
          <div className="shrink-0 text-slate-400">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {/* Pending → Accept / Reject buttons */}
      {isPendingStatus && <PendingActions attempt={attempt} maxScore={maxScore} />}

      {/* Reviewed → collapsible details */}
      {!isPendingStatus && expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {attempt.videoUrl && (
            <a
              href={attempt.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Watch video
            </a>
          )}
          <div className="space-y-2">
            {attempt.scoreAwarded != null && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">{attempt.scoreAwarded}</span>
                {maxScore != null && (
                  <span className="text-slate-400">/ {maxScore}</span>
                )}
              </div>
            )}
            {attempt.doctorFeedback && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Feedback Given
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {attempt.doctorFeedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientAttempts({
  patientId,
}: {
  patientId: string | number | undefined;
}) {
  const { token } = useAuth();
  const {
    data: attempts = [],
    isLoading,
    isError,
    refetch,
  } = usePatientAttempts(patientId);

  const pending = attempts.filter((a) => isPendingAttempt(a.status));
  const reviewed = attempts.filter((a) => !isPendingAttempt(a.status));
  const sessionIds = useMemo(
    () =>
      Array.from(new Set(attempts.map((attempt) => attempt.sessionId).filter(Boolean))),
    [attempts]
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
          }
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
      if (typeof score === "number") scoreMap.set(sessionId, score);
    });
    return scoreMap;
  }, [sessionIds, sessionScoreQueries]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-slate-500 mb-3">Failed to load attempts.</p>
        <button
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:underline"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">No attempts yet</p>
        <p className="text-xs text-slate-400 mt-1">
          This patient hasn't submitted any session attempts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Video className="w-5 h-5 text-primary-dark" />
          Session Attempts
          {pending.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pending.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => void refetch()}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Pending first */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Awaiting Review ({pending.length})
            </p>
            <div className="space-y-2">
              {pending.map((a) => (
                <AttemptCard
                  key={a.id}
                  attempt={a}
                  maxScore={sessionScoreById.get(a.sessionId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviewed */}
        {reviewed.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Reviewed ({reviewed.length})
            </p>
            <div className="space-y-2">
              {reviewed.map((a) => (
                <AttemptCard
                  key={a.id}
                  attempt={a}
                  maxScore={sessionScoreById.get(a.sessionId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
