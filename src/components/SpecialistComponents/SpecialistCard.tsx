import { Award, Check, Eye, MessageSquareText, UserPlus } from "lucide-react";
import type { Specialist } from "../../types/Specialist";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function SpecialistCard({
  specialist,
}: {
  specialist: Specialist;
}) {
  const { user } = useAuth();
  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102 flex flex-col gap-5">
      <div className="relative">
        <img
          src={
            specialist.gender.toLocaleLowerCase() === "male"
              ? "/mdoctor.png"
              : "/fdoctor.jpg"
          }
          alt={`Dr. ${specialist.fullName}`}
          className="w-full object-cover aspect-video rounded-2xl"
        />
        {user?.specialistId === specialist.id && (
          <span className="text-primary shadow-md backdrop-blur-lg bg-white/50 px-3 py-1 rounded-full absolute font-semibold bottom-3 right-3 flex items-center gap-2">
            <Check className="size-5" />
            Current
          </span>
        )}
      </div>
      <div className="flex flex-col justify-between h-full gap-5">
        <div className="flex flex-col grow">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Dr. {specialist.fullName}
            </h3>
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <div className="flex items-center text-primary" title="specialty">
                <Award className="size-4" />
                <span className="ml-1 font-semibold">
                  {specialist.specialty}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <div
                className="flex items-center text-primary"
                title="Number of patients"
              >
                <UserPlus className="size-4" />
                <span className="ml-1 font-semibold">
                  {specialist.patientsCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600">{specialist.professionalBio}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/specialists/${specialist.id}`}
            className={`${user?.specialistId === specialist.id ? "w-1/2" : "w-full"} shadow-md border-primary text-center hover:border-primary hover:bg-white hover:text-primary transition-all duration-300 border-2 gap-2 bg-primary text-white px-6 py-4 rounded-2xl flex items-center justify-center`}
          >
            <Eye className="size-5" />
            Details
          </Link>
          {user?.specialistId === specialist.id && (
            <Link
              to={`/chats/${specialist.id}`}
              className="w-1/2 shadow-md border-primary text-center hover:border-primary hover:bg-white hover:text-primary transition-all duration-300 border-2 gap-2 bg-primary text-white px-6 py-4 rounded-2xl flex items-center justify-center"
            >
              <MessageSquareText className="size-5" />
              Message
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
