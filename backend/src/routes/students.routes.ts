import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireAssignedStudent, requireRole } from "../middleware/rbac";
import { logAction } from "../lib/audit";

export const studentsRouter = Router();
studentsRouter.use(requireAuth);

// GET /students — scoped by role: admin sees all, therapist sees assigned,
// parent sees their children, student sees only themself.
studentsRouter.get("/", async (req, res) => {
  const user = req.user!;

  if (user.role === "ADMIN") {
    return res.json(await prisma.student.findMany({ orderBy: { name: "asc" } }));
  }

  if (user.role === "THERAPIST") {
    const therapist = await prisma.therapist.findUnique({ where: { userId: user.id } });
    if (!therapist) return res.json([]);
    const links = await prisma.studentTherapist.findMany({
      where: { therapistId: therapist.id },
      include: { student: true },
    });
    return res.json(links.map((l) => l.student));
  }

  if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({ where: { userId: user.id } });
    if (!parent) return res.json([]);
    const links = await prisma.studentParent.findMany({
      where: { parentId: parent.id },
      include: { student: true },
    });
    return res.json(links.map((l) => l.student));
  }

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    return res.json(student ? [student] : []);
  }

  res.json([]);
});

// GET /students/:studentId — full profile, ownership-checked
studentsRouter.get("/:studentId", requireAssignedStudent, async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.studentId },
    include: { therapists: { include: { therapist: { include: { user: true } } } } },
  });
  if (!student) return res.status(404).json({ error: "Student not found." });
  res.json(student);
});

// GET /students/:studentId/progress
studentsRouter.get("/:studentId/progress", requireAssignedStudent, async (req, res) => {
  const goals = await prisma.goal.findMany({ where: { studentId: req.params.studentId } });
  const byDept: Record<string, { total: number; count: number }> = {};
  for (const g of goals) {
    byDept[g.department] ??= { total: 0, count: 0 };
    byDept[g.department].total += g.progress;
    byDept[g.department].count += 1;
  }
  const progress = Object.fromEntries(
    Object.entries(byDept).map(([dept, v]) => [dept, Math.round(v.total / v.count)])
  );
  res.json({ progress, goals });
});

// GET /students/:studentId/assessments
studentsRouter.get("/:studentId/assessments", requireAssignedStudent, async (req, res) => {
  const assessments = await prisma.assessment.findMany({
    where: { studentId: req.params.studentId },
    include: { items: true, therapist: { include: { user: true } } },
    orderBy: { date: "desc" },
  });
  res.json(assessments);
});

// GET /students/:studentId/therapy — session + daily report timeline
studentsRouter.get("/:studentId/therapy", requireAssignedStudent, async (req, res) => {
  const sessions = await prisma.therapySession.findMany({
    where: { studentId: req.params.studentId },
    include: { therapist: { include: { user: true } }, dailyReport: true },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// POST /students — admin only
studentsRouter.post("/", requireRole("ADMIN"), async (req, res) => {
  const student = await prisma.student.create({ data: req.body });
  await logAction(req.user!.id, "created_student", "Student", student.id);
  res.status(201).json(student);
});

// POST /students/:studentId/assign-therapist — admin only
studentsRouter.post("/:studentId/assign-therapist", requireRole("ADMIN"), async (req, res) => {
  const { therapistId, department } = req.body ?? {};
  const link = await prisma.studentTherapist.create({
    data: { studentId: req.params.studentId, therapistId, department },
  });
  await logAction(req.user!.id, "assigned_therapist", "StudentTherapist", req.params.studentId, `therapist=${therapistId} dept=${department}`);
  res.status(201).json(link);
});
