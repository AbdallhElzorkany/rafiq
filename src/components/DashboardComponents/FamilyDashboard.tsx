import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { SpecialistApiResponse } from "../../types/Specialist";
import type {
  PatientProgressData,
  PatientProgressApiResponse,
} from "../../types/PatientProgress";
import WelcomeBanner from "./FamilyDashboard/WelcomeBanner";
import SpecialistDetailsCard from "./FamilyDashboard/SpecialistDetailsCard";
import SkillsProgress from "./FamilyDashboard/SkillsProgress";
import ProgressChart from "./FamilyDashboard/ProgressChart";
import RecentActivity from "./FamilyDashboard/RecentActivity";
import Milestones from "./FamilyDashboard/Milestones";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const [specialistData, setSpecialistData] = useState<
    SpecialistApiResponse["data"] | null
  >(null);
  const [isLoadingSpecialist, setIsLoadingSpecialist] =
    useState<boolean>(false);
  const [specialistError, setSpecialistError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<PatientProgressData | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialistDetails = async () => {
      if (!user?.specialistId) {
        return;
      }

      setIsLoadingSpecialist(true);
      setSpecialistError(null);

      try {
        const response = await fetch(
          `${API_BASE}/Specialist/${user.specialistId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch specialist details");
        }

        const result: SpecialistApiResponse = await response.json();

        if (result.success && result.data) {
          setSpecialistData(result.data);
        } else {
          throw new Error(
            result.message || "Failed to fetch specialist details",
          );
        }
      } catch (err) {
        console.error("Error fetching specialist details:", err);
        setSpecialistError("Unable to load specialist information");
      } finally {
        setIsLoadingSpecialist(false);
      }
    };

    fetchSpecialistDetails();
  }, [user?.specialistId]);

  useEffect(() => {
    if (!user?.patientId) {
      setProgressData(null);
      setProgressError("Patient profile is missing.");
      return;
    }

    let cancelled = false;

    const fetchPatientProgress = async () => {
      setIsLoadingProgress(true);
      setProgressError(null);

      try {
        const response = await fetch(
          `${API_BASE}/categories/patient-progress?patientId=${user.patientId}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch patient progress");
        }

        const result: PatientProgressApiResponse = await response.json();
        if (cancelled) return;

        if (result.isSuccess && result.value) {
          const categories = result.value;
          const normalizedProgress: PatientProgressData = {
            patientId: Number(user.patientId),
            totalGamesPlayed: categories.reduce(
              (sum, category) => sum + category.questionsNumber,
              0,
            ),
            totalEarnedPoints: categories.reduce(
              (sum, category) => sum + category.questionsEarnedPoints,
              0,
            ),
            byCategory: categories.map((category) => ({
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              gamesPlayed: category.questionsNumber,
              totalPoints: Number(category.score ?? 0),
            })),
          };
          setProgressData(normalizedProgress);
        } else {
          throw new Error(result.message || "Could not load progress details");
        }
      } catch (err) {
        console.error("Error fetching patient progress:", err);
        if (!cancelled) {
          setProgressData(null);
          setProgressError("Unable to load child progress right now.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProgress(false);
        }
      }
    };

    fetchPatientProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.patientId]);

  return (
    <div className="container mx-auto px-6 py-8 min-h-[calc(100vh-74px)] bg-linear-to-br from-gray-50 to-green-50/30">
      <WelcomeBanner username={user?.username} />

      <SpecialistDetailsCard
        isLoading={isLoadingSpecialist}
        error={specialistError}
        specialistData={specialistData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <SkillsProgress
            progressData={progressData}
            isLoading={isLoadingProgress}
            error={progressError}
            patientScore={user?.score ?? null}
          />
          <ProgressChart
            progressData={progressData}
            isLoading={isLoadingProgress}
            error={progressError}
            patientScore={user?.score ?? null}
          />
        </div>

        <div className="space-y-6">
          <RecentActivity
            progressData={progressData}
            isLoading={isLoadingProgress}
          />
          <Milestones
            progressData={progressData}
            isLoading={isLoadingProgress}
            patientScore={user?.score ?? null}
          />
        </div>
      </div>
    </div>
  );
}
