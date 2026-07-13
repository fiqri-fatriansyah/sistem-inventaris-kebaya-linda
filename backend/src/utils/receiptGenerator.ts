import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReceipt = (rental: any, type: 'Deposit' | 'Lunas'): string => {
  const dir = path.join(__dirname, '../../../public/receipts');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${type}_${rental.transactionId}.pdf`;
  const filePath = path.join(dir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Sistem Inventaris Kebaya Linda', { align: 'center' });
  doc.fontSize(14).text(`Kwitansi ${type}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Transaction ID: ${rental.transactionId}`);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`);
  doc.moveDown();

  doc.text(`Nama Pelanggan: ${rental.customerId.name}`);
  doc.text(`No. Telp: ${rental.customerId.telephone}`);
  doc.moveDown();

  doc.text(`Kebaya Disewa: ${rental.kebayaId.jenis} (${rental.kebayaId.warna})`);
  doc.text(`Tanggal Sewa: ${new Date(rental.rentalStartTime).toLocaleDateString('id-ID')}`);
  doc.text(`Ekspektasi Kembali: ${new Date(rental.expectedReturnDate).toLocaleDateString('id-ID')}`);
  doc.moveDown();

  if (type === 'Deposit') {
    doc.text(`Status Deposit: ${rental.depositPaid ? 'DIBAYAR' : 'BELUM DIBAYAR'}`);
    doc.text(`Jumlah Deposit: Rp ${rental.depositAmount}`);
  } else {
    // Lunas
    doc.text(`Waktu Pengembalian: ${new Date(rental.rentalEndTime).toLocaleDateString('id-ID')}`);
    doc.text(`Total Tagihan Akhir (sudah dipotong deposit): Rp ${rental.amountToPay}`);
  }

  doc.moveDown(2);
  doc.fontSize(10).text('Terima kasih telah menyewa di Kebaya Linda!', { align: 'center', italic: true });

  doc.end();
  return `/receipts/${fileName}`;
};
