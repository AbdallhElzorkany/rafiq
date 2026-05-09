import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Sidebar,
  SidebarOpen,
  X,
  Loader2,
  MessageSquarePlus,
  MessageSquareX,
} from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { useAuth } from "../../contexts/AuthContext";
import type { Conversation, ConversationsSideBarProps } from "../../types/Chat";
import { useConversation } from "../../hooks/useConversation";
import { useParams } from "react-router";
import NewChat from "./NewChat";

const API_BASE_URL =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io";

export default function ConversationsSideBar({
  isOpen: controlledIsOpen,
  onToggle,
}: ConversationsSideBarProps) {
  const { token } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [newChat, setNewChat] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { userId } = useParams();
  const { setConversation } = useConversation();
  const {
    data: conversations = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["conversations"],
    refetchInterval: 3_000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/api/Chat/conversations`, {
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const result = await response.json();
      if (result.success === false) {
        throw new Error(result.message || "Failed to fetch conversations");
      }
      return Array.isArray(result.data) ? result.data : (result?.data ?? []);
    },
    enabled: !!token,
  });
  const sidebarOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };
  const newChatToggle = () => {
    setNewChat(!newChat);
  };
  useEffect(() => {
    if (userId && (conversations as Conversation[]).length > 0) {
      setConversation(
        conversations.find((conv: Conversation) => conv.partnerId === userId),
      );
    }
  }, [userId, conversations, setConversation]);

  const filteredConversations: Conversation[] = conversations.filter(
    (conv: Conversation) =>
      conv.partnerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* sidebar Toggle Button */}
      <button
        onClick={handleToggle}
        className="fixed cursor-pointer top-23.5 right-4 z-26 p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <Sidebar size={24} /> : <SidebarOpen size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="cursor-pointer fixed top-[80px] left-0 right-0 bottom-0 bg-black/50 z-30 md:hidden"
          onClick={handleToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-[81px] md:top-0 left-0 h-[calc(100vh-81px)] bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40 shrink-0 ${
          sidebarOpen
            ? "w-[320px] translate-x-0"
            : "w-0 -translate-x-full md:opacity-100 overflow-hidden"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div
            className={`flex items-center justify-between ${!newChat && "mb-4"}`}
          >
            <h2 className="text-xl font-bold text-gray-800 ">
              {newChat ? "New Chat" : "Chats"}
            </h2>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setNewChat(!newChat)}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${newChat ? "bg-green-100 text-primary" : "text-primary-light hover:text-primary hover:bg-green-100"}`}
                aria-label={newChat ? "Close New Chat" : "New Chat"}
                title={newChat ? "Close New Chat" : "New Chat"}
              >
                {newChat ? (
                  <MessageSquareX className="size-6" />
                ) : (
                  <MessageSquarePlus className="size-6" />
                )}
              </button>
              <button
                onClick={handleToggle}
                className="cursor-pointer md:hidden p-1.5 text-primary-light hover:text-primary hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <X className="size-6" />
              </button>
            </div>
          </div>

          {/* Search */}
          {!newChat && (
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          )}
        </div>

        {/* Conversations List */}
        {newChat ? (
          <NewChat newChatToggle={newChatToggle} />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 size={48} className="mb-3 opacity-50 animate-spin" />
                <p className="text-sm">Loading chats...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-400">
                <X size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Failed to load chats</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Search size={48} className="mb-3 opacity-50" />
                <p className="text-sm">No chats found</p>
              </div>
            ) : (
              filteredConversations.map((conversation: Conversation) => (
                <ConversationItem
                  key={conversation.partnerId}
                  conversation={conversation}
                />
              ))
            )}
          </div>
        )}
      </aside>
    </>
  );
}
