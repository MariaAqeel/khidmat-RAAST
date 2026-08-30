/**
 * Thin fetch wrapper for the RAST backend. Vite's dev proxy forwards
 * /api/* to http://localhost:4000/* (see vite.config.ts), so this file
 * never needs a hardcoded host.
 *
 * Swap the mock data in App.tsx for calls to these functions module by
 * module (start with `login`, then `getStudents`) rather than all at once.
 */

const BASE = "/api";

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("rast_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getStudents: () => request<any[]>("/students"),
  getStudent: (id: string) => request<any>(`/students/${id}`),
  getStudentProgress: (id: string) => request<any>(`/students/${id}/progress`),
  getStudentAssessments: (id: string) => request<any[]>(`/students/${id}/assessments`),
  getStudentTherapy: (id: string) => request<any[]>(`/students/${id}/therapy`),

  createSession: (data: any) => request<any>("/therapy/sessions", { method: "POST", body: JSON.stringify(data) }),
  createDailyReport: (data: any) => request<any>("/therapy/reports", { method: "POST", body: JSON.stringify(data) }),
  updateDailyReport: (id: string, data: any) => request<any>(`/therapy/reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  createAssessment: (data: any) => request<any>("/assessments", { method: "POST", body: JSON.stringify(data) }),
  createGoal: (data: any) => request<any>("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => request<any>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getMeetings: (studentId?: string) => request<any[]>(`/meetings${studentId ? `?studentId=${studentId}` : ""}`),
  createMeeting: (data: any) => request<any>("/meetings", { method: "POST", body: JSON.stringify(data) }),

  getAttendance: (studentId?: string) => request<any[]>(`/attendance${studentId ? `?studentId=${studentId}` : ""}`),
  markAttendance: (data: any) => request<any>("/attendance", { method: "POST", body: JSON.stringify(data) }),

  getNotifications: () => request<any[]>("/notifications"),
};
