import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

/**
 * Restricts a route to specific roles. Use alongside requireAuth.
 * Example: router.post("/students", requireAuth, requireRole("ADMIN"), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }
    next();
  };
}

/**
 * Confirms a therapist is assigned to the :studentId in the route, or lets
 * admins through unconditionally. Students/parents get their own ownership
 * checks (requireOwnStudent / requireOwnChild) since their relation to a
 * student is different from a therapist's.
 */
export async function requireAssignedStudent(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).end();
  if (req.user.role === "ADMIN") return next();

  if (req.user.role === "THERAPIST") {
    const therapist = await prisma.therapist.findUnique({ where: { userId: req.user.id } });
    if (!therapist) return res.status(403).json({ error: "No therapist profile found." });
    const link = await prisma.studentTherapist.findFirst({
      where: { studentId: req.params.studentId, therapistId: therapist.id },
    });
    if (!link) return res.status(403).json({ error: "This student isn't assigned to you." });
    return next();
  }

  if (req.user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } });
    if (!parent) return res.status(403).json({ error: "No parent profile found." });
    const link = await prisma.studentParent.findFirst({
      where: { studentId: req.params.studentId, parentId: parent.id },
    });
    if (!link) return res.status(403).json({ error: "This isn't your child's record." });
    return next();
  }

  if (req.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student || student.id !== req.params.studentId) {
      return res.status(403).json({ error: "You can only view your own record." });
    }
    return next();
  }

  return res.status(403).end();
}
