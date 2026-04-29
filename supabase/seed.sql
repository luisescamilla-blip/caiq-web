-- ============================================================
-- SEED DATA for Coach AIQ
-- Run this AFTER 001_initial_schema.sql
-- Replace YOUR_COACH_ID with your actual auth.users UUID
-- (find it in Supabase → Authentication → Users → your user's ID)
-- ============================================================

-- Set this to your coach user ID
DO $$
DECLARE
  coach_id uuid := 'YOUR_COACH_ID'; -- ← replace this

  s1 uuid := gen_random_uuid();
  s2 uuid := gen_random_uuid();
  s3 uuid := gen_random_uuid();
  s4 uuid := gen_random_uuid();

  sess1 uuid := gen_random_uuid();
  sess2 uuid := gen_random_uuid();
  sess3 uuid := gen_random_uuid();
  sess4 uuid := gen_random_uuid();
  sess5 uuid := gen_random_uuid();
  sess6 uuid := gen_random_uuid();

BEGIN

-- Students
INSERT INTO public.students (id, coach_id, name, email, phone, avatar, status, program, join_date, tags) VALUES
  (s1, coach_id, 'Marco Rodriguez',   'marco@example.com',   '+1 (555) 111-2222', 'MR', 'active',   'Soccer - Attacking', '2025-09-01', ARRAY['high-priority']),
  (s2, coach_id, 'Sofia Hernandez',   'sofia@example.com',   '+1 (555) 333-4444', 'SH', 'active',   'Soccer - Defense',   '2025-10-15', ARRAY['new']),
  (s3, coach_id, 'James Carter',      'james@example.com',   '+1 (555) 555-6666', 'JC', 'active',   'Soccer - Midfield',  '2026-01-05', ARRAY['new']),
  (s4, coach_id, 'Aisha Thompson',    'aisha@example.com',   '+1 (555) 777-8888', 'AT', 'on-hold',  'Soccer - GK',        '2025-08-20', ARRAY['paused']);

-- Sessions
INSERT INTO public.sessions (id, coach_id, student_id, topic, date, time, duration, status) VALUES
  (sess1, coach_id, s1, '1v1 Attacking Moves',      '2026-05-02', '10:00', 60, 'upcoming'),
  (sess2, coach_id, s2, 'Defensive Positioning',    '2026-05-03', '14:00', 60, 'upcoming'),
  (sess3, coach_id, s3, 'Passing & Vision',         '2026-05-05', '09:00', 45, 'upcoming'),
  (sess4, coach_id, s1, 'Dribbling Under Pressure', '2026-04-25', '10:00', 60, 'completed'),
  (sess5, coach_id, s2, 'Clearance Techniques',     '2026-04-20', '14:00', 60, 'completed'),
  (sess6, coach_id, s3, 'First Touch Drills',       '2026-04-18', '09:00', 45, 'completed');

-- Goals (parent_type = 'student')
INSERT INTO public.goals (coach_id, title, status, progress, due_date, parent_type, parent_id) VALUES
  (coach_id, 'Master weak foot finishing',     'in-progress', 55, '2026-07-01', 'student', s1),
  (coach_id, 'Improve sprint speed by 10%',   'in-progress', 30, '2026-06-15', 'student', s1),
  (coach_id, 'Win 80% of aerial duels',       'not-started', 0,  '2026-08-01', 'student', s2),
  (coach_id, 'Complete defensive shape drill', 'completed',  100, '2026-04-01', 'student', s2),
  (coach_id, 'Improve passing accuracy to 90%','in-progress', 45, '2026-07-15', 'student', s3);

-- Notes (parent_type = 'student')
INSERT INTO public.notes (coach_id, content, parent_type, parent_id) VALUES
  (coach_id, 'Marco showed great improvement in his left foot today. Still needs work on finishing under pressure.', 'student', s1),
  (coach_id, 'Sofia is reading the game well but drops her line too early. Focus on timing next session.', 'student', s2),
  (coach_id, 'James has excellent vision but needs to play faster — one-touch passing drills are working.', 'student', s3);

END $$;
