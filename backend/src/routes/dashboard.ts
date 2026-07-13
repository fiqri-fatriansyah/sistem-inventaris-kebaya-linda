import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';
import Customer from '../models/Customer';
import Event from '../models/Event';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find().populate('kebayaId');
    
    // Top 5 rented kebaya
    const kebayaCounts: Record<string, number> = {};
    for (const r of rentals) {
      if (r.kebayaId) {
        const kId = (r.kebayaId as any)._id.toString();
        kebayaCounts[kId] = (kebayaCounts[kId] || 0) + 1;
      }
    }
    const popSortedK = Object.entries(kebayaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topKebayas = [];
    for (const [id, count] of popSortedK) {
      const k = await Kebaya.findById(id);
      if (k) topKebayas.push({ kebaya: k, count });
    }

    // Top 5 active customers
    const customerCounts: Record<string, number> = {};
    for (const r of rentals) {
      customerCounts[r.customerId as string] = (customerCounts[r.customerId as string] || 0) + 1;
    }
    const popSortedC = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topCustomers = [];
    for (const [id, count] of popSortedC) {
      const c = await Customer.findById(id);
      if (c) topCustomers.push({ customer: c, count });
    }

    // Upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = await Event.find({ date: { $gte: today } }).sort({ date: 1 }).limit(5);

    // TIME SERIES DATA (For Charts)
    const revenuePerMonth = new Array(12).fill(0);
    const completedRentals = rentals.filter(r => r.status === 'Completed' && r.rentalEndTime);
    for (const r of completedRentals) {
      const month = new Date(r.rentalEndTime!).getMonth();
      revenuePerMonth[month] += r.amountToPay || 0;
    }

    const kebayaPopularity = topKebayas.map(t => ({ label: `${t.kebaya.jenis} (${t.kebaya.warna})`, count: t.count }));

    const rentalsPerMonth = new Array(12).fill(0);
    for (const r of rentals) {
      const month = new Date(r.rentalStartTime).getMonth();
      rentalsPerMonth[month]++;
    }

    res.json({
      topKebayas,
      topCustomers,
      upcomingEvents,
      charts: {
        revenuePerMonth,
        kebayaPopularity,
        rentalsPerMonth
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get late and soon-to-be-due rentals
router.get('/due', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2); // Up to end of tomorrow

    const dueRentals = await RentalTransaction.find({ 
      status: 'Active',
      expectedReturnDate: { $lt: tomorrow }
    }).populate('customerId kebayaId').sort({ expectedReturnDate: 1 });

    res.json(dueRentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
