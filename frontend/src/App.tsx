import React, { useState, useMemo } from "react";
import {
  Home, Users, Calendar, ClipboardList, FileText, Target, Activity,
  Bell, Search, Menu, X, ChevronRight, ChevronDown, Plus, Check,
  Clock, Filter, LogOut, Baby, Stethoscope, GraduationCap,
  MessageCircle, FolderOpen, BarChart3, Sparkles, ArrowLeft,
  AlertCircle, CheckCircle2, Circle, TrendingUp, Save, ChevronLeft,
  Building2, Settings, UserCheck, UserX, RefreshCw,
} from "lucide-react";
import { api } from "./lib/api";

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────── */
const T = {
  ink: "#152420",
  inkSoft: "#4B5B56",
  inkFaint: "#8A9A94",
  paper: "#F5F7F5",
  paperRaised: "#FFFFFF",
  line: "#DDE4E0",
  teal: "#1D4E4A",
  tealDeep: "#123330",
  tealSoft: "#DCEAE7",
  gold: "#C89B3C",
  goldSoft: "#F3E7CB",
  sage: "#7FA98E",
  sageSoft: "#E4EEE7",
  coral: "#D9694E",
  coralSoft: "#FBE6DF",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&display=swap');
    .rast-root { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: ${T.ink}; background: ${T.paper}; }
    .rast-serif { font-family: 'Fraunces', Georgia, serif; }
    .rast-card { background: ${T.paperRaised}; border: 1px solid ${T.line}; border-radius: 14px; }
    .rast-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .rast-scroll::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 8px; }
    .rast-btn-primary { background: ${T.teal}; color: white; border: none; }
    .rast-btn-primary:hover { background: ${T.tealDeep}; }
    .rast-btn-ghost { background: transparent; color: ${T.teal}; border: 1px solid ${T.line}; }
    .rast-btn-ghost:hover { background: ${T.tealSoft}; }
    .rast-nav-item { transition: background .15s ease, color .15s ease; }
    .rast-nav-item:hover { background: rgba(255,255,255,0.08); }
    .rast-tab { transition: color .15s ease, border-color .15s ease; white-space: nowrap; }
    .rast-fade-in { animation: rastFade .35s ease both; }
    @keyframes rastFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    input, select, textarea { font-family: inherit; }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────
   SCHEDULING ENGINE  (mirrors app.py logic)
   Slots are 30-minute blocks counted from therapist clock-in to clock-out
───────────────────────────────────────────────────────────────── */
const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function makeSlots(clockIn: string, clockOut: string): string[] {
  if (!clockIn || !clockOut) return [];
  try {
    const [ih, im] = clockIn.split(":").map(Number);
    const [oh, om] = clockOut.split(":").map(Number);
    const startM = ih * 60 + im, endM = oh * 60 + om;
    const slots: string[] = [];
    const fmt = (h: number, m: number) => {
      const p = h >= 12 ? "PM" : "AM";
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${h12}:${String(m).padStart(2, "0")} ${p}`;
    };
    for (let c = startM; c + 30 <= endM; c += 30)
      slots.push(`${fmt(Math.floor(c/60), c%60)} – ${fmt(Math.floor((c+30)/60), (c+30)%60)}`);
    return slots;
  } catch { return []; }
}

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

// Departments — admin-manageable
let DEPARTMENTS: { id: string; name: string; color: string; abbr: string }[] = [
  { id: "d1", name: "Speech Therapy",       color: T.teal,  abbr: "S.T" },
  { id: "d2", name: "Occupational Therapy", color: T.gold,  abbr: "O.T" },
  { id: "d3", name: "Behavior Therapy",     color: T.coral, abbr: "B.T" },
  { id: "d4", name: "Remedial Therapy",     color: T.sage,  abbr: "R.T" },
  { id: "d5", name: "Physio Therapy",       color: "#7C6FA0", abbr: "P.T" },
  { id: "d6", name: "Sports Therapy",       color: "#4E7FA0", abbr: "SP"  },
];

// Staff with clock-in/out per day
let STAFF: {
  id: string; name: string; role: string; dept: string;
  shift: string; daysScheduled: string[];
  attendance: Record<string, { clockIn: string; clockOut: string }>;
}[] = [
  {
    id: "th1", name: "Abeeha Fatima Danish", role: "Speech Therapist", dept: "Speech Therapy",
    shift: "1st Shift", daysScheduled: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    attendance: {
      "2026-10-24": { clockIn: "08:00", clockOut: "13:00" },
      "2026-10-23": { clockIn: "08:05", clockOut: "13:10" },
    },
  },
  {
    id: "th2", name: "Ali Akbar", role: "Occupational Therapist", dept: "Occupational Therapy",
    shift: "1st Shift", daysScheduled: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    attendance: {
      "2026-10-24": { clockIn: "08:00", clockOut: "12:30" },
    },
  },
  {
    id: "th3", name: "Amaan Ahmed", role: "Behavior Therapist", dept: "Behavior Therapy",
    shift: "2nd Shift", daysScheduled: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    attendance: {
      "2026-10-24": { clockIn: "12:00", clockOut: "17:00" },
    },
  },
  {
    id: "th4", name: "Eeman Fatima", role: "Remedial Therapist", dept: "Remedial Therapy",
    shift: "2nd Shift", daysScheduled: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    attendance: {},
  },
];

let STUDENTS: {
  id: string; studentId: string; name: string; father: string; age: number; dob: string;
  gender: string; program: string; house: string; shift: string;
  admission: string; status: "Active" | "Inactive"; parent: string; phone: string;
  diagnosis: string; allergies: string; emergencyContact: string;
  severity: "Mild" | "Moderate" | "Severe"; monthlyFee: number;
  departments: string[]; assignedTherapists: Record<string, string>;
  progress: Record<string, number>; photo: string;
}[] = [
  {
    id: "s1", studentId: "23/24-01", name: "Abdul Ahad", father: "Naveed Ahmed", age: 5, dob: "2021-03-14",
    gender: "Male", program: "School Readiness Program", house: "Green House", shift: "1st Shift",
    admission: "2024-08-01", status: "Active", parent: "Sana Ahmed", phone: "0300-1234567",
    diagnosis: "Global Developmental Delay", allergies: "None known", emergencyContact: "0300-1234567 (mother)",
    severity: "Moderate", monthlyFee: 8000,
    departments: ["Speech Therapy", "Occupational Therapy", "Behavior Therapy", "Remedial Therapy"],
    assignedTherapists: { "Speech Therapy": "th1", "Occupational Therapy": "th2", "Behavior Therapy": "th3", "Remedial Therapy": "th4" },
    progress: { "Speech Therapy": 70, "Occupational Therapy": 55, "Behavior Therapy": 75, "Remedial Therapy": 60 },
    photo: "AA",
  },
  {
    id: "s2", studentId: "23/24-02", name: "Mohsin Ali Khan", father: "Ali Khan", age: 7, dob: "2019-01-20",
    gender: "Male", program: "Foundational Skills Program", house: "Blue House", shift: "1st Shift",
    admission: "2023-09-10", status: "Active", parent: "Farah Khan", phone: "0301-2223344",
    diagnosis: "Autism Spectrum Disorder", allergies: "Peanuts", emergencyContact: "0301-2223344 (father)",
    severity: "Severe", monthlyFee: 10000,
    departments: ["Behavior Therapy", "Remedial Therapy"],
    assignedTherapists: { "Behavior Therapy": "th3", "Remedial Therapy": "th4" },
    progress: { "Behavior Therapy": 62, "Remedial Therapy": 48 },
    photo: "MK",
  },
  {
    id: "s3", studentId: "23/24-03", name: "Hamdan Ahmed", father: "Ahmed Raza", age: 6, dob: "2020-05-02",
    gender: "Male", program: "School Readiness Program", house: "Red House", shift: "2nd Shift",
    admission: "2024-01-15", status: "Active", parent: "Mariam Raza", phone: "0302-4455667",
    diagnosis: "Sensory Processing Disorder", allergies: "None known", emergencyContact: "0302-4455667 (mother)",
    severity: "Mild", monthlyFee: 6000,
    departments: ["Occupational Therapy"],
    assignedTherapists: { "Occupational Therapy": "th2" },
    progress: { "Occupational Therapy": 66 },
    photo: "HA",
  },
  {
    id: "s4", studentId: "23/24-04", name: "Rayyan Yosuf", father: "Yosuf Malik", age: 8, dob: "2018-11-09",
    gender: "Male", program: "Communication Skills Program", house: "Green House", shift: "2nd Shift",
    admission: "2023-03-20", status: "Inactive", parent: "Aisha Malik", phone: "0303-7788990",
    diagnosis: "Speech & Language Delay", allergies: "None known", emergencyContact: "0303-7788990 (mother)",
    severity: "Mild", monthlyFee: 6000,
    departments: ["Speech Therapy"],
    assignedTherapists: { "Speech Therapy": "th1" },
    progress: { "Speech Therapy": 58 },
    photo: "RY",
  },
  {
    id: "s5", studentId: "23/24-05", name: "Haris Ali", father: "Imran Ali", age: 9, dob: "2017-07-30",
    gender: "Male", program: "Behavior Support Program", house: "Blue House", shift: "1st Shift",
    admission: "2022-11-05", status: "Active", parent: "Nadia Ali", phone: "0304-9988776",
    diagnosis: "ADHD", allergies: "None known", emergencyContact: "0304-9988776 (father)",
    severity: "Moderate", monthlyFee: 8000,
    departments: ["Behavior Therapy"],
    assignedTherapists: { "Behavior Therapy": "th3" },
    progress: { "Behavior Therapy": 52 },
    photo: "HA",
  },
];

// Severity → days per week mapping
const SEVERITY_DAYS: Record<string, number> = { Severe: 4, Moderate: 3, Mild: 2 };

// Daily attendance for students (date → studentId → { depts attended })
let STUDENT_ATTENDANCE: Record<string, Record<string, { depts: string[]; sessions: number; absent: boolean }>> = {
  "2026-10-24": {
    s1: { depts: ["Speech Therapy","Behavior Therapy"], sessions: 2, absent: false },
    s2: { depts: [], sessions: 0, absent: true },
    s3: { depts: ["Occupational Therapy"], sessions: 1, absent: false },
  },
};

// Messages mock
const MESSAGES_TODAY = [
  { id: "m1", from: "Sana Ahmed", text: "Will Abdul Ahad have session tomorrow?", time: "09:30", responded: true },
  { id: "m2", from: "Farah Khan", text: "Request for monthly progress report.", time: "10:15", responded: false },
  { id: "m3", from: "Mariam Raza", text: "Can we reschedule Thursday?", time: "11:00", responded: false },
];

const GOALS = [
  { id: "g1", studentId: "s1", dept: "Behavior Therapy", title: "Improve command following", type: "Short-term", target: "2026-09-30", status: "In progress", progress: 70 },
  { id: "g2", studentId: "s1", dept: "Occupational Therapy", title: "Improve independence in ADLs", type: "Long-term", target: "2027-01-15", status: "In progress", progress: 45 },
  { id: "g3", studentId: "s1", dept: "Speech Therapy", title: "Expand functional vocabulary to 50 words", type: "Short-term", target: "2026-10-10", status: "In progress", progress: 68 },
  { id: "g4", studentId: "s1", dept: "Remedial Therapy", title: "Trace and copy 5-letter words independently", type: "Short-term", target: "2026-09-20", status: "On track", progress: 60 },
];

const SESSIONS = [
  { id: "sess1", studentId: "s1", dept: "Behavior Therapy", therapist: "Abeeha Fatima Danish", date: "2026-10-24", time: "10:00 AM", status: "Upcoming" },
  { id: "sess2", studentId: "s1", dept: "Occupational Therapy", therapist: "Ali Akbar", date: "2026-10-24", time: "11:00 AM", status: "Upcoming" },
  { id: "sess3", studentId: "s1", dept: "Speech Therapy", therapist: "Abeeha Fatima Danish", date: "2026-10-23", time: "10:00 AM", status: "Completed", progress: "Improving" },
  { id: "sess5", studentId: "s2", dept: "Behavior Therapy", therapist: "Amaan Ahmed", date: "2026-10-24", time: "9:00 AM", status: "Upcoming" },
];

const DAILY_LOGS = [
  { date: "2026-10-24", student: "Haris Ali", note: "Behavior issue — increased aggression reported by mother." },
  { date: "2026-10-24", student: "Hamdan Ahmed", note: "OT demonstration and home-protocol walkthrough with mother." },
];

const MEETINGS = [
  { id: "m1", studentId: "s1", date: "2026-09-04", purpose: "Quarterly progress review", attendees: "Sana Ahmed (parent), Abeeha, Ali Akbar", status: "Scheduled" },
];

let ASSESSMENT_STATUS: Record<string, boolean> = {
  s1: true, s2: false, s3: false, s4: true, s5: false,
};

const NOTIFICATIONS = {
  therapist: [
    { text: "You have 2 pending daily coverage reports.", time: "1h ago" },
    { text: "New student assigned to you: Hamdan Ahmed.", time: "Yesterday" },
  ],
  parent: [
    { text: "Abdul Ahad's progress report is now available.", time: "2h ago" },
    { text: "Speech Therapy session scheduled for tomorrow, 10:00 AM.", time: "5h ago" },
  ],
  student: [{ text: "Your Speech Therapy report was shared by Abeeha.", time: "3h ago" }],
  admin: [
    { text: "Attendance report for October requires review.", time: "1d ago" },
    { text: "2 unresponded messages from parents.", time: "3h ago" },
  ],
};

function deptColor(name: string) {
  const d = DEPARTMENTS.find(d => d.name === name);
  return d?.color || T.teal;
}

/* ─────────────────────────────────────────────────────────────────
   DAILY REPORT FORMS
───────────────────────────────────────────────────────────────── */
const DAILY_REPORT_FORMS: Record<string, { title: string; icon: string; fields: any[] }> = {
  ADL: { title: "ADL - Daily Coverage Report", icon: "👤", fields: [
    { name: "studentName", label: "Student's Name", type: "select", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time", required: true },
    { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
    { name: "listensRepeat", label: "Listens and repeat?", type: "yesno", required: true },
    { name: "listenFollowDirections", label: "Listen and follow directions?", type: "yesno", required: true },
    { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
    { name: "enjoyedGroupActivities", label: "Enjoyed group activities?", type: "yesno", required: true },
    { name: "activityConductedByStudent", label: "Was the activity conducted by the student?", type: "select", options: ["Fully Independent","Partially Independent"], required: true },
    { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
  ]},
  "Behaviour Therapy": { title: "Behaviour Therapy - Daily Coverage Report", icon: "🧠", fields: [
    { name: "studentName", label: "Student's Name", type: "select", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time", required: true },
    { name: "activityConducted", label: "Activity conducted?", type: "textarea", required: true },
    { name: "strategiesUsed", label: "Strategy used?", type: "textarea", required: true },
    { name: "frequencyOfBehaviour", label: "Frequency of behaviour? (mins)", type: "number", required: true },
    { name: "sittingTolerance", label: "Sitting Tolerance? (mins)", type: "number", required: true },
    { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
  ]},
  "Occupational Therapy": { title: "Occupational Therapy - Daily Coverage Report", icon: "🤚", fields: [
    { name: "studentName", label: "Student's Name", type: "select", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time", required: true },
    { name: "activityConducted", label: "Activity conducted?", type: "textarea", required: true },
    { name: "sittingTolerance", label: "Sitting Tolerance? (mins)", type: "number", required: true },
    { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
  ]},
  "Remedial Therapy": { title: "Remedial Therapy - Daily Coverage Report", icon: "📝", fields: [
    { name: "studentName", label: "Student's Name", type: "select", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time", required: true },
    { name: "activityConducted", label: "Activity conducted?", type: "textarea", required: true },
    { name: "sittingTolerance", label: "Sitting Tolerance? (mins)", type: "number", required: true },
    { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
  ]},
  "Speech Therapy": { title: "Speech Therapy - Daily Coverage Report", icon: "🗣️", fields: [
    { name: "studentName", label: "Student's Name", type: "select", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time", required: true },
    { name: "activityConducted", label: "Activity conducted?", type: "textarea", required: true },
    { name: "listensRepeat", label: "Listens and repeat?", type: "yesno", required: true },
    { name: "sittingTolerance", label: "Sitting Tolerance? (mins)", type: "number", required: true },
    { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
  ]},
};

const INFORMAL_ASSESSMENT_FORM = {
  title: "Informal Assessment Checklist",
  sections: [
    { name: "basic", label: "Basic Information", fields: [
      { name: "studentName", label: "Student's Name", type: "select", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Time", type: "time", required: true },
    ]},
    { name: "formalAssessment", label: "Formal Assessment", fields: [
      { name: "hasFormalAssessment", label: "Has the formal assessment been made?", type: "yesno", required: true },
      { name: "diagnosis", label: "If Yes, What is the diagnosis?", type: "textarea", required: false, condition: (f: any) => f.hasFormalAssessment === "Yes" },
    ]},
    { name: "behaviour", label: "Behaviour", fields: [
      { name: "sittingTolerance", label: "Sitting Tolerance (mins)", type: "number", required: true },
      { name: "hyperactive", label: "Hyperactive", type: "yesno", required: true },
      { name: "stubbornness", label: "Stubbornness (Follow Instructions)", type: "yesno", required: true },
      { name: "stubbornnessReason", label: "If No, Specify?", type: "multiselect", options: ["Not following commands","Distracted"], required: false, condition: (f: any) => f.stubbornness === "No" },
      { name: "selfStimulatory", label: "Self Stimulatory Behaviour?", type: "yesno", required: true },
      { name: "selfStimType", label: "If Yes, Specify?", type: "multiselect", options: ["Self-talking","Hand clapping","Spinning","Shouting","Crying","Self-hitting","Head banging"], required: false, condition: (f: any) => f.selfStimulatory === "Yes" },
      { name: "behaviourObservations", label: "Observations?", type: "textarea", required: false },
    ]},
    { name: "fineMotor", label: "Fine Motor Skills", fields: [
      { name: "pencilGripping", label: "Pencil Gripping", type: "yesno", required: true },
      { name: "colouringWithinLines", label: "Colouring within lines?", type: "yesno", required: true },
      { name: "verticalHorizontalLines", label: "Drawing vertical and horizontal lines", type: "yesno", required: true },
      { name: "pickingSmallObjects", label: "Picking up small objects", type: "yesno", required: true },
      { name: "openingClosingLocks", label: "Opening and closing locks", type: "yesno", required: true },
      { name: "fineMotorObservations", label: "Observation", type: "textarea", required: false },
    ]},
    { name: "grossMotor", label: "Gross Motor Skills", fields: [
      { name: "catchingThrowing", label: "Catching and throwing a ball", type: "yesno", required: true },
      { name: "walkingInLine", label: "Walking in line", type: "yesno", required: true },
      { name: "controlRunningWalking", label: "Control while running and walking", type: "yesno", required: true },
      { name: "jumpingInOutCircle", label: "Jumping in and out of circle", type: "yesno", required: true },
      { name: "coordinatedMuscleControl", label: "Coordinated muscle control", type: "yesno", required: true },
      { name: "grossMotorObservations", label: "Observation", type: "textarea", required: false },
    ]},
    { name: "speech", label: "Speech", fields: [
      { name: "respondsToName", label: "Receptive Language - Responds to name?", type: "yesno", required: true },
      { name: "recogniseObjects", label: "Receptive Language - Recognise objects?", type: "yesno", required: true },
      { name: "expressEmotions", label: "Expressive Language - Can express feelings?", type: "yesno", required: true },
      { name: "demandObjects", label: "Expressive Language - Can demand for objects?", type: "yesno", required: true },
      { name: "speechObservations", label: "Observations?", type: "textarea", required: false },
    ]},
    { name: "remedial", label: "Remedial Therapy", fields: [
      { name: "matchingSameObjects", label: "Matching same objects?", type: "yesno", required: true },
      { name: "comparingSorting", label: "Comparing and sorting objects by size", type: "yesno", required: true },
      { name: "countingFingers", label: "Counting on fingers", type: "yesno", required: true },
      { name: "identifyingNaming", label: "Identifying and naming different objects", type: "yesno", required: true },
      { name: "remedialObservations", label: "Observations", type: "textarea", required: false },
    ]},
    { name: "emotional", label: "Emotional & Social Skills", fields: [
      { name: "expressEmotionsAppropriately", label: "Express emotions appropriately", type: "yesno", required: true },
      { name: "interactsWithPeers", label: "Interacts with peers appropriately", type: "yesno", required: true },
      { name: "handlesTransitions", label: "Handles transitions or change in routine", type: "yesno", required: true },
      { name: "emotionalObservations", label: "Observations", type: "textarea", required: false },
    ]},
    { name: "progressCheck", label: "Progress Check", fields: [
      { name: "isFirstAssessment", label: "Is this the first assessment at RAST?", type: "yesno", required: true },
      { name: "lastAssessmentDate", label: "If No, date of last assessment", type: "date", required: false, condition: (f: any) => f.isFirstAssessment === "No" },
      { name: "progressLevel", label: "Level of progress", type: "select", options: ["Improvement","No Change","Regression"], required: false, condition: (f: any) => f.isFirstAssessment === "No" },
      { name: "progressObservations", label: "Observations", type: "textarea", required: false },
    ]},
    { name: "additional", label: "Additional Information", fields: [
      { name: "additionalNotes", label: "Additional Notes if Any?", type: "textarea", required: false },
    ]},
  ],
};

/* ─────────────────────────────────────────────────────────────────
   SMALL UI PRIMITIVES
───────────────────────────────────────────────────────────────── */
const Avatar = ({ initials, size = 40, bg = T.tealSoft, color = T.teal }: any) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.35, flexShrink: 0 }}>{initials}</div>
);

const Pill = ({ children, color = T.teal, bg = T.tealSoft }: any) => (
  <span style={{ background: bg, color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, display: "inline-block", whiteSpace: "nowrap" }}>{children}</span>
);

const ProgressBar = ({ value, color = T.teal, track = T.line, height = 8 }: any) => (
  <div style={{ width: "100%", height, background: track, borderRadius: 999, overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" }} />
  </div>
);

const GrowthRings = ({ progress, size = 180 }: any) => {
  const depts = Object.keys(progress);
  const cx = size / 2, cy = size / 2;
  const baseR = size * 0.16, step = size * 0.11;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {depts.map((d, i) => {
        const r = baseR + i * step, circ = 2 * Math.PI * r;
        const dash = (progress[d] / 100) * circ;
        return (
          <g key={d} transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.line} strokeWidth={6} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={deptColor(d)} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
          </g>
        );
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.13} fontWeight={600} fill={T.ink} fontFamily="Fraunces, serif">
        {Math.round(depts.reduce((a, d) => a + progress[d], 0) / depts.length)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={size * 0.055} fill={T.inkFaint}>overall</text>
    </svg>
  );
};

const EmptyState = ({ icon: Icon, title, body, actionLabel = undefined, onAction = undefined }: any) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: T.inkFaint }}>
    <Icon size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
    <div className="rast-serif" style={{ fontSize: 16, color: T.ink, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, marginBottom: actionLabel ? 16 : 0 }}>{body}</div>
    {actionLabel && (
      <button onClick={onAction} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{actionLabel}</button>
    )}
  </div>
);

const SectionLabel = ({ children }: any) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.inkFaint, marginBottom: 10 }}>{children}</div>
);

/* ─────────────────────────────────────────────────────────────────
   RAST LOGO SVG (from the uploaded image)
───────────────────────────────────────────────────────────────── */
const RastLogo = ({ size = 40 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "#1a4a2a", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #c8a84b", flexShrink: 0 }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 50 50" fill="none">
      {/* Book */}
      <path d="M10 36 L25 30 L40 36 L40 14 L25 8 L10 14 Z" fill="none" stroke="#c8a84b" strokeWidth="2"/>
      <line x1="25" y1="8" x2="25" y2="30" stroke="#c8a84b" strokeWidth="1.5"/>
      {/* Globe */}
      <circle cx="25" cy="24" r="8" fill="none" stroke="white" strokeWidth="1.5"/>
      <ellipse cx="25" cy="24" rx="4" ry="8" fill="none" stroke="white" strokeWidth="1"/>
      <line x1="17" y1="24" x2="33" y2="24" stroke="white" strokeWidth="1"/>
      {/* Crescent */}
      <path d="M22 10 Q18 13 22 16 Q19 13 22 10Z" fill="#c8a84b"/>
      {/* Star */}
      <polygon points="25,10 26,13 29,13 27,15 28,18 25,16 22,18 23,15 21,13 24,13" fill="#c8a84b" transform="scale(0.4) translate(38,12)"/>
    </svg>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────────────── */
const NAV: Record<string, { id: string; label: string; icon: any }[]> = {
  therapist: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "assessments", label: "Assessments", icon: ClipboardList },
    { id: "goals", label: "Goals", icon: Target },
    { id: "meetings", label: "Meetings", icon: MessageCircle },
  ],
  parent: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "health-history", label: "Health & case history", icon: Stethoscope },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "meetings", label: "Meetings", icon: MessageCircle },
  ],
  student: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "schedule", label: "My schedule", icon: Calendar },
    { id: "progress", label: "My progress", icon: TrendingUp },
    { id: "reports", label: "My reports", icon: FileText },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "staff", label: "Staff", icon: Stethoscope },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "scheduling", label: "Scheduling", icon: Clock },
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ],
};

const ROLE_META: Record<string, { label: string; sub: string; initials: string }> = {
  therapist: { label: "Abeeha Fatima Danish", sub: "Speech Therapist", initials: "AF" },
  parent: { label: "Sana Ahmed", sub: "Parent", initials: "SA" },
  student: { label: "Abdul Ahad", sub: "Student", initials: "AA" },
  admin: { label: "Zoya Farooqui", sub: "Administrator", initials: "ZF" },
};

/* ─────────────────────────────────────────────────────────────────
   ROLE SWITCHER (LOGIN SCREEN)
───────────────────────────────────────────────────────────────── */
const RoleSelect = ({ onSelect }: { onSelect: (r: string) => void }) => {
  const roles = [
    { id: "student", label: "Student", icon: Baby, blurb: "View your schedule, progress and reports." },
    { id: "therapist", label: "Therapist", icon: Stethoscope, blurb: "Manage assigned students and daily reports." },
    { id: "parent", label: "Parent", icon: Users, blurb: "Follow your child's therapy and progress." },
    { id: "admin", label: "Admin", icon: GraduationCap, blurb: "Run the school — students, staff, analytics." },
  ];
  return (
    <div className="rast-root" style={{ minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <RastLogo size={64} />
          </div>
          <div className="rast-serif" style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>RAST Schooling System</div>
          <div style={{ fontSize: 13, color: T.inkFaint }}>Choose a role to preview the platform</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {roles.map((r) => (
            <button key={r.id} onClick={() => onSelect(r.id)} className="rast-card" style={{ padding: 20, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.tealSoft, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: 12.5, color: T.inkFaint, lineHeight: 1.4 }}>{r.blurb}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FORM FIELD RENDERER (shared)
───────────────────────────────────────────────────────────────── */
const renderFormField = (field: any, form: any, setField: (k: string, v: any) => void) => {
  if (field.condition && !field.condition(form)) return null;
  const value = form[field.name] || "";
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };

  if (field.type === "yesno") return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Yes","No"].map(opt => (
        <button key={opt} onClick={() => setField(field.name, opt)} style={{ flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${value === opt ? T.teal : T.line}`, background: value === opt ? T.teal : "white", color: value === opt ? "white" : T.ink, fontWeight: 600, fontSize: 12 }}>{opt}</button>
      ))}
    </div>
  );
  if (field.type === "multiselect") {
    const sel = Array.isArray(value) ? value : [];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {field.options?.map((opt: string) => (
          <button key={opt} onClick={() => setField(field.name, sel.includes(opt) ? sel.filter((i: string) => i !== opt) : [...sel, opt])} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, border: `1px solid ${sel.includes(opt) ? T.teal : T.line}`, background: sel.includes(opt) ? T.teal : "white", color: sel.includes(opt) ? "white" : T.ink, fontWeight: 500 }}>{opt}</button>
        ))}
      </div>
    );
  }
  if (field.type === "select") return (
    <select value={value} onChange={(e) => setField(field.name, e.target.value)} style={{ ...base, cursor: "pointer" }}>
      <option value="">Select...</option>
      {(field.options || STUDENTS.map((s: any) => s.name))?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
  if (field.type === "textarea") return <textarea value={value} onChange={(e) => setField(field.name, e.target.value)} rows={3} style={{ ...base, resize: "vertical" }} />;
  return <input type={field.type || "text"} value={value} onChange={(e) => setField(field.name, e.target.value)} style={base} />;
};

/* ─────────────────────────────────────────────────────────────────
   DAILY REPORT FORM
───────────────────────────────────────────────────────────────── */
const DailyReportForm = ({ student, onClose }: any) => {
  const [selectedReportType, setSelectedReportType] = useState("Behaviour Therapy");
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const reportConfig = DAILY_REPORT_FORMS[selectedReportType];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="rast-card rast-fade-in" style={{ width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.coral, textTransform: "uppercase", letterSpacing: 0.5 }}>Daily Coverage Report</div>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{student?.name || "Select Student"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div className="rast-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 22 }}>
            {Object.keys(DAILY_REPORT_FORMS).map((type) => (
              <button key={type} onClick={() => setSelectedReportType(type)} style={{ padding: "10px 12px", borderRadius: 8, border: `2px solid ${selectedReportType === type ? T.teal : T.line}`, background: selectedReportType === type ? T.tealSoft : "white", color: selectedReportType === type ? T.teal : T.ink, cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}>
                {reportConfig && DAILY_REPORT_FORMS[type].icon} {type}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reportConfig.fields.map((field: any) => (
              <div key={field.name}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{field.label}{field.required && <span style={{ color: T.coral }}> *</span>}</label>
                {renderFormField(field, form, set)}
              </div>
            ))}
          </div>
          {saved && <div style={{ marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Report saved successfully!</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} className="rast-btn-ghost" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => setSaved(true)} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Save size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Submit</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   INFORMAL ASSESSMENT FORM
───────────────────────────────────────────────────────────────── */
const InformalAssessmentForm = ({ student, onClose, onSubmit }: any) => {
  const [selectedStudent, setSelectedStudent] = useState(student?.id || "");
  const [section, setSection] = useState(0);
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const sections = INFORMAL_ASSESSMENT_FORM.sections;
  const sec = sections[section];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="rast-card rast-fade-in" style={{ width: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Informal Assessment Checklist</div>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{STUDENTS.find(s => s.id === selectedStudent)?.name || "Select Student"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "12px 22px", borderBottom: `1px solid ${T.line}`, overflowX: "auto" }} className="rast-scroll">
          {sections.map((s, i) => (
            <button key={s.name} onClick={() => setSection(i)} style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${i === section ? T.teal : T.line}`, background: i === section ? T.teal : "white", color: i === section ? "white" : T.ink }}>{s.label}</button>
          ))}
        </div>
        <div className="rast-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Student *</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={Boolean(student)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, opacity: student ? 0.7 : 1 }}>
              <option value="">Select a student</option>
              {STUDENTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sec.fields.map((field: any) => (
              <div key={field.name}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{field.label}{field.required && <span style={{ color: T.coral }}> *</span>}</label>
                {renderFormField(field, form, set)}
              </div>
            ))}
          </div>
          {saved && <div style={{ marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Assessment completed!</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button onClick={() => setSection(Math.max(0, section - 1))} disabled={section === 0} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: section === 0 ? "default" : "pointer", opacity: section === 0 ? 0.4 : 1, border: `1px solid ${T.line}`, background: "white" }}>← Previous</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} className="rast-btn-ghost" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            {section < sections.length - 1
              ? <button onClick={() => setSection(section + 1)} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Next →</button>
              : <button onClick={() => { onSubmit(selectedStudent, form); setSaved(true); }} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Submit</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   STUDENT PROFILE
───────────────────────────────────────────────────────────────── */
const StudentProfile = ({ student, onBack, onOpenReport }: any) => {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Case history", "Assessments", "Therapy", "Goals", "Attendance", "Reports", "Meetings"];
  const goals = GOALS.filter((g) => g.studentId === student.id);
  const sessions = SESSIONS.filter((s) => s.studentId === student.id);
  const daysPerWeek = SEVERITY_DAYS[student.severity] || 3;

  return (
    <div className="rast-fade-in">
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkFaint, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 16 }}><ArrowLeft size={14} /> All students</button>
      <div className="rast-card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar initials={student.photo} size={56} />
            <div>
              <div className="rast-serif" style={{ fontSize: 21, fontWeight: 600 }}>{student.name}</div>
              <div style={{ fontSize: 13, color: T.inkFaint, marginTop: 2 }}>{student.studentId} · Age {student.age} · House: {student.house} · {student.shift}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <Pill color={student.severity === "Severe" ? T.coral : student.severity === "Moderate" ? T.gold : T.sage} bg={(student.severity === "Severe" ? T.coral : student.severity === "Moderate" ? T.gold : T.sage) + "22"}>{student.severity}</Pill>
                <Pill color={T.teal} bg={T.tealSoft}>{daysPerWeek} days/week</Pill>
                <Pill color={T.inkFaint} bg={T.line}>Fee: Rs {student.monthlyFee.toLocaleString()}/mo</Pill>
                {student.departments.map((d: string) => <Pill key={d} color={deptColor(d)} bg={deptColor(d) + "22"}>{DEPARTMENTS.find(dp => dp.name === d)?.abbr || d}</Pill>)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Pill color={student.status === "Active" ? T.sage : T.coral} bg={student.status === "Active" ? T.sageSoft : T.coralSoft}>{student.status}</Pill>
            <button onClick={onOpenReport} className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add daily report</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, borderBottom: `1px solid ${T.line}`, marginBottom: 20, overflowX: "auto" }} className="rast-scroll">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className="rast-tab" style={{ background: "none", border: "none", padding: "0 2px 12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: tab === t ? T.teal : T.inkFaint, borderBottom: `2px solid ${tab === t ? T.teal : "transparent"}` }}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
          <div className="rast-card" style={{ padding: 20 }}>
            <SectionLabel>Health summary</SectionLabel>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Diagnosis:</strong> {student.diagnosis || "Not recorded"}</div>
              <div><strong>Allergies:</strong> {student.allergies || "Not recorded"}</div>
              <div><strong>Emergency contact:</strong> {student.emergencyContact || "Not recorded"}</div>
              <div><strong>Parent:</strong> {student.parent} · {student.phone}</div>
            </div>
            <div style={{ height: 1, background: T.line, margin: "16px 0" }} />
            <SectionLabel>Assigned Therapists</SectionLabel>
            {student.departments.map((d: string) => {
              const thId = student.assignedTherapists[d];
              const th = STAFF.find(s => s.id === thId);
              return (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.line}`, fontSize: 13 }}>
                  <span style={{ color: deptColor(d), fontWeight: 600 }}>{d}</span>
                  <span style={{ color: T.inkSoft }}>{th?.name || "Unassigned"}</span>
                </div>
              );
            })}
          </div>
          <div className="rast-card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SectionLabel>Overall progress</SectionLabel>
            <GrowthRings progress={student.progress} />
          </div>
        </div>
      )}
      {tab === "Therapy" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{sessions.length ? sessions.map((s: any) => <div key={s.id} className="rast-card" style={{ padding: 16 }}>{s.dept} · {s.date} · {s.status}</div>) : <EmptyState icon={Activity} title="No therapy sessions recorded yet" body="Sessions will appear here once logged." />}</div>}
      {tab === "Goals" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{goals.length ? goals.map((g: any) => <div key={g.id} className="rast-card" style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</span><span>{g.progress}%</span></div><ProgressBar value={g.progress} color={deptColor(g.dept)} /></div>) : <EmptyState icon={Target} title="No goals recorded yet" body="Goals will appear here once added." />}</div>}
      {(tab === "Case history" || tab === "Assessments" || tab === "Attendance" || tab === "Reports" || tab === "Meetings") && <EmptyState icon={FolderOpen} title={`No ${tab.toLowerCase()} records yet`} body="Records will appear here once they are saved." />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADD STUDENT FORM  (Admin — updated with new fields)
───────────────────────────────────────────────────────────────── */
const AddStudentForm = ({ onClose, onSubmit }: any) => {
  const [step, setStep] = useState<"basic" | "health">("basic");
  const [form, setForm] = useState<any>({ shift: "1st Shift", severity: "Moderate", status: "Active", monthlyFee: 8000 });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };
  const Label = ({ children }: any) => <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{children}</label>;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="rast-card rast-fade-in" style={{ width: 680, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sage, textTransform: "uppercase", letterSpacing: 0.5 }}>Add New Student</div>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Student Enrollment</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkFaint }}><X size={20} /></button>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.line}` }}>
          {[["basic","Basic Info"],["health","Health & Case History"]].map(([s, label]) => (
            <button key={s} onClick={() => setStep(s as any)} style={{ flex: 1, padding: "12px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: step === s ? T.tealSoft : "transparent", color: step === s ? T.teal : T.inkFaint, borderBottom: `2px solid ${step === s ? T.teal : "transparent"}` }}>{label}</button>
          ))}
        </div>

        <div className="rast-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          {step === "basic" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><Label>Student Name *</Label><input value={form.name || ""} onChange={e => set("name", e.target.value)} style={base} /></div>
              <div><Label>Father's Name</Label><input value={form.father || ""} onChange={e => set("father", e.target.value)} style={base} /></div>
              <div><Label>Date of Birth</Label><input type="date" value={form.dob || ""} onChange={e => set("dob", e.target.value)} style={base} /></div>
              <div><Label>Age</Label><input type="number" value={form.age || ""} onChange={e => set("age", e.target.value)} style={base} /></div>
              <div><Label>Gender</Label><select value={form.gender || ""} onChange={e => set("gender", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
              <div><Label>House</Label><input value={form.house || ""} onChange={e => set("house", e.target.value)} placeholder="e.g. Green House" style={base} /></div>
              <div><Label>Shift</Label><select value={form.shift || ""} onChange={e => set("shift", e.target.value)} style={{ ...base, cursor: "pointer" }}><option>1st Shift</option><option>2nd Shift</option></select></div>
              <div><Label>Severity</Label><select value={form.severity || "Moderate"} onChange={e => set("severity", e.target.value)} style={{ ...base, cursor: "pointer" }}><option>Mild</option><option>Moderate</option><option>Severe</option></select></div>
              <div><Label>Monthly Fee (Rs)</Label><input type="number" value={form.monthlyFee || ""} onChange={e => set("monthlyFee", Number(e.target.value))} style={base} /></div>
              <div><Label>Status</Label><select value={form.status || "Active"} onChange={e => set("status", e.target.value)} style={{ ...base, cursor: "pointer" }}><option>Active</option><option>Inactive</option></select></div>
              <div><Label>Parent/Guardian Name</Label><input value={form.parent || ""} onChange={e => set("parent", e.target.value)} style={base} /></div>
              <div><Label>Phone Number</Label><input type="tel" value={form.phone || ""} onChange={e => set("phone", e.target.value)} style={base} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Diagnosis</Label><input value={form.diagnosis || ""} onChange={e => set("diagnosis", e.target.value)} style={base} /></div>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Departments</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DEPARTMENTS.map(d => {
                    const sel = (form.departments || []).includes(d.name);
                    return <button key={d.id} onClick={() => set("departments", sel ? (form.departments || []).filter((x: string) => x !== d.name) : [...(form.departments || []), d.name])} style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, border: `1px solid ${sel ? d.color : T.line}`, background: sel ? d.color + "22" : "white", color: sel ? d.color : T.inkSoft }}>{d.abbr} {d.name.replace(" Therapy","")}</button>;
                  })}
                </div>
              </div>
            </div>
          )}

          {step === "health" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Parental & Delivery */}
              <div style={{ gridColumn: "1/-1" }}><SectionLabel>Parental & Delivery History</SectionLabel></div>
              <div><Label>Length of pregnancy</Label><input value={form.pregnancyLength || ""} onChange={e => set("pregnancyLength", e.target.value)} style={base} /></div>
              <div><Label>Birth weight</Label><input value={form.birthWeight || ""} onChange={e => set("birthWeight", e.target.value)} style={base} /></div>
              <div><Label>Complications during pregnancy?</Label><select value={form.pregnancyComplications || ""} onChange={e => set("pregnancyComplications", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div><Label>NICU?</Label><select value={form.nicu || ""} onChange={e => set("nicu", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Hospital of delivery</Label><input value={form.deliveryHospital || ""} onChange={e => set("deliveryHospital", e.target.value)} style={base} /></div>
              {/* Health */}
              <div style={{ gridColumn: "1/-1" }}><SectionLabel>Health History</SectionLabel></div>
              <div><Label>Fever greater than 104?</Label><select value={form.fever104 || ""} onChange={e => set("fever104", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div><Label>Ever hospitalized?</Label><select value={form.hospitalized || ""} onChange={e => set("hospitalized", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div><Label>Diagnosed condition?</Label><select value={form.diagnosedCondition || ""} onChange={e => set("diagnosedCondition", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Diagnosis details</Label><textarea value={form.diagnosisDetails || ""} onChange={e => set("diagnosisDetails", e.target.value)} rows={3} style={{ ...base, resize: "vertical" }} /></div>
              {/* Development */}
              <div style={{ gridColumn: "1/-1" }}><SectionLabel>Development Milestones</SectionLabel></div>
              <div><Label>Age at first word</Label><input value={form.firstWordAge || ""} onChange={e => set("firstWordAge", e.target.value)} style={base} /></div>
              <div><Label>Age walked alone</Label><input value={form.walkAloneAge || ""} onChange={e => set("walkAloneAge", e.target.value)} style={base} /></div>
              <div><Label>Communication</Label><select value={form.communication || ""} onChange={e => set("communication", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Fluent</option><option>Minimal</option><option>Less communicative</option><option>Not at all</option></select></div>
              <div><Label>Speech concerns?</Label><select value={form.speechConcerns || ""} onChange={e => set("speechConcerns", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option><option>Yes</option><option>No</option></select></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Previous therapies (names & durations)</Label><textarea value={form.therapies || ""} onChange={e => set("therapies", e.target.value)} rows={2} style={{ ...base, resize: "vertical" }} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Allergies</Label><input value={form.allergies || ""} onChange={e => set("allergies", e.target.value)} style={base} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Additional notes</Label><textarea value={form.additionalNotes || ""} onChange={e => set("additionalNotes", e.target.value)} rows={3} style={{ ...base, resize: "vertical" }} /></div>
            </div>
          )}

          {saved && <div style={{ marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Student added! ⚠️ Therapist must complete Informal Assessment.</div>}
        </div>

        <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button onClick={onClose} className="rast-btn-ghost" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <div style={{ display: "flex", gap: 8 }}>
            {step === "basic" && <button onClick={() => setStep("health")} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Next: Health History →</button>}
            {step === "health" && (
              <>
                <button onClick={() => setStep("basic")} className="rast-btn-ghost" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                <button onClick={() => { onSubmit(form); setSaved(true); }} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Student</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADD STAFF FORM
───────────────────────────────────────────────────────────────── */
const AddStaffForm = ({ onClose, onSubmit }: any) => {
  const [form, setForm] = useState<any>({ shift: "1st Shift", daysScheduled: ["Monday","Tuesday","Wednesday","Thursday","Friday"] });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="rast-card rast-fade-in" style={{ width: 600, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: 0.5 }}>Add Staff Member</div>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>New Staff</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div className="rast-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Full Name *</label><input value={form.name || ""} onChange={e => set("name", e.target.value)} style={base} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Role / Title</label><input value={form.role || ""} onChange={e => set("role", e.target.value)} placeholder="e.g. Speech Therapist" style={base} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Department</label><select value={form.dept || ""} onChange={e => set("dept", e.target.value)} style={{ ...base, cursor: "pointer" }}><option value="">Select</option>{DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Shift</label><select value={form.shift} onChange={e => set("shift", e.target.value)} style={{ ...base, cursor: "pointer" }}><option>1st Shift</option><option>2nd Shift</option></select></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Phone</label><input type="tel" value={form.phone || ""} onChange={e => set("phone", e.target.value)} style={base} /></div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Scheduled Days</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => {
                  const sel = (form.daysScheduled || []).includes(d);
                  return <button key={d} onClick={() => set("daysScheduled", sel ? (form.daysScheduled || []).filter((x: string) => x !== d) : [...(form.daysScheduled || []), d])} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, border: `1px solid ${sel ? T.teal : T.line}`, background: sel ? T.tealSoft : "white", color: sel ? T.teal : T.inkFaint }}>{d.slice(0,3)}</button>;
                })}
              </div>
            </div>
          </div>
          {saved && <div style={{ marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Staff member added!</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} className="rast-btn-ghost" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { onSubmit(form); setSaved(true); }} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Staff</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   THERAPIST VIEWS
───────────────────────────────────────────────────────────────── */
const TherapistDashboard = ({ onOpenStudent, onShowReport, onChangeTab, onShowAssessment }: any) => {
  const myStudents = STUDENTS.filter((s) => STAFF[0].id && s.assignedTherapists && Object.values(s.assignedTherapists).includes(STAFF[0].id));
  const today = SESSIONS.filter((s) => s.date === "2026-10-24");
  const pendingAssessments = STUDENTS.filter((s) => ASSESSMENT_STATUS[s.id] === false);

  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Good morning, Abeeha</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Here's what's happening with your students today.</div>
      {pendingAssessments.length > 0 && (
        <div className="rast-card" style={{ padding: 14, marginBottom: 20, borderLeft: `4px solid ${T.gold}`, background: T.goldSoft, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={18} color={T.gold} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{pendingAssessments.length} student(s) need Informal Assessment</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{pendingAssessments.map(s => s.name).join(", ")}</div>
          </div>
          <button onClick={() => onShowAssessment(pendingAssessments[0])} className="rast-btn-primary" style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Start now</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Assigned students", value: STUDENTS.length, icon: Users },
          { label: "Today's sessions", value: today.length, icon: Clock },
          { label: "Pending reports", value: 2, icon: AlertCircle, accent: true },
          { label: "Completed this week", value: 11, icon: CheckCircle2 },
        ].map((c) => (
          <div key={c.label} className="rast-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600 }}>{c.label}</div><c.icon size={16} color={c.accent ? T.coral : T.inkFaint} /></div>
            <div className="rast-serif" style={{ fontSize: 28, fontWeight: 600, marginTop: 6, color: (c as any).accent ? T.coral : T.ink }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel>Today's sessions</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
            {today.map((s, i) => {
              const student = STUDENTS.find((st) => st.id === s.studentId);
              if (!student) return null;
              return (
                <div key={s.id} onClick={() => onOpenStudent(student)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < today.length - 1 ? `1px solid ${T.line}` : "none", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }}>{s.time}</div>
                  <Avatar initials={student.photo} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint }}>{s.dept}</div>
                  </div>
                  <ChevronRight size={16} color={T.inkFaint} />
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <SectionLabel>Quick actions</SectionLabel>
          <div className="rast-card" style={{ padding: 8, marginBottom: 22 }}>
            {[
              { label: "Add daily coverage report", action: onShowReport },
              { label: "View students", action: () => onChangeTab("students") },
            ].map((item, i) => (
              <div key={item.label} onClick={item.action} style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: i < 1 ? `1px solid ${T.line}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.label} <ChevronRight size={14} color={T.inkFaint} />
              </div>
            ))}
          </div>
          <SectionLabel>Notifications</SectionLabel>
          <div className="rast-card" style={{ padding: 14 }}>
            {NOTIFICATIONS.therapist.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5, padding: "8px 0", borderBottom: i < NOTIFICATIONS.therapist.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div>{n.text}</div><div style={{ color: T.inkFaint, fontSize: 11, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TherapistStudents = ({ onOpenStudent }: any) => {
  const [q, setQ] = useState("");
  const filtered = STUDENTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rast-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>My students</div>
        <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 10, top: 9, color: T.inkFaint }} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." style={{ padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 220 }} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {filtered.map((s) => (
          <div key={s.id} onClick={() => onOpenStudent(s)} className="rast-card" style={{ padding: 16, cursor: "pointer", display: "flex", gap: 12 }}>
            <Avatar initials={s.photo} size={44} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: T.inkFaint }}>{s.studentId} · {s.shift}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {s.departments.slice(0,2).map((d) => <Pill key={d} color={deptColor(d)} bg={deptColor(d) + "22"}>{DEPARTMENTS.find(dp => dp.name === d)?.abbr || d}</Pill>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   PARENT & STUDENT VIEWS
───────────────────────────────────────────────────────────────── */
const ParentDashboard = () => {
  const child = STUDENTS[0];
  const todaySessions = SESSIONS.filter((s) => s.studentId === child.id && s.date === "2026-10-24");
  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Good afternoon, Sana</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Here's how {child.name} is doing.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel>Today's schedule</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
            {todaySessions.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < todaySessions.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }}>{s.time}</div>
                <div style={{ width: 4, height: 30, background: deptColor(s.dept), borderRadius: 4 }} />
                <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.dept}</div><div style={{ fontSize: 12, color: T.inkFaint }}>with {s.therapist}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Progress</SectionLabel>
          <div className="rast-card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <GrowthRings progress={child.progress} size={150} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const me = STUDENTS[0];
  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Welcome, {me.name}</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Here's your week at RAST.</div>
      <div className="rast-card" style={{ padding: 20, display: "flex", justifyContent: "center" }}><GrowthRings progress={me.progress} /></div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN DASHBOARD  (updated with new KPIs)
───────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const totalStudents = STUDENTS.length;
  const activeStudents = STUDENTS.filter(s => s.status === "Active").length;
  const msgToday = MESSAGES_TODAY.length;
  const msgResponded = MESSAGES_TODAY.filter(m => m.responded).length;
  const msgUnattended = MESSAGES_TODAY.filter(m => !m.responded).length;
  const today = "2026-10-24";
  const presentStaff = STAFF.filter(th => th.attendance[today]?.clockIn).length;

  return (
    <div className="rast-fade-in">
      {/* Header with RAST Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <RastLogo size={56} />
        <div>
          <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600 }}>RAST Schooling System</div>
          <div style={{ fontSize: 13.5, color: T.inkFaint }}>Saturday, 24 October 2026 · Admin Dashboard</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Registered Students", value: totalStudents, icon: Users, color: T.teal, bg: T.tealSoft },
          { label: "Active Students", value: activeStudents, icon: UserCheck, color: T.sage, bg: T.sageSoft },
          { label: "Messages Received Today", value: msgToday, icon: MessageCircle, color: T.gold, bg: T.goldSoft },
          { label: "Messages Responded Today", value: msgResponded, icon: CheckCircle2, color: T.sage, bg: T.sageSoft },
          { label: "Unattended Messages", value: msgUnattended, icon: AlertCircle, color: T.coral, bg: T.coralSoft },
        ].map(c => (
          <div key={c.label} className="rast-card" style={{ padding: 16, borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><c.icon size={16} color={c.color} /></div>
            </div>
            <div className="rast-serif" style={{ fontSize: 28, fontWeight: 600, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 4, fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Today's staff attendance summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <div>
          <SectionLabel>Today's Staff Attendance</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", borderBottom: `1px solid ${T.line}` }}>
              <div>Therapist</div><div>Clock-In</div><div>Clock-Out</div><div>Slots / Status</div>
            </div>
            {STAFF.map((th, i) => {
              const att = th.attendance[today];
              const slots = att ? makeSlots(att.clockIn, att.clockOut).length : 0;
              return (
                <div key={th.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 13, alignItems: "center", borderBottom: i < STAFF.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <div style={{ fontWeight: 600 }}>{th.name.split(" ")[0]} {th.name.split(" ")[1]?.[0]}.</div>
                  <div style={{ color: att ? T.sage : T.coral }}>{att?.clockIn || "—"}</div>
                  <div style={{ color: att ? T.sage : T.coral }}>{att?.clockOut || "—"}</div>
                  <div>{att ? <Pill color={T.teal} bg={T.tealSoft}>{slots} slots</Pill> : <Pill color={T.coral} bg={T.coralSoft}>Absent</Pill>}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>Unresponded Messages</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 18 }}>
            {MESSAGES_TODAY.filter(m => !m.responded).map((msg, i, arr) => (
              <div key={msg.id} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.from}</span>
                  <span style={{ fontSize: 11, color: T.inkFaint }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{msg.text}</div>
              </div>
            ))}
          </div>

          <SectionLabel>Notifications</SectionLabel>
          <div className="rast-card" style={{ padding: 14 }}>
            {NOTIFICATIONS.admin.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5, padding: "8px 0", borderBottom: i < NOTIFICATIONS.admin.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div>{n.text}</div><div style={{ color: T.inkFaint, fontSize: 11, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students by Shift & Dept */}
      <div className="rast-card" style={{ padding: 20 }}>
        <SectionLabel>Students by Shift & Department</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            {(["1st Shift","2nd Shift"] as const).map(shift => {
              const count = STUDENTS.filter(s => s.shift === shift).length;
              return (
                <div key={shift} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{shift}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
                  <ProgressBar value={(count / totalStudents) * 100} color={T.teal} />
                </div>
              );
            })}
          </div>
          <div>
            {DEPARTMENTS.slice(0, 4).map(d => {
              const count = STUDENTS.filter(s => s.departments.includes(d.name)).length;
              return (
                <div key={d.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{d.abbr} {d.name.replace(" Therapy","")}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
                  <ProgressBar value={(count / totalStudents) * 100} color={d.color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN STUDENTS
───────────────────────────────────────────────────────────────── */
const AdminStudents = ({ onOpenStudent, onShowAddStudent }: any) => {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All"|"Active"|"Inactive">("All");
  const filtered = STUDENTS.filter(s =>
    (filter === "All" || s.status === filter) &&
    s.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="rast-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>All Students</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 10, top: 9, color: T.inkFaint }} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{ padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 200 }} /></div>
          <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, cursor: "pointer" }}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
          <button onClick={() => onShowAddStudent(true)} className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add Student</button>
        </div>
      </div>
      <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.line}` }}>
          <div>Student</div><div>Shift</div><div>House</div><div>Severity</div><div>Departments</div><div>Status</div>
        </div>
        {filtered.map((s) => (
          <div key={s.id} onClick={() => onOpenStudent(s)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 18px", alignItems: "center", borderBottom: `1px solid ${T.line}`, cursor: "pointer", fontSize: 13 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Avatar initials={s.photo} size={30} /><div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: T.inkFaint }}>{s.studentId}</div></div></div>
            <div style={{ color: T.inkSoft }}>{s.shift}</div>
            <div style={{ color: T.inkSoft }}>{s.house}</div>
            <Pill color={s.severity === "Severe" ? T.coral : s.severity === "Moderate" ? T.gold : T.sage} bg={(s.severity === "Severe" ? T.coral : s.severity === "Moderate" ? T.gold : T.sage) + "22"}>{s.severity}</Pill>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{s.departments.slice(0,2).map(d => <Pill key={d} color={deptColor(d)} bg={deptColor(d) + "22"}>{DEPARTMENTS.find(dp => dp.name === d)?.abbr || "?"}</Pill>)}</div>
            <Pill color={s.status === "Active" ? T.sage : T.coral} bg={s.status === "Active" ? T.sageSoft : T.coralSoft}>{s.status}</Pill>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN STAFF
───────────────────────────────────────────────────────────────── */
const AdminStaff = ({ onShowAddStaff }: any) => (
  <div className="rast-fade-in">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>Staff & Therapists</div>
      <button onClick={() => onShowAddStaff(true)} className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add Staff</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {STAFF.map(th => {
        const att = th.attendance["2026-10-24"];
        const slots = att ? makeSlots(att.clockIn, att.clockOut).length : 0;
        return (
          <div key={th.id} className="rast-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <Avatar initials={th.name.split(" ").map(w => w[0]).join("").slice(0,2)} size={44} bg={deptColor(th.dept) + "22"} color={deptColor(th.dept)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{th.name}</div>
                <div style={{ fontSize: 12, color: T.inkFaint }}>{th.role} · {th.dept}</div>
                <div style={{ fontSize: 12, color: T.inkFaint }}>{th.shift}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {th.daysScheduled.map(d => <Pill key={d} color={T.teal} bg={T.tealSoft}>{d.slice(0,3)}</Pill>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: T.paper, borderRadius: 8 }}>
              <div style={{ fontSize: 12 }}><span style={{ fontWeight: 600 }}>Today:</span> {att ? `${att.clockIn} – ${att.clockOut}` : "Not clocked in"}</div>
              {att ? <Pill color={T.teal} bg={T.tealSoft}>{slots} slots available</Pill> : <Pill color={T.coral} bg={T.coralSoft}>Absent</Pill>}
            </div>
            <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 8 }}>
              Students assigned: {STUDENTS.filter(s => Object.values(s.assignedTherapists).includes(th.id)).length}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   ADMIN ATTENDANCE  (clock-in/out entry + monthly summary table)
───────────────────────────────────────────────────────────────── */
const AdminAttendance = () => {
  const today = "2026-10-24";
  const [attendData, setAttendData] = useState<Record<string, { clockIn: string; clockOut: string }>>(
    Object.fromEntries(STAFF.map(th => [th.id, { clockIn: th.attendance[today]?.clockIn || "", clockOut: th.attendance[today]?.clockOut || "" }]))
  );
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"daily"|"monthly">("daily");

  const saveAttendance = () => {
    STAFF.forEach(th => { th.attendance[today] = attendData[th.id]; });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Monthly summary mock
  const monthlySummary = STAFF.map(th => ({
    name: th.name,
    workingDays: 17, absent: th.id === "th4" ? 3 : 1,
    OT: th.id === "th1" ? 5 : th.id === "th2" ? 4 : 2,
    BT: 6,
    ST: th.id === "th1" ? 3 : th.id === "th3" ? 9 : 5,
    RT: 11, SP: th.id === "th1" ? 11 : 5,
    P: th.id === "th1" ? 1 : 4, C: 0, avgDay: 2.7, flag: "Regular",
  }));

  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Attendance</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 20 }}>Daily clock-in/out entry and monthly summary</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["daily","monthly"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${activeTab === t ? T.teal : T.line}`, background: activeTab === t ? T.tealSoft : "white", color: activeTab === t ? T.teal : T.inkFaint }}>
            {t === "daily" ? "Daily Entry" : "Monthly Summary"}
          </button>
        ))}
      </div>

      {activeTab === "daily" && (
        <>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "12px 18px", background: T.tealSoft, borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.teal }}>📅 {today} — Daily Clock-In/Out</div>
              <div style={{ fontSize: 12, color: T.inkFaint }}>Empty fields = Absent</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", borderBottom: `1px solid ${T.line}` }}>
              <div>Therapist</div><div>Clock-In</div><div>Clock-Out</div><div>30-min Slots</div>
            </div>
            {STAFF.map((th, i) => {
              const att = attendData[th.id];
              const slots = att.clockIn && att.clockOut ? makeSlots(att.clockIn, att.clockOut).length : 0;
              return (
                <div key={th.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr", padding: "12px 18px", alignItems: "center", borderBottom: i < STAFF.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{th.name}</div>
                    <div style={{ fontSize: 11, color: T.inkFaint }}>{th.dept}</div>
                  </div>
                  <div><input type="time" value={att.clockIn} onChange={e => setAttendData(d => ({ ...d, [th.id]: { ...d[th.id], clockIn: e.target.value } }))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13, width: 110 }} /></div>
                  <div><input type="time" value={att.clockOut} onChange={e => setAttendData(d => ({ ...d, [th.id]: { ...d[th.id], clockOut: e.target.value } }))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13, width: 110 }} /></div>
                  <div>
                    {slots > 0 ? (
                      <div>
                        <Pill color={T.teal} bg={T.tealSoft}>{slots} slots</Pill>
                        <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 3 }}>{slots * 30} mins total</div>
                      </div>
                    ) : (
                      <Pill color={att.clockIn ? T.gold : T.coral} bg={att.clockIn ? T.goldSoft : T.coralSoft}>{att.clockIn ? "No clock-out" : "Absent"}</Pill>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {saved && <div style={{ padding: "9px 14px", background: T.sageSoft, borderRadius: 8, color: T.sage, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> Attendance saved</div>}
            <button onClick={saveAttendance} className="rast-btn-primary" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Save size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Save Attendance</button>
          </div>
        </>
      )}

      {activeTab === "monthly" && (
        <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", background: T.tealSoft, borderBottom: `1px solid ${T.line}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.teal }}>October 2026 — Monthly Summary</div>
            <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>O.T=Occ.Therapy  B.T=Behavior  S.T=Speech  R.T=Remedial  SP=Sports  P=Physio  C=Comp</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.paper }}>
                  {["Name","Working Days","Absent","O.T","B.T","S.T","R.T","SP","P","C","Avg/Day","Flag"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", fontSize: 10, borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.line}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{row.name.split(" ")[0]} {row.name.split(" ")[1]}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{row.workingDays}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: row.absent > 2 ? T.coral : T.ink }}>{row.absent}</td>
                    {[row.OT, row.BT, row.ST, row.RT, row.SP, row.P, row.C].map((v, j) => (
                      <td key={j} style={{ padding: "10px 12px", textAlign: "center" }}>{v}</td>
                    ))}
                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>{row.avgDay}</td>
                    <td style={{ padding: "10px 12px" }}><Pill color={T.sage} bg={T.sageSoft}>{row.flag}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN SCHEDULING  (uses app.py slot engine)
───────────────────────────────────────────────────────────────── */
const AdminScheduling = () => {
  const [activeTab, setActiveTab] = useState<"overview"|"slots"|"assign">("overview");

  // Compute dept slot availability from STAFF attendance today
  const today = "2026-10-24";
  const deptCapacity = DEPARTMENTS.map(dept => {
    const deptStaff = STAFF.filter(th => th.dept === dept.name);
    const totalSlots = deptStaff.reduce((sum, th) => {
      const att = th.attendance[today];
      return sum + (att ? makeSlots(att.clockIn, att.clockOut).length : 0);
    }, 0);
    const bookedSlots = STUDENTS.filter(s => s.departments.includes(dept.name) && s.status === "Active").length * (SEVERITY_DAYS[STUDENTS.find(s => s.departments.includes(dept.name))?.severity || "Moderate"] || 3) / 5; // rough daily demand
    return { dept, totalSlots, bookedSlots: Math.round(bookedSlots), available: Math.max(0, totalSlots - Math.round(bookedSlots)) };
  });

  // Per-therapist slot view
  const therapistSlots = STAFF.map(th => {
    const att = th.attendance[today];
    const slots = att ? makeSlots(att.clockIn, att.clockOut) : [];
    const assignedStudents = STUDENTS.filter(s => Object.values(s.assignedTherapists).includes(th.id) && s.status === "Active");
    const daysPerStudent = assignedStudents.map(s => SEVERITY_DAYS[s.severity] || 3);
    const weeklyDemand = daysPerStudent.reduce((a, b) => a + b, 0);
    const dailyDemand = Math.ceil(weeklyDemand / 5);
    return { th, slots, assignedStudents, dailyDemand, overbooked: dailyDemand > slots.length };
  });

  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Scheduling</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 20 }}>30-minute slots computed from therapist clock-in/out · Severity: Severe=4 days, Moderate=3, Mild=2</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {([["overview","Dept Overview"],["slots","Therapist Slots"],["assign","Student Assignment"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${activeTab === id ? T.teal : T.line}`, background: activeTab === id ? T.tealSoft : "white", color: activeTab === id ? T.teal : T.inkFaint }}>{label}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {deptCapacity.map(({ dept, totalSlots, bookedSlots, available }) => (
              <div key={dept.id} className="rast-card" style={{ padding: 16, borderTop: `3px solid ${dept.color}` }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{dept.name}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 12 }}>{dept.abbr}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div><div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, color: dept.color }}>{totalSlots}</div><div style={{ fontSize: 11, color: T.inkFaint }}>Total Slots Today</div></div>
                  <div style={{ textAlign: "right" }}><div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, color: available > 0 ? T.sage : T.coral }}>{available}</div><div style={{ fontSize: 11, color: T.inkFaint }}>Available</div></div>
                </div>
                <ProgressBar value={totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0} color={available > 0 ? dept.color : T.coral} />
                <div style={{ marginTop: 6, fontSize: 11, color: T.inkFaint }}>{bookedSlots} booked · {totalSlots} capacity</div>
                <div style={{ marginTop: 8 }}>
                  {available > 0
                    ? <Pill color={T.sage} bg={T.sageSoft}>✅ Can accept new admissions</Pill>
                    : <Pill color={T.coral} bg={T.coralSoft}>⚠️ Fully booked</Pill>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "slots" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {therapistSlots.map(({ th, slots, assignedStudents, dailyDemand, overbooked }) => (
            <div key={th.id} className="rast-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={th.name.split(" ").map(w => w[0]).join("").slice(0,2)} size={40} bg={deptColor(th.dept) + "22"} color={deptColor(th.dept)} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{th.name}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint }}>{th.dept} · {th.shift}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: overbooked ? T.coral : T.sage }}>{slots.length} slots / {dailyDemand} needed daily</div>
                  {overbooked && <Pill color={T.coral} bg={T.coralSoft}>⚠️ Overbooked by {dailyDemand - slots.length}</Pill>}
                </div>
              </div>
              {slots.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {slots.map((slot, i) => (
                    <div key={i} style={{ padding: "4px 10px", borderRadius: 6, background: i < dailyDemand ? T.tealSoft : T.paper, color: i < dailyDemand ? T.teal : T.inkFaint, fontSize: 12, fontWeight: 500, border: `1px solid ${i < dailyDemand ? T.teal : T.line}` }}>{slot}</div>
                  ))}
                </div>
              ) : (
                <Pill color={T.coral} bg={T.coralSoft}>No attendance recorded today</Pill>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: T.inkFaint }}>Assigned students: {assignedStudents.map(s => s.name).join(", ") || "None"}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "assign" && (
        <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", background: T.tealSoft, borderBottom: `1px solid ${T.line}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.teal }}>Student Department & Therapist Assignments</div>
          </div>
          {STUDENTS.filter(s => s.status === "Active").map((s, i, arr) => (
            <div key={s.id} style={{ padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar initials={s.photo} size={32} />
                  <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div style={{ fontSize: 12, color: T.inkFaint }}>{s.shift} · <span style={{ color: s.severity === "Severe" ? T.coral : s.severity === "Moderate" ? T.gold : T.sage, fontWeight: 600 }}>{s.severity}</span> → {SEVERITY_DAYS[s.severity]} days/wk</div></div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {s.departments.map(dept => {
                  const thId = s.assignedTherapists[dept];
                  const th = STAFF.find(t => t.id === thId);
                  const deptStaff = STAFF.filter(t => t.dept === dept);
                  return (
                    <div key={dept} style={{ padding: "8px 12px", background: T.paper, borderRadius: 8, border: `1px solid ${deptColor(dept)}22`, minWidth: 180 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: deptColor(dept), marginBottom: 4 }}>{dept}</div>
                      <select value={thId || ""} onChange={e => { s.assignedTherapists[dept] = e.target.value; }} style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 12, width: "100%" }}>
                        <option value="">Unassigned</option>
                        {deptStaff.map(t => <option key={t.id} value={t.id}>{t.name.split(" ")[0]} {t.name.split(" ")[1]?.[0]}.</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN DEPARTMENTS
───────────────────────────────────────────────────────────────── */
const AdminDepartments = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", abbr: "", color: T.teal });
  const [saved, setSaved] = useState(false);

  const addDept = () => {
    if (!newDept.name.trim()) return;
    DEPARTMENTS.push({ id: `d${DEPARTMENTS.length + 1}`, name: newDept.name, abbr: newDept.abbr, color: newDept.color });
    setSaved(true);
    setNewDept({ name: "", abbr: "", color: T.teal });
    setTimeout(() => { setSaved(false); setShowAdd(false); }, 1500);
  };

  return (
    <div className="rast-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>Departments</div>
        <button onClick={() => setShowAdd(!showAdd)} className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add Department</button>
      </div>

      {showAdd && (
        <div className="rast-card" style={{ padding: 20, marginBottom: 20, borderLeft: `3px solid ${T.teal}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>New Department</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Department Name</label><input value={newDept.name} onChange={e => setNewDept(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Sports Therapy" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13 }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Abbreviation</label><input value={newDept.abbr} onChange={e => setNewDept(d => ({ ...d, abbr: e.target.value }))} placeholder="e.g. SP" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13 }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Color</label><input type="color" value={newDept.color} onChange={e => setNewDept(d => ({ ...d, color: e.target.value }))} style={{ width: "100%", height: 38, borderRadius: 8, border: `1px solid ${T.line}`, cursor: "pointer" }} /></div>
            <button onClick={addDept} className="rast-btn-primary" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Save</button>
          </div>
          {saved && <div style={{ marginTop: 12, padding: 10, background: T.sageSoft, borderRadius: 8, color: T.sage, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> Department added!</div>}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {DEPARTMENTS.map(dept => {
          const staffCount = STAFF.filter(th => th.dept === dept.name).length;
          const studCount = STUDENTS.filter(s => s.departments.includes(dept.name)).length;
          return (
            <div key={dept.id} className="rast-card" style={{ padding: 20, borderTop: `4px solid ${dept.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{dept.name}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>Abbreviation: <strong>{dept.abbr}</strong></div>
                </div>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: dept.color }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", background: T.paper, borderRadius: 8 }}>
                  <div className="rast-serif" style={{ fontSize: 20, fontWeight: 600, color: dept.color }}>{staffCount}</div>
                  <div style={{ fontSize: 11, color: T.inkFaint }}>Therapists</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", background: T.paper, borderRadius: 8 }}>
                  <div className="rast-serif" style={{ fontSize: 20, fontWeight: 600, color: dept.color }}>{studCount}</div>
                  <div style={{ fontSize: 11, color: T.inkFaint }}>Students</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN ANALYTICS
───────────────────────────────────────────────────────────────── */
const AdminAnalytics = () => (
  <div className="rast-fade-in">
    <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Analytics</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      <div className="rast-card" style={{ padding: 20 }}>
        <SectionLabel>Students by Severity</SectionLabel>
        {(["Severe","Moderate","Mild"] as const).map(sev => {
          const count = STUDENTS.filter(s => s.severity === sev).length;
          const color = sev === "Severe" ? T.coral : sev === "Moderate" ? T.gold : T.sage;
          return (
            <div key={sev} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{sev} ({SEVERITY_DAYS[sev]} days/wk)</span><span style={{ fontWeight: 600 }}>{count}</span></div>
              <ProgressBar value={(count / STUDENTS.length) * 100} color={color} />
            </div>
          );
        })}
      </div>
      <div className="rast-card" style={{ padding: 20 }}>
        <SectionLabel>Staff per Department</SectionLabel>
        {DEPARTMENTS.map(d => {
          const count = STAFF.filter(th => th.dept === d.name).length;
          return (
            <div key={d.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{d.abbr} – {d.name.replace(" Therapy","")}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
              <ProgressBar value={(count / STAFF.length) * 100} color={d.color} />
            </div>
          );
        })}
      </div>
      <div className="rast-card" style={{ padding: 20 }}>
        <SectionLabel>Today's Slot Capacity by Department</SectionLabel>
        {DEPARTMENTS.map(d => {
          const deptStaff = STAFF.filter(th => th.dept === d.name);
          const slots = deptStaff.reduce((sum, th) => {
            const att = th.attendance["2026-10-24"];
            return sum + (att ? makeSlots(att.clockIn, att.clockOut).length : 0);
          }, 0);
          return (
            <div key={d.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{d.abbr}</span><span style={{ fontWeight: 600 }}>{slots} slots</span></div>
              <ProgressBar value={Math.min(100, (slots / 20) * 100)} color={d.color} />
            </div>
          );
        })}
      </div>
      <div className="rast-card" style={{ padding: 20 }}>
        <SectionLabel>Recent Daily Logs</SectionLabel>
        {DAILY_LOGS.map((l, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < DAILY_LOGS.length - 1 ? `1px solid ${T.line}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}><span>{l.student}</span><span style={{ color: T.inkFaint, fontWeight: 400, fontSize: 11 }}>{l.date}</span></div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{l.note}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   STUB PANEL
───────────────────────────────────────────────────────────────── */
const StubPanel = ({ title, icon }: any) => (
  <div className="rast-fade-in">
    <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>{title}</div>
    <div className="rast-card"><EmptyState icon={icon} title="Nothing to show yet" body="This module will be connected once the backend is in place." /></div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   APP SHELL
───────────────────────────────────────────────────────────────── */
export default function RastApp() {
  const [role, setRole] = useState<string | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [openStudent, setOpenStudent] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentStudent, setAssessmentStudent] = useState<any>(null);
  const [, refreshData] = useState(0);

  const selectRole = async (nextRole: string) => {
    const credentials: Record<string, [string, string]> = {
      admin: ["admin@rast.local", "RastDev!2026"],
      therapist: ["therapist@rast.local", "RastDev!2026"],
      parent: ["parent@rast.local", "RastDev!2026"],
      student: ["student@rast.local", "RastDev!2026"],
    };
    try {
      const creds = credentials[nextRole];
      const session = await api.login(creds[0], creds[1]);
      localStorage.setItem("rast_token", session.token);
      const remoteStudents = await api.getStudents();
      if (remoteStudents?.length) {
        STUDENTS = remoteStudents.filter((s: any) => s?.name).map((s: any) => ({
          ...s, studentId: s.studentCode || s.id,
          father: s.fatherName || "", dob: s.dateOfBirth?.slice(0, 10) || "",
          admission: s.enrollmentDate?.slice(0, 10) || "",
          house: s.className || "General", shift: s.shift?.includes("1") ? "1st Shift" : "2nd Shift",
          parent: "", phone: "",
          photo: (s.name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          departments: [], assignedTherapists: {}, progress: {},
          severity: s.severity || "Moderate", monthlyFee: s.monthlyFee || 8000, status: s.status || "Active",
        }));
      }
    } catch { /* use mock data */ }
    setRole(nextRole);
  };

  if (!role) return <div className="rast-root"><GlobalStyle /><RoleSelect onSelect={selectRole} /></div>;

  const meta = ROLE_META[role];
  const nav = NAV[role];
  const goHome = () => { setRole(null); setTab("dashboard"); setOpenStudent(null); };
  const changeTab = (id: string) => { setTab(id); setOpenStudent(null); };

  const addStudent = (form: any) => {
    const id = `s${STUDENTS.length + 1}`;
    STUDENTS = [...STUDENTS, {
      ...form, id,
      studentId: `26/27-${String(STUDENTS.length + 1).padStart(2, "0")}`,
      age: Number(form.age) || 0, status: "Active",
      admission: new Date().toISOString().slice(0, 10),
      emergencyContact: form.phone || "",
      departments: form.departments || [], assignedTherapists: {},
      progress: {},
      photo: (form.name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    }];
    ASSESSMENT_STATUS = { ...ASSESSMENT_STATUS, [id]: false };
    refreshData(v => v + 1);
    setShowAddStudent(false);
  };

  const addStaff = (form: any) => {
    STAFF = [...STAFF, {
      id: `th${STAFF.length + 1}`, name: form.name, role: form.role || "Therapist",
      dept: form.dept || "", shift: form.shift || "1st Shift",
      daysScheduled: form.daysScheduled || [],
      attendance: {},
    }];
    refreshData(v => v + 1);
    setShowAddStaff(false);
  };

  const completeAssessment = (studentId: string, form: any) => {
    if (!studentId) return;
    ASSESSMENT_STATUS = { ...ASSESSMENT_STATUS, [studentId]: true };
    refreshData(v => v + 1);
    setShowAssessmentForm(false);
  };

  const renderContent = () => {
    if (openStudent) {
      return <StudentProfile student={openStudent} onBack={() => setOpenStudent(null)} onOpenReport={() => setShowReport(true)} />;
    }
    if (role === "therapist") {
      if (tab === "dashboard") return <TherapistDashboard onOpenStudent={setOpenStudent} onShowReport={() => setShowReport(true)} onChangeTab={setTab} onShowAssessment={(s: any) => { setAssessmentStudent(s); setShowAssessmentForm(true); }} />;
      if (tab === "students") return <TherapistStudents onOpenStudent={setOpenStudent} />;
      if (tab === "goals") return (
        <div className="rast-fade-in">
          <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GOALS.map(g => {
              const st = STUDENTS.find(s => s.id === g.studentId);
              return (
                <div key={g.id} className="rast-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</div><div style={{ fontSize: 12, color: T.inkFaint }}>{st?.name} · {g.dept} · {g.type}</div></div>
                    <div style={{ fontWeight: 700 }}>{g.progress}%</div>
                  </div>
                  <ProgressBar value={g.progress} color={deptColor(g.dept)} />
                </div>
              );
            })}
          </div>
        </div>
      );
      return <StubPanel title={nav.find(n => n.id === tab)?.label || tab} icon={ClipboardList} />;
    }
    if (role === "parent") {
      if (tab === "dashboard") return <ParentDashboard />;
      return <StubPanel title={nav.find(n => n.id === tab)?.label || tab} icon={FileText} />;
    }
    if (role === "student") {
      if (tab === "dashboard") return <StudentDashboard />;
      return <StubPanel title={nav.find(n => n.id === tab)?.label || tab} icon={FileText} />;
    }
    if (role === "admin") {
      if (tab === "dashboard") return <AdminDashboard />;
      if (tab === "students") return <AdminStudents onOpenStudent={setOpenStudent} onShowAddStudent={setShowAddStudent} />;
      if (tab === "staff") return <AdminStaff onShowAddStaff={setShowAddStaff} />;
      if (tab === "attendance") return <AdminAttendance />;
      if (tab === "scheduling") return <AdminScheduling />;
      if (tab === "departments") return <AdminDepartments />;
      if (tab === "analytics") return <AdminAnalytics />;
    }
  };

  return (
    <div className="rast-root" style={{ display: "flex", minHeight: 640, maxWidth: 1400, margin: "0 auto", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden" }}>
      <GlobalStyle />

      {/* Sidebar */}
      <div style={{ width: 230, background: T.tealDeep, color: "white", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <RastLogo size={36} />
          <div>
            <div className="rast-serif" style={{ fontSize: 14, fontWeight: 600, color: "white" }}>RAST</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>Schooling System</div>
          </div>
        </div>
        <div style={{ padding: "14px 10px", flex: 1 }}>
          {nav.map((n) => (
            <div key={n.id} onClick={() => changeTab(n.id)} className="rast-nav-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, fontWeight: 500, marginBottom: 2, background: tab === n.id && !openStudent ? "rgba(255,255,255,0.12)" : "transparent", color: tab === n.id && !openStudent ? "white" : "rgba(255,255,255,0.75)" }}>
              <n.icon size={16} />{n.label}
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div onClick={goHome} className="rast-nav-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
            <LogOut size={15} />Switch role
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "14px 26px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: 9, color: T.inkFaint }} />
            <input placeholder="Search students, reports..." style={{ padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 260 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={18} color={T.inkSoft} />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials={meta.initials} size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{meta.label}</div>
                <div style={{ fontSize: 11, color: T.inkFaint }}>{meta.sub}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="rast-scroll" style={{ padding: 26, overflowY: "auto", flex: 1 }}>
          {renderContent()}
        </div>
      </div>

      {showReport && <DailyReportForm student={openStudent} onClose={() => setShowReport(false)} />}
      {showAddStudent && <AddStudentForm onClose={() => setShowAddStudent(false)} onSubmit={addStudent} />}
      {showAddStaff && <AddStaffForm onClose={() => setShowAddStaff(false)} onSubmit={addStaff} />}
      {showAssessmentForm && <InformalAssessmentForm student={assessmentStudent} onClose={() => setShowAssessmentForm(false)} onSubmit={completeAssessment} />}
    </div>
  );
}
