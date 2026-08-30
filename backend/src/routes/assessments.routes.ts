import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const assessmentsRouter = Router();
assessmentsRouter.use(requireAuth);

// POST /assessments  { studentId, department, date, type, items: [{category, skill, rating, notes}] }
assessmentsRouter.post("/", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
  const { studentId, department, date, type, items } = req.body ?? {};

  const assessment = await prisma.assessment.create({
    data: {
      studentId,
      therapistId: req.body.therapistId ?? therapist?.id,
      department,
      date: date ?? new Date(),
      type,
      items: { create: items ?? [] },
    },
    include: { items: true },
  });
  await logAction(req.user!.id, "created_assessment", "Assessment", assessment.id);
  res.status(201).json(assessment);
});
