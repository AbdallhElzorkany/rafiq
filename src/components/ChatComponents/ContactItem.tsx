import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Contact } from "../../types/Chat";

export function ContactItem({
  contact,
  icon,
  newChatToggle,
}: {
  contact: Contact;
  icon: ReactNode;
  newChatToggle: () => void;
}) {
  return (
    <Link
      to={contact.id ? `/chats/${contact.id}` : `/chats/${contact.familyId}`}
      onClick={newChatToggle}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group border border-transparent hover:bg-primary/10 hover:border-primary/20"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white transition-colors bg-gray-400 group-hover:bg-primary`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-sm font-semibold truncate transition-colors text-gray-800 group-hover:text-primary`}
          >
            {contact.familyName ? contact.familyName : contact.fullName}
          </h3>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-sm truncate text-gray-500`}>
            {contact.familyName ? `patient: ${contact.fullName}` : "My Specialist"}
          </p>
        </div>
      </div>
    </Link>
  );
}
