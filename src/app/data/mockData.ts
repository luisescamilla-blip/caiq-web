export type StudentStatus = "active" | "inactive" | "on-hold";
export type SessionStatus = "completed" | "upcoming" | "cancelled";
export type GoalStatus = "in-progress" | "completed" | "not-started";

export interface Goal {
  id: string;
  title: string;
  status: GoalStatus;
  progress: number;
  dueDate: string;
}

export interface Note {
  id: string;
  date: string;
  content: string;
  sessionId?: string;
  parentId?: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
}

export interface Session {
  id: string;
  studentId: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: SessionStatus;
  topic: string;
  notes?: string;
  drillIds?: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  status: StudentStatus;
  joinDate: string;
  program: string;
  totalSessions: number;
  nextSession?: string;
  goals: Goal[];
  notes: Note[];
  tags: string[];
}

export const PROGRAMS = [
  "Modified Rondos",
  "Agility",
  "1v1",
  "1st Touch",
  "Crossing",
  "Fox Tails",
  "Penalties",
];

export const initialStudents: Student[] = [
  {
    id: "s1",
    name: "Olivia Martinez",
    email: "olivia.martinez@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "OM",
    status: "active",
    joinDate: "2025-09-15",
    program: "Career Development",
    totalSessions: 12,
    nextSession: "2026-05-02T10:00:00",
    tags: ["high-priority", "referred"],
    goals: [
      { id: "g1", title: "Land senior product manager role", status: "in-progress", progress: 65, dueDate: "2026-07-01" },
      { id: "g2", title: "Build professional network (+50 connections)", status: "in-progress", progress: 40, dueDate: "2026-06-01" },
      { id: "g3", title: "Complete leadership course", status: "completed", progress: 100, dueDate: "2026-03-15" },
    ],
    notes: [
      { id: "n1", date: "2026-04-22", content: "Olivia showed great progress in interview preparation. She practiced STAR method responses effectively. Focus next session on salary negotiation." },
      { id: "n2", date: "2026-04-08", content: "Discussed LinkedIn profile optimization. Identified 3 target companies. Homework: reach out to 5 alumni in target companies." },
    ],
  },
  {
    id: "s2",
    name: "James Thornton",
    email: "james.thornton@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "JT",
    status: "active",
    joinDate: "2025-11-01",
    program: "Executive Coaching",
    totalSessions: 8,
    nextSession: "2026-04-30T14:00:00",
    tags: ["executive", "leadership"],
    goals: [
      { id: "g4", title: "Improve team communication score", status: "in-progress", progress: 55, dueDate: "2026-06-30" },
      { id: "g5", title: "Delegate effectively to reduce 20% workload", status: "not-started", progress: 0, dueDate: "2026-08-01" },
    ],
    notes: [
      { id: "n3", date: "2026-04-15", content: "James is struggling with delegation. Identified root cause as trust issues with team members. Created action plan: weekly 1:1s with direct reports." },
    ],
  },
  {
    id: "s3",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "PS",
    status: "active",
    joinDate: "2026-01-10",
    program: "Life Coaching",
    totalSessions: 5,
    nextSession: "2026-05-05T09:00:00",
    tags: ["new", "work-life-balance"],
    goals: [
      { id: "g6", title: "Establish morning routine", status: "completed", progress: 100, dueDate: "2026-03-01" },
      { id: "g7", title: "Reduce work hours to 45/week", status: "in-progress", progress: 30, dueDate: "2026-06-01" },
    ],
    notes: [
      { id: "n4", date: "2026-04-20", content: "Priya has successfully built her morning routine. Now focusing on boundary-setting at work. Great progress overall." },
    ],
  },
  {
    id: "s4",
    name: "Marcus Williams",
    email: "marcus.williams@email.com",
    phone: "+1 (555) 567-8901",
    avatar: "MW",
    status: "active",
    joinDate: "2025-08-20",
    program: "Business Strategy",
    totalSessions: 18,
    nextSession: "2026-05-01T11:00:00",
    tags: ["entrepreneur", "long-term"],
    goals: [
      { id: "g8", title: "Launch MVP by Q2 2026", status: "in-progress", progress: 80, dueDate: "2026-06-30" },
      { id: "g9", title: "Secure seed funding", status: "in-progress", progress: 25, dueDate: "2026-09-01" },
      { id: "g10", title: "Build core team (5 people)", status: "completed", progress: 100, dueDate: "2026-02-01" },
    ],
    notes: [
      { id: "n5", date: "2026-04-25", content: "Marcus is on track with MVP development. Beta testers secured. Need to focus on pitch deck refinement for investor meetings." },
    ],
  },
  {
    id: "s5",
    name: "Elena Vasquez",
    email: "elena.vasquez@email.com",
    phone: "+1 (555) 678-9012",
    avatar: "EV",
    status: "on-hold",
    joinDate: "2025-10-05",
    program: "Health & Wellness",
    totalSessions: 9,
    tags: ["health", "paused"],
    goals: [
      { id: "g11", title: "Develop sustainable fitness plan", status: "in-progress", progress: 50, dueDate: "2026-07-01" },
      { id: "g12", title: "Improve sleep quality", status: "in-progress", progress: 60, dueDate: "2026-05-01" },
    ],
    notes: [
      { id: "n6", date: "2026-03-30", content: "Elena requested a hold due to family commitments. Will resume in June. Left with a self-guided wellness plan." },
    ],
  },
  {
    id: "s6",
    name: "David Chen",
    email: "david.chen@email.com",
    phone: "+1 (555) 789-0123",
    avatar: "DC",
    status: "active",
    joinDate: "2026-02-15",
    program: "Leadership",
    totalSessions: 4,
    nextSession: "2026-05-07T15:00:00",
    tags: ["new", "management"],
    goals: [
      { id: "g13", title: "Transition from IC to manager role", status: "in-progress", progress: 20, dueDate: "2026-10-01" },
      { id: "g14", title: "Develop public speaking confidence", status: "not-started", progress: 0, dueDate: "2026-08-01" },
    ],
    notes: [
      { id: "n7", date: "2026-04-18", content: "David is eager to grow into leadership. Identified areas: difficult conversations, influence without authority. Assigned book: 'The Manager's Path'." },
    ],
  },
  {
    id: "s7",
    name: "Sarah O'Brien",
    email: "sarah.obrien@email.com",
    phone: "+1 (555) 890-1234",
    avatar: "SO",
    status: "inactive",
    joinDate: "2025-05-10",
    program: "Career Development",
    totalSessions: 24,
    tags: ["graduated", "alumni"],
    goals: [
      { id: "g15", title: "Pivot to UX design career", status: "completed", progress: 100, dueDate: "2025-12-01" },
      { id: "g16", title: "Build portfolio with 5 projects", status: "completed", progress: 100, dueDate: "2025-11-01" },
    ],
    notes: [
      { id: "n8", date: "2026-01-15", content: "Sarah successfully transitioned to a UX Designer role! Completed program. May return for advanced coaching in the future." },
    ],
  },
  {
    id: "s8",
    name: "Ryan Foster",
    email: "ryan.foster@email.com",
    phone: "+1 (555) 901-2345",
    avatar: "RF",
    status: "active",
    joinDate: "2026-03-01",
    program: "Mindfulness",
    totalSessions: 3,
    nextSession: "2026-05-03T08:00:00",
    tags: ["new", "stress-management"],
    goals: [
      { id: "g17", title: "Daily meditation practice (10 min)", status: "in-progress", progress: 45, dueDate: "2026-05-15" },
      { id: "g18", title: "Reduce anxiety symptoms", status: "in-progress", progress: 25, dueDate: "2026-07-01" },
    ],
    notes: [
      { id: "n9", date: "2026-04-23", content: "Ryan is making good progress with guided breathing techniques. Discussed stress triggers at work. Introduced journaling practice." },
    ],
  },
];

export const initialSessions: Session[] = [
  { id: "sess1", studentId: "s1", date: "2026-05-02", time: "10:00", duration: 60, status: "upcoming", topic: "Salary Negotiation Strategies", drillIds: ["d1"] },
  { id: "sess2", studentId: "s2", date: "2026-04-30", time: "14:00", duration: 60, status: "upcoming", topic: "Delegation & Trust Building", drillIds: [] },
  { id: "sess3", studentId: "s3", date: "2026-05-05", time: "09:00", duration: 45, status: "upcoming", topic: "Work-Life Boundary Setting", drillIds: [] },
  { id: "sess4", studentId: "s4", date: "2026-05-01", time: "11:00", duration: 90, status: "upcoming", topic: "Investor Pitch Deck Review", drillIds: [] },
  { id: "sess5", studentId: "s6", date: "2026-05-07", time: "15:00", duration: 60, status: "upcoming", topic: "Managing Up & Stakeholder Communication", drillIds: [] },
  { id: "sess6", studentId: "s8", date: "2026-05-03", time: "08:00", duration: 45, status: "upcoming", topic: "Mindfulness in the Workplace", drillIds: [] },
  { id: "sess7", studentId: "s1", date: "2026-04-22", time: "10:00", duration: 60, status: "completed", topic: "Interview Preparation", notes: "Practiced STAR method. Strong performance.", drillIds: ["d1"] },
  { id: "sess8", studentId: "s2", date: "2026-04-15", time: "14:00", duration: 60, status: "completed", topic: "Team Dynamics Assessment", notes: "Identified key blockers. Action plan created.", drillIds: ["d2", "d3"] },
  { id: "sess9", studentId: "s4", date: "2026-04-25", time: "11:00", duration: 90, status: "completed", topic: "MVP Progress Review", notes: "On track. Beta testing underway.", drillIds: [] },
  { id: "sess10", studentId: "s3", date: "2026-04-20", time: "09:00", duration: 45, status: "completed", topic: "Morning Routine Review", notes: "Routine established. Shifting focus to work hours.", drillIds: [] },
  { id: "sess11", studentId: "s6", date: "2026-04-18", time: "15:00", duration: 60, status: "completed", topic: "Leadership Styles & Assessment", notes: "Completed DISC assessment. Identified strengths.", drillIds: [] },
  { id: "sess12", studentId: "s8", date: "2026-04-23", time: "08:00", duration: 45, status: "completed", topic: "Breathing & Stress Techniques", notes: "Introduced box breathing. Journaling homework assigned.", drillIds: [] },
  { id: "sess13", studentId: "s1", date: "2026-04-08", time: "10:00", duration: 60, status: "completed", topic: "LinkedIn & Personal Branding", notes: "Profile optimized. 3 target companies identified.", drillIds: [] },
  { id: "sess14", studentId: "s7", date: "2025-12-20", time: "14:00", duration: 60, status: "completed", topic: "Program Graduation", notes: "Sarah landed UX role! Celebrated success.", drillIds: [] },
  { id: "sess15", studentId: "s5", date: "2026-03-30", time: "10:00", duration: 45, status: "cancelled", topic: "Fitness Plan Review", notes: "Client requested hold due to family commitments.", drillIds: [] },
];

export interface ChatMessage {
  id: string;
  from: "coach" | "student";
  content: string;
  timestamp: string;
}

export interface ChatThread {
  studentId: string;
  messages: ChatMessage[];
  unreadCount: number;
}

export const initialChatThreads: ChatThread[] = [
  {
    studentId: "s1",
    unreadCount: 2,
    messages: [
      { id: "cm1", from: "coach", content: "Hi Olivia! Great work in our last session. How are you feeling about your upcoming interview?", timestamp: "2026-04-22T10:15:00" },
      { id: "cm2", from: "student", content: "Thanks! I feel much more confident now. I've been practicing the STAR method like you suggested.", timestamp: "2026-04-22T10:32:00" },
      { id: "cm3", from: "coach", content: "That's fantastic to hear! Don't forget to research salary ranges for senior PM roles in your target market before our next session.", timestamp: "2026-04-22T10:45:00" },
      { id: "cm4", from: "student", content: "Will do! I already found some great data on Levels.fyi. Should I bring a specific number to negotiate with?", timestamp: "2026-04-28T09:10:00" },
      { id: "cm5", from: "student", content: "Also, I reached out to 3 alumni so far — two already replied! 🎉", timestamp: "2026-04-28T09:12:00" },
    ],
  },
  {
    studentId: "s2",
    unreadCount: 0,
    messages: [
      { id: "cm6", from: "coach", content: "James, I wanted to check in — how did your 1:1 with your team lead go this week?", timestamp: "2026-04-16T11:00:00" },
      { id: "cm7", from: "student", content: "It went better than expected! I took your advice and focused on listening first before giving feedback.", timestamp: "2026-04-16T13:22:00" },
      { id: "cm8", from: "coach", content: "That's a huge step. Keep that approach. I'll have some delegation exercises ready for our next session.", timestamp: "2026-04-16T14:00:00" },
    ],
  },
  {
    studentId: "s3",
    unreadCount: 1,
    messages: [
      { id: "cm9", from: "student", content: "Hey Coach! I just wanted to share — I've been leaving work by 6pm every day this week!", timestamp: "2026-04-24T19:05:00" },
      { id: "cm10", from: "coach", content: "Priya, that is AMAZING! I'm so proud of you. How does it feel to have that boundary in place?", timestamp: "2026-04-24T19:30:00" },
      { id: "cm11", from: "student", content: "Honestly liberating! I even had dinner with my family three times. Thank you for pushing me on this.", timestamp: "2026-04-27T08:45:00" },
    ],
  },
  {
    studentId: "s4",
    unreadCount: 0,
    messages: [
      { id: "cm12", from: "coach", content: "Marcus, the pitch deck is coming along great. Let's plan a dry run before your next investor meeting.", timestamp: "2026-04-25T12:00:00" },
      { id: "cm13", from: "student", content: "Agreed! I'm thinking next Thursday works. Should I send you the latest deck beforehand?", timestamp: "2026-04-25T12:20:00" },
      { id: "cm14", from: "coach", content: "Yes, please send it by Wednesday so I can review and have notes ready.", timestamp: "2026-04-25T12:25:00" },
      { id: "cm15", from: "student", content: "Perfect. Sending it over tonight. Really appreciate your support on this!", timestamp: "2026-04-25T15:00:00" },
    ],
  },
  {
    studentId: "s6",
    unreadCount: 0,
    messages: [
      { id: "cm16", from: "coach", content: "David, how are you finding the book 'The Manager's Path' so far?", timestamp: "2026-04-20T10:00:00" },
      { id: "cm17", from: "student", content: "It's really eye-opening. The chapter on having hard conversations hit close to home.", timestamp: "2026-04-21T18:30:00" },
      { id: "cm18", from: "coach", content: "That's exactly the chapter I wanted you to reflect on. Write down 2-3 situations where you avoided a difficult conversation — we'll work through them together.", timestamp: "2026-04-21T19:00:00" },
    ],
  },
  {
    studentId: "s8",
    unreadCount: 3,
    messages: [
      { id: "cm19", from: "coach", content: "Ryan, how is the journaling practice going? Are you noticing any patterns in your stress triggers?", timestamp: "2026-04-24T08:00:00" },
      { id: "cm20", from: "student", content: "It's been really insightful. I noticed I get most anxious on Sunday evenings thinking about Monday.", timestamp: "2026-04-25T07:50:00" },
      { id: "cm21", from: "student", content: "I tried the box breathing before bed and it actually helped a lot!", timestamp: "2026-04-27T21:10:00" },
      { id: "cm22", from: "student", content: "Quick question — is it normal for the meditation to feel harder some days than others?", timestamp: "2026-04-28T07:30:00" },
    ],
  },
];