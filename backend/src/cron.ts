import cron from 'node-cron';
import nodemailer from 'nodemailer';
import RentalTransaction from './models/RentalTransaction';

// Setup Ethereal Testing Email
let transporter: nodemailer.Transporter;

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log(`[Cron] Ethereal Email Ready. User: ${account.user}`);
});

export const startCronJobs = () => {
  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily late rental check...');
    try {
      const today = new Date();
      
      const lateRentals = await RentalTransaction.find({
        status: 'Active',
        expectedReturnDate: { $lt: today }
      }).populate('customerId kebayaId');

      if (lateRentals.length === 0) {
        console.log('[Cron] No late rentals found today.');
        return;
      }

      let emailText = `Warning! There are ${lateRentals.length} late kebaya rentals today:\n\n`;
      lateRentals.forEach(r => {
        const c = r.customerId as any;
        const k = r.kebayaId as any;
        emailText += `- Customer: ${c.name} (${c.telephone})\n  Kebaya: ${k.jenis} (${k.warna})\n  Expected Return: ${new Date(r.expectedReturnDate).toLocaleDateString()}\n\n`;
      });

      const info = await transporter.sendMail({
        from: '"Sistem Kebaya Linda" <system@kebayalinda.local>',
        to: 'owner@kebayalinda.local',
        subject: '⚠️ Daily Report: Late Kebaya Rentals',
        text: emailText
      });

      console.log('[Cron] Email sent successfully! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error('[Cron] Error running daily check:', err);
    }
  });
  console.log('[Cron] Cron jobs initialized (0 8 * * *).');
};
