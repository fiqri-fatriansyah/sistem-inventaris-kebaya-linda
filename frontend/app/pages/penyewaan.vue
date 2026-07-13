<template>
  <div>
    <h1 class="page-title">Data Penyewaan</h1>
    
    <!-- Laporan & Export -->
    <div class="material-card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 10px;">Laporan & Export</h3>
      
      <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
        <strong style="color: var(--text-main);">Laporan Penyewaan:</strong>
        <a href="http://localhost:3001/api/reports/renting?format=excel" target="_blank"><button class="btn" style="background: #107c41; padding: 5px 15px; font-size: 0.8rem;">Excel</button></a>
        <a href="http://localhost:3001/api/reports/renting?format=word" target="_blank"><button class="btn" style="background: #2b579a; padding: 5px 15px; font-size: 0.8rem;">Word</button></a>
        <a href="http://localhost:3001/api/reports/renting?format=pdf" target="_blank"><button class="btn" style="background: #c62828; padding: 5px 15px; font-size: 0.8rem;">PDF</button></a>
      </div>

      <div style="display: flex; gap: 15px; align-items: center;">
        <strong style="color: var(--text-main);">Laporan Keuangan:</strong>
        <select v-model="financialRange" class="input" style="width: auto; margin-bottom: 0; padding: 5px;">
          <option value="daily">Harian</option>
          <option value="weekly">Mingguan</option>
          <option value="monthly">Bulanan</option>
          <option value="quarterly">Kuartal</option>
          <option value="yearly">Tahunan</option>
          <option value="">Semua Waktu</option>
        </select>
        <a :href="'http://localhost:3001/api/reports/financial?range=' + financialRange + '&format=excel'" target="_blank"><button class="btn" style="background: #107c41; padding: 5px 15px; font-size: 0.8rem;">Excel</button></a>
        <a :href="'http://localhost:3001/api/reports/financial?range=' + financialRange + '&format=word'" target="_blank"><button class="btn" style="background: #2b579a; padding: 5px 15px; font-size: 0.8rem;">Word</button></a>
        <a :href="'http://localhost:3001/api/reports/financial?range=' + financialRange + '&format=pdf'" target="_blank"><button class="btn" style="background: #c62828; padding: 5px 15px; font-size: 0.8rem;">PDF</button></a>
      </div>
    </div>

    <!-- Main Content with Tabs -->
    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="display: flex; gap: 10px;">
          <button class="btn" :style="activeTab === 'Aktif' ? 'background: var(--primary-color);' : 'background: #e0e0e0; color: #333;'" @click="activeTab = 'Aktif'">Penyewaan Aktif</button>
          <button class="btn" :style="activeTab === 'Historikal' ? 'background: var(--primary-color);' : 'background: #e0e0e0; color: #333;'" @click="activeTab = 'Historikal'">Historikal</button>
        </div>
        <button class="btn" @click="router.push('/')">Penyewaan Cepat (Halaman Utama)</button>
      </div>

      <div style="margin-bottom: 20px;">
        <input type="text" v-model="searchTrx" class="input" placeholder="Cari berdasarkan Transaction ID (TRX-)..." style="max-width: 400px; margin-bottom: 0;" />
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>TRX ID</th>
            <th>Pelanggan</th>
            <th>Kebaya</th>
            <th>Jatuh Tempo</th>
            <th>Status / Deposit</th>
            <th>Kwitansi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in displayedRentals" :key="r._id">
            <td><strong>{{ r.transactionId }}</strong></td>
            <td>{{ r.customerId?.name || 'Unknown' }}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img v-if="r.kebayaId?.imageUrl" :src="'http://localhost:3001' + r.kebayaId.imageUrl" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />
                <div v-else style="width: 40px; height: 40px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.7em; color: #999;">No Img</div>
                {{ r.kebayaId?.jenis }} ({{ r.kebayaId?.warna }})
              </div>
            </td>
            <td>
              {{ new Date(r.expectedReturnDate).toLocaleDateString('id-ID') }}
              <span v-if="r.status === 'Active' && new Date(r.expectedReturnDate) < new Date()" style="color: red; font-weight: bold; display: block;">[TELAT]</span>
            </td>
            <td>
              <span v-if="r.status === 'Active'" :style="r.depositPaid ? 'color: var(--success); font-weight: bold;' : 'color: var(--danger); font-weight: bold;'">
                {{ r.depositPaid ? 'Deposit Lunas' : 'Belum Deposit' }}
              </span>
              <span v-else :style="r.status === 'Completed' ? 'color: var(--success); font-weight: bold;' : 'color: var(--danger); font-weight: bold;'">
                {{ r.status === 'Completed' ? 'SELESAI (LUNAS)' : 'DIBATALKAN' }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <button v-if="r.status === 'Active' || r.status === 'Completed'" class="btn" style="background: #2980b9; padding: 2px 8px; font-size: 0.75rem;" @click="openReceipt(r, 'Deposit')">PDF Deposit</button>
                <button v-if="r.status === 'Completed'" class="btn" style="background: #8e44ad; padding: 2px 8px; font-size: 0.75rem;" @click="openReceipt(r, 'Lunas')">PDF Lunas</button>
                <button v-if="r.status !== 'Cancelled'" class="btn" style="background: #e67e22; padding: 2px 8px; font-size: 0.75rem;" @click="emailReceipt(r._id, r.status === 'Completed' ? 'Lunas' : 'Deposit')">Email</button>
              </div>
            </td>
            <td>
              <div v-if="r.status === 'Active'" style="display: flex; gap: 5px;">
                <button class="btn" style="background: var(--success); padding: 5px 10px; font-size: 0.8rem;" @click="returnKebaya(r._id)">Kembalikan</button>
                <button class="btn" style="background: var(--danger); padding: 5px 10px; font-size: 0.8rem;" @click="cancelRental(r._id)">Batal</button>
              </div>
              <span v-else style="color: var(--text-muted); font-size: 0.8em;">-</span>
            </td>
          </tr>
          <tr v-if="displayedRentals.length === 0">
            <td colspan="7" style="text-align: center; padding: 20px;">Tidak ada penyewaan ditemukan</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const rentals = ref<any[]>([]);
const pending = ref(true);
const financialRange = ref('monthly');
const activeTab = ref('Aktif');
const searchTrx = ref('');

const fetchData = async () => {
  pending.value = true;
  try {
    const res = await fetch('http://localhost:3001/api/rentals');
    rentals.value = await res.json();
  } catch (err) {
    console.error(err);
  }
  pending.value = false;
};

const displayedRentals = computed(() => {
  let filtered = rentals.value;
  
  if (activeTab.value === 'Aktif') {
    filtered = filtered.filter(r => r.status === 'Active');
  } else {
    filtered = filtered.filter(r => r.status === 'Completed' || r.status === 'Cancelled');
  }

  if (searchTrx.value) {
    const q = searchTrx.value.toLowerCase();
    filtered = filtered.filter(r => r.transactionId.toLowerCase().includes(q));
  }

  return filtered;
});

const returnKebaya = async (rentalId: string) => {
  if (confirm('Selesaikan penyewaan dan kembalikan kebaya?')) {
    try {
      const res = await fetch(`http://localhost:3001/api/rentals/${rentalId}/return`, {
        method: 'POST'
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error);

      let msg = `Kebaya berhasil dikembalikan!\n\n`;
      msg += `Biaya Sewa Dasar: Rp ${data.basePay}\n`;
      if(data.penaltyPay > 0) {
        msg += `Biaya Denda Keterlambatan: Rp ${data.penaltyPay}\n`;
      }
      msg += `Deposit Dibayar: Rp ${data.depositAmount}\n`;
      msg += `\nTotal Tagihan Akhir: Rp ${data.total}`;
      
      alert(msg);
      // Auto open lunas receipt
      window.open(`http://localhost:3001/receipts/Lunas_${data.rental.transactionId}.pdf`, '_blank');
      fetchData();
    } catch (err: any) {
      alert('Gagal memproses pengembalian: ' + err.message);
    }
  }
};

const cancelRental = async (rentalId: string) => {
  if (confirm('Anda yakin ingin membatalkan penyewaan ini?')) {
    try {
      const res = await fetch(`http://localhost:3001/api/rentals/${rentalId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      fetchData();
    } catch (err: any) {
      alert('Gagal membatalkan: ' + err.message);
    }
  }
};

const openReceipt = (rental: any, type: string) => {
  window.open(`http://localhost:3001/receipts/${type}_${rental.transactionId}.pdf`, '_blank');
};

const emailReceipt = async (rentalId: string, type: string) => {
  try {
    alert('Mengirim email... Mohon tunggu.');
    const res = await fetch(`http://localhost:3001/api/rentals/${rentalId}/email-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    
    alert(`Email kwitansi berhasil dikirim!\nCek preview di: ${data.previewUrl}`);
    window.open(data.previewUrl, '_blank');
  } catch (err: any) {
    alert('Gagal mengirim email: ' + err.message);
  }
};

onMounted(fetchData);
</script>
<style scoped>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
