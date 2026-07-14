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

// Transfer Stock
router.post('/:id/transfer-stock', async (req: Request, res: Response) => {
  try {
    const { from, to, amount } = req.body;
    const qty = parseInt(amount, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const kebaya = await Kebaya.findById(req.params.id);
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });

    // Validate from stock
    if (from === 'available' && kebaya.availableStock < qty) return res.status(400).json({ error: 'Not enough available stock' });
    if (from === 'laundry' && kebaya.laundryStock < qty) return res.status(400).json({ error: 'Not enough laundry stock' });
    if (from === 'maintenance' && kebaya.maintenanceStock < qty) return res.status(400).json({ error: 'Not enough maintenance stock' });

    // Subtract from source
    if (from === 'available') kebaya.availableStock -= qty;
    if (from === 'laundry') kebaya.laundryStock -= qty;
    if (from === 'maintenance') kebaya.maintenanceStock -= qty;

    // Add to destination
    if (to === 'available') kebaya.availableStock += qty;
    if (to === 'laundry') kebaya.laundryStock += qty;
    if (to === 'maintenance') kebaya.maintenanceStock += qty;

    await kebaya.save();

    await AuditLog.create({
      action: 'UPDATE',
      entity: 'Kebaya',
      details: `Transferred ${qty} stock from ${from} to ${to} for kebaya ${kebaya.jenis} (${kebaya.warna})`
    });

    res.json(kebaya);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
