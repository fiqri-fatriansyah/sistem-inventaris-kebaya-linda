CURRENT FEEDBACK
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