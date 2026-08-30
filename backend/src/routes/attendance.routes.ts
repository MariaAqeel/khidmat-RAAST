import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

export const attendanceRouter = Router();
attendanceRouter.use(requireAuth);

// GET /attendance?studentId=...
attendanceRouter.get("/", async (req, res) => {
  const studentId = req.query.studentId as string | undefined;
  const records = await prisma.attendance.findMany({
    where: studentId ? { studentId } : undefined,
    orderBy: { date: "desc" },
  });
  res.json(records);
});

// POST /attendance — therapist/admin marks attendance
attendanceRouter.post("/", requireRole("THERAPIST", "ADMIN"), async (req, res) => {
  const record = await prisma.attendance.create({ data: req.body });
  res.status(201).json(record);
});
