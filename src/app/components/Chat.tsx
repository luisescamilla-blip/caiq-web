import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Hash,
  Clock,
} from "lucide-react";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getPreview(messages: any[]) {
  const real = messages.filter((m) => m.id !== "welcome");
  const last = real[real.length - 1];
  if (!last) return "No messages yet";
  const prefix = last.role === "user" ? "You: " : "Cai: ";
  return prefix + last.content.slice(0, 100) + (last.content.length > 100 ? "…" : "");
}

export function Chat() {
  const navigate = useNavigate();
  const { conversations, deleteConversation } = useApp();

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // All unique tags across conversations
  const allTags = Array.from(
    new Set(conversations.flatMap((c) => c.tags))
  ).sort();

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.messages.some((m) => m.content?.toLowerCase().includes(q));
    const matchesTag = !activeTag || c.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Conversations</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
            Your Cai chat history — {conversations.length} thread{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/kai")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "14px" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
          style={{ fontSize: "14px" }}
        />
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors ${
              !activeTag
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <Hash className="w-3 h-3" />{tag}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>No conversations yet</h3>
          <p className="text-gray-400 mt-1 max-w-xs" style={{ fontSize: "13px" }}>
            Start chatting with Cai — your conversations will be saved here automatically.
          </p>
          <button
            onClick={() => navigate("/kai")}
            className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors"
            style={{ fontSize: "14px" }}
          >
            <Sparkles className="w-4 h-4" /> Chat with Cai
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400" style={{ fontSize: "14px" }}>No conversations match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/kai?conv=${conv.id}`)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-gray-900 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {conv.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Clock className="w-3 h-3" />
                        {formatDate(conv.updatedAt)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(conv.id); }}
                        className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <p className="text-gray-500 truncate mb-2" style={{ fontSize: "12px" }}>
                    {getPreview(conv.messages)}
                  </p>

                  {/* Tags */}
                  {conv.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {conv.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-0.5 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
                          style={{ fontSize: "11px", fontWeight: 500 }}
                          onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                        >
                          <Hash className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message count */}
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                <MessageSquare className="w-3 h-3" />
                {conv.messages.filter((m) => m.id !== "welcome").length} messages
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 text-center mb-2">Delete Conversation?</h3>
            <p className="text-gray-500 text-center mb-5" style={{ fontSize: "14px" }}>
              This conversation will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl"
                style={{ fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => { await deleteConversation(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl"
                style={{ fontSize: "14px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
