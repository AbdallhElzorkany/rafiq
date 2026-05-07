import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, Stethoscope, User, X } from "lucide-react";
import { ContactItem } from "./ContactItem";
import type { Contact } from "../../types/Chat";

const API_BASE_URL =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io";

export default function NewChat({
  newChatToggle,
}: {
  newChatToggle: () => void;
}) {
  const { user } = useAuth();
  const isFamily: boolean = user?.roles?.includes("Family") ?? false;

  const { data, error, isPending } = useQuery({
    queryKey: ["patients", isFamily, user?.id, user?.specialistId],
    queryFn: async () => {
      const req = await fetch(
        `${API_BASE_URL}/api/Specialist/${isFamily ? user?.specialistId : user?.id}${isFamily ? "" : "/patients"}`,
      );
      if (isFamily) {
        const res = await req.json();
        return res.data;
      }
      if (req.status === 404) {
        return [];
      }
      const res = await req.json();
      console.log(res);
      return res.data || [];
    },
    enabled: isFamily && user?.specialistId ? true : !isFamily,
  });
  if (isFamily) {
    const contact: Contact = data as Contact;
    return (
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {!user?.specialistId ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Stethoscope className="mb-3 opacity-50 size-10" />
            <p className="text-sm">You don't have a specialist to chat with.</p>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 size={48} className="mb-3 opacity-50 animate-spin" />
            <p className="text-sm">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <X size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Failed to load contacts</p>
          </div>
        ) : (
          <ContactItem
            newChatToggle={newChatToggle}
            contact={contact}
            icon={<Stethoscope className="size-6" />}
          />
        )}
      </div>
    );
  }
  const contacts: Contact[] = data as Contact[];
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {isPending ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={48} className="mb-3 opacity-50 animate-spin" />
          <p className="text-sm">Loading contacts...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-red-400">
          <X size={48} className="mb-3 opacity-50" />
          <p className="text-sm">Failed to load contacts</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <User className="mb-3 opacity-50 size-10" />
          <p className="text-sm">You don't have any Patients to chat with.</p>
        </div>
      ) : (
        contacts.map((contact) => (
          <ContactItem
            key={contact.familyId}
            newChatToggle={newChatToggle}
            contact={contact}
            icon={<User className="size-6" />}
          />
        ))
      )}
    </div>
  );
}
