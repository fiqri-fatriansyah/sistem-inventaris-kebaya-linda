import cron from 'node-cron';
import nodemailer from 'nodemailer';
import RentalTransaction from './models/RentalTransaction';
import Event from './models/Event';

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

  // Run on January 1st every year
  cron.schedule('0 0 1 1 *', () => {
    fetchPublicHolidays(new Date().getFullYear());
  });
  
  console.log('[Cron] Cron jobs initialized (0 8 * * *), (0 0 1 1 *).');

  // Fetch holidays on boot
  fetchPublicHolidays(new Date().getFullYear());
};

export const fetchPublicHolidays = async (year: number) => {
  console.log(`[Cron] Fetching public holidays for ${year}...`);
  try {
    let holidays: any[] = [];
    try {
      // Use AbortController for fetch timeout so it doesn't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('API Error');
      holidays = await res.json();
    } catch (fetchErr) {
      console.log(`[Cron] External API failed or timed out. Using reliable offline fallback for ${year}.`);
      holidays = [
        { holiday_date: `${year}-01-01`, holiday_name: 'Tahun Baru Masehi', is_national_holiday: true },
        { holiday_date: `${year}-03-20`, holiday_name: 'Idul Fitri (Estimasi)', is_national_holiday: true },
        { holiday_date: `${year}-05-01`, holiday_name: 'Hari Buruh Internasional', is_national_holiday: true },
        { holiday_date: `${year}-05-27`, holiday_name: 'Idul Adha (Estimasi)', is_national_holiday: true },
        { holiday_date: `${year}-06-01`, holiday_name: 'Hari Lahir Pancasila', is_national_holiday: true },
        { holiday_date: `${year}-08-17`, holiday_name: 'Hari Kemerdekaan Republik Indonesia', is_national_holiday: true },
        { holiday_date: `${year}-12-25`, holiday_name: 'Hari Raya Natal', is_national_holiday: true }
      ];
    }
    
    if (!holidays || !Array.isArray(holidays)) return;

    const fixedMasehi = ['Tahun Baru Masehi', 'Hari Buruh Internasional', 'Hari Lahir Pancasila', 'Hari Kemerdekaan Republik Indonesia', 'Hari Raya Natal'];

    await Event.deleteMany({ isHijriah: true, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31T23:59:59.999Z`) } });

    for (const h of holidays) {
      if (h.is_national_holiday) {
        const hDate = new Date(h.holiday_date);
        
        if (fixedMasehi.includes(h.holiday_name)) {
          const existing = await Event.findOne({ name: h.holiday_name, isPublicHoliday: true });
          if (!existing) {
            await Event.create({
              name: h.holiday_name,
              date: hDate,
              description: 'Libur Nasional',
              recurring: 'yearly',
              isPublicHoliday: true,
              isHijriah: false
            });
          }
        } else {
          // Check if it already exists for this exact shifting year to prevent duplicates on multiple boots
          const existingShift = await Event.findOne({ name: h.holiday_name, isPublicHoliday: true, isHijriah: true, date: hDate });
          if (!existingShift) {
             await Event.create({
               name: h.holiday_name,
               date: hDate,
               description: 'Libur Nasional',
               recurring: 'none',
               isPublicHoliday: true,
               isHijriah: true
             });
          }
        }
      }
    }
    console.log(`[Cron] Successfully synced public holidays for ${year}.`);
  } catch (err) {
    console.log(`[Cron] Failed to fetch public holidays (silent fail)`);
  }
};
