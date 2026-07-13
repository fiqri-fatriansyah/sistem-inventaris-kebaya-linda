import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import Kebaya from '../models/Kebaya';
import AuditLog from '../models/AuditLog';

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

    await AuditLog.create({
      action: 'CREATE',
      entity: 'Kebaya',
      details: `Added new kebaya: ${kebaya.jenis} (${kebaya.warna})`
    });

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
    
    await AuditLog.create({
      action: 'UPDATE',
      entity: 'Kebaya',
      details: `Updated kebaya: ${kebaya.jenis} (${kebaya.warna})`
    });

    res.json(kebaya);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const kebaya = await Kebaya.findByIdAndDelete(req.params.id);
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });
    
    await AuditLog.create({
      action: 'DELETE',
      entity: 'Kebaya',
      details: `Deleted kebaya: ${kebaya.jenis} (${kebaya.warna})`
    });
    res.json({ message: 'Kebaya deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
