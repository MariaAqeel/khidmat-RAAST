import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const meetingsRouter = Router();
meetingsRouter.use(requireAuth);

// POST /meetings — staff creates Parent/Teacher Minutes of Meeting
meetingsRouter.post("/", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const meeting = await prisma.meeting.create({ data: { ...req.body, createdBy: req.user!.id } });
  await logAction(req.user!.id, "created_meeting", "Meeting", meeting.id);
  res.status(201).json(meeting);
});

// GET /meetings?studentId=...
meetingsRouter.get("/", async (req, res) => {
  const studentId = req.query.studentId as string | undefined;
  const meetings = await prisma.meeting.findMany({
    where: studentId ? { studentId } : undefined,
    orderBy: { date: "desc" },
  });
  res.json(meetings);
});
