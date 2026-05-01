import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { ChatService } from './chat.service';

const router = Router();

// POST /api/chat
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can access the AI chatbot.' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const response = await ChatService.handleChat(req.user!, message);
    res.json(response);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export { router as chatRouter };
