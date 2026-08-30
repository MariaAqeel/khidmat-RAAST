import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const goalsRouter = Router();
goalsRouter.use(requireAuth);

// POST /goals
goalsRouter.post("/", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const therapist = await prisma.therapist.findUnique({ where: { userId: req.user!.id } });
  const goal = await prisma.goal.create({
    data: { ...req.body, therapistId: req.body.therapistId ?? therapist?.id },
  });
  await logAction(req.user!.id, "created_goal", "Goal", goal.id);
  res.status(201).json(goal);
});

// PUT /goals/:id — update progress/status
goalsRouter.put("/:id", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const goal = await prisma.goal.update({ where: { id: req.params.id }, data: req.body });
  await logAction(req.user!.id, "updated_goal", "Goal", goal.id);
  res.json(goal);
});
