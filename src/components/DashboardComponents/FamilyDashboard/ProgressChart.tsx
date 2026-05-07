import { TrendingUp } from "lucide-react";
import type { PatientProgressData } from "../../../types/PatientProgress";

interface ProgressChartProps {
  progressData: PatientProgressData | null;
  isLoading: boolean;
  error: string | null;
  patientScore: number | null;
}

const BAR_COLORS = [
  "from-emerald-600 to-green-400",
  "from-amber-600 to-yellow-400",
  "from-red-600 to-rose-400",
  "from-blue-600 to-sky-400",
  "from-violet-600 to-purple-400",
];
const CATEGORY_LABELS: Record<number, string> = {
  1: "Speech",
  2: "Social Skills",
  3: "Cognitive Skills",
};

export default function ProgressChart({
  progressData,
  isLoading,
  error,
  patientScore,
}: ProgressChartProps) {
  const categoriesWithPercent = (progressData?.byCategory ?? []).map((category) => ({
    categoryId: category.categoryId,
    categoryName:
      category.categoryName && category.categoryName !== "Unknown"
        ? category.categoryName
        : (CATEGORY_LABELS[category.categoryId] ?? `Category ${category.categoryId}`),
    totalPoints: category.totalPoints,
    achievedPercent: Math.max(0, Math.min(100, Math.round(category.totalPoints))),
  }));
  const hasMotorFromApi = categoriesWithPercent.some(
    (category) =>
      category.categoryName.toLowerCase() === "motor" ||
      category.categoryName.toLowerCase() === "motor skills",
  );
  const normalizedMotorSkillPercent =
    typeof patientScore === "number"
      ? Math.max(0, Math.min(100, Math.round(patientScore)))
      : 0;
  if (!hasMotorFromApi) {
    categoriesWithPercent.push({
      categoryId: 999,
      categoryName: "motor skills",
      totalPoints:
        typeof patientScore === "number" ? Number(patientScore.toFixed(2)) : 0,
      achievedPercent: normalizedMotorSkillPercent,
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 transition-shadow duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Progress by Category</h3>
          </div>
          <p className="text-sm text-gray-500">Percentage achieved in each game category</p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center text-gray-500 font-medium">
          Loading chart data...
        </div>
      )}

      {!isLoading && categoriesWithPercent.length === 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center text-gray-500 font-medium">
          {error || "No category progress has been recorded yet."}
        </div>
      )}

      {!isLoading && categoriesWithPercent.length > 0 && <div className="relative h-64 w-full">
        {/* Y Axis Labels and Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-13">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="flex relative items-center w-full">
              <span className="w-8 text-right pr-3 text-xs font-medium text-gray-400">{val}%</span>
              <div className="flex-1 border-t border-gray-100 border-dashed"></div>
            </div>
          ))}
        </div>

        {/* X Axis & Bars */}
        <div className="absolute inset-0 flex items-end justify-between pl-8 pr-2 pb-13">
          {categoriesWithPercent.map((category, i) => (
            <div key={i} className="flex flex-col items-center h-full justify-end relative z-10 w-full group cursor-pointer">
              <div className="flex items-end gap-1 w-full justify-center h-full">
                <div
                  className={`w-2/3 max-w-12 bg-linear-to-t rounded-t-md group-hover:opacity-80 transition-all duration-300 hover:scale-y-105 origin-bottom shadow-sm ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{
                    height: `${Math.max(
                      8,
                      category.achievedPercent,
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-gray-500 text-[11px] font-semibold text-center absolute -bottom-7">
                {category.categoryName}
              </span>
            </div>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-4 mt-8 flex-wrap">
          {categoriesWithPercent.map((category, index) => (
            <div key={category.categoryId} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className={`w-3 h-3 rounded-full bg-linear-to-r ${BAR_COLORS[index % BAR_COLORS.length]}`}></span>
              <span className="text-gray-600 text-xs font-semibold">
                {`${category.categoryName} (${category.achievedPercent}%)`}
              </span>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
