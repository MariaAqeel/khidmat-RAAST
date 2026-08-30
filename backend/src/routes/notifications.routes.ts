import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

// GET /notifications — only the signed-in user's own notifications
notificationsRouter.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
});

// PUT /notifications/:id/read
notificationsRouter.put("/:id/read", async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user!.id) {
    return res.status(404).json({ error: "Notification not found." });
  }
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json(updated);
});
