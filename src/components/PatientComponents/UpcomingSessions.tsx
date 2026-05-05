import type { Session } from "../../types/Session";
import { Calendar, Clock, Play, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router";

const API_BASE_URL =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io";

function SessionSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0 shimmer" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3 shimmer" />
        <div className="h-3 bg-gray-200 rounded w-full shimmer" />
        <div className="flex items-center gap-4 mt-1">
          <div className="h-3 bg-gray-200 rounded w-24 shimmer" />
          <div className="h-3 bg-gray-200 rounded w-20 shimmer" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-28 shimmer" />
    </div>
  );
}

function SessionsSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
      </div>
      <div className="space-y-3">
        <SessionSkeleton delay={0} />
        <SessionSkeleton delay={100} />
        <SessionSkeleton delay={200} />
      </div>
    </div>
  );
}

export default function UpcomingSessions({ patientId }: { patientId: string }) {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["upcomingSessions", patientId],
    queryFn: async () => {
      const req = await fetch(
        `${API_BASE_URL}/api/Session/patient/${patientId}/sessions?status=not-allowed`,
      );
      const res = await req.json();
      return res;
    },
    enabled: !!patientId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const sessions: Session[] = data?.data || [];
  if (isLoading) {
    return <SessionsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <X className="w-10 h-10 text-red-500 mb-2" />
          <h3 className="text-base font-semibold text-red-800 mb-1">
            Failed to load sessions
          </h3>
          <p className="text-red-600 text-sm mb-4">Please try again later.</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          There are no upcoming sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
      {/* Progress bar for background refetch */}
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-t-xl overflow-hidden">
          <div className="h-full bg-primary animate-[loading-bar_1s_ease-in-out_infinite]" />
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
          >
            <Link
              to={`/sessions/${session.id}`}
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 hover:scale-105 hover:text-white text-primary hover:bg-primary transition-all duration-300"
            >
              <Play className="w-5 h-5 " />
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {session.title}
              </h3>
              <p className="text-gray-500 text-xs">{session.description}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar className="size-3" />
                  {format(new Date(session.publishedAt), "MMM d, yyyy")}
                </span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock className="size-3" />
                  {session.duration.split(".")[0].substring(3)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
