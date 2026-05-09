import { useEffect, useState } from "react";
import WelcomeBanner from "./SpecialistDashboard/WelcomeBanner";
import RecentSessions from "./SpecialistDashboard/RecentSessions";
import MyPatients from "./SpecialistDashboard/MyPatients";
import PendingAttemptReviews from "./SpecialistDashboard/PendingAttemptReviews";
import { useAuth } from "../../contexts/AuthContext";
import type { SpecialistApiResponse } from "../../types/Specialist";

const SPECIALIST_API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

export default function SpecialistDashboard() {
  const { user } = useAuth();
  const [patientsCount, setPatientsCount] = useState<number | null>(null);

  useEffect(() => {
    const specialistProfileId = user?.specialistId || user?.id;
    if (!specialistProfileId) {
      setPatientsCount(null);
      return;
    }

    let cancelled = false;

    const fetchSpecialistProfile = async () => {
      setPatientsCount(null);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          Accept: "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${SPECIALIST_API_BASE}/Specialist/${specialistProfileId}`,
          { headers },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch specialist profile");
        }

        const result: SpecialistApiResponse = await response.json();

        if (cancelled) return;

        if (result.success && result.data) {
          setPatientsCount(result.data.patientsCount);
        } else {
          setPatientsCount(0);
        }
      } catch (err) {
        console.error("Error fetching specialist profile:", err);
        if (!cancelled) setPatientsCount(0);
      }
    };

    fetchSpecialistProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.specialistId, user?.id]);

  return (
    <div className="container mx-auto px-6 py-8 min-h-[calc(100vh-74px)] bg-linear-to-br from-gray-50 via-green-50/20 to-emerald-50/30 font-sans text-gray-800">
      <div className="space-y-8">
        <WelcomeBanner
          doctorName={user?.username}
          patientsCount={patientsCount}
        />
        <div className="space-y-8">
          <PendingAttemptReviews />
          <RecentSessions />
          <MyPatients />
        </div>
      </div>
    </div>
  );
}
