import { useEffect, useMemo, useState } from "react";
import {
  Video,
  ChevronRight,
  Play,
  Activity,
  Clock,
  Users,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";

interface SessionItem {
  id: number;
  title: string;
  description: string;
  notes: string;
  videoUrl: string;
  duration: string;
  score: number;
  publishedAt: string;
  thumbnailUrl: string;
  specialistProfileId: string;
  specialistName: string;
}

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

export default function RecentSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const specialistProfileId = user?.specialistId || user?.id;
    if (!specialistProfileId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(
          `${API_BASE}/Session/specialist/${specialistProfileId}`,
          { headers },
        );

        if (!response.ok)
          throw new Error("Failed to fetch specialist sessions");

        const result = await response.json();
        if (cancelled) return;

        const parsed = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        const normalized: SessionItem[] = parsed.map((item: SessionItem) => ({
          ...item,
          thumbnailUrl: item.thumbnailUrl || FALLBACK_THUMBNAIL,
        }));

        normalized.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );
        setSessions(normalized);
      } catch (err) {
        console.error("Error fetching specialist sessions:", err);
        if (!cancelled) {
          setError("Unable to load sessions");
          setSessions([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSessions();

    return () => {
      cancelled = true;
    };
  }, [user?.specialistId, user?.id]);

  const featuredSession = sessions[0] || null;
  const otherSessions = useMemo(() => sessions.slice(1), [sessions]);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "Unknown date";
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Unknown date";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-green-600 font-bold text-xs tracking-widest uppercase mb-4 ml-1">
        <div className="w-2 h-2 rounded-full bg-linear-to-r from-green-500 to-emerald-500 animate-pulse"></div>
        RECENT SESSION
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Uploaded Sessions
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                educational videos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/sessions")}
            className="flex items-center gap-1 text-xs text-green-600 font-bold border-2 border-green-600/30 rounded-full px-5 py-2 hover:bg-green-50 transition-colors uppercase tracking-wider group cursor-pointer"
          >
            View All{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading && (
          <div className="py-10 text-center text-sm font-medium text-gray-500">
            Loading sessions...
          </div>
        )}

        {!isLoading && error && (
          <div className="py-10 text-center text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && featuredSession && (
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 mb-6">
            <Link to={`/sessions/${featuredSession.id}`} className="relative group cursor-pointer">
              <img
                src={featuredSession.thumbnailUrl || FALLBACK_THUMBNAIL}
                alt={featuredSession.title}
                className="w-full md:w-70 h-45 object-cover rounded-2xl shrink-0 shadow-md group-hover:shadow-xl transition-shadow"
              />
              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-green-600 ml-1" />
                </div>
              </div>
            </Link>
            <div className="flex flex-col justify-center flex-1 py-2 w-full relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full tracking-wide">
                  <Activity className="w-3.5 h-3.5" /> Session
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full tracking-wide text-center">
                  <Clock className="w-3.5 h-3.5" />{" "}
                  {featuredSession.duration.split(".")[0].substring(3) || "N/A"}
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {featuredSession.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-4">
                Uploaded on {formatDate(featuredSession.publishedAt)}
              </p>

              <div className="flex items-center justify-between">
                <span className="bg-linear-to-r from-primary-dark to-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider shadow-md">
                  Latest
                </span>
                <span className="flex items-center gap-2 text-sm text-green-600 font-bold">
                  <Users className="w-4 h-4" /> {featuredSession.score}{" "}
                  <span className="text-gray-500 font-medium">score</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && featuredSession && (
          <div className="w-full h-px bg-linear-to-r from-gray-200 via-gray-100 to-transparent my-6"></div>
        )}

        {!isLoading && !error && featuredSession && (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <Link to={`/sessions/${session.id}`}
                key={session.id}
                className="flex flex-col md:flex-row items-center md:items-stretch justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/80 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-5 w-full">
                  <div className="relative shrink-0">
                    <img
                      src={session.thumbnailUrl || FALLBACK_THUMBNAIL}
                      className="w-35 h-18.75 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                      alt={session.title}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {session.duration.split(".")[0].substring(3) || "N/A"}
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {session.title}
                    </h4>
                    <div className="flex items-start">
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full tracking-wide flex items-center w-max">
                        <Activity className="w-3 h-3 mr-1" /> Session
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3 h-3" />{" "}
                      {formatDate(session.publishedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end w-full md:w-auto mt-4 md:mt-0 pr-4 shrink-0">
                  <span className="flex items-center gap-2 text-xs text-green-600 font-bold">
                    <Eye className="w-4 h-4" /> {session.score}{" "}
                    <span className="text-gray-500 font-medium">score</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !error && !featuredSession && (
          <div className="py-10 text-center text-sm font-medium text-gray-500">
            No sessions uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
