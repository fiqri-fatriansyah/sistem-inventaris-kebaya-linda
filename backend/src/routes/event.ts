import { Router, Request, Response } from 'express';
import Event from '../models/Event';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
