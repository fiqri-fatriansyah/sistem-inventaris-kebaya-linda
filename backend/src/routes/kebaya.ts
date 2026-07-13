import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import Kebaya from '../models/Kebaya';

const router = Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = '/uploads/' + req.file.filename;
    
    const kebaya = new Kebaya(data);
    await kebaya.save();
    res.status(201).json(kebaya);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const kebayas = await Kebaya.find();
    res.json(kebayas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = '/uploads/' + req.file.filename;

    const kebaya = await Kebaya.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });
    res.json(kebaya);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
