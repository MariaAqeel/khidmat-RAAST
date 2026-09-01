import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Home, Users, Calendar, ClipboardList, FileText, Target, Activity, Bell, Search, X, ChevronRight, ChevronDown, Plus, Clock, LogOut, Baby, Stethoscope, GraduationCap, MessageCircle, FolderOpen, BarChart3, Sparkles, ArrowLeft, AlertCircle, CheckCircle2, TrendingUp, Save, } from "lucide-react";
import { api } from "./lib/api";
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
const GlobalStyle = () => (_jsx("style", { children: `
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
  ` }));
/* ---------------------------------------------------------
   MOCK DATA — seeded from the uploaded roster / daily log
--------------------------------------------------------- */
let THERAPISTS = [
    { id: "t1", name: "Marukh", dept: "Behavior", role: "Behavior Therapist", students: ["s1", "s2", "s5"] },
    { id: "t2", name: "Dr. Atiya", dept: "Occupational", role: "Occupational Therapist", students: ["s1", "s3"] },
    { id: "t3", name: "Ayesha Imran", dept: "Speech", role: "Speech Therapist", students: ["s1", "s4"] },
    { id: "t4", name: "Bilal Farooq", dept: "Remedial", role: "Remedial Therapist", students: ["s1", "s2"] },
];
let STUDENTS = [
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
// Track which students have had Informal Assessment Checklist completed (student ID → true/false)
let ASSESSMENT_STATUS = {
    s1: true, // Abdul Ahad - completed
    s2: false, // Mohsin Ali Khan - pending
    s3: false, // Hamdan Ahmed - pending
    s4: true, // Rayyan Yosuf - completed
    s5: false, // Haris Ali - pending
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
/* Daily Report Forms Configuration */
const DAILY_REPORT_FORMS = {
    ADL: {
        title: "ADL - Daily Coverage Report",
        icon: "👤",
        fields: [
            { name: "studentName", label: "Student's Name", type: "select", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
            { name: "listensRepeat", label: "Listens and repeat?", type: "yesno", required: true },
            { name: "listenFollowDirections", label: "Listen and follow directions?", type: "yesno", required: true },
            { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
            { name: "enjoyedGroupActivities", label: "Enjoyed group activities and make new friends?", type: "yesno", required: true },
            { name: "activityConductedByStudent", label: "Was the activity conducted by the students?", type: "select", options: ["Fully Independent", "Partially Independent"], required: true },
            { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
        ]
    },
    "Behaviour Therapy": {
        title: "Behaviour Therapy - Daily Coverage Report",
        icon: "🧠",
        fields: [
            { name: "studentName", label: "Student's Name", type: "select", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
            { name: "strategiesUsed", label: "Strategy used to conduct the activity?", type: "textarea", required: true },
            { name: "frequencyOfBehaviour", label: "Frequency of behaviour? (In Minutes)", type: "number", required: true },
            { name: "materialsUsed", label: "Material used during the session?", type: "multiselect", options: ["Slime", "Playdough", "Shaving foam", "Bubble balls", "Beads and threads", "Stress balls", "Pop it", "Worksheets", "Flashcards", "Puzzles", "Ice cream sticks", "Straws", "Rice and beans", "Salt", "Handmade material"], required: false },
            { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
            { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
        ]
    },
    "Occupational Therapy": {
        title: "Occupational Therapy - Daily Coverage Report",
        icon: "🤚",
        fields: [
            { name: "studentName", label: "Student's Name", type: "select", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
            { name: "strategiesUsed", label: "Strategy used to conduct the activity?", type: "textarea", required: true },
            { name: "listenFollowDirections", label: "Listen and follow directions?", type: "yesno", required: true },
            { name: "materialsUsed", label: "Material used during the session?", type: "multiselect", options: ["Lotion", "Slime", "Playdough", "Shaving foam", "Beads and threads", "Flashcards", "Ice cream sticks", "Sensory playmat", "Gymballs", "Trampoline", "Salt", "Handmade material", "Sensory path"], required: false },
            { name: "attentionSpan", label: "Attention span? (In Minutes)", type: "number", required: true },
            { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
            { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
        ]
    },
    "Remedial Therapy": {
        title: "Remedial Therapy - Daily Coverage Report",
        icon: "📝",
        fields: [
            { name: "studentName", label: "Student's Name", type: "select", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
            { name: "strategiesUsed", label: "Strategy used to conduct the activity?", type: "textarea", required: true },
            { name: "listensRepeat", label: "Listens and repeat?", type: "yesno", required: true },
            { name: "listenFollowDirections", label: "Listen and follow directions?", type: "yesno", required: true },
            { name: "materialsUsed", label: "Material used during the session?", type: "multiselect", options: ["Slime", "Playdough", "Beads and threads", "Pop it", "Paints", "Colours", "Worksheets", "Flashcards", "Puzzles", "Ice cream sticks", "Rice and beans", "Salt", "Handmade material", "Storybooks"], required: false },
            { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
            { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
        ]
    },
    "Speech Therapy": {
        title: "Speech Therapy - Daily Coverage Report",
        icon: "🗣️",
        fields: [
            { name: "studentName", label: "Student's Name", type: "select", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "activityConducted", label: "Activity conducted with the student?", type: "textarea", required: true },
            { name: "strategiesUsed", label: "Strategy used to conduct the activity?", type: "textarea", required: true },
            { name: "listensRepeat", label: "Listens and repeat?", type: "yesno", required: true },
            { name: "listenFollowDirections", label: "Listen and follow directions?", type: "yesno", required: true },
            { name: "materialsUsed", label: "Material used during the session?", type: "multiselect", options: ["Honey", "Lotion", "Slime", "Playdough", "Bubble balls", "Beads and threads", "Flashcards", "Ice cream sticks", "Straws", "Musical toys", "Rice and beans", "Hand made material", "Storybooks"], required: false },
            { name: "sittingTolerance", label: "Sitting Tolerance? (In Minutes)", type: "number", required: true },
            { name: "remarks", label: "Any Other Remarks?", type: "textarea", required: false },
        ]
    }
};
/* Informal Assessment Checklist Form Configuration */
const INFORMAL_ASSESSMENT_FORM = {
    title: "Informal Assessment Checklist",
    sections: [
        {
            name: "basic",
            label: "Basic Information",
            fields: [
                { name: "studentName", label: "Student's Name", type: "select", required: true },
                { name: "date", label: "Date", type: "date", required: true },
                { name: "time", label: "Time", type: "time", required: true },
            ]
        },
        {
            name: "formalAssessment",
            label: "Formal Assessment",
            fields: [
                { name: "hasFormalAssessment", label: "Has the formal assessment been made?", type: "yesno", required: true },
                { name: "diagnosis", label: "If Yes, What is the diagnosis?", type: "textarea", required: false, condition: (form) => form.hasFormalAssessment === "Yes" },
            ]
        },
        {
            name: "behaviour",
            label: "Behaviour",
            fields: [
                { name: "sittingTolerance", label: "Sitting Tolerance (Record time of sitting in mins)", type: "number", required: true },
                { name: "hyperactive", label: "Hyperactive", type: "yesno", required: true },
                { name: "stubbornness", label: "Stubbornness (Follow Instructions)", type: "yesno", required: true },
                { name: "stubbornnessReason", label: "If No, Specify?", type: "multiselect", options: ["Not following commands", "Distracted"], required: false, condition: (form) => form.stubbornness === "No" },
                { name: "selfStimulatory", label: "Self Stimulatory Behaviour?", type: "yesno", required: true },
                { name: "selfStimType", label: "If Yes, Specify?", type: "multiselect", options: ["Self-talking", "Hand clapping", "Spinning", "Shouting", "Crying", "Self-hitting", "Head banging"], required: false, condition: (form) => form.selfStimulatory === "Yes" },
                { name: "behaviourObservations", label: "Observations?", type: "textarea", required: false },
            ]
        },
        {
            name: "fineMotor",
            label: "Fine Motor Skills",
            fields: [
                { name: "pencilGripping", label: "Pencil Gripping", type: "yesno", required: true },
                { name: "colouringWithinLines", label: "Colouring within lines?", type: "yesno", required: true },
                { name: "verticalHorizontalLines", label: "Drawing vertical and horizontal lines", type: "yesno", required: true },
                { name: "pickingSmallObjects", label: "Picking up small objects", type: "yesno", required: true },
                { name: "openingClosingLocks", label: "Opening and closing locks", type: "yesno", required: true },
                { name: "fineMotorObservations", label: "Observation", type: "textarea", required: false },
            ]
        },
        {
            name: "grossMotor",
            label: "Gross Motor Skills",
            fields: [
                { name: "catchingThrowing", label: "Catching and throwing a ball", type: "yesno", required: true },
                { name: "walkingInLine", label: "Walking in line", type: "yesno", required: true },
                { name: "controlRunningWalking", label: "Control while running and walking", type: "yesno", required: true },
                { name: "jumpingInOutCircle", label: "Jumping in and out of circle", type: "yesno", required: true },
                { name: "coordinatedMuscleControl", label: "Coordinated muscle control", type: "yesno", required: true },
                { name: "grossMotorObservations", label: "Observation", type: "textarea", required: false },
            ]
        },
        {
            name: "speech",
            label: "Speech",
            fields: [
                { name: "respondsToName", label: "Receptive Language - Responds to name?", type: "yesno", required: true },
                { name: "recogniseObjects", label: "Receptive Language - Recognise objects?", type: "yesno", required: true },
                { name: "expressEmotions", label: "Expressive Language - Can express feelings?", type: "yesno", required: true },
                { name: "demandObjects", label: "Expressive Language - Can demand for objects?", type: "yesno", required: true },
                { name: "speechObservations", label: "Observations?", type: "textarea", required: false },
            ]
        },
        {
            name: "remedial",
            label: "Remedial Therapy",
            fields: [
                { name: "matchingSameObjects", label: "Matching same objects?", type: "yesno", required: true },
                { name: "comparingSorting", label: "Comparing and sorting objects by size (big/small, long/short)", type: "yesno", required: true },
                { name: "countingFingers", label: "Counting on fingers", type: "yesno", required: true },
                { name: "identifyingNaming", label: "Identifying and naming different objects", type: "yesno", required: true },
                { name: "remedialObservations", label: "Observations", type: "textarea", required: false },
            ]
        },
        {
            name: "emotional",
            label: "Emotional and Social Skills",
            fields: [
                { name: "expressEmotionsAppropriately", label: "Express emotions appropriately", type: "yesno", required: true },
                { name: "interactsWithPeers", label: "Interacts with peers appropriately", type: "yesno", required: true },
                { name: "handlesTransitions", label: "Handles transitions or change in routine", type: "yesno", required: true },
                { name: "emotionalObservations", label: "Observations", type: "textarea", required: false },
            ]
        },
        {
            name: "progressCheck",
            label: "Progress Check",
            fields: [
                { name: "isFirstAssessment", label: "Is this the first assessment at RAST Schooling System?", type: "yesno", required: true },
                { name: "lastAssessmentDate", label: "If No, then specify date of last assessment", type: "date", required: false, condition: (form) => form.isFirstAssessment === "No" },
                { name: "progressLevel", label: "Specify the level of progress", type: "select", options: ["Improvement", "No Change", "Regression"], required: false, condition: (form) => form.isFirstAssessment === "No" },
                { name: "progressObservations", label: "Observations", type: "textarea", required: false },
            ]
        },
        {
            name: "additional",
            label: "Additional Information",
            fields: [
                { name: "additionalNotes", label: "Additional Notes if Any?", type: "textarea", required: false },
            ]
        }
    ]
};
/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
const Avatar = ({ initials, size = 40, bg = T.tealSoft, color = T.teal }) => (_jsx("div", { style: {
        width: size, height: size, borderRadius: "50%", background: bg, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, fontSize: size * 0.35, flexShrink: 0,
    }, children: initials }));
const Pill = ({ children, color = T.teal, bg = T.tealSoft }) => (_jsx("span", { style: {
        background: bg, color, fontSize: 12, fontWeight: 600, padding: "3px 10px",
        borderRadius: 999, display: "inline-block", whiteSpace: "nowrap",
    }, children: children }));
const ProgressBar = ({ value, color = T.teal, track = T.line, height = 8 }) => (_jsx("div", { style: { width: "100%", height, background: track, borderRadius: 999, overflow: "hidden" }, children: _jsx("div", { style: { width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" } }) }));
// The "growth ring" signature element: concentric progress arcs, one per department.
const GrowthRings = ({ progress, size = 180 }) => {
    const depts = Object.keys(progress);
    const cx = size / 2, cy = size / 2;
    const baseR = size * 0.16;
    const step = size * 0.11;
    return (_jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [depts.map((d, i) => {
                const r = baseR + i * step;
                const circ = 2 * Math.PI * r;
                const val = progress[d];
                const dash = (val / 100) * circ;
                return (_jsxs("g", { transform: `rotate(-90 ${cx} ${cy})`, children: [_jsx("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: T.line, strokeWidth: 6 }), _jsx("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: DEPT_COLOR[d] || T.teal, strokeWidth: 6, strokeLinecap: "round", strokeDasharray: `${dash} ${circ}` })] }, d));
            }), _jsxs("text", { x: cx, y: cy - 2, textAnchor: "middle", fontSize: size * 0.13, fontWeight: 600, fill: T.ink, fontFamily: "Fraunces, serif", children: [Math.round(depts.reduce((a, d) => a + progress[d], 0) / depts.length), "%"] }), _jsx("text", { x: cx, y: cy + 14, textAnchor: "middle", fontSize: size * 0.055, fill: T.inkFaint, children: "overall" })] }));
};
const EmptyState = ({ icon: Icon, title, body, actionLabel = undefined, onAction = undefined }) => (_jsxs("div", { style: { textAlign: "center", padding: "48px 24px", color: T.inkFaint }, children: [_jsx(Icon, { size: 32, style: { marginBottom: 12, opacity: 0.6 } }), _jsx("div", { className: "rast-serif", style: { fontSize: 16, color: T.ink, marginBottom: 4 }, children: title }), _jsx("div", { style: { fontSize: 13, marginBottom: actionLabel ? 16 : 0 }, children: body }), actionLabel && (_jsx("button", { onClick: onAction, className: "rast-btn-primary", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: actionLabel }))] }));
const SectionLabel = ({ children }) => (_jsx("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.inkFaint, marginBottom: 10 }, children: children }));
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
    return (_jsx("div", { className: "rast-root", style: { minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }, children: _jsxs("div", { style: { maxWidth: 520, width: "100%" }, children: [_jsxs("div", { style: { textAlign: "center", marginBottom: 36 }, children: [_jsx("div", { style: { width: 52, height: 52, borderRadius: 14, background: T.teal, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }, children: _jsx(Sparkles, { size: 24 }) }), _jsx("div", { className: "rast-serif", style: { fontSize: 28, fontWeight: 600, marginBottom: 6 }, children: "RAST Schooling System" }), _jsx("div", { style: { fontSize: 14, color: T.inkFaint }, children: "Choose a role to preview the platform" })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: roles.map((r) => (_jsxs("button", { onClick: () => onSelect(r.id), className: "rast-card", style: {
                            padding: 20, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
                        }, children: [_jsx("div", { style: { width: 36, height: 36, borderRadius: 10, background: T.tealSoft, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }, children: _jsx(r.icon, { size: 18 }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 2 }, children: r.label }), _jsx("div", { style: { fontSize: 12.5, color: T.inkFaint, lineHeight: 1.4 }, children: r.blurb })] })] }, r.id))) })] }) }));
};
/* ---------------------------------------------------------
   DAILY REPORT — MULTI-FORM WITH DYNAMIC FIELDS
--------------------------------------------------------- */
const DailyReportForm = ({ student, onClose, preSelectedReportType = null }) => {
    const [selectedStudent, setSelectedStudent] = useState(student?.id || null);
    const [selectedReportType, setSelectedReportType] = useState(preSelectedReportType || "Behaviour Therapy");
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);
    const reportConfig = DAILY_REPORT_FORMS[selectedReportType];
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const studentObj = STUDENTS.find((s) => s.id === selectedStudent);
    const isStudentReadOnly = student !== null; // If opened from student profile, make student readonly
    const renderField = (field) => {
        const value = form[field.name] || "";
        const baseStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };
        if (field.type === "select") {
            if (field.name === "studentName") {
                return (_jsxs("select", { value: value, onChange: (e) => set(field.name, e.target.value), disabled: isStudentReadOnly, style: { ...baseStyle, opacity: isStudentReadOnly ? 0.7 : 1, cursor: isStudentReadOnly ? "not-allowed" : "pointer" }, children: [_jsx("option", { value: "", children: "Select student" }), STUDENTS.map((s) => _jsx("option", { value: s.id, children: s.name }, s.id))] }));
            }
            return (_jsxs("select", { value: value, onChange: (e) => set(field.name, e.target.value), style: { ...baseStyle, cursor: "pointer" }, children: [_jsx("option", { value: "", children: field.label }), field.options?.map((opt) => _jsx("option", { value: opt, children: opt }, opt))] }));
        }
        if (field.type === "yesno") {
            return (_jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => set(field.name, "Yes"), style: {
                            flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${value === "Yes" ? T.teal : T.line}`,
                            background: value === "Yes" ? T.teal : "white",
                            color: value === "Yes" ? "white" : T.ink, fontWeight: 600, fontSize: 12
                        }, children: "Yes" }), _jsx("button", { onClick: () => set(field.name, "No"), style: {
                            flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${value === "No" ? T.teal : T.line}`,
                            background: value === "No" ? T.teal : "white",
                            color: value === "No" ? "white" : T.ink, fontWeight: 600, fontSize: 12
                        }, children: "No" })] }));
        }
        if (field.type === "multiselect") {
            const selected = Array.isArray(value) ? value : [];
            return (_jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: field.options?.map((opt) => (_jsx("button", { onClick: () => {
                        const updated = selected.includes(opt)
                            ? selected.filter((i) => i !== opt)
                            : [...selected, opt];
                        set(field.name, updated);
                    }, style: {
                        padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                        border: `1px solid ${selected.includes(opt) ? T.teal : T.line}`,
                        background: selected.includes(opt) ? T.teal : "white",
                        color: selected.includes(opt) ? "white" : T.ink, fontWeight: 500
                    }, children: opt }, opt))) }));
        }
        if (field.type === "date") {
            return _jsx("input", { type: "date", value: value, onChange: (e) => set(field.name, e.target.value), style: baseStyle });
        }
        if (field.type === "time") {
            return _jsx("input", { type: "time", value: value, onChange: (e) => set(field.name, e.target.value), style: baseStyle });
        }
        if (field.type === "number") {
            return _jsx("input", { type: "number", value: value, onChange: (e) => set(field.name, e.target.value), placeholder: field.label, style: baseStyle });
        }
        if (field.type === "textarea") {
            return _jsx("textarea", { value: value, onChange: (e) => set(field.name, e.target.value), placeholder: field.label, rows: 3, style: { ...baseStyle, resize: "vertical" } });
        }
        return _jsx("input", { type: "text", value: value, onChange: (e) => set(field.name, e.target.value), placeholder: field.label, style: baseStyle });
    };
    return (_jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }, children: _jsxs("div", { className: "rast-card rast-fade-in", style: { width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }, children: [_jsxs("div", { style: { padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 700, color: T.coral, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Daily Coverage Report" }), _jsx("div", { className: "rast-serif", style: { fontSize: 18, fontWeight: 600, marginTop: 2 }, children: studentObj ? studentObj.name : "Select Student" })] }), _jsx("button", { onClick: onClose, style: { background: "none", border: "none", cursor: "pointer", color: T.inkFaint }, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "rast-scroll", style: { padding: 22, overflowY: "auto", flex: 1 }, children: [_jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Student *" }), _jsxs("select", { value: selectedStudent, onChange: (e) => setSelectedStudent(e.target.value), disabled: isStudentReadOnly, style: {
                                        width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit",
                                        opacity: isStudentReadOnly ? 0.7 : 1, cursor: isStudentReadOnly ? "not-allowed" : "pointer"
                                    }, children: [_jsx("option", { value: "", children: "Select a student" }), STUDENTS.map((s) => _jsxs("option", { value: s.id, children: [s.name, " (", s.studentId, ")"] }, s.id))] }), isStudentReadOnly && _jsx("div", { style: { fontSize: 11, color: T.inkFaint, marginTop: 4 }, children: "Auto-selected from student profile" })] }), _jsxs("div", { style: { marginBottom: 22 }, children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }, children: "Report Type *" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }, children: Object.keys(DAILY_REPORT_FORMS).map((type) => (_jsxs("button", { onClick: () => setSelectedReportType(type), style: {
                                            padding: "10px 12px", borderRadius: 8, border: `2px solid ${selectedReportType === type ? T.teal : T.line}`,
                                            background: selectedReportType === type ? T.tealSoft : "white",
                                            color: selectedReportType === type ? T.teal : T.ink,
                                            cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left",
                                        }, children: [DAILY_REPORT_FORMS[type].icon, " ", type] }, type))) })] }), _jsx("div", { style: { height: "1px", background: T.line, marginBottom: 20 } }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: reportConfig.fields.map((field) => (_jsxs("div", { children: [_jsxs("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: [field.label, field.required && _jsx("span", { style: { color: T.coral }, children: " *" })] }), renderField(field)] }, field.name))) }), saved && (_jsxs("div", { style: { marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }, children: [_jsx(CheckCircle2, { size: 16 }), " Report saved successfully!"] }))] }), _jsxs("div", { style: { padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }, children: [_jsx("button", { onClick: onClose, className: "rast-btn-ghost", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Cancel" }), _jsxs("button", { onClick: () => setSaved(true), className: "rast-btn-primary", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: [_jsx(Save, { size: 13, style: { verticalAlign: -2, marginRight: 4 } }), "Submit Report"] })] })] }) }));
};
/* ---------------------------------------------------------
   STUDENT PROFILE (used by therapist + admin views)
--------------------------------------------------------- */
const StudentProfile = ({ student, onBack, onOpenReport }) => {
    const [tab, setTab] = useState("Overview");
    const tabs = ["Overview", "Case history", "Assessments", "Therapy", "Goals", "Attendance", "Reports", "Meetings"];
    const goals = GOALS.filter((g) => g.studentId === student.id);
    const sessions = SESSIONS.filter((s) => s.studentId === student.id);
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsxs("button", { onClick: onBack, style: { background: "none", border: "none", color: T.inkFaint, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 16 }, children: [_jsx(ArrowLeft, { size: 14 }), " All students"] }), _jsxs("div", { className: "rast-card", style: { padding: 22, marginBottom: 18 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 21, fontWeight: 600 }, children: student.name }), _jsxs("div", { style: { fontSize: 13, color: T.inkFaint, marginTop: 4 }, children: [student.studentId, " \u00B7 Age ", student.age, " \u00B7 ", student.program, " \u00B7 ", student.shift, " shift"] }), _jsxs("button", { onClick: onOpenReport, className: "rast-btn-primary", style: { marginTop: 14, padding: "9px 14px", borderRadius: 8 }, children: [_jsx(Plus, { size: 14 }), " Add daily report"] })] }), _jsx("div", { style: { display: "flex", gap: 18, borderBottom: `1px solid ${T.line}`, marginBottom: 20, overflowX: "auto" }, className: "rast-scroll", children: tabs.map((tabName) => _jsx("button", { onClick: () => setTab(tabName), className: "rast-tab", style: { background: "none", border: "none", padding: "0 2px 12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: tab === tabName ? T.teal : T.inkFaint, borderBottom: `2px solid ${tab === tabName ? T.teal : "transparent"}` }, children: tabName }, tabName)) }), tab === "Overview" && _jsxs("div", { className: "rast-card", style: { padding: 20 }, children: [_jsx(SectionLabel, { children: "Health summary" }), _jsxs("div", { style: { fontSize: 13, lineHeight: 1.8 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Diagnosis:" }), " ", student.diagnosis || "Not recorded"] }), _jsxs("div", { children: [_jsx("strong", { children: "Allergies:" }), " ", student.allergies || "Not recorded"] }), _jsxs("div", { children: [_jsx("strong", { children: "Emergency contact:" }), " ", student.emergencyContact || "Not recorded"] })] })] }), tab === "Case history" && _jsx("div", { className: "rast-card", style: { padding: 20 }, children: _jsx(EmptyState, { icon: FolderOpen, title: "Case history", body: "Health and family history records are stored securely in the database." }) }), tab === "Assessments" && _jsx("div", { className: "rast-card", style: { padding: 20 }, children: _jsx(EmptyState, { icon: ClipboardList, title: "Assessments", body: "Assessment records will appear here after submission." }) }), tab === "Therapy" && _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: sessions.length ? sessions.map((session) => _jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [session.dept, " Therapy \u00B7 ", session.date, " \u00B7 ", session.status] }, session.id)) : _jsx(EmptyState, { icon: Activity, title: "No therapy sessions recorded yet", body: "Sessions will appear here once logged." }) }), tab === "Goals" && _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: goals.length ? goals.map((goal) => _jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [goal.title, " \u00B7 ", goal.progress, "%"] }, goal.id)) : _jsx(EmptyState, { icon: Target, title: "No goals recorded yet", body: "Goals will appear here once added." }) }), (tab === "Attendance" || tab === "Reports" || tab === "Meetings") && _jsx(EmptyState, { icon: tab === "Attendance" ? Calendar : tab === "Reports" ? FileText : MessageCircle, title: `No ${tab.toLowerCase()} records yet`, body: "Records will appear here once they are saved." })] }));
};
/* ---------------------------------------------------------
   INFORMAL ASSESSMENT CHECKLIST FORM
------------------------------------------------- */
const InformalAssessmentForm = ({ student, onClose, onSubmit }) => {
    const [selectedStudent, setSelectedStudent] = useState(student?.id || null);
    const [currentSection, setCurrentSection] = useState(0);
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);
    const sections = INFORMAL_ASSESSMENT_FORM.sections;
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const studentObj = STUDENTS.find((s) => s.id === selectedStudent);
    const isStudentReadOnly = Boolean(student);
    const renderField = (field) => {
        if (field.condition && !field.condition(form))
            return null;
        const value = form[field.name] || "";
        const baseStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };
        if (field.type === "select") {
            if (field.name === "studentName") {
                return (_jsxs("select", { value: value, onChange: (e) => set(field.name, e.target.value), disabled: isStudentReadOnly, style: { ...baseStyle, opacity: isStudentReadOnly ? 0.7 : 1 }, children: [_jsx("option", { value: "", children: "Select student" }), STUDENTS.map((s) => _jsx("option", { value: s.id, children: s.name }, s.id))] }));
            }
            return (_jsxs("select", { value: value, onChange: (e) => set(field.name, e.target.value), style: { ...baseStyle, cursor: "pointer" }, children: [_jsx("option", { value: "", children: "Select..." }), field.options?.map((opt) => _jsx("option", { value: opt, children: opt }, opt))] }));
        }
        if (field.type === "yesno") {
            return (_jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => set(field.name, "Yes"), style: {
                            flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${value === "Yes" ? T.teal : T.line}`,
                            background: value === "Yes" ? T.teal : "white",
                            color: value === "Yes" ? "white" : T.ink, fontWeight: 600, fontSize: 12
                        }, children: "Yes" }), _jsx("button", { onClick: () => set(field.name, "No"), style: {
                            flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${value === "No" ? T.teal : T.line}`,
                            background: value === "No" ? T.teal : "white",
                            color: value === "No" ? "white" : T.ink, fontWeight: 600, fontSize: 12
                        }, children: "No" })] }));
        }
        if (field.type === "multiselect") {
            const selected = Array.isArray(value) ? value : [];
            return (_jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: field.options?.map((opt) => (_jsx("button", { onClick: () => {
                        const updated = selected.includes(opt) ? selected.filter((i) => i !== opt) : [...selected, opt];
                        set(field.name, updated);
                    }, style: {
                        padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                        border: `1px solid ${selected.includes(opt) ? T.teal : T.line}`,
                        background: selected.includes(opt) ? T.teal : "white",
                        color: selected.includes(opt) ? "white" : T.ink, fontWeight: 500
                    }, children: opt }, opt))) }));
        }
        if (field.type === "date" || field.type === "time") {
            return _jsx("input", { type: field.type, value: value, onChange: (e) => set(field.name, e.target.value), style: baseStyle });
        }
        if (field.type === "number") {
            return _jsx("input", { type: "number", value: value, onChange: (e) => set(field.name, e.target.value), style: baseStyle });
        }
        if (field.type === "textarea") {
            return _jsx("textarea", { value: value, onChange: (e) => set(field.name, e.target.value), rows: 3, style: { ...baseStyle, resize: "vertical" } });
        }
        return _jsx("input", { type: "text", value: value, onChange: (e) => set(field.name, e.target.value), style: baseStyle });
    };
    const section = sections[currentSection];
    return (_jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }, children: _jsxs("div", { className: "rast-card rast-fade-in", style: { width: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }, children: [_jsxs("div", { style: { padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Informal Assessment Checklist" }), _jsx("div", { className: "rast-serif", style: { fontSize: 18, fontWeight: 600, marginTop: 2 }, children: studentObj?.name || "Select Student" })] }), _jsx("button", { onClick: onClose, style: { background: "none", border: "none", cursor: "pointer", color: T.inkFaint }, children: _jsx(X, { size: 20 }) })] }), _jsx("div", { style: { display: "flex", gap: 4, padding: "12px 22px", borderBottom: `1px solid ${T.line}`, overflowX: "auto" }, className: "rast-scroll", children: sections.map((s, i) => (_jsx("button", { onClick: () => setCurrentSection(i), style: {
                            padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                            border: `1px solid ${i === currentSection ? T.teal : T.line}`,
                            background: i === currentSection ? T.teal : "white",
                            color: i === currentSection ? "white" : T.ink,
                        }, children: s.label }, s.name))) }), _jsxs("div", { className: "rast-scroll", style: { padding: 22, overflowY: "auto", flex: 1 }, children: [_jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Student *" }), _jsxs("select", { value: selectedStudent, onChange: (e) => setSelectedStudent(e.target.value), disabled: isStudentReadOnly, style: { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, opacity: isStudentReadOnly ? 0.7 : 1 }, children: [_jsx("option", { value: "", children: "Select a student" }), STUDENTS.map((s) => _jsx("option", { value: s.id, children: s.name }, s.id))] })] }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: section.fields.map((field) => (_jsxs("div", { children: [_jsxs("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: [field.label, field.required && _jsx("span", { style: { color: T.coral }, children: " *" })] }), renderField(field)] }, field.name))) }), saved && (_jsxs("div", { style: { marginTop: 16, padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }, children: [_jsx(CheckCircle2, { size: 16 }), " Assessment completed successfully!"] }))] }), _jsxs("div", { style: { padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", gap: 8 }, children: [_jsx("button", { onClick: () => setCurrentSection(Math.max(0, currentSection - 1)), disabled: currentSection === 0, style: {
                                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: currentSection === 0 ? "default" : "pointer",
                                opacity: currentSection === 0 ? 0.4 : 1
                            }, children: "\u2190 Previous" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: onClose, className: "rast-btn-ghost", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Cancel" }), currentSection < sections.length - 1 ? (_jsx("button", { onClick: () => setCurrentSection(currentSection + 1), className: "rast-btn-primary", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Next \u2192" })) : (_jsx("button", { onClick: () => { onSubmit(selectedStudent, form); setSaved(true); }, className: "rast-btn-primary", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Submit" }))] })] })] }) }));
};
/* ---------------------------------------------------------
   ADD STUDENT FORM (Admin)
------------------------------------------------- */
const AddStudentForm = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
        name: "", father: "", age: "", dob: "", gender: "", className: "", shift: "", program: "", parent: "", phone: "", diagnosis: "", allergies: "",
    });
    const [saved, setSaved] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const baseStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: "inherit" };
    return (_jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(21,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }, children: _jsxs("div", { className: "rast-card rast-fade-in", style: { width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }, children: [_jsxs("div", { style: { padding: "18px 22px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, fontWeight: 700, color: T.sage, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Add New Student" }), _jsx("div", { className: "rast-serif", style: { fontSize: 18, fontWeight: 600, marginTop: 2 }, children: "Student Enrollment" })] }), _jsx("button", { onClick: onClose, style: { background: "none", border: "none", cursor: "pointer", color: T.inkFaint }, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "rast-scroll", style: { padding: 22, overflowY: "auto", flex: 1 }, children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Student Name *" }), _jsx("input", { type: "text", value: form.name, onChange: (e) => set("name", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Father's Name" }), _jsx("input", { type: "text", value: form.father, onChange: (e) => set("father", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Date of Birth" }), _jsx("input", { type: "date", value: form.dob, onChange: (e) => set("dob", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Age" }), _jsx("input", { type: "number", value: form.age, onChange: (e) => set("age", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Gender" }), _jsxs("select", { value: form.gender, onChange: (e) => set("gender", e.target.value), style: { ...baseStyle, cursor: "pointer" }, children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "Male", children: "Male" }), _jsx("option", { value: "Female", children: "Female" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Shift" }), _jsxs("select", { value: form.shift, onChange: (e) => set("shift", e.target.value), style: { ...baseStyle, cursor: "pointer" }, children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "Morning", children: "Morning" }), _jsx("option", { value: "Afternoon", children: "Afternoon" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Program" }), _jsx("input", { type: "text", value: form.program, onChange: (e) => set("program", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Class Name" }), _jsx("input", { type: "text", value: form.className, onChange: (e) => set("className", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Parent/Guardian Name" }), _jsx("input", { type: "text", value: form.parent, onChange: (e) => set("parent", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Phone Number" }), _jsx("input", { type: "tel", value: form.phone, onChange: (e) => set("phone", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Diagnosis" }), _jsx("input", { type: "text", value: form.diagnosis, onChange: (e) => set("diagnosis", e.target.value), style: baseStyle })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }, children: "Allergies" }), _jsx("input", { type: "text", value: form.allergies, onChange: (e) => set("allergies", e.target.value), style: baseStyle })] })] }), saved && (_jsxs("div", { style: { padding: 12, background: T.sageSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: T.sage, fontSize: 13, fontWeight: 600 }, children: [_jsx(CheckCircle2, { size: 16 }), " New student added! \u26A0\uFE0F Therapist must complete Informal Assessment."] }))] }), _jsxs("div", { style: { padding: "14px 22px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }, children: [_jsx("button", { onClick: onClose, className: "rast-btn-ghost", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Cancel" }), _jsx("button", { onClick: () => { onSubmit(form); setSaved(true); }, className: "rast-btn-primary", style: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: "Add Student" })] })] }) }));
};
/* ---------------------------------------------------------
   LEGACY STUDENT PROFILE MARKUP
   (retained below only as historical prototype content)
/*
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

*/
/* ---------------------------------------------------------
   THERAPIST VIEWS
--------------------------------------------------------- */
const TherapistDashboard = ({ onOpenStudent, onShowReport, onChangeTab, onShowAssessment }) => {
    const myStudents = STUDENTS.filter((s) => THERAPISTS[0].students.includes(s.id));
    const today = SESSIONS.filter((s) => s.date === "2026-08-28");
    const pendingAssessments = myStudents.filter((s) => ASSESSMENT_STATUS[s.id] === false);
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 24, fontWeight: 600, marginBottom: 4 }, children: "Good afternoon, Marukh" }), _jsx("div", { style: { fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }, children: "Here's what's happening with your students today." }), pendingAssessments.length > 0 && (_jsxs("div", { className: "rast-card", style: { padding: 14, marginBottom: 20, borderLeft: `4px solid ${T.gold}`, background: T.goldSoft, display: "flex", alignItems: "center", gap: 12 }, children: [_jsx(AlertCircle, { size: 18, color: T.gold }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: T.ink }, children: [pendingAssessments.length, " student", pendingAssessments.length === 1 ? '' : 's', " need", pendingAssessments.length === 1 ? 's' : '', " Informal Assessment"] }), _jsx("div", { style: { fontSize: 12, color: T.inkSoft, marginTop: 2 }, children: pendingAssessments.map(s => s.name).join(", ") })] }), _jsx("button", { onClick: () => onShowAssessment(pendingAssessments[0]), className: "rast-btn-primary", style: { padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }, children: "Start now" })] })), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }, children: [
                    { label: "Assigned students", value: myStudents.length, icon: Users },
                    { label: "Today's sessions", value: today.length, icon: Clock },
                    { label: "Pending reports", value: 2, icon: AlertCircle, accent: true },
                    { label: "Completed this week", value: 11, icon: CheckCircle2 },
                ].map((c) => (_jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [_jsx("div", { style: { fontSize: 12, color: T.inkFaint, fontWeight: 600 }, children: c.label }), _jsx(c.icon, { size: 16, color: c.accent ? T.coral : T.inkFaint })] }), _jsx("div", { className: "rast-serif", style: { fontSize: 28, fontWeight: 600, marginTop: 6, color: c.accent ? T.coral : T.ink }, children: c.value })] }, c.label))) }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }, children: [_jsxs("div", { children: [_jsx(SectionLabel, { children: "Today's sessions" }), _jsx("div", { className: "rast-card", style: { padding: 0, overflow: "hidden", marginBottom: 22 }, children: today.map((s, i) => {
                                    const student = STUDENTS.find((st) => st.id === s.studentId);
                                    return (_jsxs("div", { onClick: () => onOpenStudent(student), style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < today.length - 1 ? `1px solid ${T.line}` : "none", cursor: "pointer" }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }, children: s.time }), _jsx(Avatar, { initials: student.photo, size: 34 }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 13.5, fontWeight: 600 }, children: student.name }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint }, children: [s.dept, " Therapy"] })] }), _jsx(ChevronRight, { size: 16, color: T.inkFaint })] }, s.id));
                                }) }), _jsx(SectionLabel, { children: "Students needing attention" }), _jsxs("div", { className: "rast-card", style: { padding: 16, display: "flex", gap: 12, alignItems: "center", borderColor: T.coral + "55" }, children: [_jsx(AlertCircle, { size: 18, color: T.coral }), _jsxs("div", { style: { fontSize: 13 }, children: [_jsx("strong", { children: "Haris Ali" }), " \u2014 daily log flags increased aggression reported at home. Consider a behavior check-in."] })] })] }), _jsxs("div", { children: [_jsx(SectionLabel, { children: "Quick actions" }), _jsx("div", { className: "rast-card", style: { padding: 8, marginBottom: 22 }, children: [
                                    { label: "Add daily coverage report", action: onShowReport },
                                    { label: "View students", action: () => onChangeTab("students") },
                                    { label: "Record session", action: null },
                                    { label: "Add assessment", action: null },
                                    { label: "Add progress note", action: null }
                                ].map((item, i) => (_jsxs("div", { onClick: item.action, style: {
                                        padding: "11px 12px", fontSize: 13, fontWeight: 600, cursor: item.action ? "pointer" : "default",
                                        borderBottom: i < 4 ? `1px solid ${T.line}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center",
                                        opacity: item.action ? 1 : 0.5
                                    }, children: [item.label, " ", _jsx(ChevronRight, { size: 14, color: T.inkFaint })] }, item.label))) }), _jsx(SectionLabel, { children: "Notifications" }), _jsx("div", { className: "rast-card", style: { padding: 14 }, children: NOTIFICATIONS.therapist.map((n, i) => (_jsxs("div", { style: { fontSize: 12.5, padding: "8px 0", borderBottom: i < 1 ? `1px solid ${T.line}` : "none" }, children: [_jsx("div", { children: n.text }), _jsx("div", { style: { color: T.inkFaint, fontSize: 11, marginTop: 2 }, children: n.time })] }, i))) })] })] })] }));
};
const TherapistStudents = ({ onOpenStudent }) => {
    const [q, setQ] = useState("");
    const myStudents = STUDENTS.filter((s) => THERAPISTS[0].students.includes(s.id));
    const filtered = myStudents.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600 }, children: "My students" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(Search, { size: 15, style: { position: "absolute", left: 10, top: 9, color: T.inkFaint } }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search students...", style: { padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 220 } })] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }, children: filtered.map((s) => (_jsxs("div", { onClick: () => onOpenStudent(s), className: "rast-card", style: { padding: 16, cursor: "pointer", display: "flex", gap: 12 }, children: [_jsx(Avatar, { initials: s.photo, size: 44 }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: s.name }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint, marginBottom: 8 }, children: [s.studentId, " \u00B7 Age ", s.age, " \u00B7 ", s.shift] }), _jsx("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: s.departments.filter((d) => THERAPISTS[0].dept === d || THERAPISTS.find(t => t.students.includes(s.id) && t.dept === d)).slice(0, 1).map((d) => (_jsx(Pill, { color: DEPT_COLOR[d], bg: DEPT_COLOR[d] + "22", children: d }, d))) })] })] }, s.id))) })] }));
};
/* ---------------------------------------------------------
   PARENT VIEWS
--------------------------------------------------------- */
const ParentDashboard = () => {
    const child = STUDENTS[0];
    const todaySessions = SESSIONS.filter((s) => s.studentId === child.id && s.date === "2026-08-28");
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }, children: [_jsxs("div", { children: [_jsx("div", { className: "rast-serif", style: { fontSize: 24, fontWeight: 600 }, children: "Good afternoon, Sana" }), _jsxs("div", { style: { fontSize: 13.5, color: T.inkFaint, marginTop: 2 }, children: ["Here's how ", child.name, " is doing."] })] }), _jsxs("div", { className: "rast-card", style: { padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, children: [_jsx(Avatar, { initials: child.photo, size: 28 }), _jsx("span", { style: { fontSize: 13, fontWeight: 600 }, children: child.name }), _jsx(ChevronDown, { size: 14, color: T.inkFaint })] })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }, children: [_jsxs("div", { children: [_jsx(SectionLabel, { children: "Today's schedule" }), _jsx("div", { className: "rast-card", style: { padding: 0, overflow: "hidden", marginBottom: 22 }, children: todaySessions.map((s, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < todaySessions.length - 1 ? `1px solid ${T.line}` : "none" }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }, children: s.time }), _jsx("div", { style: { width: 4, height: 30, background: DEPT_COLOR[s.dept], borderRadius: 4 } }), _jsxs("div", { children: [_jsxs("div", { style: { fontSize: 13.5, fontWeight: 600 }, children: [s.dept, " Therapy"] }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint }, children: ["with ", s.therapist] })] })] }, s.id))) }), _jsx(SectionLabel, { children: "Recent updates" }), _jsxs("div", { className: "rast-card", style: { padding: 16, marginBottom: 22, display: "flex", gap: 12 }, children: [_jsx(Avatar, { initials: "AI", size: 34, bg: T.tealSoft, color: T.teal }), _jsxs("div", { children: [_jsxs("div", { style: { fontSize: 13.5 }, children: [_jsx("strong", { children: "Ayesha Imran" }), " added a Speech Therapy progress update."] }), _jsx("div", { style: { fontSize: 12, color: T.inkFaint, marginTop: 2 }, children: "\"Improving object recognition \u2014 introduced 6 new picture cards this week.\"" })] })] }), _jsx(SectionLabel, { children: "Home recommendations" }), _jsx("div", { className: "rast-card", style: { padding: 16 }, children: _jsxs("div", { style: { fontSize: 13, lineHeight: 1.7 }, children: ["\u2022 Continue short, structured writing activities for 10 minutes daily.", _jsx("br", {}), "\u2022 Use visual schedules for transitions between activities.", _jsx("br", {}), "\u2022 Practice 2-step instructions during daily routines."] }) })] }), _jsxs("div", { children: [_jsx(SectionLabel, { children: "Progress" }), _jsxs("div", { className: "rast-card", style: { padding: 20, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }, children: [_jsx(GrowthRings, { progress: child.progress, size: 150 }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 12 }, children: Object.entries(child.progress).map(([d, v]) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12 }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: DEPT_COLOR[d] } }), _jsx("div", { style: { flex: 1, color: T.inkSoft }, children: d }), _jsxs("div", { style: { fontWeight: 600 }, children: [v, "%"] })] }, d))) })] }), _jsx(SectionLabel, { children: "Upcoming" }), _jsxs("div", { className: "rast-card", style: { padding: 14, marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }, children: [_jsx(Calendar, { size: 16, color: T.teal }), _jsxs("div", { style: { fontSize: 12.5 }, children: ["Parent/Teacher meeting \u2014 ", _jsx("strong", { children: "4 Sep 2026" })] })] }), _jsx(SectionLabel, { children: "Notifications" }), _jsx("div", { className: "rast-card", style: { padding: 14 }, children: NOTIFICATIONS.parent.map((n, i) => (_jsxs("div", { style: { fontSize: 12.5, padding: "8px 0", borderBottom: i < NOTIFICATIONS.parent.length - 1 ? `1px solid ${T.line}` : "none" }, children: [_jsx("div", { children: n.text }), _jsx("div", { style: { color: T.inkFaint, fontSize: 11, marginTop: 2 }, children: n.time })] }, i))) })] })] })] }));
};
/* ---------------------------------------------------------
   STUDENT VIEW
--------------------------------------------------------- */
const StudentDashboard = () => {
    const me = STUDENTS[0];
    const goals = GOALS.filter((g) => g.studentId === me.id);
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsxs("div", { className: "rast-serif", style: { fontSize: 24, fontWeight: 600, marginBottom: 4 }, children: ["Welcome, ", me.name] }), _jsx("div", { style: { fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }, children: "Here's your week at RAST." }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }, children: [_jsxs("div", { children: [_jsx(SectionLabel, { children: "Today's schedule" }), _jsx("div", { className: "rast-card", style: { padding: 0, overflow: "hidden", marginBottom: 22 }, children: SESSIONS.filter((s) => s.studentId === me.id && s.date === "2026-08-28").map((s, i, arr) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 700, color: T.inkFaint, width: 72 }, children: s.time }), _jsx("div", { style: { width: 4, height: 30, background: DEPT_COLOR[s.dept], borderRadius: 4 } }), _jsxs("div", { style: { fontSize: 13.5, fontWeight: 600 }, children: [s.dept, " Therapy"] })] }, s.id))) }), _jsx(SectionLabel, { children: "My goals" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: goals.map((g) => (_jsxs("div", { className: "rast-card", style: { padding: 14 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600 }, children: g.title }), _jsxs("div", { style: { fontSize: 13, fontWeight: 700 }, children: [g.progress, "%"] })] }), _jsx(ProgressBar, { value: g.progress, color: DEPT_COLOR[g.dept] })] }, g.id))) })] }), _jsxs("div", { children: [_jsx(SectionLabel, { children: "My progress" }), _jsx("div", { className: "rast-card", style: { padding: 20, display: "flex", justifyContent: "center", marginBottom: 22 }, children: _jsx(GrowthRings, { progress: me.progress, size: 150 }) }), _jsx(SectionLabel, { children: "Attendance" }), _jsxs("div", { className: "rast-card", style: { padding: 16, textAlign: "center", marginBottom: 22 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 30, fontWeight: 600, color: T.sage }, children: "92%" }), _jsx("div", { style: { fontSize: 12, color: T.inkFaint }, children: "this month" })] }), _jsx(SectionLabel, { children: "Notifications" }), _jsx("div", { className: "rast-card", style: { padding: 14 }, children: NOTIFICATIONS.student.map((n, i) => (_jsxs("div", { style: { fontSize: 12.5 }, children: [_jsx("div", { children: n.text }), _jsx("div", { style: { color: T.inkFaint, fontSize: 11, marginTop: 2 }, children: n.time })] }, i))) })] })] })] }));
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
    return (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 24, fontWeight: 600, marginBottom: 4 }, children: "School overview" }), _jsx("div", { style: { fontSize: 13.5, color: T.inkFaint, marginBottom: 24 }, children: "Friday, 28 August 2026" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }, children: stats.map((c) => (_jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("div", { style: { fontSize: 12, color: T.inkFaint, fontWeight: 600 }, children: c.label }), _jsx(c.icon, { size: 16, color: c.accent ? T.coral : T.inkFaint })] }), _jsx("div", { className: "rast-serif", style: { fontSize: 26, fontWeight: 600, marginTop: 6, color: c.accent ? T.coral : T.ink }, children: c.value })] }, c.label))) }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }, children: [_jsxs("div", { className: "rast-card", style: { padding: 20 }, children: [_jsx(SectionLabel, { children: "Students by shift" }), Object.entries(byShift).map(([k, v]) => (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }, children: [_jsx("span", { children: k }), _jsx("span", { style: { fontWeight: 600 }, children: v })] }), _jsx(ProgressBar, { value: (v / STUDENTS.length) * 100, color: T.teal })] }, k))), _jsx(SectionLabel, { children: "Students by department" }), ["Behavior", "Occupational", "Speech", "Remedial"].map((d) => {
                                const count = STUDENTS.filter((s) => s.departments.includes(d)).length;
                                return (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }, children: [_jsx("span", { children: d }), _jsx("span", { style: { fontWeight: 600 }, children: count })] }), _jsx(ProgressBar, { value: (count / STUDENTS.length) * 100, color: DEPT_COLOR[d] })] }, d));
                            })] }), _jsxs("div", { children: [_jsx(SectionLabel, { children: "Recent daily log entries" }), _jsx("div", { className: "rast-card", style: { padding: 0, overflow: "hidden" }, children: DAILY_LOGS.map((l, i) => (_jsxs("div", { style: { padding: "12px 16px", borderBottom: i < DAILY_LOGS.length - 1 ? `1px solid ${T.line}` : "none" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }, children: [_jsx("span", { children: l.student }), _jsx("span", { style: { color: T.inkFaint, fontWeight: 400, fontSize: 11 }, children: l.date })] }), _jsx("div", { style: { fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.5 }, children: l.note })] }, i))) })] })] })] }));
};
const AdminStudents = ({ onOpenStudent, onShowAddStudent }) => (_jsxs("div", { className: "rast-fade-in", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600 }, children: "All students" }), _jsxs("button", { onClick: () => onShowAddStudent(true), className: "rast-btn-primary", style: { padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }, children: [_jsx(Plus, { size: 14, style: { verticalAlign: -2, marginRight: 4 } }), "Add student"] })] }), _jsxs("div", { className: "rast-card", style: { padding: 0, overflow: "hidden" }, children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.line}` }, children: [_jsx("div", { children: "Student" }), _jsx("div", { children: "Shift" }), _jsx("div", { children: "Class" }), _jsx("div", { children: "Parent" }), _jsx("div", { children: "Status" })] }), STUDENTS.map((s) => (_jsxs("div", { onClick: () => onOpenStudent(s), style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 18px", alignItems: "center", borderBottom: `1px solid ${T.line}`, cursor: "pointer", fontSize: 13 }, children: [_jsxs("div", { style: { display: "flex", gap: 10, alignItems: "center" }, children: [_jsx(Avatar, { initials: s.photo, size: 30 }), _jsx("div", { style: { fontWeight: 600 }, children: s.name })] }), _jsx("div", { style: { color: T.inkSoft }, children: s.shift }), _jsx("div", { style: { color: T.inkSoft }, children: s.className }), _jsx("div", { style: { color: T.inkSoft }, children: s.parent }), _jsx(Pill, { color: T.sage, bg: T.sageSoft, children: s.status })] }, s.id)))] })] }));
/* ---------------------------------------------------------
   GENERIC "COMING SOON" PANEL for lightly-stubbed nav items
--------------------------------------------------------- */
const StubPanel = ({ title, icon }) => (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600, marginBottom: 18 }, children: title }), _jsx("div", { className: "rast-card", children: _jsx(EmptyState, { icon: icon, title: "Nothing to show yet", body: "This module follows the same data model as the others \u2014 connect it once the backend is in place." }) })] }));
const FormModal = ({ title, fields, onClose, onSubmit }) => {
    const [data, setData] = useState({});
    const [saving, setSaving] = useState(false);
    const set = (name, value) => setData((current) => ({ ...current, [name]: value }));
    const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13 };
    const submit = async (event) => { event.preventDefault(); setSaving(true); await onSubmit(data); setSaving(false); };
    return _jsx("div", { style: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(21,36,32,.45)", display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }, children: _jsxs("form", { onSubmit: submit, className: "rast-card rast-scroll", style: { width: 700, maxHeight: "90vh", overflowY: "auto", padding: 24 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 21, fontWeight: 600 }, children: title }), _jsx("button", { type: "button", onClick: onClose, style: { border: 0, background: "none", cursor: "pointer" }, children: _jsx(X, { size: 20 }) })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 15 }, children: fields.map((field) => _jsxs("label", { style: { fontSize: 12, fontWeight: 600, gridColumn: field.wide ? "1 / -1" : undefined }, children: [field.label, field.type === "textarea" ? _jsx("textarea", { required: field.required, rows: 3, value: data[field.name] || "", onChange: (e) => set(field.name, e.target.value), style: { ...inputStyle, display: "block", marginTop: 6, resize: "vertical" } }) : field.type === "select" ? _jsxs("select", { required: field.required, value: data[field.name] || "", onChange: (e) => set(field.name, e.target.value), style: { ...inputStyle, display: "block", marginTop: 6 }, children: [_jsx("option", { value: "", children: "Select..." }), field.options.map((option) => _jsx("option", { children: option }, option))] }) : _jsx("input", { required: field.required, type: field.type || "text", value: data[field.name] || "", onChange: (e) => set(field.name, e.target.value), style: { ...inputStyle, display: "block", marginTop: 6 } })] }, field.name)) }), _jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }, children: [_jsx("button", { type: "button", onClick: onClose, className: "rast-btn-ghost", style: { padding: "9px 15px", borderRadius: 8 }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: saving, className: "rast-btn-primary", style: { padding: "9px 15px", borderRadius: 8 }, children: saving ? "Saving..." : "Save form" })] })] }) });
};
const HEALTH_HISTORY_FIELDS = [
    { name: "dateOfBirth", label: "Date of birth", type: "date", required: true }, { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"], required: true },
    { name: "guardian", label: "Parent or guardian name", required: true }, { name: "relationship", label: "Relationship", type: "select", options: ["Biological", "Step Parent", "Adoptive", "Grandparent", "Other"], required: true },
    { name: "primaryLanguage", label: "Primary language at home", required: true }, { name: "livingWith", label: "Child mainly lives with", type: "select", options: ["Mother", "Father", "Grandparents", "Other"] }, { name: "legalCustody", label: "Legal custody", type: "select", options: ["Mother", "Father", "Grandparents", "Other"] }, { name: "householdMembers", label: "Everyone living in the home", wide: true, type: "textarea" },
    { name: "pregnancyLength", label: "Length of pregnancy" }, { name: "birthWeight", label: "Birth weight" }, { name: "deliveryHospital", label: "Hospital of delivery" }, { name: "nicU", label: "Spent time in NICU?", type: "select", options: ["Yes", "No"] },
    { name: "pregnancyComplications", label: "Complications during pregnancy?", type: "select", options: ["Yes", "No"] }, { name: "pregnancyDetails", label: "Pregnancy/delivery details", wide: true, type: "textarea" },
    { name: "medications", label: "Medications ever taken", wide: true, type: "textarea" }, { name: "fever104", label: "Fever greater than 104?", type: "select", options: ["Yes", "No"] }, { name: "hospitalized", label: "Ever hospitalized?", type: "select", options: ["Yes", "No"] }, { name: "healthConditions", label: "Health conditions", wide: true, type: "textarea" },
    { name: "fallsBalance", label: "Falls or loses balance?", type: "select", options: ["Yes", "No"] }, { name: "diagnosedCondition", label: "Diagnosed condition?", type: "select", options: ["Yes", "No"] }, { name: "diagnosisDetails", label: "Diagnosis and current condition", wide: true, type: "textarea" },
    { name: "firstWordAge", label: "Age at first word" }, { name: "walkAloneAge", label: "Age walked alone" }, { name: "communication", label: "Communication", type: "select", options: ["Fluent", "Minimal", "Less communicative", "Not at all"] }, { name: "speechUnderstood", label: "Speech understood by family", type: "select", options: ["Yes", "No", "Sometimes", "Not at all"] }, { name: "speechConcerns", label: "Speech concerns?", type: "select", options: ["Yes", "No"] },
    { name: "therapies", label: "Therapies received", wide: true, type: "textarea" }, { name: "servicesDetails", label: "Institution and duration", wide: true, type: "textarea" },
];
const MEETING_FIELDS = [
    { name: "studentId", label: "Student", type: "select", options: STUDENTS.map((student) => `${student.id}|${student.name}`), required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "time", label: "Time", type: "time", required: true }, { name: "diagnosis", label: "Diagnosis" }, { name: "therapistName", label: "Therapist name" }, { name: "parentConcerns", label: "Parents' concerns", wide: true, type: "textarea" }, { name: "parentProgress", label: "Parental progress feedback", wide: true, type: "textarea" }, { name: "progressRating", label: "Progress", type: "select", options: ["Excellent", "Good", "Fair", "Unsatisfactory", "Other"] }, { name: "otherProgress", label: "If Other, specify" }, { name: "therapistAdvice", label: "Therapist advice", wide: true, type: "textarea" }, { name: "therapistProgress", label: "Therapist progress feedback", wide: true, type: "textarea" }, { name: "reinforcements", label: "Re-inforcements", type: "textarea" }, { name: "eyeContact", label: "Eye contact", type: "select", options: ["Yes", "No", "Sometimes"] }, { name: "sitting", label: "Sitting", type: "select", options: ["Yes", "No", "Sometimes"] }, { name: "commandFollowing", label: "Command following", type: "select", options: ["Yes", "No", "Sometimes"] },
];
/* ---------------------------------------------------------
   APP SHELL
--------------------------------------------------------- */
export default function RastApp() {
    const [role, setRole] = useState(null);
    const [tab, setTab] = useState("dashboard");
    const [openStudent, setOpenStudent] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [assessmentStudent, setAssessmentStudent] = useState(null);
    const [showHealthHistory, setShowHealthHistory] = useState(false);
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [, refreshData] = useState(0);
    const [mobileNav, setMobileNav] = useState(false);
    const selectRole = async (nextRole) => {
        const credentials = {
            admin: ["admin@rast.local", "RastDev!2026"], therapist: ["therapist@rast.local", "RastDev!2026"],
            parent: ["parent@rast.local", "RastDev!2026"], student: ["student@rast.local", "RastDev!2026"],
        }[nextRole];
        try {
            const session = await api.login(credentials[0], credentials[1]);
            localStorage.setItem("rast_token", session.token);
            const remoteStudents = await api.getStudents();
            if (remoteStudents.length) {
                STUDENTS = remoteStudents.map((student) => ({ ...student, studentId: student.studentCode, father: student.fatherName, dob: student.dateOfBirth?.slice(0, 10), admission: student.enrollmentDate?.slice(0, 10), parent: "", phone: "", photo: student.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(), departments: [], progress: {} }));
            }
            if (nextRole === "therapist") {
                const pending = await api.getPendingAssessments();
                ASSESSMENT_STATUS = Object.fromEntries(STUDENTS.map((student) => [student.id, pending.some((item) => item.id === student.id) === false]));
            }
            setRole(nextRole);
        }
        catch (error) {
            console.error("Unable to connect to the RAST API", error);
            setRole(nextRole);
        }
    };
    if (!role)
        return _jsxs("div", { className: "rast-root", children: [_jsx(GlobalStyle, {}), _jsx(RoleSelect, { onSelect: selectRole })] });
    const meta = ROLE_META[role];
    const nav = NAV[role];
    const goHome = () => { setRole(null); setTab("dashboard"); setOpenStudent(null); };
    const changeTab = (id) => { setTab(id); setOpenStudent(null); setMobileNav(false); };
    const addStudent = async (form) => {
        const savedStudent = await api.createStudent({
            studentCode: `26/27-${String(STUDENTS.length + 1).padStart(2, "0")}`,
            name: form.name, fatherName: form.father || null, dateOfBirth: form.dob,
            gender: form.gender || "Not specified", program: form.program || "School Readiness Program",
            className: form.className || null, shift: (form.shift || "AFTERNOON").toUpperCase(),
            enrollmentDate: new Date().toISOString(), diagnosis: form.diagnosis || null,
            allergies: form.allergies || null, emergencyContact: form.phone || null,
        });
        const id = savedStudent.id;
        STUDENTS = [...STUDENTS, {
                ...form, id, studentId: `26/27-${String(STUDENTS.length + 1).padStart(2, "0")}`,
                age: Number(form.age) || 0, status: "Active", admission: new Date().toISOString().slice(0, 10),
                emergencyContact: form.phone, departments: [], progress: {}, photo: form.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
            }];
        THERAPISTS = THERAPISTS.map((therapist, index) => index === 0
            ? { ...therapist, students: [...therapist.students, id] }
            : therapist);
        ASSESSMENT_STATUS = { ...ASSESSMENT_STATUS, [id]: false };
        refreshData((value) => value + 1);
        setShowAddStudent(false);
    };
    const completeAssessment = async (studentId, form) => {
        if (!studentId)
            return;
        await api.createAssessment({ studentId, department: "BEHAVIOR", date: form.date || new Date().toISOString(), type: "Informal Assessment Checklist", items: Object.entries(form).filter(([key]) => !["studentName", "date", "time"].includes(key)).map(([skill, rating]) => ({ category: "Informal Assessment Checklist", skill, rating: Array.isArray(rating) ? rating.join(", ") : String(rating), notes: null })) });
        ASSESSMENT_STATUS = { ...ASSESSMENT_STATUS, [studentId]: true };
        refreshData((value) => value + 1);
        setShowAssessmentForm(false);
    };
    const renderContent = () => {
        if (openStudent) {
            return _jsx(StudentProfile, { student: openStudent, onBack: () => setOpenStudent(null), onOpenReport: () => setShowReport(true) });
        }
        if (role === "therapist") {
            if (tab === "dashboard")
                return _jsx(TherapistDashboard, { onOpenStudent: setOpenStudent, onShowReport: () => setShowReport(true), onChangeTab: setTab, onShowAssessment: (student) => { setAssessmentStudent(student); setShowAssessmentForm(true); } });
            if (tab === "students")
                return _jsx(TherapistStudents, { onOpenStudent: setOpenStudent });
            if (tab === "goals")
                return (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600, marginBottom: 18 }, children: "Goals across your students" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: GOALS.map((g) => {
                                const st = STUDENTS.find((s) => s.id === g.studentId);
                                return (_jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13.5 }, children: g.title }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint }, children: [st.name, " \u00B7 ", g.dept, " \u00B7 ", g.type] })] }), _jsxs("div", { style: { fontWeight: 700 }, children: [g.progress, "%"] })] }), _jsx(ProgressBar, { value: g.progress, color: DEPT_COLOR[g.dept] })] }, g.id));
                            }) })] }));
            if (tab === "meetings")
                return (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600, marginBottom: 18 }, children: "Parent / teacher meetings" }), MEETINGS.map((m) => {
                            const st = STUDENTS.find((s) => s.id === m.studentId);
                            return (_jsxs("div", { className: "rast-card", style: { padding: 16 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 13.5 }, children: [st.name, " \u2014 ", m.purpose] }), _jsx(Pill, { children: m.status })] }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint }, children: [m.date, " \u00B7 ", m.attendees] })] }, m.id));
                        })] }));
            return _jsx(StubPanel, { title: nav.find((n) => n.id === tab)?.label, icon: ClipboardList });
        }
        if (role === "parent") {
            if (tab === "dashboard")
                return _jsx(ParentDashboard, {});
            if (tab === "health-history")
                return _jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600, marginBottom: 18 }, children: "Health & case history" }), _jsx("button", { onClick: () => setShowHealthHistory(true), className: "rast-btn-primary", style: { padding: "10px 15px", borderRadius: 8 }, children: "Fill health and history form" })] });
            if (tab === "progress")
                return (_jsx("div", { className: "rast-fade-in", style: { display: "flex", justifyContent: "center" }, children: _jsxs("div", { className: "rast-card", style: { padding: 28, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 340 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 18, fontWeight: 600, marginBottom: 16 }, children: "Abdul Ahad's progress" }), _jsx(GrowthRings, { progress: STUDENTS[0].progress, size: 200 })] }) }));
            return _jsx(StubPanel, { title: nav.find((n) => n.id === tab)?.label, icon: FileText });
        }
        if (role === "student") {
            if (tab === "dashboard")
                return _jsx(StudentDashboard, {});
            return _jsx(StubPanel, { title: nav.find((n) => n.id === tab)?.label, icon: FileText });
        }
        if (role === "admin") {
            if (tab === "dashboard")
                return _jsx(AdminDashboard, {});
            if (tab === "students")
                return _jsx(AdminStudents, { onOpenStudent: setOpenStudent, onShowAddStudent: setShowAddStudent });
            if (tab === "meetings")
                return _jsxs("div", { className: "rast-fade-in", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600 }, children: "Parent / teacher meetings" }), _jsxs("button", { onClick: () => setShowMeetingForm(true), className: "rast-btn-primary", style: { padding: "9px 14px", borderRadius: 8 }, children: [_jsx(Plus, { size: 14 }), " Record minutes"] })] }), MEETINGS.map((meeting) => _jsxs("div", { className: "rast-card", style: { padding: 16, marginBottom: 10 }, children: [meeting.date, " \u00B7 ", meeting.purpose || "Parent / teacher meeting"] }, meeting.id))] });
            if (tab === "staff")
                return (_jsxs("div", { className: "rast-fade-in", children: [_jsx("div", { className: "rast-serif", style: { fontSize: 22, fontWeight: 600, marginBottom: 18 }, children: "Therapists & staff" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }, children: THERAPISTS.map((t) => (_jsxs("div", { className: "rast-card", style: { padding: 16, display: "flex", gap: 12 }, children: [_jsx(Avatar, { initials: t.name.split(" ").map((w) => w[0]).join("").slice(0, 2), size: 40, bg: DEPT_COLOR[t.dept] + "22", color: DEPT_COLOR[t.dept] }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: t.name }), _jsxs("div", { style: { fontSize: 12, color: T.inkFaint }, children: [t.role, " \u00B7 ", t.students.length, " students"] })] })] }, t.id))) })] }));
            return _jsx(StubPanel, { title: nav.find((n) => n.id === tab)?.label, icon: BarChart3 });
        }
    };
    return (_jsxs("div", { className: "rast-root", style: { display: "flex", minHeight: 640, maxWidth: 1400, margin: "0 auto", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden" }, children: [_jsx(GlobalStyle, {}), _jsxs("div", { style: {
                    width: 220, background: T.tealDeep, color: "white", display: "flex", flexDirection: "column",
                    flexShrink: 0,
                }, className: mobileNav ? "" : "", children: [_jsxs("div", { style: { padding: "20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }, children: [_jsx("div", { style: { width: 30, height: 30, borderRadius: 8, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }, children: _jsx(Sparkles, { size: 15, color: T.tealDeep }) }), _jsx("div", { className: "rast-serif", style: { fontSize: 15, fontWeight: 600 }, children: "RAST" })] }), _jsx("div", { style: { padding: "14px 10px", flex: 1 }, children: nav.map((n) => (_jsxs("div", { onClick: () => changeTab(n.id), className: "rast-nav-item", style: {
                                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                                cursor: "pointer", fontSize: 13.5, fontWeight: 500, marginBottom: 2,
                                background: tab === n.id && !openStudent ? "rgba(255,255,255,0.12)" : "transparent",
                                color: tab === n.id && !openStudent ? "white" : "rgba(255,255,255,0.75)",
                            }, children: [_jsx(n.icon, { size: 16 }), n.label] }, n.id))) }), _jsx("div", { style: { padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.1)" }, children: _jsxs("div", { onClick: goHome, className: "rast-nav-item", style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.65)" }, children: [_jsx(LogOut, { size: 15 }), "Switch role"] }) })] }), _jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }, children: [_jsxs("div", { style: { padding: "14px 26px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { style: { position: "relative" }, children: [_jsx(Search, { size: 15, style: { position: "absolute", left: 10, top: 9, color: T.inkFaint } }), _jsx("input", { placeholder: "Search students, reports...", style: { padding: "8px 12px 8px 32px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, width: 260 } })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 16 }, children: [_jsxs("div", { style: { position: "relative", cursor: "pointer" }, children: [_jsx(Bell, { size: 18, color: T.inkSoft }), _jsx("div", { style: { position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: T.coral } })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx(Avatar, { initials: meta.initials, size: 32 }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600, lineHeight: 1.2 }, children: meta.label }), _jsx("div", { style: { fontSize: 11, color: T.inkFaint }, children: meta.sub })] })] })] })] }), _jsx("div", { className: "rast-scroll", style: { padding: 26, overflowY: "auto", flex: 1 }, children: renderContent() })] }), showReport && (_jsx(DailyReportForm, { student: openStudent, onClose: () => setShowReport(false) })), showAddStudent && (_jsx(AddStudentForm, { onClose: () => setShowAddStudent(false), onSubmit: addStudent })), showAssessmentForm && (_jsx(InformalAssessmentForm, { student: assessmentStudent, onClose: () => setShowAssessmentForm(false), onSubmit: completeAssessment })), showHealthHistory && _jsx(FormModal, { title: "Health & Case History Form", fields: HEALTH_HISTORY_FIELDS, onClose: () => setShowHealthHistory(false), onSubmit: async (data) => { await api.createHealthHistory(STUDENTS[0].id, data); setShowHealthHistory(false); } }), showMeetingForm && _jsx(FormModal, { title: "Parent / Teacher Minutes of Meeting", fields: MEETING_FIELDS, onClose: () => setShowMeetingForm(false), onSubmit: async (data) => { const [studentId] = data.studentId.split("|"); await api.createMeeting({ studentId, date: `${data.date}T${data.time || "00:00"}:00`, parentConcerns: data.parentConcerns, notes: data.therapistAdvice, data }); setShowMeetingForm(false); } })] }));
}
