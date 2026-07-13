import { Router, Request, Response } from 'express';
import writeXlsxFile from 'write-excel-file/node';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';
import RentalTransaction from '../models/RentalTransaction';

const router = Router();

const generatePdf = (res: Response, title: string, data: any[], columns: string[], filename: string) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  doc.pipe(res);
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  
  data.forEach((row, i) => {
    let rowText = '';
    columns.forEach(col => { rowText += `${col}: ${row[col]} | `; });
    doc.fontSize(10).text(`${i+1}. ${rowText}`);
    doc.moveDown(0.5);
  });
  doc.end();
};

const generateDocx = async (res: Response, title: string, data: any[], columns: string[], filename: string) => {
  const tableRows = [
    new TableRow({ children: columns.map(c => new TableCell({ children: [new Paragraph(c)] })) })
  ];

  data.forEach(row => {
    tableRows.push(new TableRow({
      children: columns.map(c => new TableCell({ children: [new Paragraph(row[c] ? String(row[c]) : '-')] }))
    }));
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 32 })] }),
        new Table({ rows: tableRows })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(buffer);
};

const generateExcel = async (res: Response, data: any[], columns: string[], filename: string) => {
  const HEADER_ROW = columns.map(c => ({ value: c, fontWeight: 'bold' }));
  const dataRows = data.map(row => columns.map(c => ({ type: String, value: row[c] ? String(row[c]) : '-' })));
  
  const buffer = await writeXlsxFile([HEADER_ROW, ...dataRows], {});
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(Buffer.from(buffer));
};

router.get('/renting', async (req: Request, res: Response) => {
  try {
    const { format } = req.query; // excel, pdf, word
    const rentals = await RentalTransaction.find().populate('customerId kebayaId');
    
    const columns = ['ID', 'Pelanggan', 'Kebaya', 'Waktu Pinjam', 'Status'];
    const data = rentals.map(r => ({
      'ID': r._id.toString(),
      'Pelanggan': (r.customerId as any)?.name || 'Unknown',
      'Kebaya': (r.kebayaId as any)?.jenis || 'Unknown',
      'Waktu Pinjam': new Date(r.rentalStartTime).toLocaleDateString('id-ID'),
      'Status': r.status
    }));

    if (format === 'pdf') return generatePdf(res, 'Laporan Penyewaan', data, columns, 'Laporan_Penyewaan.pdf');
    if (format === 'word') return await generateDocx(res, 'Laporan Penyewaan', data, columns, 'Laporan_Penyewaan.docx');
    
    // default excel
    await generateExcel(res, data, columns, 'Laporan_Penyewaan.xlsx');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial', async (req: Request, res: Response) => {
  try {
    const { format, range } = req.query; // excel, pdf, word
    const rentals = await RentalTransaction.find({ status: 'Completed' }).populate('customerId kebayaId');
    
    const columns = ['ID', 'Pelanggan', 'Kebaya', 'Pendapatan (Rp)'];
    let total = 0;
    const data = rentals.map(r => {
      total += r.amountToPay || 0;
      return {
        'ID': r._id.toString(),
        'Pelanggan': (r.customerId as any)?.name || 'Unknown',
        'Kebaya': (r.kebayaId as any)?.jenis || 'Unknown',
        'Pendapatan (Rp)': String(r.amountToPay || 0)
      };
    });
    data.push({ 'ID': 'TOTAL', 'Pelanggan': '', 'Kebaya': '', 'Pendapatan (Rp)': String(total) });

    if (format === 'pdf') return generatePdf(res, `Laporan Keuangan (${range || 'Semua'})`, data, columns, 'Laporan_Keuangan.pdf');
    if (format === 'word') return await generateDocx(res, `Laporan Keuangan (${range || 'Semua'})`, data, columns, 'Laporan_Keuangan.docx');
    
    await generateExcel(res, data, columns, 'Laporan_Keuangan.xlsx');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { format } = req.query; 
    const rentals = await RentalTransaction.find({ status: 'Completed' }).populate('kebayaId');
    
    let totalRevenue = 0;
    rentals.forEach(r => totalRevenue += r.amountToPay || 0);

    const data = [
      { Metric: 'Total Penyewaan Selesai', Value: String(rentals.length) },
      { Metric: 'Total Pendapatan', Value: 'Rp ' + totalRevenue },
    ];
    const columns = ['Metric', 'Value'];

    if (format === 'pdf') return generatePdf(res, 'Dashboard Export', data, columns, 'Dashboard_Export.pdf');
    if (format === 'word') return await generateDocx(res, 'Dashboard Export', data, columns, 'Dashboard_Export.docx');
    await generateExcel(res, data, columns, 'Dashboard_Export.xlsx');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
