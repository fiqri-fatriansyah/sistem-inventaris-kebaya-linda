import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';
import Customer from '../models/Customer';
import Event from '../models/Event';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find().populate('kebayaId');
    
    // Most rented kebaya
    const kebayaCounts: Record<string, number> = {};
    for (const r of rentals) {
      if (r.kebayaId) {
        const kId = (r.kebayaId as any)._id.toString();
        kebayaCounts[kId] = (kebayaCounts[kId] || 0) + 1;
      }
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

    // TIME SERIES DATA (For Charts)
    // 1. Revenue per Month (Completed rentals)
    const revenuePerMonth = new Array(12).fill(0);
    const completedRentals = rentals.filter(r => r.status === 'Completed' && r.rentalEndTime);
    for (const r of completedRentals) {
      const month = new Date(r.rentalEndTime!).getMonth(); // 0 - 11
      revenuePerMonth[month] += r.amountToPay || 0;
    }

    // 2. Kebaya Popularity (Pie Chart) - Top 5
    const popSorted = Object.entries(kebayaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const kebayaPopularity = [];
    for (const [id, count] of popSorted) {
      const k = await Kebaya.findById(id);
      if (k) kebayaPopularity.push({ label: `${k.jenis} (${k.warna})`, count });
    }

    // 3. Rentals over time (Line chart) - By Month
    const rentalsPerMonth = new Array(12).fill(0);
    for (const r of rentals) {
      const month = new Date(r.rentalStartTime).getMonth();
      rentalsPerMonth[month]++;
    }

    res.json({
      mostRentedKebaya: mostRentedKebaya ? { kebaya: mostRentedKebaya, count: maxK } : null,
      mostActiveCustomer: mostActiveCustomer ? { customer: mostActiveCustomer, count: maxC } : null,
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

export default router;
