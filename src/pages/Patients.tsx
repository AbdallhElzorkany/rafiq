import {
  AlertCircle,
  Loader2,
  Search,
  SearchX,
  UserPlus,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { type PatientCard as PatientCardInterface } from "../types/Patient";
import PatientCard from "../components/PatientComponents/PatientCard";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

export default function Patients() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: patients,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const req = await fetch(
        `https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/Specialist/${user?.id}/patients`,
      );
      if (req.status === 404) {
        return [];
      }
      return (await req.json()).data || [];
    },
  });
  const filteredPatients = useMemo(() => {
    let patientsData: PatientCardInterface[] = patients || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      patientsData = patientsData.filter((p: PatientCardInterface) =>
        p.fullName.toLowerCase().includes(query),
      );
    }

    return patientsData;
  }, [searchQuery, patients]);

  return (
    <div className="bg-linear-to-b min-h-[calc(100vh-81px)] from-gray-50 to-gray-100 p-4 sm:p-5">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          My Patients
        </h1>
        <p className="text-gray-500 text-lg">
          Monitor and support your patients&apos; developmental progress
        </p>
      </div>

      <div className="flex  gap-2 items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="relative w-full lg:w-auto flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3  bg-primary/5 border-2 border-transparent rounded-2xl text-md font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 text-primary hover:text-white cursor-pointer hover:bg-primary rounded-full transition-all duration-300"
              aria-label="Clear search"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div
          title="Number of Patients"
          className="w-fit flex items-center gap-1 px-4 py-3 bg-gray-50 text-gray-500 rounded-2xl border text-md border-gray-100"
        >
          <UserPlus className="size-5 text-primary" />
          <span className="text-lg font-bold">{filteredPatients.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredPatients.map((patient) => (
          <PatientCard key={patient.patientId} patient={patient} />
        ))}
      </div>

      {isFetching ? (
        <div className="text-center py-16">
          <div className="p-10 mx-auto mb-4 rounded-2xl flex items-center justify-center">
            <Loader2 className="size-20 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Loading patients...
          </h3>
          <p className="text-gray-500">Please wait while we load your data</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="p-10 mx-auto mb-4  flex items-center justify-center">
            <AlertCircle className="size-20 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Error loading patients
          </h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      ) : (
        filteredPatients.length === 0 && (
          <div className="text-center py-16">
            <div className=" mx-auto mb-4 p-10  flex items-center justify-center">
              <SearchX className="size-20 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No patients found
            </h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )
      )}
    </div>
  );
}
