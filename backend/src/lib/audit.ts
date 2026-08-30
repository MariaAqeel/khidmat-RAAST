import { prisma } from "./prisma";

export async function logAction(userId: string, action: string, entity: string, entityId?: string, details?: string) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details },
  });
}
