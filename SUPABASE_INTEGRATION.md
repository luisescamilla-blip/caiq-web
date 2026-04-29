# Supabase Integration

## What was completed

### Authentication (`src/app/context/AuthContext.tsx`)
- Replaced mock auth (simulated delay) with real Supabase Auth
- `signIn` → `supabase.auth.signInWithPassword()`
- `signUp` → `supabase.auth.signUp()` with name in user_metadata
- `signOut` → `supabase.auth.signOut()`
- Session persistence via `getSession()` + `onAuthStateChange()` listener
- Fetches coach name from `coaches` table on login for display

### Supabase Client (`src/lib/supabase.ts`)
- Created shared client using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars

### Data Layer (`src/app/context/AppContext.tsx`)
- Replaced all mock data (`initialStudents`, `initialSessions`) with live Supabase queries
- On mount (after auth): fetches students, sessions, goals, notes in parallel
- All CRUD operations write to Supabase and optimistically update local state
- Mapping: Supabase `snake_case` → component `camelCase` (e.g. `join_date` → `joinDate`, `due_date` → `dueDate`, `student_id` → `studentId`)
- Added `loading: boolean` to context (optional — components can ignore it)

**Tables used:**
- `students` — scoped by `coach_id`
- `sessions` — scoped by `coach_id`
- `goals` — scoped by `coach_id`, polymorphic (`parent_type='student'` for student goals)
- `notes` — scoped by `coach_id`, polymorphic (`parent_type='student'` for student notes)

### Database Schema (`supabase/migrations/001_initial_schema.sql`)
Run this manually in the Supabase SQL editor. Includes:
- `coaches`, `students`, `sessions`, `drills`, `goals`, `notes`, `media` tables
- Row Level Security (RLS) on all tables — data scoped to `auth.uid() = coach_id`
- Auto-create coach profile trigger on `auth.users` insert

### Environment
- `.env` — real credentials (gitignored)
- `.env.example` — template for new devs

---

## Steps to go live

1. **Run the SQL migration** in your Supabase dashboard (SQL Editor):
   - Paste contents of `supabase/migrations/001_initial_schema.sql`
   - Run it

2. **Sign up a coach account** — the trigger will auto-create the `coaches` row

3. **Test locally:**
   ```bash
   npm run dev
   ```
   Sign up → the app should load with an empty students/sessions list (no more mock data)

---

## TODO / Not yet done

- **Drills** — tables designed, no UI integration yet
- **Media** — table designed, no upload/display flow yet
- **Chats** — left as TODO; unclear if coach↔student or coach↔AI
- **Sub-drills** — left as TODO (polymorphic parent_type='drill' is in schema)
- **Google OAuth** — schema supports it, Supabase OAuth flow not wired up
- **Session notes/goals** — the `goals` and `notes` tables support `parent_type='session'`, but `SessionDetail.tsx` currently stores them as `parent_type='student'` (same behavior as before)
- **Error toasts** — CRUD errors are logged to console but not shown to users
- **Loading spinners** — `loading` is in AppContext but components don't use it yet
- **Realtime subscriptions** — could add `supabase.channel()` for live updates across tabs/devices
- **nextSession field** — computed from sessions in mock data; currently not computed after Supabase fetch (shows empty)

---

## Known behavior change

**Mock data is gone.** After the migration runs, the app starts empty until you create real students/sessions. If you want seed data, insert it directly in the Supabase dashboard or write a seed script.
