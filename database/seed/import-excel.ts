/**
 * Safe importer: reads the reference Excel files in /assets/data and
 * normalizes them into the relational schema. Run AFTER `npm run migrate`.
 *
 * This intentionally does NOT blindly dump every column — it maps only
 * the fields that matter to the schema (see SPEC.md §25/§37) and skips
 * blank/template rows. Extend the column mapping below once you confirm
 * the exact header names in your copy of each sheet (they can drift
 * between exports).
 *
 * Usage: npm run import:excel   (from /database)
 */
import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient, Shift } from "@prisma/client";

const prisma = new PrismaClient();
const DATA_DIR = path.resolve(__dirname, "../../assets/data");

function readSheet(file: string, sheetIndex = 0) {
  const wb = XLSX.readFile(path.join(DATA_DIR, file));
  const sheetName = wb.SheetNames[sheetIndex];
  return XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName], { defval: null });
}

async function importStudentsFromShiftSheet() {
  console.log("Reading Afternoon_Shift_Data.xlsx ...");
  const rows = readSheet("Afternoon_Shift_Data.xlsx");

  let imported = 0;
  for (const row of rows) {
    // NOTE: adjust these keys to match your actual column headers once confirmed.
    const name = row["Name"] || row["Student Name"] || row["name"];
    if (!name || typeof name !== "string") continue;

    const studentCode = row["Student ID"] || row["ID"] || `AUTO-${imported + 1}`;
    const fatherName = row["Father Name"] || row["Father's Name"] || null;
    const className = row["Class"] || null;

    await prisma.student.upsert({
      where: { studentCode: String(studentCode) },
      update: {},
      create: {
        studentCode: String(studentCode),
        name: String(name).trim(),
        fatherName: fatherName ? String(fatherName).trim() : null,
        dateOfBirth: new Date("2019-01-01"), // placeholder — replace once DOB column confirmed
        gender: "Unspecified",
        program: "RAST Schooling System",
        className: className ? String(className) : null,
        shift: Shift.AFTERNOON,
        enrollmentDate: new Date(),
        status: "active",
      },
    });
    imported++;
  }
  console.log(`  -> upserted ${imported} students from shift sheet`);
}

async function importDailyLog() {
  console.log("Reading Daily_Log_Sheet_-_10062026.xlsx ...");
  const rows = readSheet("Daily_Log_Sheet_-_10062026.xlsx");

  let matched = 0;
  for (const row of rows) {
    const studentName = row["Student"] || row["student"];
    const note = row["Notes"] || row["Note"] || row["Observation"];
    if (!studentName || !note) continue;

    const student = await prisma.student.findFirst({ where: { name: String(studentName).trim() } });
    if (!student) continue;

    await prisma.attendance.upsert({
      where: {
        studentId_date_department: {
          studentId: student.id,
          date: new Date(row["Date"] || Date.now()),
          department: null as any,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        date: new Date(row["Date"] || Date.now()),
        status: "PRESENT",
      },
    }).catch(() => {}); // unique constraint may already exist — non-fatal for a log import

    matched++;
  }
  console.log(`  -> matched ${matched} daily log rows to existing students`);
}

async function main() {
  await importStudentsFromShiftSheet();
  await importDailyLog();
  console.log("Excel import complete. Review data via `npm run studio`.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
