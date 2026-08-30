import React, { useState, useMemo } from "react";
import {
  Home, Users, Calendar, ClipboardList, FileText, Target, Activity,
  Bell, Search, Menu, X, ChevronRight, ChevronDown, Plus, Check,
  Clock, Filter, LogOut, Baby, Stethoscope, GraduationCap,
  MessageCircle, FolderOpen, BarChart3, Sparkles, ArrowLeft,
  AlertCircle, CheckCircle2, Circle, TrendingUp, Save, ChevronLeft,
} from "lucide-react";

/* ---------------------------------------------------------
   DESIGN TOKENS
   Subject: a Karachi special-needs therapy school. The visual
   idea is "growth rings" — concentric arcs that read as both
   a plant's growth rings and a radial progress chart, tying
   directly to how the app tracks a child's progress over time.
   Palette avoids AI-cliché cream+terracotta / near-black+neon:
   deep teal (trust/clinical calm) + warm gold (growth) + soft
   coral (reserved strictly for alerts).
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   MOCK DATA — seeded from the uploaded roster / daily log
--------------------------------------------------------- */
const THERAPISTS = [
  { id: "t1", name: "Marukh", dept: "Behavior", role: "Behavior Therapist", students: ["s1", "s2", "s5"] },
  { id: "t2", name: "Dr. Atiya", dept: "Occupational", role: "Occupational Therapist", students: ["s1", "s3"] },
  { id: "t3", name: "Ayesha Imran", dept: "Speech", role: "Speech Therapist", students: ["s1", "s4"] },
  { id: "t4", name: "Bilal Farooq", dept: "Remedial", role: "Remedial Therapist", students: ["s1", "s2"] },
];

const STUDENTS = [
  {
    id: "s1", studentId: "23/24-01", name: "Abdul Ahad", father: "Naveed Ahmed", age: 5, dob: "2021-03-14",
    gender: "Male", program: "School Readiness Program", className: "R.T (Afternoon)", shift: "Afternoon",
    admission: "2024-08-01", status: "Active", parent: "Sana Ahmed", phone: "0300-1234567",
    diagnosis: "Global Developmental Delay", allergies: "None known", emergencyContact: "0300-1234567 (mother)",
    departments: ["Behavior", "Occupational", "Speech", "Remedial"],
    progress: { Behavior: 75, Occupational: 55, Speech: 70, Remedial: 60 },
    photo: "AA",
  },
  {
    id: "s2", studentId: "23/24-02", name: "Mohsin Ali Khan", father: "Ali Khan", age: 7, dob: "2019-01-20",
    gender: "Male", program: "Foundational Skills Program", className: "R.T (Morning)", shift: "Morning",
    admission: "2023-09-10", status: "Active", parent: "Farah Khan", phone: "0301-2223344",
    diagnosis: "Autism Spectrum Disorder", allergies: "Peanuts", emergencyContact: "0301-2223344 (father)",
    departments: ["Behavior", "Remedial"],
    progress: { Behavior: 62, Remedial: 48 },
    photo: "MK",
  },
  {
    id: "s3", studentId: "23/24-03", name: "Hamdan Ahmed", father: "Ahmed Raza", age: 6, dob: "2020-05-02",
    gender: "Male", program: "School Readiness Program", className: "R.T (Afternoon)", shift: "Afternoon",
    admission: "2024-01-15", status: "Active", parent: "Mariam Raza", phone: "0302-4455667",
    diagnosis: "Sensory Processing Disorder", allergies: "None known", emergencyContact: "0302-4455667 (mother)",
    departments: ["Occupational"],
    progress: { Occupational: 66 },
    photo: "HA",
  },
  {
    id: "s4", studentId: "23/24-04", name: "Rayyan Yosuf", father: "Yosuf Malik", age: 8, dob: "2018-11-09",
    gender: "Male", program: "Communication Skills Program", className: "R.T (Afternoon)", shift: "Afternoon",
    admission: "2023-03-20", status: "Active", parent: "Aisha Malik", phone: "0303-7788990",
    diagnosis: "Speech & Language Delay", allergies: "None known", emergencyContact: "0303-7788990 (mother)",
    departments: ["Speech"],
    progress: { Speech: 58 },
    photo: "RY",
  },
  {
    id: "s5", studentId: "23/24-05", name: "Haris Ali", father: "Imran Ali", age: 9, dob: "2017-07-30",
    gender: "Male", program: "Behavior Support Program", className: "R.T (Morning)", shift: "Morning",
    admission: "2022-11-05", status: "Active", parent: "Nadia Ali", phone: "0304-9988776",
    diagnosis: "ADHD", allergies: "None known", emergencyContact: "0304-9988776 (father)",
    departments: ["Behavior"],
    progress: { Behavior: 52 },
    photo: "HA",
  },
];

const GOALS = [
  { id: "g1", studentId: "s1", dept: "Behavior", title: "Improve command following", type: "Short-term", target: "2026-09-30", status: "In progress", progress: 70 },
  { id: "g2", studentId: "s1", dept: "Occupational", title: "Improve independence in ADLs", type: "Long-term", target: "2027-01-15", status: "In progress", progress: 45 },
  { id: "g3", studentId: "s1", dept: "Speech", title: "Expand functional vocabulary to 50 words", type: "Short-term", target: "2026-10-10", status: "In progress", progress: 68 },
  { id: "g4", studentId: "s1", dept: "Remedial", title: "Trace and copy 5-letter words independently", type: "Short-term", target: "2026-09-20", status: "On track", progress: 60 },
];

const SESSIONS = [
  { id: "sess1", studentId: "s1", dept: "Behavior", therapist: "Marukh", date: "2026-08-28", time: "10:00 AM", status: "Upcoming" },
  { id: "sess2", studentId: "s1", dept: "Occupational", therapist: "Dr. Atiya", date: "2026-08-28", time: "11:00 AM", status: "Upcoming" },
  { id: "sess3", studentId: "s1", dept: "Speech", therapist: "Ayesha Imran", date: "2026-08-27", time: "10:00 AM", status: "Completed", progress: "Improving" },
  { id: "sess4", studentId: "s1", dept: "Remedial", therapist: "Bilal Farooq", date: "2026-08-27", time: "11:30 AM", status: "Completed", progress: "Fair" },
  { id: "sess5", studentId: "s2", dept: "Behavior", therapist: "Marukh", date: "2026-08-28", time: "9:00 AM", status: "Upcoming" },
  { id: "sess6", studentId: "s5", dept: "Behavior", therapist: "Marukh", date: "2026-08-28", time: "1:00 PM", status: "Upcoming" },
];

const DAILY_LOGS = [
  { date: "2026-10-06", student: "Haris Ali", note: "Behavior issue — not listening at home, resistant to routine changes, increased aggression reported by mother." },
  { date: "2026-10-06", student: "Abu Bakar Najam", note: "Flagged as drowsy during sessions — monitor and note timing of medication if any." },
  { date: "2026-10-06", student: "Hamdan Ahmed", note: "OT demonstration and home-protocol walkthrough held with mother." },
  { date: "2026-10-06", student: "Rayyan Yosuf", note: "Send OT report and home plan to parent." },
  { date: "2026-10-06", student: "Shahzain", note: "Check whether he is verbally engaging with any therapist during sessions." },
];

const MEETINGS = [
  { id: "m1", studentId: "s1", date: "2026-09-04", purpose: "Quarterly progress review", attendees: "Sana Ahmed (parent), Marukh, Dr. Atiya, Ayesha Imran", status: "Scheduled" },
];

const NOTIFICATIONS = {
  therapist: [
    { text: "You have 2 pending daily coverage reports.", time: "1h ago" },
    { text: "New student assigned to you: Hamdan Ahmed.", time: "Yesterday" },
  ],
  parent: [
    { text: "Abdul Ahad's progress report is now available.", time: "2h ago" },
    { text: "Speech Therapy session scheduled for tomorrow, 10:00 AM.", time: "5h ago" },
  ],
  student: [
    { text: "Your Speech Therapy report was shared by Ayesha Imran.", time: "3h ago" },
  ],
  admin: [
    { text: "Attendance report for August requires review.", time: "1d ago" },
  ],
};

const DEPT_COLOR = {
  Behavior: T.coral,
  Occupational: T.gold,
  Speech: T.teal,
  Remedial: T.sage,
};

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
const Avatar = ({ initials, size = 40, bg = T.tealSoft, color = T.teal }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: bg, color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 600, fontSize: size * 0.35, flexShrink: 0,
  }}>{initials}</div>
);

const Pill = ({ children, color = T.teal, bg = T.tealSoft }) => (
  <span style={{
    background: bg, color, fontSize: 12, fontWeight: 600, padding: "3px 10px",
    borderRadius: 999, display: "inline-block", whiteSpace: "nowrap",
  }}>{children}</span>
);

const ProgressBar = ({ value, color = T.teal, track = T.line, height = 8 }) => (
  <div style={{ width: "100%", height, background: track, borderRadius: 999, overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" }} />
  </div>
);

// The "growth ring" signature element: concentric progress arcs, one per department.
const GrowthRings = ({ progress, size = 180 }) => {
  const depts = Object.keys(progress);
  const cx = size / 2, cy = size / 2;
  const baseR = size * 0.16;
  const step = size * 0.11;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {depts.map((d, i) => {
        const r = baseR + i * step;
        const circ = 2 * Math.PI * r;
        const val = progress[d];
        const dash = (val / 100) * circ;
        return (
          <g key={d} transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.line} strokeWidth={6} />
            <circle
              cx={cx} cy={cy} r={r} fill="none" stroke={DEPT_COLOR[d] || T.teal}
              strokeWidth={6} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
            />
          </g>
        );
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.13} fontWeight={600} fill={T.ink} fontFamily="Fraunces, serif">
        {Math.round(depts.reduce((a, d) => a + progress[d], 0) / depts.length)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={size * 0.055} fill={T.inkFaint}>
        overall
      </text>
    </svg>
  );
};

const EmptyState = ({ icon: Icon, title, body, actionLabel, onAction }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: T.inkFaint }}>
    <Icon size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
    <div className="rast-serif" style={{ fontSize: 16, color: T.ink, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, marginBottom: actionLabel ? 16 : 0 }}>{body}</div>
    {actionLabel && (
      <button onClick={onAction} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        {actionLabel}
      </button>
    )}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.inkFaint, marginBottom: 10 }}>
    {children}
  </div>
);

/* ---------------------------------------------------------
   NAV CONFIG
--------------------------------------------------------- */
const NAV = {
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
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "documents", label: "Documents", icon: FolderOpen },
  ],
};

const ROLE_META = {
  therapist: { label: "Marukh", sub: "Behavior Therapist", initials: "MK" },
  parent: { label: "Sana Ahmed", sub: "Parent", initials: "SA" },
  student: { label: "Abdul Ahad", sub: "Student", initials: "AA" },
  admin: { label: "Zoya Farooqui", sub: "Administrator", initials: "ZF" },
};

/* ---------------------------------------------------------
   ROLE SWITCHER (LOGIN SCREEN)
--------------------------------------------------------- */
const RoleSelect = ({ onSelect }) => {
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
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.teal, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sparkles size={24} />
          </div>
          <div className="rast-serif" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>RAST Schooling System</div>
          <div style={{ fontSize: 14, color: T.inkFaint }}>Choose a role to preview the platform</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {roles.map((r) => (
            <button key={r.id} onClick={() => onSelect(r.id)} className="rast-card" style={{
              padding: 20, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
            }}>
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

/* ---------------------------------------------------------
   DAILY REPORT — MULTI-STEP FORM (Behavior Therapy example)
--------------------------------------------------------- */
const DailyReportForm = ({ student, onClose }) => {
  const steps = ["Session info", "Focus areas", "Ratings", "Observations", "Recommendations"];
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    duration: "45", focus: "Attention & command following",
    attention: 3, eyeContact: 3, compliance: 3, sitting: 3,
    observations: "", prompts: "Verbal + gestural", recommendations: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const RatingRow = ({ label, field }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => set(field, n)} style={{
            width: 34, height: 34, borderRadius: 8, cursor: "pointer",
            border: `1px solid ${form[field] === n ? T.teal : T.line}`,
            background: form[field] === n ? T.teal : "white",
            color: form[field] === n ? "white" : T.inkSoft, fontWeight: 600, fontSize: 13,
          }}>{n}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="rast-card rast-fade-in" style={{ width: 560, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.coral, textTransform: "uppercase", letterSpacing: 0.5 }}>Behavior therapy · daily coverage report</div>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{student.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkFaint }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "12px 22px 0", borderBottom: `1px solid ${T.line}`, overflowX: "auto" }} className="rast-scroll">
          {steps.map((s, i) => (
            <div key={s} className="rast-tab" style={{
              padding: "0 4px 12px", fontSize: 12.5, fontWeight: 600,
              color: i === step ? T.teal : i < step ? T.sage : T.inkFaint,
              borderBottom: `2px solid ${i === step ? T.teal : "transparent"}`,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              {i < step ? <CheckCircle2 size={13} /> : <Circle size={13} />} {s}
            </div>
          ))}
        </div>

        <div className="rast-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          {step === 0 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Session duration (minutes)</div>
                <input value={form.duration} onChange={(e) => set("duration", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}` }} />
              </div>
              <div style={{ fontSize: 13, color: T.inkFaint }}>Therapist: Marukh · Date: 28 Aug 2026 · Department: Behavior Therapy</div>
            </div>
          )}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Focus areas for this session</div>
              <textarea value={form.focus} onChange={(e) => set("focus", e.target.value)} rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, resize: "vertical" }} />
            </div>
          )}
          {step === 2 && (
            <div>
              <RatingRow label="Attention" field="attention" />
              <RatingRow label="Eye contact" field="eyeContact" />
              <RatingRow label="Compliance" field="compliance" />
              <RatingRow label="Sitting tolerance" field="sitting" />
              <div style={{ fontSize: 12, color: T.inkFaint }}>1 = needs significant support · 5 = fully independent</div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Prompts required</div>
                <input value={form.prompts} onChange={(e) => set("prompts", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}` }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Behavior observations</div>
                <textarea value={form.observations} onChange={(e) => set("observations", e.target.value)} rows={4} placeholder="What did you notice this session?" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, resize: "vertical" }} />
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Recommendations for home / next session</div>
              <textarea value={form.recommendations} onChange={(e) => set("recommendations", e.target.value)} rows={4} placeholder="Continue structured turn-taking games at home..." style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, resize: "vertical" }} />
              {saved && (
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Report saved to Abdul Ahad's therapy timeline.
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rast-btn-ghost" style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Previous
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="rast-btn-ghost" style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Save size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Save draft
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Next<ChevronRight size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />
              </button>
            ) : (
              <button onClick={() => setSaved(true)} className="rast-btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Submit report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   STUDENT PROFILE (used by therapist + admin views)
--------------------------------------------------------- */
const StudentProfile = ({ student, onBack, onOpenReport }) => {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Case history", "Assessments", "Therapy", "Goals", "Attendance", "Reports", "Meetings"];
  const goals = GOALS.filter((g) => g.studentId === student.id);
  const sessions = SESSIONS.filter((s) => s.studentId === student.id);

  return (
    <div className="rast-fade-in">
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkFaint, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 16 }}>
        <ArrowLeft size={14} /> All students
      </button>

      <div className="rast-card" style={{ padding: 22, marginBottom: 18, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Avatar initials={student.photo} size={56} />
          <div>
            <div className="rast-serif" style={{ fontSize: 21, fontWeight: 600 }}>{student.name}</div>
            <div style={{ fontSize: 13, color: T.inkFaint, marginTop: 2 }}>
              {student.studentId} · Age {student.age} · {student.program} · {student.shift} shift
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {student.departments.map((d) => <Pill key={d} color={DEPT_COLOR[d]} bg={DEPT_COLOR[d] + "22"}>{d}</Pill>)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <button onClick={onOpenReport} className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add daily report
          </button>
          <button className="rast-btn-ghost" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add goal</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, borderBottom: `1px solid ${T.line}`, marginBottom: 20, overflowX: "auto" }} className="rast-scroll">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="rast-tab" style={{
            background: "none", border: "none", padding: "0 2px 12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            color: tab === t ? T.teal : T.inkFaint, borderBottom: `2px solid ${tab === t ? T.teal : "transparent"}`,
          }}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
          <div className="rast-card" style={{ padding: 20 }}>
            <SectionLabel>Assigned therapists</SectionLabel>
            {THERAPISTS.filter((t) => t.students.includes(student.id)).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar initials={t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} size={32} bg={DEPT_COLOR[t.dept] + "22"} color={DEPT_COLOR[t.dept]} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint }}>{t.role}</div>
                  </div>
                </div>
                <MessageCircle size={16} color={T.inkFaint} />
              </div>
            ))}
            <div style={{ marginTop: 18 }}>
              <SectionLabel>Health summary</SectionLabel>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <div><strong>Diagnosis:</strong> {student.diagnosis}</div>
                <div><strong>Allergies:</strong> {student.allergies}</div>
                <div><strong>Emergency contact:</strong> {student.emergencyContact}</div>
              </div>
            </div>
          </div>
          <div className="rast-card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SectionLabel>Overall progress</SectionLabel>
            <GrowthRings progress={student.progress} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 12 }}>
              {Object.entries(student.progress).map(([d, v]) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: DEPT_COLOR[d] }} />
                  <div style={{ flex: 1, color: T.inkSoft }}>{d}</div>
                  <div style={{ fontWeight: 600 }}>{v}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Case history" && (
        <div className="rast-card" style={{ padding: 20 }}>
          {[
            ["Family information", `Father: ${student.father}. Primary guardian: ${student.parent}, reachable at ${student.phone}.`],
            ["Developmental & birth history", "Full-term birth, no complications reported. Delayed motor and speech milestones noted around 18 months."],
            ["Communication history", "Limited verbal output at intake; primarily used gestures. Responds to name inconsistently."],
            ["Behavioral history", "Difficulty with transitions; benefits from visual schedules and consistent routine."],
            ["Previous therapy", "No formal therapy prior to enrollment."],
            ["Parent concerns", "Delayed speech, difficulty following multi-step instructions."],
          ].map(([label, text]) => (
            <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: T.inkFaint }}>Last updated by Marukh · 12 Aug 2026</div>
        </div>
      )}

      {tab === "Assessments" && (
        <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
          {[
            { skill: "Following commands", dept: "Behavior", rating: "Emerging", date: "20 Aug 2026" },
            { skill: "Fine motor / pencil grip", dept: "Occupational", rating: "Developing", date: "18 Aug 2026" },
            { skill: "Expressive vocabulary", dept: "Speech", rating: "Emerging", date: "15 Aug 2026" },
            { skill: "Letter tracing", dept: "Remedial", rating: "Developing", date: "12 Aug 2026" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${T.line}` }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.skill}</div>
                <div style={{ fontSize: 12, color: T.inkFaint }}>{a.dept} · assessed {a.date}</div>
              </div>
              <Pill color={DEPT_COLOR[a.dept]} bg={DEPT_COLOR[a.dept] + "22"}>{a.rating}</Pill>
            </div>
          ))}
        </div>
      )}

      {tab === "Therapy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.length === 0 ? (
            <EmptyState icon={Activity} title="No therapy sessions recorded yet" body="Sessions will appear here once a therapist logs one." />
          ) : sessions.map((s) => (
            <div key={s.id} className="rast-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 4, height: 36, borderRadius: 4, background: DEPT_COLOR[s.dept] }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.dept} Therapy</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>{s.therapist} · {s.date} · {s.time}</div>
                </div>
              </div>
              <Pill color={s.status === "Upcoming" ? T.teal : T.sage} bg={s.status === "Upcoming" ? T.tealSoft : T.sageSoft}>{s.status}</Pill>
            </div>
          ))}
        </div>
      )}

      {tab === "Goals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.map((g) => (
            <div key={g.id} className="rast-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>{g.dept} · {g.type} · target {g.target}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{g.progress}%</div>
              </div>
              <ProgressBar value={g.progress} color={DEPT_COLOR[g.dept]} />
            </div>
          ))}
        </div>
      )}

      {tab === "Attendance" && (
        <div className="rast-card" style={{ padding: 20 }}>
          <SectionLabel>August 2026 · attendance rate 92%</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
            {Array.from({ length: 26 }).map((_, i) => {
              const state = i % 11 === 3 ? "absent" : i % 7 === 0 ? "late" : "present";
              const bg = state === "present" ? T.sageSoft : state === "late" ? T.goldSoft : T.coralSoft;
              const color = state === "present" ? T.sage : state === "late" ? T.gold : T.coral;
              return (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(tab === "Reports" || tab === "Meetings") && (
        <EmptyState
          icon={tab === "Reports" ? FileText : MessageCircle}
          title={tab === "Reports" ? "No shared progress reports yet" : "No meetings scheduled"}
          body={tab === "Reports" ? "Generated progress reports will show up here once shared." : "Parent/teacher minutes will appear here once scheduled."}
          actionLabel={tab === "Meetings" ? "Schedule meeting" : undefined}
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------
   THERAPIST VIEWS
--------------------------------------------------------- */
const TherapistDashboard = ({ onOpenStudent }) => {
  const myStudents = STUDENTS.filter((s) => THERAPISTS[0].students.includes(s.id));
  const today = SESSIONS.filter((s) => s.date === "2026-08-28");
  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Good afternoon, Marukh</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Here's what's happening with your students today.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Assigned students", value: myStudents.length, icon: Users },
          { label: "Today's sessions", value: today.length, icon: Clock },
          { label: "Pending reports", value: 2, icon: AlertCircle, accent: true },
          { label: "Completed this week", value: 11, icon: CheckCircle2 },
        ].map((c) => (
          <div key={c.label} className="rast-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600 }}>{c.label}</div>
              <c.icon size={16} color={c.accent ? T.coral : T.inkFaint} />
            </div>
            <div className="rast-serif" style={{ fontSize: 28, fontWeight: 600, marginTop: 6, color: c.accent ? T.coral : T.ink }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel>Today's sessions</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
            {today.map((s, i) => {
              const student = STUDENTS.find((st) => st.id === s.studentId);
              return (
                <div key={s.id} onClick={() => onOpenStudent(student)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < today.length - 1 ? `1px solid ${T.line}` : "none", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }}>{s.time}</div>
                  <Avatar initials={student.photo} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint }}>{s.dept} Therapy</div>
                  </div>
                  <ChevronRight size={16} color={T.inkFaint} />
                </div>
              );
            })}
          </div>

          <SectionLabel>Students needing attention</SectionLabel>
          <div className="rast-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", borderColor: T.coral + "55" }}>
            <AlertCircle size={18} color={T.coral} />
            <div style={{ fontSize: 13 }}>
              <strong>Haris Ali</strong> — daily log flags increased aggression reported at home. Consider a behavior check-in.
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Quick actions</SectionLabel>
          <div className="rast-card" style={{ padding: 8, marginBottom: 22 }}>
            {["Add daily coverage report", "View students", "Record session", "Add assessment", "Add progress note"].map((a, i) => (
              <div key={a} style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: i < 4 ? `1px solid ${T.line}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {a} <ChevronRight size={14} color={T.inkFaint} />
              </div>
            ))}
          </div>
          <SectionLabel>Notifications</SectionLabel>
          <div className="rast-card" style={{ padding: 14 }}>
            {NOTIFICATIONS.therapist.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5, padding: "8px 0", borderBottom: i < 1 ? `1px solid ${T.line}` : "none" }}>
                <div>{n.text}</div>
                <div style={{ color: T.inkFaint, fontSize: 11, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TherapistStudents = ({ onOpenStudent }) => {
  const [q, setQ] = useState("");
  const myStudents = STUDENTS.filter((s) => THERAPISTS[0].students.includes(s.id));
  const filtered = myStudents.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rast-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>My students</div>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 9, color: T.inkFaint }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students..." style={{ padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 220 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {filtered.map((s) => (
          <div key={s.id} onClick={() => onOpenStudent(s)} className="rast-card" style={{ padding: 16, cursor: "pointer", display: "flex", gap: 12 }}>
            <Avatar initials={s.photo} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 8 }}>{s.studentId} · Age {s.age} · {s.shift}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {s.departments.filter((d) => THERAPISTS[0].dept === d || THERAPISTS.find(t => t.students.includes(s.id) && t.dept === d)).slice(0,1).map((d) => (
                  <Pill key={d} color={DEPT_COLOR[d]} bg={DEPT_COLOR[d] + "22"}>{d}</Pill>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   PARENT VIEWS
--------------------------------------------------------- */
const ParentDashboard = () => {
  const child = STUDENTS[0];
  const todaySessions = SESSIONS.filter((s) => s.studentId === child.id && s.date === "2026-08-28");
  return (
    <div className="rast-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600 }}>Good afternoon, Sana</div>
          <div style={{ fontSize: 13.5, color: T.inkFaint, marginTop: 2 }}>Here's how {child.name} is doing.</div>
        </div>
        <div className="rast-card" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Avatar initials={child.photo} size={28} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{child.name}</span>
          <ChevronDown size={14} color={T.inkFaint} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel>Today's schedule</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
            {todaySessions.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < todaySessions.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }}>{s.time}</div>
                <div style={{ width: 4, height: 30, background: DEPT_COLOR[s.dept], borderRadius: 4 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.dept} Therapy</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>with {s.therapist}</div>
                </div>
              </div>
            ))}
          </div>

          <SectionLabel>Recent updates</SectionLabel>
          <div className="rast-card" style={{ padding: 16, marginBottom: 22, display: "flex", gap: 12 }}>
            <Avatar initials="AI" size={34} bg={T.tealSoft} color={T.teal} />
            <div>
              <div style={{ fontSize: 13.5 }}><strong>Ayesha Imran</strong> added a Speech Therapy progress update.</div>
              <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>"Improving object recognition — introduced 6 new picture cards this week."</div>
            </div>
          </div>

          <SectionLabel>Home recommendations</SectionLabel>
          <div className="rast-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              • Continue short, structured writing activities for 10 minutes daily.<br />
              • Use visual schedules for transitions between activities.<br />
              • Practice 2-step instructions during daily routines.
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Progress</SectionLabel>
          <div className="rast-card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
            <GrowthRings progress={child.progress} size={150} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 12 }}>
              {Object.entries(child.progress).map(([d, v]) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: DEPT_COLOR[d] }} />
                  <div style={{ flex: 1, color: T.inkSoft }}>{d}</div>
                  <div style={{ fontWeight: 600 }}>{v}%</div>
                </div>
              ))}
            </div>
          </div>

          <SectionLabel>Upcoming</SectionLabel>
          <div className="rast-card" style={{ padding: 14, marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }}>
            <Calendar size={16} color={T.teal} />
            <div style={{ fontSize: 12.5 }}>Parent/Teacher meeting — <strong>4 Sep 2026</strong></div>
          </div>

          <SectionLabel>Notifications</SectionLabel>
          <div className="rast-card" style={{ padding: 14 }}>
            {NOTIFICATIONS.parent.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5, padding: "8px 0", borderBottom: i < NOTIFICATIONS.parent.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div>{n.text}</div>
                <div style={{ color: T.inkFaint, fontSize: 11, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   STUDENT VIEW
--------------------------------------------------------- */
const StudentDashboard = () => {
  const me = STUDENTS[0];
  const goals = GOALS.filter((g) => g.studentId === me.id);
  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Welcome, {me.name}</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Here's your week at RAST.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel>Today's schedule</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
            {SESSIONS.filter((s) => s.studentId === me.id && s.date === "2026-08-28").map((s, i, arr) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }}>{s.time}</div>
                <div style={{ width: 4, height: 30, background: DEPT_COLOR[s.dept], borderRadius: 4 }} />
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.dept} Therapy</div>
              </div>
            ))}
          </div>
          <SectionLabel>My goals</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {goals.map((g) => (
              <div key={g.id} className="rast-card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{g.progress}%</div>
                </div>
                <ProgressBar value={g.progress} color={DEPT_COLOR[g.dept]} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>My progress</SectionLabel>
          <div className="rast-card" style={{ padding: 20, display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <GrowthRings progress={me.progress} size={150} />
          </div>
          <SectionLabel>Attendance</SectionLabel>
          <div className="rast-card" style={{ padding: 16, textAlign: "center", marginBottom: 22 }}>
            <div className="rast-serif" style={{ fontSize: 30, fontWeight: 600, color: T.sage }}>92%</div>
            <div style={{ fontSize: 12, color: T.inkFaint }}>this month</div>
          </div>
          <SectionLabel>Notifications</SectionLabel>
          <div className="rast-card" style={{ padding: 14 }}>
            {NOTIFICATIONS.student.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5 }}>
                <div>{n.text}</div>
                <div style={{ color: T.inkFaint, fontSize: 11, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   ADMIN VIEWS
--------------------------------------------------------- */
const AdminDashboard = () => {
  const stats = [
    { label: "Total students", value: STUDENTS.length, icon: Users },
    { label: "Active therapists", value: THERAPISTS.length, icon: Stethoscope },
    { label: "Attendance rate", value: "92%", icon: CheckCircle2 },
    { label: "Pending reports", value: 4, icon: AlertCircle, accent: true },
  ];
  const byShift = { Morning: STUDENTS.filter((s) => s.shift === "Morning").length, Afternoon: STUDENTS.filter((s) => s.shift === "Afternoon").length };
  return (
    <div className="rast-fade-in">
      <div className="rast-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>School overview</div>
      <div style={{ fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }}>Friday, 28 August 2026</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((c) => (
          <div key={c.label} className="rast-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600 }}>{c.label}</div>
              <c.icon size={16} color={c.accent ? T.coral : T.inkFaint} />
            </div>
            <div className="rast-serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 6, color: c.accent ? T.coral : T.ink }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="rast-card" style={{ padding: 20 }}>
          <SectionLabel>Students by shift</SectionLabel>
          {Object.entries(byShift).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
              <ProgressBar value={(v / STUDENTS.length) * 100} color={T.teal} />
            </div>
          ))}
          <SectionLabel>Students by department</SectionLabel>
          {["Behavior", "Occupational", "Speech", "Remedial"].map((d) => {
            const count = STUDENTS.filter((s) => s.departments.includes(d)).length;
            return (
              <div key={d} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{d}</span><span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <ProgressBar value={(count / STUDENTS.length) * 100} color={DEPT_COLOR[d]} />
              </div>
            );
          })}
        </div>
        <div>
          <SectionLabel>Recent daily log entries</SectionLabel>
          <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
            {DAILY_LOGS.map((l, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < DAILY_LOGS.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                  <span>{l.student}</span><span style={{ color: T.inkFaint, fontWeight: 400, fontSize: 11 }}>{l.date}</span>
                </div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{l.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStudents = ({ onOpenStudent }) => (
  <div className="rast-fade-in">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600 }}>All students</div>
      <button className="rast-btn-primary" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Add student
      </button>
    </div>
    <div className="rast-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.line}` }}>
        <div>Student</div><div>Shift</div><div>Class</div><div>Parent</div><div>Status</div>
      </div>
      {STUDENTS.map((s) => (
        <div key={s.id} onClick={() => onOpenStudent(s)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 18px", alignItems: "center", borderBottom: `1px solid ${T.line}`, cursor: "pointer", fontSize: 13 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar initials={s.photo} size={30} />
            <div style={{ fontWeight: 600 }}>{s.name}</div>
          </div>
          <div style={{ color: T.inkSoft }}>{s.shift}</div>
          <div style={{ color: T.inkSoft }}>{s.className}</div>
          <div style={{ color: T.inkSoft }}>{s.parent}</div>
          <Pill color={T.sage} bg={T.sageSoft}>{s.status}</Pill>
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------------------------------------------
   GENERIC "COMING SOON" PANEL for lightly-stubbed nav items
--------------------------------------------------------- */
const StubPanel = ({ title, icon }) => (
  <div className="rast-fade-in">
    <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>{title}</div>
    <div className="rast-card">
      <EmptyState icon={icon} title="Nothing to show yet" body="This module follows the same data model as the others — connect it once the backend is in place." />
    </div>
  </div>
);

/* ---------------------------------------------------------
   APP SHELL
--------------------------------------------------------- */
export default function RastApp() {
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [openStudent, setOpenStudent] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  if (!role) return <div className="rast-root"><GlobalStyle /><RoleSelect onSelect={(r) => setRole(r)} /></div>;

  const meta = ROLE_META[role];
  const nav = NAV[role];

  const goHome = () => { setRole(null); setTab("dashboard"); setOpenStudent(null); };
  const changeTab = (id) => { setTab(id); setOpenStudent(null); setMobileNav(false); };

  const renderContent = () => {
    if (openStudent) {
      return <StudentProfile student={openStudent} onBack={() => setOpenStudent(null)} onOpenReport={() => setShowReport(true)} />;
    }
    if (role === "therapist") {
      if (tab === "dashboard") return <TherapistDashboard onOpenStudent={setOpenStudent} />;
      if (tab === "students") return <TherapistStudents onOpenStudent={setOpenStudent} />;
      if (tab === "goals") return (
        <div className="rast-fade-in">
          <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Goals across your students</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GOALS.map((g) => {
              const st = STUDENTS.find((s) => s.id === g.studentId);
              return (
                <div key={g.id} className="rast-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</div>
                      <div style={{ fontSize: 12, color: T.inkFaint }}>{st.name} · {g.dept} · {g.type}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{g.progress}%</div>
                  </div>
                  <ProgressBar value={g.progress} color={DEPT_COLOR[g.dept]} />
                </div>
              );
            })}
          </div>
        </div>
      );
      if (tab === "meetings") return (
        <div className="rast-fade-in">
          <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Parent / teacher meetings</div>
          {MEETINGS.map((m) => {
            const st = STUDENTS.find((s) => s.id === m.studentId);
            return (
              <div key={m.id} className="rast-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{st.name} — {m.purpose}</div>
                  <Pill>{m.status}</Pill>
                </div>
                <div style={{ fontSize: 12, color: T.inkFaint }}>{m.date} · {m.attendees}</div>
              </div>
            );
          })}
        </div>
      );
      return <StubPanel title={nav.find((n) => n.id === tab)?.label} icon={ClipboardList} />;
    }
    if (role === "parent") {
      if (tab === "dashboard") return <ParentDashboard />;
      if (tab === "progress") return (
        <div className="rast-fade-in" style={{ display: "flex", justifyContent: "center" }}>
          <div className="rast-card" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 340 }}>
            <div className="rast-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Abdul Ahad's progress</div>
            <GrowthRings progress={STUDENTS[0].progress} size={200} />
          </div>
        </div>
      );
      return <StubPanel title={nav.find((n) => n.id === tab)?.label} icon={FileText} />;
    }
    if (role === "student") {
      if (tab === "dashboard") return <StudentDashboard />;
      return <StubPanel title={nav.find((n) => n.id === tab)?.label} icon={FileText} />;
    }
    if (role === "admin") {
      if (tab === "dashboard") return <AdminDashboard />;
      if (tab === "students") return <AdminStudents onOpenStudent={setOpenStudent} />;
      if (tab === "staff") return (
        <div className="rast-fade-in">
          <div className="rast-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Therapists & staff</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {THERAPISTS.map((t) => (
              <div key={t.id} className="rast-card" style={{ padding: 16, display: "flex", gap: 12 }}>
                <Avatar initials={t.name.split(" ").map((w) => w[0]).join("").slice(0,2)} size={40} bg={DEPT_COLOR[t.dept] + "22"} color={DEPT_COLOR[t.dept]} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>{t.role} · {t.students.length} students</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      return <StubPanel title={nav.find((n) => n.id === tab)?.label} icon={BarChart3} />;
    }
  };

  return (
    <div className="rast-root" style={{ display: "flex", minHeight: 640, maxWidth: 1180, margin: "0 auto", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden" }}>
      <GlobalStyle />

      {/* Sidebar */}
      <div style={{
        width: 220, background: T.tealDeep, color: "white", display: "flex", flexDirection: "column",
        flexShrink: 0,
      }} className={mobileNav ? "" : ""}>
        <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={15} color={T.tealDeep} />
          </div>
          <div className="rast-serif" style={{ fontSize: 15, fontWeight: 600 }}>RAST</div>
        </div>
        <div style={{ padding: "14px 10px", flex: 1 }}>
          {nav.map((n) => (
            <div key={n.id} onClick={() => changeTab(n.id)} className="rast-nav-item" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
              cursor: "pointer", fontSize: 13.5, fontWeight: 500, marginBottom: 2,
              background: tab === n.id && !openStudent ? "rgba(255,255,255,0.12)" : "transparent",
              color: tab === n.id && !openStudent ? "white" : "rgba(255,255,255,0.75)",
            }}>
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

      {showReport && openStudent && (
        <DailyReportForm student={openStudent} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
