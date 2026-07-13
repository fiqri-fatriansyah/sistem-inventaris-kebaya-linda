import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';

const router = Router();

// Create a rental (rent out a kebaya)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, kebayaId } = req.body;
    
    // Check stock
    const kebaya = await Kebaya.findById(kebayaId);
    if (!kebaya) return res.status(404).json({ error: 'Kebaya not found' });
    if (kebaya.availableStock <= 0) return res.status(400).json({ error: 'Out of stock' });

    // Decrement stock
    kebaya.availableStock -= 1;
    await kebaya.save();

    // Create transaction
    const rental = new RentalTransaction({ customerId, kebayaId });
    await rental.save();
    
    res.status(201).json(rental);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Complete a rental (return kebaya)
router.post('/:id/return', async (req: Request, res: Response) => {
  try {
    const rental = await RentalTransaction.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental transaction not found' });
    if (rental.status === 'Completed') return res.status(400).json({ error: 'Already completed' });

    const kebaya = await Kebaya.findById(rental.kebayaId);
    if (kebaya) {
      kebaya.availableStock += 1;
      await kebaya.save();
    }

    const amountToPay = req.body.amountToPay || (kebaya ? kebaya.price : 0);
    
    rental.status = 'Completed';
    rental.rentalEndTime = new Date();
    rental.amountToPay = amountToPay;
    await rental.save();

    res.json(rental);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get active rentals
router.get('/active', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find({ status: 'Active' }).populate('customerId').populate('kebayaId');
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
