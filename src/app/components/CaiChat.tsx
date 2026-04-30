import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SUGGESTED_PROMPTS = [
  "Summarize my upcoming sessions this week",
  "Which students need the most attention right now?",
  "Help me write a session note for a student",
  "What goals are behind schedule?",
];

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CaiChat() {
  const { user } = useAuth();
  const { students, sessions } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hey Coach${user?.name ? " " + user.name.split(" ")[0] : ""}! ⚡ I'm Cai, your AI assistant. I know your students, sessions, and goals. What do you need?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build system prompt with live coach context
  const buildSystemPrompt = () => {
    const activeStudents = students.filter((s) => s.status === "active");
    const upcomingSessions = sessions
      .filter((s) => s.status === "upcoming")
      .slice(0, 10);

    const studentSummary = activeStudents.map((s) => {
      const goalsInProgress = s.goals.filter((g) => g.status === "in-progress");
      const avgProgress = s.goals.length > 0
        ? Math.round(s.goals.reduce((a, g) => a + g.progress, 0) / s.goals.length)
        : 0;
      return `- ${s.name} (${s.program}): ${s.totalSessions} sessions, ${avgProgress}% avg goal progress${goalsInProgress.length > 0 ? `, working on: ${goalsInProgress.map((g) => g.title).join(", ")}` : ""}`;
    }).join("\n");

    const sessionSummary = upcomingSessions.map((s) => {
      const student = students.find((st) => st.id === s.studentId);
      return `- ${s.date} ${s.time}: ${student?.name ?? "Unknown"} — ${s.topic} (${s.duration}min)`;
    }).join("\n");

    return `You are Cai, an AI assistant for Coach ${user?.name ?? ""}. You help coaches manage their students, sessions, goals, and drills.

Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

ACTIVE STUDENTS (${activeStudents.length}):
${studentSummary || "No active students yet."}

UPCOMING SESSIONS (${upcomingSessions.length}):
${sessionSummary || "No upcoming sessions."}

Be concise, helpful, and direct. Use the coach's real data above to answer questions. If asked to write notes or summaries, keep them professional and practical.`;
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...updatedMessages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`Groq error: ${response.status}`);

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't get a response.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const coachInitials =
    user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "C";

  return (
    <div className="flex flex-col overflow-hidden bg-gray-50" style={{ height: "calc(100vh - 65px)" }}>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                  style={{ fontSize: "13px" }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{coachInitials}</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-xl group flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                    }`}
                    style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                  </div>
                  <span className="mt-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: "11px" }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-8 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all bg-white shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cai anything about your students, sessions, goals..."
              rows={1}
              disabled={loading}
              className="w-full px-4 pt-3 pb-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none resize-none disabled:opacity-50"
              style={{ fontSize: "14px", lineHeight: "1.5", maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
            />
            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-400" style={{ fontSize: "12px", fontWeight: 500 }}>Cai · powered by Groq</span>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`p-1.5 rounded-lg transition-all ${
                  input.trim() && !loading
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-2" style={{ fontSize: "11px" }}>
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Enter</kbd> to send ·{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500" style={{ fontSize: "10px" }}>Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
