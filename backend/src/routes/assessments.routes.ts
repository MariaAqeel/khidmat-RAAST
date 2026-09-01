import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const assessmentsRouter = Router();
assessmentsRouter.use(requireAuth);

assessmentsRouter.get("/pending", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
  const students = await prisma.student.findMany({
    where: therapist ? { therapists: { some: { therapistId: therapist.id } } } : undefined,
    include: { assessments: { where: { type: "Informal Assessment Checklist" }, select: { id: true }, take: 1 } },
    orderBy: { name: "asc" },
  });
  res.json(students.filter((student) => student.assessments.length === 0).map(({ assessments, ...student }) => student));
});

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
