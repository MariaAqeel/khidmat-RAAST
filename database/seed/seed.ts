/**
 * Seeds demo accounts + one realistic sample student (Abdul Ahad) so the
 * app is usable immediately after `npm run migrate`. Run: npm run seed
 */
import { PrismaClient, Role, Department, Shift, GoalType, GoalStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEV_PASSWORD = "RastDev!2026"; // dev-only — change before any real deployment

async function upsertUser(name: string, email: string, role: Role) {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role },
  });
}

async function main() {
  console.log("Seeding demo accounts...");
  const adminUser = await upsertUser("Zoya Farooqui", "admin@rast.local", Role.ADMIN);
  const therapistUser = await upsertUser("Marukh", "therapist@rast.local", Role.THERAPIST);
  const parentUser = await upsertUser("Sana Ahmed", "parent@rast.local", Role.PARENT);
  const studentUser = await upsertUser("Abdul Ahad", "student@rast.local", Role.STUDENT);

  const therapist = await prisma.therapist.upsert({
    where: { userId: therapistUser.id },
    update: {},
    create: { userId: therapistUser.id, department: Department.BEHAVIOR, title: "Behavior Therapist" },
  });

  const otTherapistUser = await upsertUser("Dr. Atiya", "atiya@rast.local", Role.THERAPIST);
  const otTherapist = await prisma.therapist.upsert({
    where: { userId: otTherapistUser.id },
    update: {},
    create: { userId: otTherapistUser.id, department: Department.OCCUPATIONAL, title: "Occupational Therapist" },
  });

  const speechTherapistUser = await upsertUser("Ayesha Imran", "ayesha@rast.local", Role.THERAPIST);
  const speechTherapist = await prisma.therapist.upsert({
    where: { userId: speechTherapistUser.id },
    update: {},
    create: { userId: speechTherapistUser.id, department: Department.SPEECH, title: "Speech Therapist" },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id, contactInformation: "0300-1234567" },
  });

  const student = await prisma.student.upsert({
    where: { studentCode: "23/24-01" },
    update: {},
    create: {
      studentCode: "23/24-01",
      userId: studentUser.id,
      name: "Abdul Ahad",
      fatherName: "Naveed Ahmed",
      dateOfBirth: new Date("2021-03-14"),
      gender: "Male",
      program: "RAST Schooling System – School Readiness Program",
      className: "R.T (Afternoon)",
      shift: Shift.AFTERNOON,
      enrollmentDate: new Date("2024-08-01"),
      diagnosis: "Global Developmental Delay",
      allergies: "None known",
      emergencyContact: "0300-1234567 (mother)",
    },
  });

  await prisma.studentParent.upsert({
    where: { studentId_parentId: { studentId: student.id, parentId: parent.id } },
    update: {},
    create: { studentId: student.id, parentId: parent.id, relationship: "mother" },
  });

  for (const [t, dept] of [
    [therapist, Department.BEHAVIOR],
    [otTherapist, Department.OCCUPATIONAL],
    [speechTherapist, Department.SPEECH],
  ] as const) {
    await prisma.studentTherapist.upsert({
      where: { studentId_therapistId_department: { studentId: student.id, therapistId: t.id, department: dept } },
      update: {},
      create: { studentId: student.id, therapistId: t.id, department: dept },
    });
  }

  await prisma.goal.createMany({
    data: [
      { studentId: student.id, therapistId: therapist.id, department: Department.BEHAVIOR, title: "Improve command following", goalType: GoalType.SHORT_TERM, status: GoalStatus.IN_PROGRESS, progress: 70, targetDate: new Date("2026-09-30") },
      { studentId: student.id, therapistId: otTherapist.id, department: Department.OCCUPATIONAL, title: "Improve independence in ADLs", goalType: GoalType.LONG_TERM, status: GoalStatus.IN_PROGRESS, progress: 45, targetDate: new Date("2027-01-15") },
      { studentId: student.id, therapistId: speechTherapist.id, department: Department.SPEECH, title: "Expand functional vocabulary to 50 words", goalType: GoalType.SHORT_TERM, status: GoalStatus.IN_PROGRESS, progress: 68, targetDate: new Date("2026-10-10") },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
  console.log("Demo logins (all use password:", DEV_PASSWORD, "):");
  console.log("  admin@rast.local / therapist@rast.local / parent@rast.local / student@rast.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
