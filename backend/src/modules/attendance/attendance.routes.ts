import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { AttendanceService } from "./attendance.service";
import { createSessionSchema } from "./attendance.schemas";

const router = Router();

/**
 * Faculty: Mark attendance
 */
router.post(
  "/sessions",
  requireAuth,
  can('create', 'attendance'),
  async (req: any, res) => {
    try {
      const parsed = createSessionSchema.parse(req.body);
      const result = await AttendanceService.markSession(
        req.user.id,
        parsed
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Faculty: Get students in section
 */
router.get(
  "/section/:sectionId/students",
  requireAuth,
  async (req: any, res) => {
    try {
      const students = await AttendanceService.getSectionStudents(
        req.params.sectionId
      );
      res.json(students);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Student: Get my summary
 */
router.get(
  "/me/summary",
  requireAuth,
  async (req: any, res) => {
    try {
      const summary = await AttendanceService.getStudentSummary(
        req.user.id
      );
      res.json(summary);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
