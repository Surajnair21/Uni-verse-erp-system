import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { can } from '../../middlewares/can';
import { createTimetableSlotSchema, updateTimetableSlotSchema } from './timetable.schemas';
import { TimetableService } from './timetable.service';

export const timetableRouter = Router();

timetableRouter.use(requireAuth);

timetableRouter.get('/', can('read', 'timetable' as any), async (req: any, res) => {
    const sectionId = req.query.sectionId as string | undefined;
    const data = await TimetableService.listSlots(req.user, sectionId);
    res.json(data);
});

timetableRouter.post('/', can('create', 'timetable' as any), async (req, res) => {
    const parsed = createTimetableSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    }

    const slot = await TimetableService.createSlot(parsed.data);
    res.status(201).json(slot);
});

timetableRouter.put('/:id', can('update', 'timetable' as any), async (req, res) => {
    const parsed = updateTimetableSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const slot = await TimetableService.updateSlot(id, parsed.data);
    res.json(slot);
});

timetableRouter.delete('/:id', can('delete', 'timetable' as any), async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await TimetableService.deleteSlot(id);
    res.status(204).send();
});
