import { Router, Request, Response } from 'express';
import Kebaya from '../models/Kebaya';

const router = Router();

// Create Kebaya
router.post('/', async (req: Request, res: Response) => {
  try {
    const kebaya = new Kebaya(req.body);
    await kebaya.save();
    res.status(201).json(kebaya);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Kebayas
router.get('/', async (req: Request, res: Response) => {
  try {
    const kebayas = await Kebaya.find();
    res.json(kebayas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Kebaya stock or details
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const kebaya = await Kebaya.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });
    res.json(kebaya);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
