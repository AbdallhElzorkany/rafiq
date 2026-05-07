import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useParams } from "react-router";
import type { Message, Chat as ChatType } from "../../types/Chat";
import MessageComponent from "./Message";
import { getInitials } from "../../lib/chatUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useSignalR } from "../../hooks/useSignalR";
import { useToast } from "../../hooks/useToast";
import { useConversation } from "../../hooks/useConversation";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api";

const PAGE_SIZE = 30;

export default function Chat() {
  const { userId } = useParams();
  const { token, user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [states, setStates] = useState<{
    messages: Message[];
    partnerName: string;
    pageNumber: number;
    hasNextPage: boolean;
    error: string;
    isLoading: boolean;
    isLoadingMore: boolean;
  }>({
    messages: [],
    pageNumber: 1,
    partnerName: "",
    hasNextPage: false,
    error: "",
    isLoading: false,
    isLoadingMore: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const { conversation } = useConversation();
  const fetchMessages = useCallback(
    async (page: number, appendToEnd: boolean = false) => {
      if (!token || !userId) return;

      const loadingSetter = (loading: boolean = true) =>
        page === 1
          ? setStates((prev) => ({ ...prev, isLoading: loading }))
          : setStates((prev) => ({ ...prev, isLoadingMore: loading }));
      loadingSetter(true);
      try {
        const res = await fetch(
          `${API_BASE}/Chat/history/${userId}?pageNumber=${page}&pageSize=${PAGE_SIZE}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok && res.status === 403) {
          const error = await res.json();
          throw new Error(error.message);
        }

        if (!res.ok) throw new Error("Failed to fetch messages");

        const result: unknown = await res.json();

        const data = (
          result && typeof result === "object" && "messages" in result
            ? result
            : result && typeof result === "object" && "data" in result
              ? (result as { data: ChatType }).data
              : null
        ) as ChatType | null;
        if (!data || !Array.isArray(data.messages)) {
          throw new Error("Invalid response format");
        }

        const reversedMessages = data.messages.slice().reverse();

        if (appendToEnd) {
          setStates((prev) => ({
            ...prev,
            messages: [
              ...reversedMessages,
              ...prev.messages.filter(
                (m) => !reversedMessages.some((rm) => rm.id === m.id),
              ),
            ],
          }));
        } else {
          setStates((prev) => ({ ...prev, messages: reversedMessages }));
        }
        setStates((prev) => ({
          ...prev,
          pageNumber: data.pageNumber ?? page,
          hasNextPage: data.hasNextPage ?? false,
          partnerName: data.partnerName ?? "",
        }));
      } catch (error) {
        if (error instanceof Error)
          setStates((prev) => ({ ...prev, error: error.message }));
      } finally {
        loadingSetter(false);
      }
    },
    [token, userId],
  );

  useEffect(() => {
    if (token && userId) {
      initialScrollDone.current = false;
      fetchMessages(1);
    }
  }, [token, userId, fetchMessages]);

  useEffect(() => {
    if (
      states.messages.length > 0 &&
      !initialScrollDone.current &&
      !states.isLoading
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      initialScrollDone.current = true;
    }
  }, [states.messages, states.isLoading]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || states.isLoadingMore || !states.hasNextPage) return;

    const scrollTop = container.scrollTop;
    const scrollThreshold = 100;

    if (
      scrollTop < scrollThreshold &&
      states.hasNextPage &&
      !states.isLoadingMore
    ) {
      fetchMessages(states.pageNumber + 1, true);
    }
  }, [
    fetchMessages,
    states.hasNextPage,
    states.isLoadingMore,
    states.pageNumber,
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleReceiveMessage = useCallback((message: Message) => {
    setStates((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, []);

  useSignalR({
    token,
    onReceiveMessage: handleReceiveMessage,
  });

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !token) return;

    const content = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`${API_BASE}/Chat/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const result = (await res.json()) as { data: Message };
      const message = result.data;

      setStates((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
      setTimeout(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    } catch (e) {
      if (e instanceof Error) showToast(e.message, "error");

      // Optionally surface error; keeping current behavior minimal
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const markMessagesAsRead = useCallback(async () => {
    if (!token || !userId) return;

    try {
      await fetch(`${API_BASE}/Chat/read/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Silently fail - read status is not critical
    }
  }, [token, userId]);

  useEffect(() => {
    if (states.messages.length === 0 || !currentUser) return;

    const lastMessage = states.messages[states.messages.length - 1];
    const isFromOtherUser = lastMessage.senderId !== currentUser.id;
    const isFromMe = lastMessage.senderId === currentUser.id;

    if (isFromOtherUser && !lastMessage.isRead) {
      markMessagesAsRead().then(() => {
        setStates((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => ({
            ...msg,
            isRead: true,
          })),
        }));
      });
    }
    if (
      isFromMe &&
      lastMessage.isRead === false &&
      conversation?.lastMessage.isRead === true &&
      conversation?.lastMessage.id === lastMessage.id
    ) {
      setStates((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => ({
          ...msg,
          isRead: true,
        })),
      }));
    }
  }, [
    states.messages,
    currentUser,
    markMessagesAsRead,
    fetchMessages,
    conversation,
  ]);
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(
              states.partnerName || conversation?.partnerName || "User",
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {states.partnerName || conversation?.partnerName || "User"}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0"
      >
        {states.isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
        {states.error && (
          <div className="flex justify-center items-center py-4">
            <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
              {states.error}
            </div>
          </div>
        )}
        {states.isLoading && !states.error ? (
          <div className="flex justify-center items-center h-[calc(100%-80px)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : states.messages.length === 0 && !states.error ? (
          <div className="flex flex-col items-center justify-center gap-3 h-[calc(100%-80px)]">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          states.messages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              isMe={message.senderId === currentUser?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 flex items-end gap-2 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex-1 bg-gray-100 rounded-2xl flex items-end px-4 py-2">
          <textarea
            value={newMessage}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            style={{ minHeight: "20px", maxHeight: "128px" }}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              if (e.target.style.height === "128px") {
                e.target.style.overflowY = "scroll";
              }
              setNewMessage(e.target.value);
            }}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 resize-none  overflow-hidden"
            rows={1}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="cursor-pointer  p-3 bg-primary text-white rounded-full hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
