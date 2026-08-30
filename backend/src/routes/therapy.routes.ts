import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const therapyRouter = Router();
therapyRouter.use(requireAuth);

// POST /therapy/sessions — therapist creates a session for an assigned student
therapyRouter.post("/sessions", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
  if (!therapist && req.user!.role !== "ADMIN") return res.status(403).json({ error: "No therapist profile." });

  const session = await prisma.therapySession.create({
    data: { ...req.body, therapistId: req.body.therapistId ?? therapist?.id },
  });
  await logAction(req.user!.id, "created_session", "TherapySession", session.id);
  res.status(201).json(session);
});

// POST /therapy/reports — save a structured daily coverage report
// body.data holds the template-specific fields (see docs/report-templates.md)
therapyRouter.post("/reports", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
  const report = await prisma.dailyReport.create({
    data: {
      sessionId: req.body.sessionId,
      reportType: req.body.reportType,
      studentId: req.body.studentId,
      therapistId: req.body.therapistId ?? therapist?.id,
      date: req.body.date ?? new Date(),
      data: req.body.data,
      notes: req.body.notes,
    },
  });
  await logAction(req.user!.id, "created_daily_report", "DailyReport", report.id, `type=${report.reportType}`);
  res.status(201).json(report);
});

// PUT /therapy/reports/:id — a therapist may only edit their own report; admin can edit any
therapyRouter.put("/reports/:id", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const existing = await prisma.dailyReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Report not found." });

  if (req.user!.role === "THERAPIST") {
    const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
    if (existing.therapistId !== therapist?.id) {
      return res.status(403).json({ error: "You can only edit your own reports." });
    }
  }

  const updated = await prisma.dailyReport.update({ where: { id: req.params.id }, data: req.body });
  await logAction(req.user!.id, "updated_daily_report", "DailyReport", updated.id);
  res.json(updated);
});

// GET /therapy/reports/:id
therapyRouter.get("/reports/:id", async (req, res) => {
  const report = await prisma.dailyReport.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found." });
  res.json(report);
});
