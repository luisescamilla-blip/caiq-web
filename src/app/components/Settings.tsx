import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle2,
} from "lucide-react";

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Luis E",
    email: "luis@coachaiq.com",
    title: "Sports Coach",
    bio: "Certified professional coach with 8+ years of experience helping individuals achieve their personal and professional goals.",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
  });
  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    newStudents: true,
    goalUpdates: false,
    weeklyDigest: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-gray-900">Settings</h1>
        <p
          className="text-gray-500 mt-0.5"
          style={{ fontSize: "14px" }}
        >
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-gray-900">Coach Profile</h3>
        </div>
        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span
                className="text-white"
                style={{ fontSize: "20px", fontWeight: 800 }}
              >
                LE
              </span>
            </div>
            <div>
              <button
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                style={{ fontSize: "13px" }}
              >
                Change Photo
              </button>
              <p
                className="text-gray-400 mt-1"
                style={{ fontSize: "11px" }}
              >
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 mb-1"
                style={{ fontSize: "13px" }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1"
                style={{ fontSize: "13px" }}
              >
                Title / Specialty
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1"
                style={{ fontSize: "13px" }}
              >
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1"
                style={{ fontSize: "13px" }}
              >
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 mb-1"
              style={{ fontSize: "13px" }}
            >
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none"
              style={{ fontSize: "14px" }}
            />
          </div>

          <div>
            <label
              className="block text-gray-700 mb-1"
              style={{ fontSize: "13px" }}
            >
              Timezone
            </label>
            <select
              value={profile.timezone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  timezone: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
              style={{ fontSize: "14px" }}
            >
              <option value="America/New_York">
                Eastern Time (ET)
              </option>
              <option value="America/Chicago">
                Central Time (CT)
              </option>
              <option value="America/Denver">
                Mountain Time (MT)
              </option>
              <option value="America/Los_Angeles">
                Pacific Time (PT)
              </option>
              <option value="Europe/London">
                London (GMT)
              </option>
              <option value="Europe/Paris">
                Central European (CET)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-gray-900">Notifications</h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              key: "sessionReminders",
              label: "Session Reminders",
              desc: "Get notified 1 hour before each session",
            },
            {
              key: "newStudents",
              label: "New Player Alerts",
              desc: "Notify when a new player is added",
            },
            {
              key: "goalUpdates",
              label: "Goal Updates",
              desc: "Notify when players update their goal progress",
            },
            {
              key: "weeklyDigest",
              label: "Weekly Digest",
              desc: "Summary of sessions and progress each Monday",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between"
            >
              <div>
                <p
                  className="text-gray-800"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  {item.label}
                </p>
                <p
                  className="text-gray-400"
                  style={{ fontSize: "12px" }}
                >
                  {item.desc}
                </p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]:
                      !notifications[
                        item.key as keyof typeof notifications
                      ],
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifications[
                    item.key as keyof typeof notifications
                  ]
                    ? "bg-indigo-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    notifications[
                      item.key as keyof typeof notifications
                    ]
                      ? "left-5.5"
                      : "left-0.5"
                  }`}
                  style={{
                    left: notifications[
                      item.key as keyof typeof notifications
                    ]
                      ? "22px"
                      : "2px",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-gray-900">Security</h3>
        </div>
        <div className="p-5 space-y-3">
          <button
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            style={{ fontSize: "14px" }}
          >
            <p
              className="text-gray-800"
              style={{ fontWeight: 500 }}
            >
              Change Password
            </p>
            <p
              className="text-gray-400"
              style={{ fontSize: "12px" }}
            >
              Last changed 3 months ago
            </p>
          </button>
          <button
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            style={{ fontSize: "14px" }}
          >
            <p
              className="text-gray-800"
              style={{ fontWeight: 500 }}
            >
              Two-Factor Authentication
            </p>
            <p
              className="text-gray-400"
              style={{ fontSize: "12px" }}
            >
              Add an extra layer of security
            </p>
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "14px" }}
        >
          {saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
        {saved && (
          <p
            className="text-emerald-600"
            style={{ fontSize: "13px" }}
          >
            Your changes have been saved.
          </p>
        )}
      </div>
    </div>
  );
}