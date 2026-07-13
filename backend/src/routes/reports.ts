import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import RentalTransaction from '../models/RentalTransaction';

const router = Router();

router.get('/renting', async (req: Request, res: Response) => {
  try {
    const rentals = await RentalTransaction.find().populate('customerId kebayaId');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Penyewaan');
    
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Pelanggan', key: 'customer', width: 20 },
      { header: 'Kebaya', key: 'kebaya', width: 20 },
      { header: 'Waktu Pinjam', key: 'start', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    rentals.forEach(r => {
      worksheet.addRow({
        _id: r._id.toString(),
        customer: (r.customerId as any)?.name || 'Unknown',
        kebaya: (r.kebayaId as any)?.jenis || 'Unknown',
        start: new Date(r.rentalStartTime).toLocaleDateString('id-ID'),
        status: r.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Penyewaan.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial', async (req: Request, res: Response) => {
  try {
    const { range } = req.query; // daily, weekly, monthly, quarterly, yearly
    
    // In a real app, we'd use `range` to filter the date. 
    // Here we retrieve all completed and you could map/filter based on date.
    let filter: any = { status: 'Completed' };
    
    const now = new Date();
    if (range === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filter.rentalEndTime = { $gte: today };
    } else if (range === 'weekly') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filter.rentalEndTime = { $gte: lastWeek };
    } else if (range === 'monthly') {
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.rentalEndTime = { $gte: thisMonth };
    } else if (range === 'yearly') {
      const thisYear = new Date(now.getFullYear(), 0, 1);
      filter.rentalEndTime = { $gte: thisYear };
    }

    const rentals = await RentalTransaction.find(filter).populate('customerId kebayaId');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Keuangan (${range || 'Semua'})`);
    
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Pelanggan', key: 'customer', width: 20 },
      { header: 'Kebaya', key: 'kebaya', width: 20 },
      { header: 'Waktu Selesai', key: 'end', width: 20 },
      { header: 'Pendapatan (Rp)', key: 'amount', width: 20 }
    ];

    let total = 0;
    rentals.forEach(r => {
      total += r.amountToPay || 0;
      worksheet.addRow({
        _id: r._id.toString(),
        customer: (r.customerId as any)?.name || 'Unknown',
        kebaya: (r.kebayaId as any)?.jenis || 'Unknown',
        end: r.rentalEndTime ? new Date(r.rentalEndTime).toLocaleDateString('id-ID') : '-',
        amount: r.amountToPay || 0
      });
    });

    worksheet.addRow({});
    worksheet.addRow({ end: 'TOTAL PENDAPATAN', amount: total });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Keuangan_${range || 'Semua'}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
