import { Router, Request, Response } from 'express';
import RentalTransaction from '../models/RentalTransaction';
import Kebaya from '../models/Kebaya';
import Customer from '../models/Customer';
import Config from '../models/Config';
import AuditLog from '../models/AuditLog';
import { generateReceipt } from '../utils/receiptGenerator';
import nodemailer from 'nodemailer';
import path from 'path';

const router = Router();

// Create rental
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, kebayaId, expectedReturnDate, depositAmount, depositPaid } = req.body;
    
    const kebaya = await Kebaya.findById(kebayaId);
    if (!kebaya || kebaya.availableStock < 1) {
      return res.status(400).json({ error: 'Kebaya not available' });
    }

    const transactionId = 'TRX-' + Date.now().toString().slice(-6);

    const rental = new RentalTransaction({
      transactionId,
      customerId,
      kebayaId,
      expectedReturnDate,
      depositAmount: depositAmount || 0,
      depositPaid: depositPaid || false
    });

    kebaya.availableStock -= 1;
    await kebaya.save();
    await rental.save();

    const populatedRental = await RentalTransaction.findById(rental._id).populate('customerId').populate('kebayaId');

    // Generate deposit receipt
    generateReceipt(populatedRental, 'Deposit');

    await AuditLog.create({
      action: 'RENT',
      entity: 'Rental',
      details: `Created rental ${transactionId} for customer ID ${customerId}`
    });

    res.status(201).json(populatedRental);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get active (including unpaid) and historical
router.get('/', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find()
      .populate('customerId')
      .populate('kebayaId')
      .sort({ expectedReturnDate: 1 });
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Return Kebaya
router.post('/:id/return', async (req: Request, res: Response) => {
  try {
    const rental = await RentalTransaction.findById(req.params.id).populate('customerId').populate('kebayaId');
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (rental.status !== 'Active') return res.status(400).json({ error: 'Rental is already completed or cancelled' });

    rental.status = 'Completed';
    rental.rentalEndTime = new Date();

    // Logic for penalty
    const config = await Config.findOne();
    let penaltyPay = 0;
    
    // Check if late
    if (rental.rentalEndTime > rental.expectedReturnDate) {
      const msLate = rental.rentalEndTime.getTime() - rental.expectedReturnDate.getTime();
      const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
      
      if (config && config.penaltyType === 'One-time') {
        penaltyPay = config.penaltyCost;
      } else if (config && config.penaltyType === 'Daily') {
        penaltyPay = config.penaltyCost * daysLate;
      } else if (config && config.penaltyType === 'Weekly') {
        penaltyPay = config.penaltyCost * Math.ceil(daysLate / 7);
      }
    }

    // Base price formula = price * days
    const msRented = rental.rentalEndTime.getTime() - rental.rentalStartTime.getTime();
    let daysRented = Math.ceil(msRented / (1000 * 60 * 60 * 24));
    if (daysRented < 1) daysRented = 1;

    const k = rental.kebayaId as any;
    const basePay = k.price * daysRented;
    
    rental.amountToPay = basePay + penaltyPay - rental.depositAmount;
    await rental.save();

    const kebaya = await Kebaya.findById(rental.kebayaId);
    if (kebaya) {
      kebaya.availableStock += 1;
      await kebaya.save();
    }

    // Generate Lunas receipt
    generateReceipt(rental, 'Lunas');

    await AuditLog.create({
      action: 'RETURN',
      entity: 'Rental',
      details: `Returned rental ${rental.transactionId} (Late: ${penaltyPay > 0}, Tagihan: ${rental.amountToPay})`
    });

    res.json({
      rental,
      basePay,
      penaltyPay,
      depositAmount: rental.depositAmount,
      total: rental.amountToPay
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Rental
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const rental = await RentalTransaction.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (rental.status !== 'Active') return res.status(400).json({ error: 'Only Active rentals can be cancelled' });

    rental.status = 'Cancelled';
    await rental.save();

    const kebaya = await Kebaya.findById(rental.kebayaId);
    if (kebaya) {
      kebaya.availableStock += 1;
      await kebaya.save();
    }

    await AuditLog.create({
      action: 'CANCEL',
      entity: 'Rental',
      details: `Cancelled rental ${rental.transactionId}`
    });

    res.json(rental);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Email Receipt
router.post('/:id/email-receipt', async (req: Request, res: Response) => {
  try {
    const { type } = req.body; // 'Deposit' or 'Lunas'
    const rental = await RentalTransaction.findById(req.params.id).populate('customerId');
    if (!rental) return res.status(404).json({ error: 'Rental not found' });

    const c = rental.customerId as any;
    if (!c.email) return res.status(400).json({ error: 'Customer has no email address' });

    const fileName = `${type}_${rental.transactionId}.pdf`;
    const filePath = path.join(__dirname, '../../../public/receipts', fileName);

    // Setup nodemailer
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: '"Sistem Kebaya Linda" <noreply@kebayalinda.com>',
      to: c.email,
      subject: `Kwitansi ${type} - ${rental.transactionId}`,
      text: `Terlampir adalah kwitansi ${type} untuk penyewaan Anda (TRX: ${rental.transactionId}).`,
      attachments: [
        {
          filename: fileName,
          path: filePath
        }
      ]
    });

    const url = nodemailer.getTestMessageUrl(info);
    
    await AuditLog.create({
      action: 'UPDATE',
      entity: 'Rental',
      details: `Emailed ${type} receipt to ${c.email} (TRX: ${rental.transactionId})`
    });

    res.json({ message: 'Receipt emailed successfully', previewUrl: url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
