import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, User } from "lucide-react";
import { chatApi } from "../../api/chat";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useAuthStore();
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => chatApi.myRooms().then((r) => r.data),
  });

  const { data: instructors } = useQuery({
    queryKey: ["instructors"],
    queryFn: () => api.get("/users?role=ROLE_INSTRUCTOR").then((r) => r.data),
  });

  // Poll messages every 2 seconds when a room is open
  const { data: messages } = useQuery({
    queryKey: ["chatMessages", activeRoom?.id],
    queryFn: () => chatApi.getMessages(activeRoom.id).then((r) => r.data),
    enabled: !!activeRoom,
    refetchInterval: 2000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChatMutation = useMutation({
    mutationFn: (tutorId) => chatApi.getOrCreateRoom(tutorId).then((r) => r.data),
    onSuccess: (room) => {
      setActiveRoom(room);
      queryClient.invalidateQueries(["chatRooms"]);
    },
    onError: () => toast.error("Could not open chat"),
  });

  const sendMutation = useMutation({
    mutationFn: () => chatApi.sendMessage(activeRoom.id, message).then((r) => r.data),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries(["chatMessages", activeRoom.id]);
    },
    onError: () => toast.error("Send failed"),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate();
  };

  const otherPerson = (room) => {
    if (!user) return "";
    const isStudent = room.student?.id === user.userId;
    return isStudent ? room.tutor?.fullName : room.student?.fullName;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        {/* Existing rooms */}
        <div className="card flex-1 overflow-y-auto p-0">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle size={16} /> Conversations
          </div>
          {loadingRooms ? <Spinner size="sm" /> : (
            <div className="divide-y divide-gray-50">
              {rooms?.map((room) => (
                <button key={room.id} onClick={() => setActiveRoom(room)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${activeRoom?.id === room.id ? "bg-primary-50" : ""}`}>
                  <div className="w-9 h-9 bg-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {otherPerson(room)?.charAt(0) ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{otherPerson(room)}</p>
                    <p className="text-xs text-gray-400">Click to open</p>
                  </div>
                </button>
              ))}
              {rooms?.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>}
            </div>
          )}
        </div>

        {/* Available tutors to chat */}
        <div className="card p-0">
          <div className="p-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Chat with Instructors</div>
          <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
            {instructors?.map((instructor) => (
              <button key={instructor.id} onClick={() => openChatMutation.mutate(instructor.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {instructor.fullName?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{instructor.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{instructor.headline ?? "Instructor"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat window */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <div className="w-9 h-9 bg-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {otherPerson(activeRoom)?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{otherPerson(activeRoom)}</p>
              <p className="text-xs text-green-500">● Online (polling every 2s)</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages?.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">Say hello! Start the conversation.</div>
            )}
            {messages?.map((msg) => {
              const mine = msg.sender?.id === user?.userId || msg.senderName === user?.fullName;
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
                      {(msg.senderName ?? msg.sender?.fullName ?? "?").charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    mine ? "bg-primary-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${mine ? "text-primary-200" : "text-gray-400"}`}>
                      {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 flex gap-3">
            <input className="input flex-1" placeholder="Type a message..."
              value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit" disabled={!message.trim() || sendMutation.isPending}
              className="btn-primary px-4 flex items-center gap-2">
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100">
          <div className="text-center text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm">or start a new chat with a tutor</p>
          </div>
        </div>
      )}
    </div>
  );
}
