import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Dumbbell, Clock, Tag, Youtube, FileText, Target, Image, MessageCircle, Plus } from "lucide-react";

// Temporary — matches mock data in Drills.tsx
const MOCK_DRILLS = [
  { id: "d1", name: "Modified Rondos", description: "Possession-based drill in a circle. Focus on quick passing and movement off the ball.", category: "Passing", tags: ["possession", "group"], difficulty: "intermediate", duration: 20, youtubeUrl: "", createdAt: "2026-04-01" },
  { id: "d2", name: "1v1 Attacking", description: "Attacker vs defender in a small grid. Develops dribbling, feints, and finishing under pressure.", category: "1v1", tags: ["dribbling", "finishing"], difficulty: "intermediate", duration: 15, youtubeUrl: "", createdAt: "2026-04-05" },
  { id: "d3", name: "Agility Ladder", description: "Footwork and coordination drill using agility ladder. Multiple patterns for speed and quickness.", category: "Agility", tags: ["fitness", "speed"], difficulty: "beginner", duration: 10, youtubeUrl: "", createdAt: "2026-04-08" },
  { id: "d4", name: "Fox Tails", description: "Players tuck a bib into their shorts. Objective: grab other players' tails while protecting your own.", category: "Dribbling", tags: ["fun", "warm-up", "kids"], difficulty: "beginner", duration: 10, youtubeUrl: "", createdAt: "2026-04-10" },
  { id: "d5", name: "Crossing & Finishing", description: "Wide player delivers crosses for strikers to finish. Work both sides of the pitch.", category: "Shooting", tags: ["crossing", "finishing", "heading"], difficulty: "intermediate", duration: 25, youtubeUrl: "", createdAt: "2026-04-12" },
  { id: "d6", name: "Penalty Pressure", description: "Penalty shootout with added pressure — coach gives distractions, defenders try to put off shooter.", category: "Shooting", tags: ["penalties", "mental"], difficulty: "advanced", duration: 15, youtubeUrl: "", createdAt: "2026-04-14" },
];

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

export function DrillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const drill = MOCK_DRILLS.find((d) => d.id === id);

  if (!drill) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Drill not found.</p>
        <button onClick={() => navigate("/drills")} className="text-indigo-600 mt-2">Back to Drills</button>
      </div>
    );
  }

  const iconColor = ICON_COLORS[drill.id.charCodeAt(drill.id.length - 1) % ICON_COLORS.length];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Back */}
      <button onClick={() => navigate("/drills")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors" style={{ fontSize: "14px" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Drills
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-gray-900">{drill.name}</h1>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full ${DIFFICULTY_STYLES[drill.difficulty]}`} style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
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
          <p className="text-gray-700" style={{ fontSize: "14px", lineHeight: 1.7 }}>{drill.description}</p>

          {/* Tags */}
          {drill.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {drill.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full" style={{ fontSize: "11px" }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* YouTube */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="w-5 h-5 text-red-500" />
            <h3 className="text-gray-900">Video Reference</h3>
          </div>
          {drill.youtubeUrl ? (
            <a href={drill.youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline" style={{ fontSize: "14px" }}>
              <Youtube className="w-4 h-4 text-red-500" /> Watch on YouTube
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Youtube className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No video added yet</p>
              <button className="mt-2 text-indigo-600 hover:underline" style={{ fontSize: "12px" }}>Add YouTube link →</button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h3 className="text-gray-900">Notes</h3>
            </div>
            <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: "13px" }}>
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-gray-400" style={{ fontSize: "13px" }}>No notes yet</p>
          </div>
        </div>

        {/* Photos & Videos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-indigo-500" />
              <h3 className="text-gray-900">Photos & Videos</h3>
            </div>
            <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: "13px" }}>
              <Plus className="w-3.5 h-3.5" /> Add Media
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Image className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-gray-400" style={{ fontSize: "13px" }}>No media yet</p>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              <h3 className="text-gray-900">Goals</h3>
            </div>
            <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: "13px" }}>
              <Plus className="w-3.5 h-3.5" /> Add Goal
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-gray-400" style={{ fontSize: "13px" }}>No goals linked to this drill yet</p>
          </div>
        </div>

      </div>
    </div>
  );
}
