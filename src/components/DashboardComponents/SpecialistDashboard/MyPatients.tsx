import { useEffect, useState } from "react";
import { Users, ChevronRight, Mail, CalendarDays } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";

interface SpecialistPatient {
  patientId: number;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  totalScore: number;
  assignedAt: string;
  familyEmail: string;
}

interface SpecialistPatientsApiResponse {
  success: boolean;
  message: string;
  data: SpecialistPatient[];
}

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

export default function MyPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<SpecialistPatient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const specialistProfileId = user?.specialistId || user?.id;
    if (!specialistProfileId) {
      setPatients([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(
          `${API_BASE}/Specialist/${specialistProfileId}/patients`,
          { headers },
        );
        if (!response.ok)
          throw new Error("Failed to fetch specialist patients");

        const result: SpecialistPatientsApiResponse = await response.json();
        if (cancelled) return;

        if (result.success && Array.isArray(result.data)) {
          setPatients(result.data);
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error("Error fetching specialist patients:", err);
        if (!cancelled) {
          setError("Unable to load patients");
          setPatients([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPatients();

    return () => {
      cancelled = true;
    };
  }, [user?.specialistId, user?.id]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NA";

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-dark to-green-700 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              My Patients
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {patients.length} children tracked
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="flex items-center gap-1 text-xs text-green-600 font-bold border-2 border-green-600/30 rounded-full px-5 py-2 hover:bg-green-50 transition-colors uppercase tracking-wider group cursor-pointer"
        >
          View All{" "}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-sm font-medium text-gray-500">
          Loading patients...
        </div>
      )}

      {!isLoading && error && (
        <div className="py-8 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {!isLoading && !error && patients.length === 0 && (
        <div className="py-8 text-center text-sm font-medium text-gray-500">
          No patients assigned yet.
        </div>
      )}

      {!isLoading && !error && patients.length > 0 && (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Link to={`/patients/${patient.patientId}`} 
              key={patient.patientId}
              className="flex items-center gap-6 p-3 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer border border-transparent hover:border-gray-100"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                  {getInitials(patient.fullName)}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-3 border-white rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-base text-gray-900 group-hover:text-green-600 transition-colors">
                    {patient.fullName}
                  </span>
                  <span className="text-xs font-black text-green-600">
                    {Math.round(patient.totalScore)}%
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full tracking-wide">
                    {patient.gender} - {patient.age} yrs
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5" /> {patient.familyEmail}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-3.5 h-3.5" /> Assigned{" "}
                  {formatDate(patient.assignedAt)}
                </span>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 group-hover:h-3"
                    style={{
                      width: `${Math.max(0, Math.min(100, patient.totalScore))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
