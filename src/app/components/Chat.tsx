import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { ChatMessage, ChatThread, initialChatThreads } from "../data/mockData";
import { Send, Search, Plus, Hash, ChevronDown, Circle } from "lucide-react";

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-300",
  "on-hold": "bg-amber-400",
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
    user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "C";
  const coachName = user?.name ?? "Coach";

  const threadedStudentIds = threads.map((t) => t.studentId);
  const studentsWithThreads = students.filter((s) => threadedStudentIds.includes(s.id));
  const studentsWithoutThread = students.filter((s) => !threadedStudentIds.includes(s.id));

  const filteredStudents = studentsWithThreads.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedThread = threads.find((t) => t.studentId === selectedStudentId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedStudentId, selectedThread?.messages.length]);

  useEffect(() => {
    if (selectedStudentId) {
      setThreads((prev) =>
        prev.map((t) => (t.studentId === selectedStudentId ? { ...t, unreadCount: 0 } : t))
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
          t.studentId === selectedStudentId ? { ...t, messages: [...t.messages, newMsg] } : t
        );
      }
      return [...prev, { studentId: selectedStudentId, messages: [newMsg], unreadCount: 0 }];
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
      setThreads((prev) => [...prev, { studentId, messages: [], unreadCount: 0 }]);
    }
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  // Group messages by date for dividers
  const groupedMessages = selectedThread?.messages.reduce<{ date: string; messages: ChatMessage[] }[]>(
    (groups, msg) => {
      const dateKey = new Date(msg.timestamp).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === dateKey) {
        last.messages.push(msg);
      } else {
        groups.push({ date: dateKey, messages: [msg] });
      }
      return groups;
    },
    []
  ) ?? [];

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "calc(100vh - 65px)" }}>

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-gray-900 flex flex-col flex-shrink-0">
        {/* Workspace header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold" style={{ fontSize: "15px" }}>Coach AIQ</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          {totalUnread > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0" style={{ fontSize: "11px", fontWeight: 700 }}>
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Direct Messages section */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-gray-400 uppercase tracking-wider" style={{ fontSize: "11px", fontWeight: 600 }}>
              Direct Messages
            </span>
            <button
              className="text-gray-400 hover:text-gray-200 transition-colors"
              title="New message"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {filteredStudents.map((student) => {
            const thread = threads.find((t) => t.studentId === student.id);
            const unread = thread?.unreadCount ?? 0;
            const isSelected = selectedStudentId === student.id;
            const statusColor = STATUS_DOT[student.status] ?? "bg-gray-300";

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors text-left ${
                  isSelected ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {/* Avatar with status dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>{student.avatar}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isSelected ? "border-indigo-600" : "border-gray-900"} ${statusColor}`} />
                </div>
                <span className="flex-1 truncate" style={{ fontSize: "14px", fontWeight: unread > 0 ? 700 : 400 }}>
                  {student.name}
                </span>
                {unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center" style={{ fontSize: "11px", fontWeight: 700 }}>
                    {unread}
                  </span>
                )}
              </button>
            );
          })}

          {/* Students without threads */}
          {studentsWithoutThread.length > 0 && (
            <div className="mt-3">
              {studentsWithoutThread.map((student) => (
                <button
                  key={student.id}
                  onClick={() => startNewConversation(student.id)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400" style={{ fontSize: "10px", fontWeight: 700 }}>{student.avatar}</span>
                  </div>
                  <span className="flex-1 truncate" style={{ fontSize: "13px" }}>{student.name}</span>
                  <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coach profile at bottom */}
        <div className="px-3 py-3 border-t border-gray-700 flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{coachInitials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 bg-emerald-500" />
          </div>
          <span className="text-gray-300 truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{coachName}</span>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedStudent ? (
          <>
            {/* Channel header */}
            <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0 bg-white">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: "12px", fontWeight: 700 }}>{selectedStudent.avatar}</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[selectedStudent.status] ?? "bg-gray-300"}`} />
              </div>
              <div>
                <p className="text-gray-900" style={{ fontSize: "15px", fontWeight: 700 }}>{selectedStudent.name}</p>
                <p className="text-gray-400" style={{ fontSize: "12px" }}>
                  {selectedStudent.program} ·{" "}
                  <span className={
                    selectedStudent.status === "active" ? "text-emerald-600" :
                    selectedStudent.status === "on-hold" ? "text-amber-600" : "text-gray-400"
                  }>
                    {selectedStudent.status === "active" ? "Active" : selectedStudent.status === "on-hold" ? "On Hold" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedThread && selectedThread.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-4">
                    <span className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{selectedStudent.avatar}</span>
                  </div>
                  <p className="text-gray-900" style={{ fontSize: "16px", fontWeight: 700 }}>
                    This is the beginning of your conversation with {selectedStudent.name.split(" ")[0]}
                  </p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>
                    Send a message below to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-400 bg-white px-2 flex-shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>
                          {formatDateDivider(group.messages[0].timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Messages in group */}
                      <div className="space-y-0.5">
                        {group.messages.map((msg, idx) => {
                          const isCoach = msg.from === "coach";
                          const prevMsg = group.messages[idx - 1];
                          const isSameSender = prevMsg && prevMsg.from === msg.from;
                          const name = isCoach ? coachName : selectedStudent.name;
                          const initials = isCoach ? coachInitials : selectedStudent.avatar;
                          const avatarGradient = isCoach ? "from-indigo-500 to-indigo-600" : "from-indigo-400 to-purple-500";

                          return (
                            <div
                              key={msg.id}
                              className="flex items-start gap-3 group px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
                            >
                              {/* Avatar or spacer */}
                              <div className="w-9 flex-shrink-0 mt-0.5">
                                {!isSameSender ? (
                                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}>
                                    <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{initials}</span>
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Name + time */}
                                {!isSameSender && (
                                  <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-gray-900" style={{ fontSize: "14px", fontWeight: 700 }}>{name}</span>
                                    <span className="text-gray-400" style={{ fontSize: "12px" }}>{formatTime(msg.timestamp)}</span>
                                  </div>
                                )}

                                {/* Message text */}
                                <p className="text-gray-800 leading-relaxed" style={{ fontSize: "14px" }}>
                                  {msg.content}
                                </p>

                                {/* Hover timestamp for grouped messages */}
                                {isSameSender && (
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 absolute" style={{ fontSize: "11px", marginLeft: "-3rem", marginTop: "2px" }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedStudent.name.split(" ")[0]}`}
                  rows={1}
                  className="w-full px-4 pt-3 pb-1 bg-white text-gray-800 placeholder-gray-400 outline-none resize-none"
                  style={{ fontSize: "14px", lineHeight: "1.5", maxHeight: "120px" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>
                    <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Enter</kbd> to send ·{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Shift+Enter</kbd> for new line
                  </p>
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className={`p-1.5 rounded-md transition-all ${
                      inputValue.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-700" style={{ fontSize: "18px", fontWeight: 700 }}>Select a conversation</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "14px" }}>Pick someone from the left to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
