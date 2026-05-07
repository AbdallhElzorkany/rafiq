import { Star, TrendingUp } from "lucide-react";
import type { PatientProgressData } from "../../../types/PatientProgress";

interface SkillsProgressProps {
  progressData: PatientProgressData | null;
  isLoading: boolean;
  error: string | null;
  patientScore: number | null;
}

const CATEGORY_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
const CATEGORY_LABELS: Record<number, string> = {
  1: "Speech Skills",
  2: "Social Skills",
  3: "Cognitive Skills",
};

export default function SkillsProgress({
  progressData,
  isLoading,
  error,
  patientScore,
}: SkillsProgressProps) {
  const skills = (progressData?.byCategory ?? []).map((category, index) => {
    const normalizedPercent = Math.max(
      0,
      Math.min(100, Math.round(category.totalPoints)),
    );

    return {
      title:
        category.categoryName && category.categoryName !== "Unknown"
          ? category.categoryName
          : (CATEGORY_LABELS[category.categoryId] ?? `Category ${category.categoryId}`),
      desc: `${category.gamesPlayed} games played`,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percent: normalizedPercent,
      points: normalizedPercent,
    };
  });
  const normalizedMotorSkillPercent =
    typeof patientScore === "number"
      ? Math.max(0, Math.min(100, Math.round(patientScore)))
      : 0;
  const hasMotorSkillScore = typeof patientScore === "number";
  const hasMotorFromApi = skills.some(
    (skill) => skill.title.toLowerCase() === "motor" || skill.title.toLowerCase() === "motor skills",
  );
  const progressCards = [
    ...skills,
    ...(!hasMotorFromApi
      ? [
          {
            title: "motor skills",
            desc: "Patient score",
            color: "#14b8a6",
            percent: normalizedMotorSkillPercent,
            points: hasMotorSkillScore ? Number(patientScore.toFixed(2)) : 0,
          },
        ]
      : []),
  ];

  const renderCircle = (percent: number, color: string, size: number = 120) => {
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative flex justify-center items-center my-6 group">
        <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300" style={{ backgroundColor: color }}></div>
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-md transition-transform duration-300 group-hover:scale-105">
          <circle
            cx="60" cy="60" r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[28px] font-black tracking-tight" style={{ color }}>{percent}%</span>
          <TrendingUp className="w-4 h-4 text-green-500 mt-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {!isLoading && skills.length === 0 && !hasMotorSkillScore && (
        <div className="md:col-span-2 xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 font-medium">
          {error || "No progress data available yet."}
        </div>
      )}

      {isLoading && (
        <div className="md:col-span-2 xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 font-medium">
          Loading child progress...
        </div>
      )}

      {progressCards.map((skill, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{skill.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{skill.desc}</p>
            </div>
            <Star className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {renderCircle(skill.percent, skill.color)}

          <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs font-medium">Achieved</span>
              <span className="font-bold text-gray-900 text-sm px-2 py-1 bg-gray-100 rounded-md">{skill.points}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{ width: `${skill.percent}%`, backgroundColor: skill.color }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
