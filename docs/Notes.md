CURRENT FEEDBACK
[2026-07-14 03:15]
- Ran test cases on every use case. E2E test had an outdated math calculation (paid 30000 instead of 130000 for a 150000 deposit), which caused it to fail. Fixed the test case, all tests now pass perfectly.

[2026-07-14 03:14]
- Change "kwitansi" button label into "aksi", then remove this ugly ▼ symbol, it's redundant. Then, do not show the "aksi" in the dropdown...

[2026-07-14 03:12]
- The buttons are too crowded... Can you change kwitansi so that the buttons become dropdown action instead?

[2026-07-14 03:10]
- Still not aligned. Checked the source code and found an empty div wrapper pushing the aksi buttons down by 10px. Fixed.

[2026-07-14 03:07]
- Buttons in kwitansi and aksi somehow is not aligned horizontally. (Screenshot provided showed vertical misalignment inside the table row).

[2026-07-14 03:07]
- Buttons in kwitansi and aksi somehow is not aligned horizontally.

[2026-07-14 03:06]
- The button should be only one line, avoid having two lines in a button.

[2026-07-14 03:05]
- Buttons in kwitansi and aksi in penyewaan page should also be standardized in size, while still maintaining font size minimum.

[2026-07-14 03:03]
- The PIN for using demo state and factory reset should be the same, as they will be from the same authority level.

[2026-07-14 02:58]
- Add sorting for "Inventaris" page
- Use "RpXXX.XXX.XXX" format for price for better readability.
- Make "proses" and "wa" button in peringatan table in landing page to be the same in size and adhere to PWA.
- Omit "(demo)" from kebaya name in dummy data.
- Omit "(sewa)" from pickup button in penyewaan page.
- Add more padding/margin/space so that graph legend doesn't collide with bar/pie labels.

[2026-07-14 02:51]
- Adjust dashboard arrangement to adhere to PWA
- Increase the size of pie chart and make each pie chart size consistent.
- If datalabel will potentially be cluttered, show the rest as others.
- Label position for bar charts should be put accordingly to increase readability. Use Indonesian abbreviations.

[2026-07-14 02:44]
- Add "PDF DEPOSIT" and "KIRIM WA" button for Kwitansi column for "Deposit Parsial" status.
- Rearrange "Aksi" button so that the order from top to bottom will be: main action -> reminder -> batal

[2026-07-14 02:38]
- Add rent order creation date column into "penyewaan" page
- Default sort by "jatuh tempo", followed by "creation date"
- Have buttons in "penyewaan" page for most used sorting.

[2026-07-14 02:28]
- UI: Change "jatuh tempo kembali" to "jatuh tempo pengembalian".
- UI: Change any wording of "dipinjam" to "disewa".
- UI: Change any wording of "pinjam" to "sewa".
- UI: Fix dashboard display to adhere to PWA (make it responsive).
- Tech: Allow sending WA warning for "dipesan" (Booked) rentals that haven't paid deposit.

[2026-07-14 02:21]
- Make "penyewaan" page sortable.
- Remove redundant warnings for deposit parsial/belum deposit in penyewaan page.
- Need dummy data variation for rent that was partially paid but has finished payment (Active state).
- Re-add the email kwitansi button, shown when customer has an email address.

[2026-07-14 02:05]
- Change action name "kembalikan" to "dikembalikan" to reflect that customer has returned it.
- Aksi column is redundant (Fix table alignment issue).
- The title page is currently black color on background, unreadable (Fixed readability).
- Create new graph in dashboard for problematic customers.
- Make sure that dashboard exports include the new graph.
- PDF deposit and PDF lunas is broken. Fix it.
- Add WA option for "kwitansi". Configuration to choose between Download Link vs Text.

Global
- Pengaturan denda tidak per sewa, namun secara global yang dapat diubah di konfigurasi.
- Tambahkan sistem deposit, di mana saat penyewaan baru dibuat, pelanggan harus membayar deposit dulu, dengan biaya deposit yang dibayar diamsukkan ke sistem dan akan menjadi pengurang biaya penyewaan saat pelanggan mengembalikan kebaya.
- Penyewaan yang belum deposit atau belum lunas masuk ke dalam tabel peringatan, dengan deposit yang belum lunas akan dikenakan sanksi denda juga
- Tambahkan sistem receipt di mana saat deposit dibayarkan, sistem otomatis membuat receipt dalam PDF dan dapat didownload oleh pemilik toko. Dibuatkan juga fitur untuk mengirim receipt melalui email.
- Receipt dapat dibentuk ulang dalam bentuk pdf, diprint ulang, dan dikirim ulang, buat aksi untuk ketiganya.
- Receipt terbagi menjadi dua, yaitu receipt deposit dan receipt lunas dan punya id unik.
- Setiap penyewaan mempunyai id unik.
- Ukuran font minimal menjadi 18-20, karena Owner merupakan orang tua.
- Font harus yang jelas, seperti Arial atau Calibri atau Sans Serif, serta harus konsisten.

Landing Page (Utama)
- Event terdekat dalam bentuk card kecil dan ramping dimunculkan kembali, posisi sebagai announcement.

Penyewaan
- Sewa dapat dicari berdasarkan id
- Penyewaan yang belum lunas masuk ke dalam penyewaan aktif sampai lunas atau dibatalkan
- Selain penyewaan aktif, harus ada juga historikal penyewaan
- Historikal penyewaan berisi daftar penyewaan yang berhasil (lunas dan dikembalikan) dan batal

Inventaris
- Data Katalog harus bisa dimodifikasi dan dihapus.
- Modifikasi juga dapat mengganti gambar kebaya.
- Jumlah stok harus bisa ditambah dan dikurang.

Pelanggan
- Data Pelanggan harus dapat dimodifikasi dan "dihilangkan".
- Data pelanggan yang "dihilangkan" masih dapat tereferensikan saat dicari dalam historikal "penyewaan", hanya saja tidak muncul lagi sebagai daftar pelanggan yang dapat dipilih.
- Bila terdapat pelanggan baru dengan nama dan nomor telepon sama dengan pelanggan yang "dihilangkan", aktifkan kembali.

Audit/Logging
- Terdapat sistem audit/logging yang melakukan tracking semua aktivitas yang dilakukan di sistem.
- Audit/Logging tidak dapat dimodifikasi atau dihapus.
- Audit/Logging dapat diprint dalam bentuk pdf.

PREVIOUS FEEDBACKS
2026-07-13 13:00
Global
- Font tulisan digedein ke minimal 12
- Background batiknya tidak terlihat
- Background putih terlalu terang, berikan warna putih yang menyejukkan
- Sistem notifikasi dalam sistem yang memperingatkan status penyewaan yang akan jatuh tempo dan yang telat, reminder setiap hari

Landing page
- Pas milih kebaya, gambarnya kebaya muncul
- selain dropdown, pemilihan pelanggan bisa dicari dengan diketik
- Penyewaan harus ada input waktu sewa dan waktu kembali, dengan waktu sewa default ke waktu saat ini dan waktu kembali default ke 1 minggu, namun bisa dipilih
- Penyewaan memunculkan durasi penyewaan dan biaya yang harus dibayar, dengan formula harga * hari
- Terdapat daftar kebaya yang telat kembali dan sebentar lagi harus dikembalikan, keduanya punya tombol kembalikan
- Small dashboard seharusnya bukan hanya card, namun 5 teratas
- Urutan: Penyewaan cepat, daftar kebaya, small dashboard

Dashboard:
- Jumlah penyewaan tidak perlu pakai koma

Inventaris:
- Bisa search dan sorting berdasarkan jenis, warna, harga, dan stok
- Terdapat drop down untuk mengecek progress penyewaan dari stok yang tersedia

Penyewaan:
- Terdapat ekspektasi waktu pengembalian

Pelanggan:
- Terdapat drop down untuk mengecek daftar produk yang disewa, diurut berdasarkan daftar pengembalian

2026-07-13 12:30
1. Landing page should be able to be operated on that page! That means a single quick "Sewa Kebaya" input where the owner can create a quick rental order, while adding new customer if it's a new customer on that same input.
2. Landing should have most rented kebaya, most active customer, important dates (holiday, events), and other important information that The Owner can quickly glance in the Landing Page without going to other pages!
3. Please fill the dashboard with important metric The Owner actually wants to see. Use graphs!
4. There should also be export button for dashboard. All the exports (renting, financial, dashboard) should be available in, Google Spreadsheets/Ms. Excel, Google Docs/Ms. Word, and PDF format.
5. Please decorate the website with Kebaya and Batik style backgrounds and images.

2026-07-13 12:00
1. Dashboard can have much better information for the owner, such as most rented kebaya, most active customer, important dates (holiday, events), and other important components usually shown in dashboard.
2. There should be a landing page where the owner can quickly input new customer and input new rent order, and quick available stock search and how recent a kebaya will be available.
3. Dashboard should not be the main page, it should be landing page
4. Input field for "Harga" and "Total Stok" should not start with 0 already inside, it will confuse the owner inputting it. If you want to do that, separate the input title with the input field.
5. Kebaya input should be "Jenis" and "Warna" instead of "Nama" and "Jenis"
6. Create a function to generate renting report and a function to generate financial report. There should be generated into Google Spreadsheet and/or Ms. Excel format file.
7. Beautify the UI and make it light mode. The design should follow the latest Material Design and/or Stitch.
8. There should be input for image when adding new Kebaya. The image should appear when searching kebaya or adding new rent.
9. Customer should have "Nama" and "Telephone" as mandatory, and also "Address" and "Email" as optional.