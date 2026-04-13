import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { AttendanceService } from "./attendance.service";
import { createSessionSchema } from "./attendance.schemas";

const router = Router();

/**
 * Faculty: Get scheduled classes for a specific date
 */
router.get(
  "/my-scheduled-classes",
  requireAuth,
  async (req: any, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.status(400).json({ error: "date query parameter is required (YYYY-MM-DD)" });

      const classes = await AttendanceService.getScheduledClasses(req.user, date);
      res.json(classes);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Faculty: Mark attendance
 */
router.post(
  "/sessions",
  requireAuth,
  can("create", "attendance"),
  async (req: any, res) => {
    try {
      const parsed = createSessionSchema.parse(req.body);

      const result = await AttendanceService.markSession(
        req.user, // ✅ pass full user object
        parsed
      );

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Get students in section (Scoped Access)
 */
router.get(
  "/section/:sectionId/students",
  requireAuth,
  can("read", "attendance"),
  async (req: any, res) => {
    try {
      const students = await AttendanceService.getSectionStudents(
        req.user, // ✅ pass full user
        req.params.sectionId
      );

      res.json(students);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  }
);

/**
 * Student: Get my summary
 */
router.get(
  "/me/summary",
  requireAuth,
  can("read", "attendance"),
  async (req: any, res) => {
    try {
      const summary = await AttendanceService.getStudentSummary(
        req.user // ✅ pass full user
      );

      res.json(summary);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  }
);

/**
 * Faculty/HOD/Admin: Get flagged students
 */
router.get(
  "/flagged",
  requireAuth,
  can("read", "attendance"),
  async (req: any, res) => {
    try {
      const flagged = await AttendanceService.getFlaggedStudents(req.user);
      res.json(flagged);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  }
);

export default router;