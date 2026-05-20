import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp, Conversation, ConversationMessage } from "../context/AppContext";
import { useSearchParams, useNavigate } from "react-router";
import { Student, Session, Goal, Note } from "../data/mockData";
import { Send, Sparkles, Loader2, CheckCircle2, Mic, MicOff, Plus, Paperclip, X, Video } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Message = ConversationMessage;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SUGGESTED_PROMPTS = [
  "Summarize my upcoming sessions this week",
  "Which players need the most attention?",
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
      description: "Create a new player/athlete for the coach",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the player" },
          email: { type: "string", description: "Email address (optional)" },
          phone: { type: "string", description: "Phone number (optional)" },
          program: { type: "string", description: "Program or sport only if explicitly mentioned by the coach. Leave empty if not specified." },
          status: { type: "string", enum: ["active", "inactive", "on-hold"], description: "Player status, default active" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_session",
      description: "Schedule a new session for a player",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player (will be matched)" },
          topic: { type: "string", description: "Topic or focus of the session (defaults to 'Training Session' if not specified)" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
          time: { type: "string", description: "Time in HH:MM format, e.g. 10:00" },
          duration: { type: "number", description: "Duration in minutes, default 60" },
          status: { type: "string", enum: ["upcoming", "completed", "cancelled"], description: "Session status" },
        },
        required: ["student_name", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_note",
      description: "Add a note for a player",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player" },
          content: { type: "string", description: "Note content" },
        },
        required: ["student_name", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_tag",
      description: "Add a hashtag/tag to a player",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player" },
          tag: { type: "string", description: "Tag to add (no # symbol, e.g. 'beginner' or 'high-priority')" },
        },
        required: ["student_name", "tag"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_goal",
      description: "Add a goal for a player",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player" },
          title: { type: "string", description: "Goal title/description" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format (optional)" },
          progress: { type: "number", description: "Initial progress 0-100, default 0" },
        },
        required: ["student_name", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_goal",
      description: "Update a player's goal — change progress, status, or title",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player" },
          goal_title: { type: "string", description: "Partial or full title of the goal to update" },
          progress: { type: "number", description: "New progress value 0-100 (optional)" },
          status: { type: "string", enum: ["not-started", "in-progress", "completed"], description: "New status (optional)" },
        },
        required: ["student_name", "goal_title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_session",
      description: "Cancel an upcoming session for a player",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player" },
          date: { type: "string", description: "Date of the session to cancel in YYYY-MM-DD format (optional, cancels next upcoming if omitted)" },
        },
        required: ["student_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_student",
      description: "Delete a player permanently",
      parameters: {
        type: "object",
        properties: {
          student_name: { type: "string", description: "Name of the player to delete" },
        },
        required: ["student_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "attach_media_to_drill",
      description: "Attach an uploaded image or video to a drill. Use this when the coach shares media and wants it linked to a drill.",
      parameters: {
        type: "object",
        properties: {
          drill_name: { type: "string", description: "Partial or full name of the drill" },
          media_url: { type: "string", description: "The URL of the uploaded media file" },
          media_type: { type: "string", enum: ["photo", "video"], description: "Type of media" },
          caption: { type: "string", description: "Optional caption or description of the media" },
        },
        required: ["drill_name", "media_url", "media_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_player_avatar",
      description: "Update a player's profile photo / avatar. Use this when the coach says 'change avatar', 'update profile photo', 'set photo', or similar for a player. Do NOT use attach_media_to_player for this.",
      parameters: {
        type: "object",
        properties: {
          player_name: { type: "string", description: "Partial or full name of the player" },
          photo_url: { type: "string", description: "The URL of the uploaded photo" },
        },
        required: ["player_name", "photo_url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "attach_media_to_player",
      description: "Attach an uploaded image or video to a player's Notes section. Use this when the coach shares media and wants it linked to a player for reference (NOT for profile/avatar photos — use update_player_avatar for that).",
      parameters: {
        type: "object",
        properties: {
          player_name: { type: "string", description: "Partial or full name of the player" },
          media_url: { type: "string", description: "The URL of the uploaded media file" },
          media_type: { type: "string", enum: ["photo", "video"], description: "Type of media" },
          caption: { type: "string", description: "Optional caption or description" },
        },
        required: ["player_name", "media_url", "media_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "attach_media_to_session",
      description: "Attach an uploaded image or video to a session. Use this when the coach shares media and mentions a session or date. The media will appear in the session's Photos & Videos section.",
      parameters: {
        type: "object",
        properties: {
          player_name: { type: "string", description: "Name of the player the session belongs to (optional)" },
          session_date: { type: "string", description: "Date of the session in YYYY-MM-DD format (optional)" },
          media_url: { type: "string", description: "The URL of the uploaded media file" },
          media_type: { type: "string", enum: ["photo", "video"], description: "Type of media" },
          caption: { type: "string", description: "Optional caption" },
        },
        required: ["media_url", "media_type"],
      },
    },
  },
];

export function CaiChat() {
  const { user } = useAuth();
  const { students, sessions, drills, conversations, addStudent, updateStudent, addSession, updateSession, addNote, addGoal, updateGoal, deleteStudent, addMediaToDrill, addMediaToStudent, addMediaToSession, setStudentAvatarUrl, saveConversation } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const convIdParam = searchParams.get("conv");

  const welcomeMsg: Message = {
    id: "welcome",
    role: "assistant",
    content: `Hey Coach${user?.name ? " " + user.name.split(" ")[0] : ""}! ⚡ I'm Cai. I can answer questions about your players and sessions, and I can also take actions — like adding a player, scheduling a session, or logging a note. What do you need?`,
    timestamp: new Date().toISOString(),
  };

  const [convId, setConvId] = useState<string>(() => convIdParam ?? crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([welcomeMsg]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; localUrl: string; type: 'image' | 'video' }[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing conversation if conv param provided
  useEffect(() => {
    if (convIdParam) {
      const existing = conversations.find((c) => c.id === convIdParam);
      if (existing && existing.messages.length > 0) {
        setConvId(existing.id);
        setMessages(existing.messages);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convIdParam]);

  const startNewConversation = () => {
    const newId = crypto.randomUUID();
    setConvId(newId);
    setMessages([welcomeMsg]);
    navigate("/kai");
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
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
    const allStudents = students;
    const activeStudents = students.filter((s) => s.status === "active");
    const onHoldStudents = students.filter((s) => s.status === "on-hold");
    const inactiveStudents = students.filter((s) => s.status === "inactive");

    const upcomingSessions = sessions
      .filter((s) => s.status === "upcoming")
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

    const recentCompleted = sessions
      .filter((s) => s.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    const buildStudentBlock = (s: typeof students[0]) => {
      const avgProgress = s.goals.length > 0
        ? Math.round(s.goals.reduce((a, g) => a + g.progress, 0) / s.goals.length) : 0;
      const goalsText = s.goals.length > 0
        ? s.goals.map((g) => `    • [${g.status}] ${g.title} — ${g.progress}% ${g.dueDate ? `(due ${g.dueDate})` : ""}`).join("\n")
        : "    (no goals)";
      const notesText = s.notes.length > 0
        ? s.notes.slice(0, 3).map((n) => `    • [${n.date}] ${n.content}`).join("\n")
        : "    (no notes)";
      const nextSess = sessions
        .filter((sess) => sess.studentId === s.id && sess.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      return [
        `- ${s.name} | Program: ${s.program || "(none)"} | Sessions: ${s.totalSessions} | Avg goal progress: ${avgProgress}%${nextSess ? ` | Next session: ${nextSess.date} ${nextSess.time} (${nextSess.topic})` : ""}`,
        `  Goals:\n${goalsText}`,
        `  Recent notes:\n${notesText}`,
      ].join("\n");
    };

    const sessionSummary = (list: typeof sessions) =>
      list.map((s) => {
        const student = students.find((st) => st.id === s.studentId);
        return `- ${s.date} ${s.time}: ${student?.name ?? "Unknown"} — ${s.topic} (${s.duration}min)${s.notes ? ` | Notes: ${s.notes}` : ""}`;
      }).join("\n");

    const drillsText = drills.length > 0
      ? drills.map(d => `- ${d.name} (${d.category}, ${d.difficulty}) — ${d.description || 'no description'}${d.mediaUrls?.length ? ` | ${d.mediaUrls.length} media file(s)` : ''}`).join('\n')
      : 'No drills yet.';

    const basePrompt = `You are Cai, an AI assistant for Coach ${user?.name ?? ""}. You help coaches manage players, sessions, goals, notes, and drills.

Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

== ACTIVE PLAYERS (${activeStudents.length}) ==
${activeStudents.length > 0 ? activeStudents.map(buildStudentBlock).join("\n\n") : "No active players yet."}

${onHoldStudents.length > 0 ? `== ON-HOLD PLAYERS (${onHoldStudents.length}) ==\n${onHoldStudents.map(buildStudentBlock).join("\n\n")}\n\n` : ""}${inactiveStudents.length > 0 ? `== INACTIVE / ALUMNI (${inactiveStudents.length}) ==\n${inactiveStudents.map(buildStudentBlock).join("\n\n")}\n\n` : ""}== UPCOMING SESSIONS (${upcomingSessions.length}) ==
${upcomingSessions.length > 0 ? sessionSummary(upcomingSessions) : "No upcoming sessions."}

== RECENTLY COMPLETED SESSIONS (last ${recentCompleted.length}) ==
${recentCompleted.length > 0 ? sessionSummary(recentCompleted) : "No completed sessions yet."}

== DRILLS (${drills.length}) ==
${drillsText}

You can both answer questions AND take real actions using the available tools. When a coach asks you to create/add/schedule something, use the appropriate tool to do it — don't just describe what you would do. Be concise and confirm what you did. Never mention UUIDs or internal IDs in your responses.`;
    return basePrompt;
  };

  const buildSystemPromptWithMedia = (freshMedia: { url: string; type: 'image' | 'video' }[]) => {
    const base = buildSystemPrompt();
    if (freshMedia.length === 0) return base;
    return base + `

== JUST UPLOADED MEDIA ==
The coach just uploaded these files. You MUST call a tool to route them. Rules (in priority order):
1. If the message contains words like 'avatar', 'profile photo', 'profile pic', 'change photo', 'update photo', 'set photo' → call update_player_avatar. Do NOT call attach_media_to_player.
2. If the coach mentions a session or date → call attach_media_to_session
3. If the coach mentions a drill → call attach_media_to_drill
4. If the coach mentions a player (no avatar intent) → call attach_media_to_player
5. If no context → ask where to attach it
URLs:
${freshMedia.map(u => `- ${u.url} (${u.type})`).join('\n')}`;
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
      return { type: "create_student", summary: `✅ Added player: **${args.name}**` };
    }

    if (name === "create_session") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "create_session", summary: `❌ Could not find student matching "${args.student_name}"` };

      const newSession: Session = {
        id: generateId(),
        studentId: student.id,
        topic: args.topic ?? "Training Session",
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

    if (name === "add_tag") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "add_tag", summary: `❌ Could not find student matching "${args.student_name}"` };
      const updatedTags = [...new Set([...student.tags, args.tag])];
      await updateStudent({ ...student, tags: updatedTags });
      return { type: "add_tag", summary: `✅ Added tag **#${args.tag}** to **${student.name}**` };
    }

    if (name === "update_goal") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "update_goal", summary: `❌ Could not find student matching "${args.student_name}"` };

      const goal = student.goals.find((g) =>
        g.title.toLowerCase().includes(args.goal_title.toLowerCase())
      );
      if (!goal) return { type: "update_goal", summary: `❌ Could not find a goal matching "${args.goal_title}" for ${student.name}` };

      const updatedGoal = {
        ...goal,
        ...(args.progress !== undefined ? { progress: args.progress } : {}),
        ...(args.status ? { status: args.status } : {}),
        // auto-set progress to 100 if marked completed
        ...(args.status === "completed" && args.progress === undefined ? { progress: 100 } : {}),
      };
      await updateGoal(student.id, updatedGoal);
      return { type: "update_goal", summary: `✅ Updated goal for **${student.name}**: "${goal.title}" → ${updatedGoal.status} (${updatedGoal.progress}%)` };
    }

    if (name === "cancel_session") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "cancel_session", summary: `❌ Could not find student matching "${args.student_name}"` };

      const upcoming = sessions
        .filter((s) => s.studentId === student.id && s.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const target = args.date
        ? upcoming.find((s) => s.date === args.date)
        : upcoming[0];

      if (!target) return { type: "cancel_session", summary: `❌ No upcoming session found for ${student.name}${args.date ? ` on ${args.date}` : ""}` };

      await updateSession({ ...target, status: "cancelled" });
      return { type: "cancel_session", summary: `✅ Cancelled session for **${student.name}**: ${target.topic} on ${target.date}` };
    }

    if (name === "delete_student") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.student_name.toLowerCase())
      );
      if (!student) return { type: "delete_student", summary: `❌ Could not find student matching "${args.student_name}"` };
      await deleteStudent(student.id);
      return { type: "delete_student", summary: `✅ Deleted student: **${student.name}**` };
    }

    if (name === "attach_media_to_drill") {
      const drill = drills.find((d) =>
        d.name.toLowerCase().includes(args.drill_name.toLowerCase())
      );
      if (!drill) return { type: "attach_media_to_drill", summary: `❌ Could not find drill matching "${args.drill_name}"` };
      await addMediaToDrill(drill.id, args.media_url, args.media_type, args.caption);
      return { type: "attach_media_to_drill", summary: `✅ Media attached to drill: **${drill.name}**` };
    }

    if (name === "update_player_avatar") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.player_name.toLowerCase())
      );
      if (!student) return { type: "update_player_avatar", summary: `❌ Could not find player matching "${args.player_name}"` };
      await setStudentAvatarUrl(student.id, args.photo_url);
      return { type: "update_player_avatar", summary: `✅ Profile photo updated for **${student.name}**` };
    }

    if (name === "attach_media_to_player") {
      const student = students.find((s) =>
        s.name.toLowerCase().includes(args.player_name.toLowerCase())
      );
      if (!student) return { type: "attach_media_to_player", summary: `❌ Could not find player matching "${args.player_name}"` };
      await addMediaToStudent(student.id, args.media_url, args.media_type, args.caption);
      return { type: "attach_media_to_player", summary: `✅ Media added to **${student.name}**'s notes` };
    }

    if (name === "attach_media_to_session") {
      let session: typeof sessions[0] | undefined;
      if (args.player_name) {
        const student = students.find((s) =>
          s.name.toLowerCase().includes(args.player_name.toLowerCase())
        );
        if (student) {
          const studentSessions = sessions.filter((s) => s.studentId === student.id);
          session = args.session_date
            ? studentSessions.find((s) => s.date === args.session_date)
            : studentSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        }
      } else if (args.session_date) {
        session = sessions.find((s) => s.date === args.session_date);
      }
      if (!session) return { type: "attach_media_to_session", summary: `❌ Could not find matching session` };
      await addMediaToSession(session.id, args.media_url, args.media_type, args.caption);
      return { type: "attach_media_to_session", summary: `✅ Media added to session on ${session.date}` };
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

  // Debounced save — fires 2s after last message
  const scheduleSave = useCallback((msgs: Message[], title?: string, tags?: string[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const realMsgs = msgs.filter((m) => m.id !== "welcome");
      if (realMsgs.length === 0) return;
      const conv: Conversation = {
        id: convId,
        title: title ?? "Conversation",
        tags: tags ?? [],
        messages: msgs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try { await saveConversation(conv); } catch (e) { console.error("Auto-save failed", e); }
    }, 2000);
  }, [convId, saveConversation]);

  // Generate title + tags from conversation using Groq (fire-and-forget)
  const generateMeta = async (msgs: Message[]) => {
    const realMsgs = msgs.filter((m) => m.id !== "welcome").slice(0, 6);
    if (realMsgs.length < 2) return;
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are a tagging assistant. Given a conversation, reply with a JSON object: { \"title\": \"short title (max 6 words)\", \"tags\": [\"tag1\", \"tag2\"] } — tags are lowercase single words or short phrases relevant to the conversation (player names, drills, topics). No explanation, just JSON." },
            { role: "user", content: realMsgs.map((m) => `${m.role}: ${m.content}`).join("\n") },
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      return { title: parsed.title ?? "Conversation", tags: parsed.tags ?? [] };
    } catch { return undefined; }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map(file => ({
      file,
      localUrl: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
    }));
    setAttachments(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      URL.revokeObjectURL(prev[index].localUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAttachments = async (files: typeof attachments) => {
    const uploaded: { url: string; type: 'image' | 'video'; name: string }[] = [];

    // Get the current session JWT so storage uses authenticated role
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    console.log('[upload] session token present:', !!accessToken);

    for (const item of files) {
      try {
        const ext = (item.file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const safeId = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
        const path = `${safeId}.${ext}`;
        console.log('[upload] attempting:', path, item.file.type, item.file.size);

        // Use fetch directly with the user's JWT to ensure authenticated upload
        const formData = new FormData();
        formData.append('', item.file);
        const res = await fetch(
          `https://grnkodxkxzvtuarrocvl.supabase.co/storage/v1/object/caiq-media/${path}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'x-upsert': 'false',
            },
            body: item.file,
          }
        );
        const result = await res.json();
        console.log('[upload] response:', res.status, JSON.stringify(result));

        if (!res.ok) throw new Error(result.message || 'Upload failed');

        const publicUrl = `https://grnkodxkxzvtuarrocvl.supabase.co/storage/v1/object/public/caiq-media/${path}`;
        console.log('[upload] public url:', publicUrl);
        uploaded.push({ url: publicUrl, type: item.type, name: item.file.name });
      } catch (err) {
        console.error('[upload] caught:', err);
      }
    }
    return uploaded;
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content && attachments.length === 0) return;
    if (loading) return;

    setUploading(true);
    let freshUploadedUrls: { url: string; type: 'image' | 'video'; name: string }[] = [];
    if (attachments.length > 0) {
      freshUploadedUrls = await uploadAttachments(attachments);
      attachments.forEach(a => URL.revokeObjectURL(a.localUrl));
      setAttachments([]);
      setUploadedUrls(freshUploadedUrls.map(u => ({ url: u.url, type: u.type })));
    }
    setUploading(false);

    const mediaNote = freshUploadedUrls.length > 0
      ? `\n[Coach attached ${freshUploadedUrls.length} file(s): ${freshUploadedUrls.map(u => u.name).join(', ')}]`
      : '';

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content + mediaNote,
      timestamp: new Date().toISOString(),
      mediaUrls: freshUploadedUrls.length > 0 ? freshUploadedUrls.map(u => ({ url: u.url, type: u.type })) : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Client-side intercept: avatar/profile photo intent + image uploaded → force update_player_avatar
      if (freshUploadedUrls.length > 0 && freshUploadedUrls[0].type === 'image') {
        const lowerContent = content.toLowerCase();
        const avatarKeywords = /avatar|profile|photo|pic\b|picture|headshot|change.*image|update.*image|set.*image/i;
        if (avatarKeywords.test(lowerContent)) {
          console.log('[avatar-intercept] triggered, content:', lowerContent);
          // Find mentioned student — first name OR full name match
          const mentionedStudent = students.find((s) => {
            const nameParts = s.name.toLowerCase().split(' ');
            return nameParts.some((part) => part.length > 2 && lowerContent.includes(part));
          });
          console.log('[avatar-intercept] matched student:', mentionedStudent?.name ?? 'none');
          if (mentionedStudent) {
            const result = await executeTool('update_player_avatar', {
              player_name: mentionedStudent.name,
              photo_url: freshUploadedUrls[0].url,
            });
            const aiMsg: Message = {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: result.summary,
              timestamp: new Date().toISOString(),
            };
            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);
            scheduleSave(finalMessages);
            setLoading(false);
            return;
          }
        }
      }

      // Always use standard model for tool calling — vision model doesn't reliably call tools
      const historyMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: buildSystemPromptWithMedia(freshUploadedUrls.map(u => ({ url: u.url, type: u.type }))) },
            ...historyMessages,
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
              { role: "system", content: buildSystemPromptWithMedia(freshUploadedUrls.map(u => ({ url: u.url, type: u.type }))) },
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

        setMessages((prev) => {
          const next = [
            ...prev,
            { id: `a-${Date.now()}`, role: "assistant" as const, content: reply, timestamp: new Date().toISOString(), action: result },
          ];
          generateMeta(next).then((meta) => scheduleSave(next, meta?.title, meta?.tags));
          return next;
        });
      } else {
        const reply = choice?.message?.content ?? "Sorry, I couldn't get a response.";
        setMessages((prev) => {
          const next = [
            ...prev,
            { id: `a-${Date.now()}`, role: "assistant" as const, content: reply, timestamp: new Date().toISOString() },
          ];
          generateMeta(next).then((meta) => scheduleSave(next, meta?.title, meta?.tags));
          return next;
        });
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
      setUploadedUrls([]);
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

      {/* Cai Header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-gray-900" style={{ fontSize: "14px", fontWeight: 600 }}>Cai</span>
          {convIdParam && <span className="text-gray-400" style={{ fontSize: "12px" }}>· resumed conversation</span>}
        </div>
        <button
          onClick={startNewConversation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
          style={{ fontSize: "13px" }}
        >
          <Plus className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

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
                  {/* Media attachments */}
                  {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.mediaUrls.map((m, i) =>
                        m.type === 'image' ? (
                          <img key={i} src={m.url} alt="attachment" className="rounded-xl max-w-xs max-h-48 object-cover border border-indigo-300" />
                        ) : (
                          <video key={i} src={m.url} controls className="rounded-xl max-w-xs max-h-48 border border-indigo-300" />
                        )
                      )}
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
                    {msg.content.replace(/\n?\[Coach attached \d+ file\(s\):.*?\]$/, '').trim()}
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {attachments.map((item, i) => (
                <div key={i} className="relative flex-shrink-0">
                  {item.type === 'image' ? (
                    <img src={item.localUrl} alt={item.file.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-100 flex flex-col items-center justify-center gap-1">
                      <Video className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400 text-center px-1" style={{ fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-none cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {listening && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600" style={{ fontSize: "13px", fontWeight: 500 }}>Listening... speak now</span>
            </div>
          )}
          <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all bg-white shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cai anything, or say 'Add player John Smith'..."
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
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className={`p-1.5 rounded-lg transition-all ${attachments.length > 0 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  title="Attach image or video"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
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
                  disabled={(!input.trim() && attachments.length === 0) || loading || uploading}
                  className={`p-1.5 rounded-lg transition-all ${
                    (input.trim() || attachments.length > 0) && !loading && !uploading
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
