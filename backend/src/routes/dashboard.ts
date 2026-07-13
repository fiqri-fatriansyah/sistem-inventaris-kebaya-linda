import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';
import Customer from '../models/Customer';
import Event from '../models/Event';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find();
    
    // Most rented kebaya
    const kebayaCounts: Record<string, number> = {};
    for (const r of rentals) {
      kebayaCounts[r.kebayaId as string] = (kebayaCounts[r.kebayaId as string] || 0) + 1;
    }
    let mostRentedKebayaId = null;
    let maxK = 0;
    for (const [id, count] of Object.entries(kebayaCounts)) {
      if (count > maxK) { maxK = count; mostRentedKebayaId = id; }
    }
    const mostRentedKebaya = mostRentedKebayaId ? await Kebaya.findById(mostRentedKebayaId) : null;

    // Most active customer
    const customerCounts: Record<string, number> = {};
    for (const r of rentals) {
      customerCounts[r.customerId as string] = (customerCounts[r.customerId as string] || 0) + 1;
    }
    let mostActiveCustomerId = null;
    let maxC = 0;
    for (const [id, count] of Object.entries(customerCounts)) {
      if (count > maxC) { maxC = count; mostActiveCustomerId = id; }
    }
    const mostActiveCustomer = mostActiveCustomerId ? await Customer.findById(mostActiveCustomerId) : null;

    // Upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = await Event.find({ date: { $gte: today } }).sort({ date: 1 }).limit(3);

    res.json({
      mostRentedKebaya: mostRentedKebaya ? { kebaya: mostRentedKebaya, count: maxK } : null,
      mostActiveCustomer: mostActiveCustomer ? { customer: mostActiveCustomer, count: maxC } : null,
      upcomingEvents
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
