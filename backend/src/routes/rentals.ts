import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';

const router = Router();

// Create new rental
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, kebayaId, expectedReturnDate, penaltyType, penaltyCost } = req.query.length ? req.query : req.body;
    
    // Check stock
    const kebaya = await Kebaya.findById(kebayaId);
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });
    if (kebaya.availableStock <= 0) return res.status(400).json({ error: 'Out of stock' });

    // Decrease stock
    kebaya.availableStock -= 1;
    await kebaya.save();

    // Default expected return date to +7 days if not provided
    const rentStart = new Date();
    const defaultReturn = new Date(rentStart);
    defaultReturn.setDate(defaultReturn.getDate() + 7);

    const rental = new RentalTransaction({
      customerId,
      kebayaId,
      rentalStartTime: rentStart,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : defaultReturn,
      penaltyType: penaltyType || 'None',
      penaltyCost: penaltyCost || 0
    });
    await rental.save();

    res.status(201).json(rental);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all active rentals
router.get('/active', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find({ status: 'Active' })
      .populate('customerId kebayaId')
      .sort({ expectedReturnDate: 1 });
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Return kebaya (calculate price + penalty)
router.post('/:id/return', async (req: Request, res: Response) => {
  try {
    const rental = await RentalTransaction.findById(req.params.id).populate('kebayaId');
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (rental.status === 'Completed') return res.status(400).json({ error: 'Already completed' });

    const kebaya = rental.kebayaId as any;
    const now = new Date();
    
    // Calculate rental duration in days (minimum 1 day)
    const msPerDay = 1000 * 60 * 60 * 24;
    const rentMs = now.getTime() - rental.rentalStartTime.getTime();
    let durationDays = Math.ceil(rentMs / msPerDay);
    if (durationDays < 1) durationDays = 1;

    let basePay = kebaya.price * durationDays;
    let penaltyPay = 0;

    // Check penalty
    if (now > rental.expectedReturnDate && rental.penaltyType !== 'None') {
      const lateMs = now.getTime() - rental.expectedReturnDate.getTime();
      const lateDays = Math.ceil(lateMs / msPerDay);
      
      if (rental.penaltyType === 'One-time') {
        penaltyPay = rental.penaltyCost;
      } else if (rental.penaltyType === 'Daily') {
        penaltyPay = rental.penaltyCost * lateDays;
      } else if (rental.penaltyType === 'Weekly') {
        penaltyPay = rental.penaltyCost * Math.ceil(lateDays / 7);
      }
    }

    rental.status = 'Completed';
    rental.rentalEndTime = now;
    rental.amountToPay = basePay + penaltyPay;
    await rental.save();

    // Increase stock
    kebaya.availableStock += 1;
    await kebaya.save();

    res.json({ rental, basePay, penaltyPay, total: rental.amountToPay });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
