import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireAssignedStudent, requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const caseHistoryRouter = Router();
caseHistoryRouter.use(requireAuth);

caseHistoryRouter.get("/:studentId", requireAssignedStudent, async (req, res) => {
  const records = await prisma.caseHistory.findMany({
    where: { studentId: req.params.studentId },
    orderBy: { createdAt: "desc" },
  });
  res.json(records);
});

caseHistoryRouter.post("/:studentId", requireRole("PARENT", "ADMIN"), requireAssignedStudent, async (req, res) => {
  const record = await prisma.caseHistory.create({
    data: {
      studentId: req.params.studentId,
      category: "health_case_history",
      data: req.body ?? {},
      createdBy: req.user!.id,
    },
  });
  await logAction(req.user!.id, "created_health_case_history", "CaseHistory", record.id);
  res.status(201).json(record);
});

caseHistoryRouter.put("/:studentId/:id", requireRole("PARENT", "ADMIN"), requireAssignedStudent, async (req, res) => {
  const record = await prisma.caseHistory.update({
    where: { id: req.params.id },
    data: { data: req.body ?? {} },
  });
  await logAction(req.user!.id, "updated_health_case_history", "CaseHistory", record.id);
  res.json(record);
});