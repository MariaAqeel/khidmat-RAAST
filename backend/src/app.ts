import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.routes";
import { studentsRouter } from "./routes/students.routes";
import { therapyRouter } from "./routes/therapy.routes";
import { assessmentsRouter } from "./routes/assessments.routes";
import { goalsRouter } from "./routes/goals.routes";
import { meetingsRouter } from "./routes/meetings.routes";
import { attendanceRouter } from "./routes/attendance.routes";
import { notificationsRouter } from "./routes/notifications.routes";
import { caseHistoryRouter } from "./routes/case-history.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRouter);
app.use("/students", studentsRouter);
app.use("/therapy", therapyRouter);
app.use("/assessments", assessmentsRouter);
app.use("/goals", goalsRouter);
app.use("/meetings", meetingsRouter);
app.use("/attendance", attendanceRouter);
app.use("/notifications", notificationsRouter);
app.use("/case-history", caseHistoryRouter);

// Centralized error handler — never leak stack traces to the client.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: "Something went wrong. Please try again." });
});
