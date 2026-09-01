/**
 * Thin fetch wrapper for the RAST backend. 
 * 
 * Local dev: Vite's proxy forwards /api/* to http://localhost:4000/*
 * Production: Uses VITE_API_BASE_URL env variable (set via Vercel/Render)
 */

const BASE =
  import.meta.env.MODE === "production" && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : "/api";

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
  createStudent: (data: any) => request<any>("/students", { method: "POST", body: JSON.stringify(data) }),
  assignTherapist: (studentId: string, data: any) => request<any>(`/students/${studentId}/assign-therapist`, { method: "POST", body: JSON.stringify(data) }),
  getStudent: (id: string) => request<any>(`/students/${id}`),
  getStudentProgress: (id: string) => request<any>(`/students/${id}/progress`),
  getStudentAssessments: (id: string) => request<any[]>(`/students/${id}/assessments`),
  getStudentTherapy: (id: string) => request<any[]>(`/students/${id}/therapy`),
  getHealthHistory: (studentId: string) => request<any[]>(`/case-history/${studentId}`),
  createHealthHistory: (studentId: string, data: any) => request<any>(`/case-history/${studentId}`, { method: "POST", body: JSON.stringify(data) }),
  updateHealthHistory: (studentId: string, id: string, data: any) => request<any>(`/case-history/${studentId}/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  createSession: (data: any) => request<any>("/therapy/sessions", { method: "POST", body: JSON.stringify(data) }),
  createDailyReport: (data: any) => request<any>("/therapy/reports", { method: "POST", body: JSON.stringify(data) }),
  updateDailyReport: (id: string, data: any) => request<any>(`/therapy/reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  createAssessment: (data: any) => request<any>("/assessments", { method: "POST", body: JSON.stringify(data) }),
  getPendingAssessments: () => request<any[]>("/assessments/pending"),
  createGoal: (data: any) => request<any>("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => request<any>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getMeetings: (studentId?: string) => request<any[]>(`/meetings${studentId ? `?studentId=${studentId}` : ""}`),
  createMeeting: (data: any) => request<any>("/meetings", { method: "POST", body: JSON.stringify(data) }),

  getAttendance: (studentId?: string) => request<any[]>(`/attendance${studentId ? `?studentId=${studentId}` : ""}`),
  markAttendance: (data: any) => request<any>("/attendance", { method: "POST", body: JSON.stringify(data) }),

  getNotifications: () => request<any[]>("/notifications"),
};
