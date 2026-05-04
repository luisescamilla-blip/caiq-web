import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { Student, StudentStatus, PROGRAMS } from "../data/mockData";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  existing?: Student | null;
}

const STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "inactive", label: "Inactive" },
];

function generateId() {
  return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function StudentModal({ open, onClose, onSave, existing }: StudentModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    program: PROGRAMS[0],
    status: "active" as StudentStatus,
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        program: existing.program,
        status: existing.status,
        tags: existing.tags.join(", "),
      });
    } else {
      setForm({ name: "", email: "", phone: "", status: "active", program: PROGRAMS[0], tags: "" });
    }
    setErrors({});
  }, [existing, open]);

  if (!open) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (existing) {
      onSave({ ...existing, ...form, tags });
    } else {
      const newStudent: Student = {
        id: generateId(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        avatar: generateInitials(form.name),
        status: form.status,
        joinDate: new Date().toISOString().split("T")[0],
        program: form.program,
        totalSessions: 0,
        tags,
        goals: [],
        notes: [],
      };
      onSave(newStudent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-gray-900" style={{ fontSize: "16px" }}>
                {existing ? "Edit Player" : "Add New Player"}
              </h2>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>
                {existing ? "Update player information" : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jane Smith"
                className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 ${errors.name ? "border-red-300" : "border-gray-200"}`}
                style={{ fontSize: "14px" }}
              />
              {errors.name && <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
                className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 ${errors.email ? "border-red-300" : "border-gray-200"}`}
                style={{ fontSize: "14px" }}
              />
              {errors.email && <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                style={{ fontSize: "14px" }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Not needed }
          <div>
            <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Program</label>
            <select
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
              style={{ fontSize: "14px" }}
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          { Not needed */}
          
          <div>
            <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>
              Tags <span className="text-gray-400" style={{ fontWeight: 400 }}>(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. new, referred, high-priority"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              style={{ fontSize: "14px" }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              style={{ fontSize: "14px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
              style={{ fontSize: "14px" }}
            >
              {existing ? "Save Changes" : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
