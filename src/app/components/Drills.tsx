import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp, Drill } from "../context/AppContext";
import {
  Plus,
  Search,
  Dumbbell,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  X,
  Youtube,
  Image,
  FileText,
} from "lucide-react";

const DIFFICULTY_STYLES: Record<Drill["difficulty"], string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

const CATEGORIES = [
  "Dribbling", "Passing", "Shooting", "Defense", "Fitness",
  "Goalkeeping", "Agility", "Tactics", "1v1", "Small Sided Games", "Other",
];

const ICON_COLORS = [
  "from-indigo-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-600",
  "from-purple-400 to-indigo-600",
];

export function Drills() {
  const navigate = useNavigate();
  const { drills, addDrill, updateDrill, deleteDrill } = useApp();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState<Drill["difficulty"] | "all">("all");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", category: CATEGORIES[0],
    difficulty: "beginner" as Drill["difficulty"], duration: 15,
    tags: "", youtubeUrl: "",
  });

  const filtered = drills.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchesCategory = filterCategory === "all" || d.category === filterCategory;
    const matchesDifficulty = filterDifficulty === "all" || d.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const openModal = (drill?: Drill) => {
    if (drill) {
      setEditingDrill(drill);
      setForm({ name: drill.name, description: drill.description, category: drill.category, difficulty: drill.difficulty, duration: drill.duration, tags: drill.tags.join(", "), youtubeUrl: drill.youtubeUrl ?? "" });
    } else {
      setEditingDrill(null);
      setForm({ name: "", description: "", category: CATEGORIES[0], difficulty: "beginner", duration: 15, tags: "", youtubeUrl: "" });
    }
    setModalOpen(true);
  };

  const saveDrill = async () => {
    if (!form.name.trim()) return;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (editingDrill) {
      await updateDrill({ ...editingDrill, ...form, tags, youtubeUrl: form.youtubeUrl || undefined });
    } else {
      const newDrill: Drill = {
        id: crypto.randomUUID(),
        name: form.name,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        duration: form.duration,
        tags,
        youtubeUrl: form.youtubeUrl || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      };
      await addDrill(newDrill);
    }
    setModalOpen(false);
  };

  const handleDeleteDrill = async (id: string) => {
    await deleteDrill(id);
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  const getIconColor = (id: string) => ICON_COLORS[id.charCodeAt(id.length - 1) % ICON_COLORS.length];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Drills</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
            {drills.length} drills in your catalog
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "14px" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Drill</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            style={{ fontSize: "14px" }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as any)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer hidden sm:block"
            style={{ fontSize: "13px" }}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-gray-500" style={{ fontSize: "13px" }}>
        Showing {filtered.length} of {drills.length} drills
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontSize: "15px", fontWeight: 500 }}>No drills found</p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Try adjusting your search or add a new drill</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((drill) => (
            <div
              key={drill.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative"
              onClick={() => navigate(`/drills/${drill.id}`)}
            >
              {/* Menu */}
              <button
                className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === drill.id ? null : drill.id); }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen === drill.id && (
                <div className="absolute top-10 right-3 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36" onClick={(e) => e.stopPropagation()}>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: "13px" }}
                    onClick={() => { openModal(drill); setMenuOpen(null); }}>
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors" style={{ fontSize: "13px" }}
                    onClick={() => { setConfirmDelete(drill.id); setMenuOpen(null); }} >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}

              <div className="p-5">
                {/* Icon & name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getIconColor(drill.id)} flex items-center justify-center flex-shrink-0`}>
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-gray-900 truncate" style={{ fontWeight: 700 }}>{drill.name}</h4>
                    <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>{drill.category} · {drill.duration} min</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 line-clamp-2 mb-3" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                  {drill.description}
                </p>

                {/* Difficulty */}
                <span className={`inline-flex px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[drill.difficulty]}`} style={{ fontSize: "11px", fontWeight: 600, textTransform: "capitalize" }}>
                  {drill.difficulty}
                </span>

                {/* Media indicators */}
                <div className="flex items-center gap-2 mt-3">
                  {drill.youtubeUrl && <Youtube className="w-3.5 h-3.5 text-red-400" />}
                </div>

                {/* Tags */}
                {drill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {drill.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>#{tag}</span>
                    ))}
                    {drill.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>+{drill.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-gray-400" style={{ fontSize: "11px" }}>Added {new Date(drill.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-900">{editingDrill ? "Edit Drill" : "Add Drill"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Drill Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Modified Rondos"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the drill, setup, and objectives..."
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
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
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
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={saveDrill} disabled={!form.name.trim()} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                {editingDrill ? "Save Changes" : "Add Drill"}
              </button>
            </div>
          </div>
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
            <h3 className="text-gray-900 text-center mb-2">Delete Drill?</h3>
            <p className="text-gray-500 text-center mb-5" style={{ fontSize: "14px" }}>
              This will permanently remove the drill from your catalog.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl" style={{ fontSize: "14px" }}>Cancel</button>
              <button onClick={() => handleDeleteDrill(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl" style={{ fontSize: "14px" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
