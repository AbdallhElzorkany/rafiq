import { Link, useParams } from "react-router";
import type { Patient as PatientType } from "../types/Patient";
import {
  ArrowLeft,
  Calendar,
  User,
  Venus,
  Mars,
  X,
  RefreshCw,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { useMemo } from "react";
import UpcomingSessions from "../components/PatientComponents/UpcomingSessions";
import PatientAttempts from "../components/PatientComponents/PatientAttempts";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io";

function HeaderSkeleton() {
  return (
    <div className="bg-linear-to-br from-gray-300 to-gray-400 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-32 h-32 rounded-2xl bg-white/30 shimmer" />
        <div className="flex-1 w-full min-w-0 space-y-3">
          <div className="h-8 bg-white/30 rounded w-2/3 shimmer" />
          <div className="max-w-4xl bg-white/20 rounded-xl p-3 space-y-2">
            <div className="h-4 bg-white/30 rounded w-full shimmer" />
            <div className="h-2 bg-white/30 rounded w-full shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItemSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0 shimmer" />
      <div className="space-y-1 flex-1">
        <div className="h-3 bg-gray-200 rounded w-12 shimmer" />
        <div className="h-4 bg-gray-200 rounded w-24 shimmer" />
      </div>
    </div>
  );
}

function PatientSkeleton() {
  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      {/* Back Link Skeleton */}
      <div className="inline-flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-gray-300 rounded shimmer" />
        <div className="h-4 bg-gray-300 rounded w-28 shimmer" />
      </div>

      <HeaderSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-64">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 shimmer" />
            <div className="space-y-3">
              <div className="h-16 bg-gray-100 rounded-xl shimmer" />
              <div className="h-16 bg-gray-100 rounded-xl shimmer" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 shimmer" />
          <div className="space-y-4">
            <DetailItemSkeleton />
            <DetailItemSkeleton />
            <DetailItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

function getAvatarUrl(gender: string): string {
  return gender === "Female" ? "/f-down.jpg" : "/m-down.jpg";
}

export default function Patient() {
  const { patientId } = useParams();

  const {
    data: patient,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const req = await axios.get(`${API_BASE_URL}/api/Patient/${patientId}`);
      return req.data?.data as PatientType;
    },
    enabled: !!patientId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const age = useMemo(
    () => (patient ? calculateAge(patient.dateOfBirth) : 0),
    [patient],
  );

  if (isLoading) {
    return <PatientSkeleton />;
  }

  if (error || !patient) {
    return (
      <div className="bg-gray-50 p-5 min-h-screen">
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Patients</span>
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <X className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Failed to load patient
          </h3>
          <p className="text-red-600 mb-4">Please try again later.</p>
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

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-81px)] p-4 relative">
      {/* Progress bar for background refetch */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50 overflow-hidden">
          <div className="h-full bg-primary animate-[loading-bar_1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Back Link */}
      <Link
        to="/patients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Patients</span>
      </Link>

      {/* Header Card */}
      <div className="bg-linear-to-br from-primary-dark to-primary rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <img
              src={getAvatarUrl(patient.gender)}
              alt={patient.fullName}
              className="w-32 h-32 rounded-2xl bg-white/20 border-4 border-white/50 shadow-2xl object-cover"
            />
          </div>
          <div className="flex-1 w-full min-w-0">
            <h1 className="font-bold text-white text-2xl md:text-3xl leading-tight truncate">
              {patient.fullName}
            </h1>
            <div className="mt-3 max-w-4xl bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/80 text-xs font-medium">
                  Total Score
                </span>
                <span className="text-white text-sm font-bold">
                  {patient.totalScore.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${patient.totalScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 not-lg:order-2 space-y-6">
          <UpcomingSessions patientId={patientId!} />
          <PatientAttempts patientId={patientId!} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Patient Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Age</p>
                  <p className="text-gray-900 text-sm font-medium">
                    {age} years old
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  {patient.gender === "Female" ? (
                    <Venus className="w-4 h-4 text-green-600" />
                  ) : (
                    <Mars className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Gender</p>
                  <p className="text-gray-900 text-sm font-medium">
                    {patient.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date of Birth</p>
                  <p className="text-gray-900 text-sm font-medium">
                    {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
