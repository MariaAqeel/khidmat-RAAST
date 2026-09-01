/**
 * Thin fetch wrapper for the RAST backend. Vite's dev proxy forwards
 * /api/* to http://localhost:4000/* (see vite.config.ts), so this file
 * never needs a hardcoded host.
 *
 * Swap the mock data in App.tsx for calls to these functions module by
 * module (start with `login`, then `getStudents`) rather than all at once.
 */
const BASE = "/api";
function authHeader() {
    const token = localStorage.getItem("rast_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
            ...(options.headers ?? {}),
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
    }
    return res.json();
}
export const api = {
    login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    getStudents: () => request("/students"),
    createStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
    assignTherapist: (studentId, data) => request(`/students/${studentId}/assign-therapist`, { method: "POST", body: JSON.stringify(data) }),
    getStudent: (id) => request(`/students/${id}`),
    getStudentProgress: (id) => request(`/students/${id}/progress`),
    getStudentAssessments: (id) => request(`/students/${id}/assessments`),
    getStudentTherapy: (id) => request(`/students/${id}/therapy`),
    getHealthHistory: (studentId) => request(`/case-history/${studentId}`),
    createHealthHistory: (studentId, data) => request(`/case-history/${studentId}`, { method: "POST", body: JSON.stringify(data) }),
    updateHealthHistory: (studentId, id, data) => request(`/case-history/${studentId}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    createSession: (data) => request("/therapy/sessions", { method: "POST", body: JSON.stringify(data) }),
    createDailyReport: (data) => request("/therapy/reports", { method: "POST", body: JSON.stringify(data) }),
    updateDailyReport: (id, data) => request(`/therapy/reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    createAssessment: (data) => request("/assessments", { method: "POST", body: JSON.stringify(data) }),
    getPendingAssessments: () => request("/assessments/pending"),
    createGoal: (data) => request("/goals", { method: "POST", body: JSON.stringify(data) }),
    updateGoal: (id, data) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    getMeetings: (studentId) => request(`/meetings${studentId ? `?studentId=${studentId}` : ""}`),
    createMeeting: (data) => request("/meetings", { method: "POST", body: JSON.stringify(data) }),
    getAttendance: (studentId) => request(`/attendance${studentId ? `?studentId=${studentId}` : ""}`),
    markAttendance: (data) => request("/attendance", { method: "POST", body: JSON.stringify(data) }),
    getNotifications: () => request("/notifications"),
};
