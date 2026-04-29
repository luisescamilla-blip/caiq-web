import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  ChatMessage,
  ChatThread,
  initialChatThreads,
  Student,
} from "../data/mockData";
import {
  Send,
  Search,
  MessageSquare,
  Circle,
} from "lucide-react";

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFullTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AvatarBubble({
  initials,
  size = "md",
  color = "indigo",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "purple" | "emerald" | "amber";
}) {
  const sizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-10 h-10" };
  const textSizes = { sm: "11px", md: "13px", lg: "14px" };
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-semibold" style={{ fontSize: textSizes[size] }}>
        {initials}
      </span>
    </div>
  );
}

const STATUS_DOT: Record<Student["status"], string> = {
  active: "text-emerald-500",
  inactive: "text-gray-300",
  "on-hold": "text-amber-400",
};

export function Chat() {
  const { students } = useApp();
  const { user } = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>(initialChatThreads);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialChatThreads[0]?.studentId ?? null
  );
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const coachInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "C";

  // Students who have a thread
  const threadedStudentIds = threads.map((t) => t.studentId);
  const allStudents = students.filter((s) =>
    threadedStudentIds.includes(s.id)
  );

  // For "new message" - students without a thread
  const studentsWithoutThread = students.filter(
    (s) => !threadedStudentIds.includes(s.id)
  );

  const filteredStudents = allStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedThread = threads.find((t) => t.studentId === selectedStudentId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Scroll to bottom on new messages or conversation change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedStudentId, selectedThread?.messages.length]);

  // Clear unread when opening a conversation
  useEffect(() => {
    if (selectedStudentId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.studentId === selectedStudentId ? { ...t, unreadCount: 0 } : t
        )
      );
    }
  }, [selectedStudentId]);

  const sendMessage = () => {
    const content = inputValue.trim();
    if (!content || !selectedStudentId) return;

    const newMsg: ChatMessage = {
      id: `cm-${Date.now()}`,
      from: "coach",
      content,
      timestamp: new Date().toISOString(),
    };

    setThreads((prev) => {
      const exists = prev.find((t) => t.studentId === selectedStudentId);
      if (exists) {
        return prev.map((t) =>
          t.studentId === selectedStudentId
            ? { ...t, messages: [...t.messages, newMsg] }
            : t
        );
      }
      return [
        ...prev,
        { studentId: selectedStudentId, messages: [newMsg], unreadCount: 0 },
      ];
    });
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (!threads.find((t) => t.studentId === studentId)) {
      setThreads((prev) => [
        ...prev,
        { studentId, messages: [], unreadCount: 0 },
      ]);
    }
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="flex overflow-hidden bg-gray-50" style={{ height: "calc(100vh - 65px)" }}>
      {/* ── Left Panel: Conversation List ── */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-gray-900" style={{ fontSize: "16px", fontWeight: 700 }}>
                Messages
              </h2>
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white" style={{ fontSize: "11px", fontWeight: 700 }}>
                  {totalUnread}
                </span>
              )}
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Conversation rows */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredStudents.length === 0 && search && (
            <p className="px-4 py-6 text-center text-gray-400" style={{ fontSize: "13px" }}>
              No conversations found
            </p>
          )}
          {filteredStudents.map((student) => {
            const thread = threads.find((t) => t.studentId === student.id);
            const lastMsg = thread?.messages[thread.messages.length - 1];
            const unread = thread?.unreadCount ?? 0;
            const isSelected = selectedStudentId === student.id;

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left border-l-2 ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-500"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  <AvatarBubble initials={student.avatar} size="md" color="purple" />
                  <Circle
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current ${STATUS_DOT[student.status]}`}
                    strokeWidth={0}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`truncate ${isSelected ? "text-indigo-700" : "text-gray-900"}`}
                      style={{ fontSize: "14px", fontWeight: unread > 0 ? 700 : 500 }}
                    >
                      {student.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                      {lastMsg && (
                        <span className="text-gray-400" style={{ fontSize: "11px" }}>
                          {formatTime(lastMsg.timestamp)}
                        </span>
                      )}
                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* New conversation section - removed */}
          {false && studentsWithoutThread.length > 0 && (
            <div className="mt-2 px-4 pb-2">
              {studentsWithoutThread.map((student) => (
                <button
                  key={student.id}
                  onClick={() => startNewConversation(student.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <AvatarBubble initials={student.avatar} size="sm" color="indigo" />
                  <span className="text-gray-600 truncate" style={{ fontSize: "13px" }}>
                    {student.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Right Panel: Conversation Thread ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedStudent && selectedThread ? (
          <>
            {/* Conversation header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <AvatarBubble initials={selectedStudent.avatar} size="lg" color="purple" />
                <Circle
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-current ${STATUS_DOT[selectedStudent.status]}`}
                  strokeWidth={0}
                />
              </div>
              <div>
                <h3 className="text-gray-900" style={{ fontSize: "15px", fontWeight: 700 }}>
                  {selectedStudent.name}
                </h3>
                <p className="text-gray-400" style={{ fontSize: "12px" }}>
                  {selectedStudent.program} &middot;{" "}
                  <span
                    className={`capitalize ${
                      selectedStudent.status === "active"
                        ? "text-emerald-600"
                        : selectedStudent.status === "on-hold"
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {selectedStudent.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {selectedThread.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-gray-700" style={{ fontSize: "15px", fontWeight: 600 }}>
                    Start the conversation
                  </p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>
                    Send {selectedStudent.name.split(" ")[0]} a message below.
                  </p>
                </div>
              ) : (
                <>
                  {selectedThread.messages.map((msg, idx) => {
                    const isCoach = msg.from === "coach";
                    const prevMsg = selectedThread.messages[idx - 1];
                    const showDateDivider =
                      !prevMsg ||
                      new Date(msg.timestamp).toDateString() !==
                        new Date(prevMsg.timestamp).toDateString();

                    return (
                      <div key={msg.id}>
                        {showDateDivider && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-gray-400 flex-shrink-0" style={{ fontSize: "11px" }}>
                              {new Date(msg.timestamp).toLocaleDateString([], {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        <div
                          className={`flex items-end gap-2.5 ${
                            isCoach ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          {isCoach ? (
                            <AvatarBubble initials={coachInitials} size="sm" color="indigo" />
                          ) : (
                            <AvatarBubble initials={selectedStudent.avatar} size="sm" color="purple" />
                          )}

                          {/* Bubble */}
                          <div
                            className={`max-w-sm lg:max-w-md xl:max-w-lg group ${
                              isCoach ? "items-end" : "items-start"
                            } flex flex-col`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl ${
                                isCoach
                                  ? "bg-indigo-600 text-white rounded-br-sm"
                                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                              }`}
                              style={{ fontSize: "14px", lineHeight: "1.5" }}
                            >
                              {msg.content}
                            </div>
                            <span
                              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
                              style={{ fontSize: "11px" }}
                            >
                              {formatFullTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedStudent.name.split(" ")[0]}…`}
                  rows={1}
                  className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none resize-none overflow-hidden"
                  style={{ fontSize: "14px", lineHeight: "1.5", maxHeight: "120px" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    inputValue.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-gray-400" style={{ fontSize: "11px" }}>
                Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Enter</kbd> to send &middot; <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Shift+Enter</kbd> for new line
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-9 h-9 text-indigo-300" />
            </div>
            <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>
              Your Messages
            </h3>
            <p className="text-gray-400 mt-2 max-w-xs" style={{ fontSize: "14px" }}>
              Select a conversation from the left to read and reply, or start a new one with any student.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}