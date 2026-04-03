import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { can } from '../../middlewares/can';
import { IAService } from './ia.service';
import { createComponentSchema, upsertMarksSchema } from './ia.schemas';

const router = Router();

// GET /api/ia/my-marks  — student views their own marks
router.get('/my-marks', requireAuth, can('read', 'ia'), async (req, res) => {
  try {
    const data = await IAService.getMyMarks(req.user!);
    res.json(data);
  } catch (e: any) {
    res.status(403).json({ message: e.message });
  }
});

// GET /api/ia?sectionId=&subjectId=  — list components (scoped)
router.get('/', requireAuth, can('read', 'ia'), async (req, res) => {
  try {
    const { sectionId, subjectId } = req.query as Record<string, string>;
    const data = await IAService.listComponents(req.user!, { sectionId, subjectId });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// GET /api/ia/:id — fetch a single component with its marks
router.get('/:id', requireAuth, can('read', 'ia'), async (req, res) => {
  try {
    const id = String(req.params.id);
    const data = await IAService.getComponent(req.user!, id);
    if (!data) return res.status(404).json({ message: 'Component not found.' });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// POST /api/ia  — faculty/admin create a component
router.post('/', requireAuth, can('create', 'ia'), async (req, res) => {
  try {
    const parsed = createComponentSchema.parse(req.body);
    const component = await IAService.createComponent(req.user!, parsed);
    res.status(201).json(component);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE /api/ia/:id
router.delete('/:id', requireAuth, can('delete', 'ia'), async (req, res) => {
  try {
    const id = String(req.params.id);
    await IAService.deleteComponent(req.user!, id);
    res.json({ message: 'Deleted.' });
  } catch (e: any) {
    res.status(403).json({ message: e.message });
  }
});

// PUT /api/ia/:id/marks  — faculty/admin enter/update marks
router.put('/:id/marks', requireAuth, can('update', 'ia'), async (req, res) => {
  try {
    const id = String(req.params.id);
    const { marks } = upsertMarksSchema.parse(req.body);
    const result = await IAService.upsertMarks(req.user!, id, marks);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export { router as iaRouter };
