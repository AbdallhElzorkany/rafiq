import { Clock, ChevronRight } from "lucide-react";
import type { PatientProgressData } from "../../../types/PatientProgress";

interface RecentActivityProps {
  progressData: PatientProgressData | null;
  isLoading: boolean;
}
const CATEGORY_LABELS: Record<number, string> = {
  1: "Speech",
  2: "Social Skills",
  3: "Cognitive Skills",
};

export default function RecentActivity({
  progressData,
  isLoading,
}: RecentActivityProps) {
  const topCategory = [...(progressData?.byCategory ?? [])].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  )[0];

  const recentActivity = [
    {
      icon: "🎮",
      text: `Total games played: ${progressData?.totalGamesPlayed ?? 0}`,
      time: "Latest sync",
      color: "#10b981",
    },
    {
      icon: "⭐",
      text: `Total points earned: ${progressData?.totalEarnedPoints ?? 0}`,
      time: "Latest sync",
      color: "#3b82f6",
    },
    {
      icon: "🏆",
      text: topCategory
        ? `Top category: ${
            topCategory.categoryName && topCategory.categoryName !== "Unknown"
              ? topCategory.categoryName
              : (CATEGORY_LABELS[topCategory.categoryId] ?? `Category ${topCategory.categoryId}`)
          }`
        : "Top category will appear after first game",
      time: "Current status",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        {isLoading && (
          <p className="text-sm text-gray-500">Refreshing progress activity...</p>
        )}
        {recentActivity.map((activity, i) => (
          <div key={i} className="flex items-start gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${activity.color}15` }}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">{activity.text}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}
