import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { StudentModal } from "./StudentModal";
import { Student, StudentStatus } from "../data/mockData";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Trash2,
  Edit,
  Users,
  MoreVertical,
} from "lucide-react";

const STATUS_STYLES: Record<StudentStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  "on-hold": "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  "on-hold": "On Hold",
};

const AVATAR_COLORS = [
  /* Keeping the color theme purple
  "from-indigo-400 to-purple-500",
  "from-blue-400 to-cyan-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",*/
  "from-violet-400 to-indigo-500",
];

export function Students() {
  const navigate = useNavigate();
  const { students, addStudent, updateStudent, deleteStudent } = useApp();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StudentStatus | "all">("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const programs = Array.from(new Set(students.map((s) => s.program)));

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesProgram = filterProgram === "all" || s.program === filterProgram;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const handleSave = (student: Student) => {
    if (editingStudent) {
      updateStudent(student);
    } else {
      addStudent(student);
    }
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  const getAvatarColor = (id: string) => {
    const index = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Students</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
            {students.length} total · {students.filter((s) => s.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => { setEditingStudent(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "14px" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Student</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            style={{ fontSize: "14px" }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StudentStatus | "all")}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all appearance-none cursor-pointer hidden sm:block"
            style={{ fontSize: "13px" }}
          >
            <option value="all">All Programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "13px" }}>
          Showing {filtered.length} of {students.length} students
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="1" width="16" height="2.5" rx="1.25" /><rect x="0" y="6.5" width="16" height="2.5" rx="1.25" />
              <rect x="0" y="12" width="16" height="2.5" rx="1.25" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7" rx="1.5" /><rect x="9" y="0" width="7" height="7" rx="1.5" />
              <rect x="0" y="9" width="7" height="7" rx="1.5" /><rect x="9" y="9" width="7" height="7" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative"
              onClick={() => navigate(`/students/${student.id}`)}
            >
              {/* Card menu */}
              <button
                className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === student.id ? null : student.id);
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen === student.id && (
                <div
                  className="absolute top-10 right-3 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    style={{ fontSize: "13px" }}
                    onClick={() => { setEditingStudent(student); setModalOpen(true); setMenuOpen(null); }}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors"
                    style={{ fontSize: "13px" }}
                    onClick={() => { setConfirmDelete(student.id); setMenuOpen(null); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}

              <div className="p-5">
                {/* Avatar & status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(student.id)} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{student.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-gray-900 truncate">{student.name}</h4>
                    <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>{student.program}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`inline-flex px-2 py-0.5 rounded-full ${STATUS_STYLES[student.status]}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                  {STATUS_LABELS[student.status]}
                </span>

                {/* Stats */}
                <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-400" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sessions</p>
                    <p className="text-gray-900" style={{ fontSize: "15px", fontWeight: 700 }}>{student.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-gray-400" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Goals</p>
                    <p className="text-gray-900" style={{ fontSize: "15px", fontWeight: 700 }}>
                      {student.goals.filter((g) => g.status === "completed").length}/{student.goals.length}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {student.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {student.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>
                        {tag}
                      </span>
                    ))}
                    {student.tags.length > 2 && (
                      <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>+{student.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                  Since {formatDate(student.joinDate)}
                </p>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider" style={{ fontSize: "11px", fontWeight: 600 }}>Student</th>
                <th className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider hidden md:table-cell" style={{ fontSize: "11px", fontWeight: 600 }}>Sessions</th>
                <th className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider hidden sm:table-cell" style={{ fontSize: "11px", fontWeight: 600 }}>Status</th>
                <th className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider hidden lg:table-cell" style={{ fontSize: "11px", fontWeight: 600 }}>Tags</th>
                <th className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider hidden lg:table-cell" style={{ fontSize: "11px", fontWeight: 600 }}>Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(student.id)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{student.avatar}</span>
                      </div>
                      <div>
                        <p className="text-gray-900" style={{ fontSize: "14px", fontWeight: 600 }}>{student.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "12px" }}>{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-gray-600" style={{ fontSize: "13px" }}>{student.totalSessions}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-flex px-2.5 py-1 rounded-full ${STATUS_STYLES[student.status]}`} style={{ fontSize: "12px", fontWeight: 600 }}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {/* Tags */}
                    {student.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>
                            {tag}
                          </span>
                        ))}
                        {student.tags.length > 2 && (
                          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full" style={{ fontSize: "10px" }}>+{student.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-gray-400" style={{ fontSize: "12px" }}>{formatDate(student.joinDate)}</span>
                  </td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(student.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontSize: "15px", fontWeight: 500 }}>No students found</p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <StudentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingStudent(null); }}
        onSave={handleSave}
        existing={editingStudent}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 text-center mb-2">Delete Student?</h3>
            <p className="text-gray-500 text-center mb-5" style={{ fontSize: "14px" }}>
              This will permanently remove the student and all their session history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                style={{ fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                style={{ fontSize: "14px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
