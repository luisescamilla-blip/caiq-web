import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Dumbbell, Clock, Tag, Youtube, FileText, Target, Plus, Edit, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

const ICON_COLORS = [
  "from-indigo-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-600",
  "from-purple-400 to-indigo-600",
];

const CATEGORIES = [
  "Dribbling", "Passing", "Shooting", "Defense", "Fitness",
  "Goalkeeping", "Agility", "Tactics", "1v1", "Small Sided Games", "Other",
];

export function DrillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { drills, updateDrill, deleteDrill } = useApp();

  const drill = drills.find((d) => d.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: drill?.name ?? "",
    description: drill?.description ?? "",
    category: drill?.category ?? CATEGORIES[0],
    difficulty: (drill?.difficulty ?? "beginner") as "beginner" | "intermediate" | "advanced",
    duration: drill?.duration ?? 15,
    tags: drill?.tags.join(", ") ?? "",
    youtubeUrl: drill?.youtubeUrl ?? "",
  });

  if (!drill) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Drill not found.</p>
        <button onClick={() => navigate("/drills")} className="text-indigo-600 mt-2 hover:underline">
          Back to Drills
        </button>
      </div>
    );
  }

  const iconColor = ICON_COLORS[drill.id.charCodeAt(drill.id.length - 1) % ICON_COLORS.length];

  const openEdit = () => {
    setForm({
      name: drill.name,
      description: drill.description,
      category: drill.category,
      difficulty: drill.difficulty,
      duration: drill.duration,
      tags: drill.tags.join(", "),
      youtubeUrl: drill.youtubeUrl ?? "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!form.name.trim()) return;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    await updateDrill({ ...drill, ...form, tags, youtubeUrl: form.youtubeUrl || undefined });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteDrill(drill.id);
    navigate("/drills");
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/drills")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontSize: "14px" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Drills
        </button>
        <div className="flex gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
            style={{ fontSize: "13px" }}
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
            style={{ fontSize: "13px" }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-gray-900">{drill.name}</h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full ${DIFFICULTY_STYLES[drill.difficulty]}`}
                style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}
              >
                {drill.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "13px" }}>
                <Tag className="w-4 h-4" /> {drill.category}
              </span>
              <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "13px" }}>
                <Clock className="w-4 h-4" /> {drill.duration} min
              </span>
            </div>
            {drill.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {drill.tags.map((tag) => (
                  <span key={tag} className="bg-white/70 text-gray-500 px-2.5 py-0.5 rounded-full border border-indigo-100" style={{ fontSize: "11px" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="text-gray-900">Description</h3>
          </div>
          {drill.description ? (
            <p className="text-gray-700" style={{ fontSize: "14px", lineHeight: 1.7 }}>{drill.description}</p>
          ) : (
            <p className="text-gray-400 italic" style={{ fontSize: "14px" }}>No description added yet.</p>
          )}
        </div>

        {/* YouTube */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="w-5 h-5 text-red-500" />
            <h3 className="text-gray-900">Video Reference</h3>
          </div>
          {drill.youtubeUrl ? (
            <a
              href={drill.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline"
              style={{ fontSize: "14px" }}
            >
              <Youtube className="w-4 h-4 text-red-500" /> Watch on YouTube
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Youtube className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No video added yet</p>
              <button onClick={openEdit} className="mt-2 text-indigo-600 hover:underline" style={{ fontSize: "12px" }}>
                Add YouTube link →
              </button>
            </div>
          )}
        </div>

        {/* Added date */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-gray-900">Details</h3>
          </div>
          <p className="text-gray-500" style={{ fontSize: "13px" }}>
            Added on {new Date(drill.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-900">Edit Drill</h3>
              <button onClick={() => setEditOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Drill Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 resize-none transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                    style={{ fontSize: "13px" }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as "beginner" | "intermediate" | "advanced" })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                    style={{ fontSize: "13px" }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Tags <span className="text-gray-400">(comma separated)</span></label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. possession, group, warm-up"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>YouTube URL <span className="text-gray-400">(optional)</span></label>
                <input type="url" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={!form.name.trim()} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 text-center mb-2">Delete Drill?</h3>
            <p className="text-gray-500 text-center mb-5" style={{ fontSize: "14px" }}>
              This will permanently remove <strong>{drill.name}</strong> from your catalog.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl" style={{ fontSize: "14px" }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl" style={{ fontSize: "14px" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
