import { Router, Request, Response } from 'express';
import Config from '../models/Config';
import AuditLog from '../models/AuditLog';
import Customer from '../models/Customer';
import Kebaya from '../models/Kebaya';
import RentalTransaction from '../models/RentalTransaction';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  let config = await Config.findOne();
  if (!config) {
    config = new Config();
    await config.save();
  }
  res.json(config);
});

router.post('/', async (req: Request, res: Response) => {
  try {
    let config = await Config.findOne();
    if (!config) config = new Config();
    
    config.penaltyType = req.body.penaltyType;
    config.penaltyCost = req.body.penaltyCost;
    await config.save();

    await AuditLog.create({
      action: 'UPDATE',
      entity: 'Config',
      details: `Global penalties updated to ${config.penaltyType} (Rp ${config.penaltyCost})`
    });

    res.json(config);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/wipe', async (req: Request, res: Response) => {
  try {
    const { pin, wipeAudit } = req.body;
    const masterPin = process.env.MASTER_PIN || '888888';

    if (pin !== masterPin) {
      return res.status(401).json({ error: 'Master PIN salah' });
    }

    await Customer.deleteMany({});
    await Kebaya.deleteMany({});
    await RentalTransaction.deleteMany({});

    if (wipeAudit) {
      await AuditLog.deleteMany({});
    }

    await AuditLog.create({
      action: 'DELETE',
      entity: 'System',
      details: wipeAudit ? `Factory Reset executed (Audit logs wiped)` : `Factory Reset executed (Audit logs preserved)`
    });

    res.json({ message: 'Semua data berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
