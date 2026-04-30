import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { Student, Session, Goal, Note } from "../data/mockData";
import { Send, Sparkles, Loader2, CheckCircle2, Mic, MicOff } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  action?: { type: string; summary: string };
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SUGGESTED_PROMPTS = [
  "Summarize my upcoming sessions this week",
  "Which students need the most attention?",
  "Who has the most sessions this month?",
  "What goals are behind schedule?",
];

function generateId() {
  return crypto.randomUUID();
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Tool definitions for Groq function calling
const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_student",
      description: "Create a new student/athlete for the coach",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the student" },
          email: { type: "string", description: "Email address (optional)" },
          phone: { type: "string", description: "Phone number (optional)" },
          program: { type: "string", description: "Program or sport only if explicitly mentioned by the coach. Leave empty if not specified." },
          status: { type: "string", enum: ["active", "inactive", "on-hold"], description: "Student status, default active" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_session",
      description: "Schedule a new session for a student",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the student (will be matched)" },
          topic: { type: "string", description: "Topic or focus of the session" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
          time: { type: "string", description: "Time in HH:MM format, e.g. 10:00" },
          duration: { type: "number", description: "Duration in minutes, default 60" },
          status: { type: "string", enum: ["upcoming", "completed", "cancelled"], description: "Session status" },
        },
        required: ["student_name", "topic", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_note",
      description: "Add a note for a student",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the student" },
          content: { type: "string", description: "Note content" },
        },
        required: ["student_name", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_goal",
      description: "Add a goal for a student",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the student" },
          title: { type: "string", description: "Goal title/description" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format (optional)" },
          progress: { type: "number", description: "Initial progress 0-100, default 0" },
        },
        required: ["student_name", "title"],
      },
    },
  },
];

export function CaiChat() {
  const { user } = useAuth();
  const { students, sessions, addStudent, addSession, addNote, addGoal } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hey Coach${user?.name ? " " + user.name.split(" ")[0] : ""}! ⚡ I'm Cai. I can answer questions about your students and sessions, and I can also take actions — like adding a student, scheduling a session, or logging a note. What do you need?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after voice input
      setTimeout(() => {
        sendMessage(transcript);
      }, 300);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const buildSystemPrompt = () => {
    const activeStudents = students.filter((s) => s.status === "active");
    const upcomingSessions = sessions.filter((s) => s.status === "upcoming").slice(0, 10);

    const studentSummary = activeStudents.map((s) => {
      const avgProgress = s.goals.length > 0
        ? Math.round(s.goals.reduce((a, g) => a + g.progress, 0) / s.goals.length) : 0;
      return `- ${s.name} (ID: ${s.id}, Program: ${s.program}, Sessions: ${s.totalSessions}, Goal progress: ${avgProgress}%)`;
    }).join("\n");

    const sessionSummary = upcomingSessions.map((s) => {
      const student = students.find((st) => st.id === s.studentId);
      return `- ${s.date} ${s.time}: ${student?.name ?? "Unknown"} — ${s.topic} (${s.duration}min)`;
    }).join("\n");

    return `You are Cai, an AI assistant for Coach ${user?.name ?? ""}. You help coaches manage students, sessions, goals, and notes.

Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

ACTIVE STUDENTS (${activeStudents.length}):
${studentSummary || "No active students yet."}

UPCOMING SESSIONS (${upcomingSessions.length}):
${sessionSummary || "No upcoming sessions."}

You can both answer questions AND take real actions using the available tools. When a coach asks you to create/add/schedule something, use the appropriate tool to do it — don't just describe what you would do. Be concise and confirm what you did. Never mention UUIDs or internal IDs in your responses.`;
  };

  // Execute a tool call
  const executeTool = async (name: string, args: any): Promise<{ summary: string; type: string }> => {
    if (name === "create_student") {
      const initials = args.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
      const newStudent: Student = {
        id: generateId(),
        name: args.name,
        email: "",
        phone: "",
        avatar: initials,
        status: "active",
        program: "",
        joinDate: new Date().toISOString().split("T")[0],
        totalSessions: 0,
        tags: [],
        goals: [],
        notes: [],
      };
      await addStudent(newStudent);
      return { type: "create_student", summary: `✅ Added student: **${args.name}**` };
    }

    if (name === "create_session") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "create_session", summary: `❌ Could not find student matching "${args.student_name}"` };

      const newSession: Session = {
        id: generateId(),
        studentId: student.id,
        topic: args.topic,
        date: args.date,
        time: args.time ?? "10:00",
        duration: args.duration ?? 60,
        status: args.status ?? "upcoming",
      };
      await addSession(newSession);
      return { type: "create_session", summary: `✅ Scheduled session for **${student.name}**: ${args.topic} on ${args.date}` };
    }

    if (name === "add_note") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "add_note", summary: `❌ Could not find student matching "${args.student_name}"` };

      const note: Note = {
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        content: args.content,
      };
      await addNote(student.id, note);
      return { type: "add_note", summary: `✅ Note added for **${student.name}**` };
    }

    if (name === "add_goal") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "add_goal", summary: `❌ Could not find student matching "${args.student_name}"` };

      const goal: Goal = {
        id: generateId(),
        title: args.title,
        status: "not-started",
        progress: args.progress ?? 0,
        dueDate: args.due_date ?? "",
      };
      await addGoal(student.id, goal);
      return { type: "add_goal", summary: `✅ Goal added for **${student.name}**: ${args.title}` };
    }

    return { type: "unknown", summary: "❌ Unknown action" };
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
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`Groq error: ${response.status}`);
      const data = await response.json();
      const choice = data.choices?.[0];

      // Handle tool calls
      if (choice?.message?.tool_calls?.length > 0) {
        const toolCall = choice.message.tool_calls[0];
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        const result = await executeTool(toolName, toolArgs);

        // Get a natural language follow-up from Groq
        const followUp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: buildSystemPrompt() },
              ...updatedMessages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content })),
              { role: "assistant", content: null, tool_calls: choice.message.tool_calls },
              { role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) },
            ],
            max_tokens: 256,
            temperature: 0.7,
          }),
        });

        const followUpData = await followUp.json();
        const reply = followUpData.choices?.[0]?.message?.content ?? result.summary;

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date().toISOString(),
            action: result,
          },
        ]);
      } else {
        // Regular text response
        const reply = choice?.message?.content ?? "Sorry, I couldn't get a response.";
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
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

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

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
                  {/* Action badge */}
                  {msg.action && (
                    <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-700" style={{ fontSize: "11px", fontWeight: 600 }}>
                        Action completed
                      </span>
                    </div>
                  )}
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
              placeholder="Ask Cai anything, or say 'Add student John Smith'..."
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
                <span className="text-indigo-400" style={{ fontSize: "12px", fontWeight: 500 }}>Cai</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  disabled={loading}
                  className={`p-1.5 rounded-lg transition-all ${
                    listening
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  title={listening ? "Stop listening" : "Speak to Cai"}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
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
