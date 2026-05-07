import { Award } from "lucide-react";
import type { PatientProgressData } from "../../../types/PatientProgress";

interface MilestonesProps {
  progressData: PatientProgressData | null;
  isLoading: boolean;
  patientScore: number | null;
}

const ICONS = ["🏃", "🧠", "👥", "🎯", "🧩"];
const CATEGORY_LABELS: Record<number, string> = {
  1: "Speech",
  2: "Social Skills",
  3: "Cognitive Skills",
};

export default function Milestones({
  progressData,
  isLoading,
  patientScore,
}: MilestonesProps) {
  const milestones = (progressData?.byCategory ?? []).map((category, index) => {
    const percent = Math.max(0, Math.min(100, Math.round(category.totalPoints)));
    return {
      title:
      category.categoryName && category.categoryName !== "Unknown"
        ? category.categoryName
        : (CATEGORY_LABELS[category.categoryId] ?? `Category ${category.categoryId}`),
      progress: percent,
      target: `${category.gamesPlayed} games played`,
      icon: ICONS[index % ICONS.length],
    };
  });
  const motorPercent =
    typeof patientScore === "number"
      ? Math.max(0, Math.min(100, Math.round(patientScore)))
      : 0;
  const hasMotorFromApi = milestones.some(
    (milestone) =>
      milestone.title.toLowerCase() === "motor" ||
      milestone.title.toLowerCase() === "motor skills",
  );
  if (!hasMotorFromApi) {
    milestones.push({
      title: "motor skills",
      progress: motorPercent,
      target: "Patient score",
      icon: ICONS[milestones.length % ICONS.length],
    });
  }

  return (
    <div className="bg-linear-to-br from-primary-dark to-green-600 rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5" />
        <h3 className="text-lg font-bold">Achievement Milestones</h3>
      </div>
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-green-100">Loading milestones...</p>}
        {!isLoading && milestones.length === 0 && (
          <p className="text-sm text-green-100">
            No milestones yet. Complete more games to unlock them.
          </p>
        )}
        {milestones.map((milestone, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{milestone.icon}</span>
                <div>
                  <p className="text-sm font-bold">{milestone.title}</p>
                  <p className="text-xs text-green-100">{milestone.target}</p>
                </div>
              </div>
              <span className="text-lg font-black">{milestone.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-white transition-all duration-1000"
                style={{ width: `${milestone.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
