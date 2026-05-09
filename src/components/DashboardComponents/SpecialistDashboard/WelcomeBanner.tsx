import { Calendar, Zap, TrendingUp, Star, Users, Video } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';interface WelcomeBannerProps {
  doctorName?: string;
  patientsCount?: number | null;
}

export default function WelcomeBanner({ doctorName, patientsCount }: WelcomeBannerProps) {
  const { user } = useAuth();
  
  const { data } = useQuery({
    queryKey: ["SpecialistSessions", user?.id],
    staleTime: 0,
    queryFn: () =>
      fetch(
        `https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/Session/specialist/${user?.id}`
      ).then((res) => res.json()),
    enabled: !!user?.id,
  });

  const sessionsCount = data?.data?.[0]?.numberOfSessions || 0;

  const displayName = doctorName?.trim() || 'Doctor';
  const patientsLabel =
    patientsCount === null ? '—' : String(patientsCount);

  return (
    <div className="bg-linear-to-br from-primary-dark via-green-800 to-emerald-700 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400/10 rounded-full blur-3xl -ml-24 -mb-24 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 opacity-10 animate-pulse">
        <Zap className="w-48 h-48" />
      </div>
      
      <div className="flex flex-col relative z-10 space-y-2 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-green-200" />
          <span className="text-xs font-bold text-green-100 uppercase tracking-widest">
            Saturday, April 11, 2026
          </span>
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tight">Welcome Dr. {displayName} 👋</h1>
        <p className="text-sm text-green-100/90 max-w-lg leading-relaxed">
          You have <strong className="text-white font-bold">{patientsLabel} patients</strong> under active care and <strong className="text-white font-bold">{sessionsCount} sessions</strong> uploaded.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            <TrendingUp className="w-3.5 h-3.5 text-green-300" />
            <span className="text-xs font-semibold">+15% this week</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            <Star className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-semibold">4.9 rating</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-32 flex flex-col items-center justify-center border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black mb-1">{patientsLabel}</span>
          <span className="text-[10px] text-green-100/80 text-center uppercase tracking-wider font-bold">Active<br/>Patients</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-32 flex flex-col items-center justify-center border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black mb-1">{sessionsCount}</span>
          <span className="text-[10px] text-green-100/80 text-center uppercase tracking-wider font-bold">Total<br/>Sessions</span>
        </div>
      </div>
    </div>
  );
}
