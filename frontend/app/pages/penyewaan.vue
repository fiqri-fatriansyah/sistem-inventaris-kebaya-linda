<template>
  <div>
    <h1 class="page-title">Data Penyewaan</h1>
    
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

    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Penyewaan Aktif</h2>
        <button class="btn" @click="router.push('/')">Penyewaan Cepat (Halaman Utama)</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Pelanggan</th>
            <th>Kebaya</th>
            <th>Waktu Pinjam</th>
            <th>Jatuh Tempo</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rentals" :key="r._id">
            <td>{{ r.customerId?.name || 'Unknown' }}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img v-if="r.kebayaId?.imageUrl" :src="'http://localhost:3001' + r.kebayaId.imageUrl" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;" />
                {{ r.kebayaId?.jenis || 'Unknown' }} ({{ r.kebayaId?.warna || '' }})
              </div>
            </td>
            <td>{{ new Date(r.rentalStartTime).toLocaleDateString('id-ID') }}</td>
            <td>
              {{ new Date(r.expectedReturnDate).toLocaleDateString('id-ID') }}
              <span v-if="new Date(r.expectedReturnDate) < new Date()" style="color: red; font-weight: bold; margin-left: 5px;">[TELAT]</span>
            </td>
            <td>
              <button class="btn" style="background: var(--success); padding: 5px 10px; font-size: 0.9em; color: #fff;" @click="returnKebaya(r._id)">Kembalikan</button>
            </td>
          </tr>
          <tr v-if="rentals.length === 0">
            <td colspan="5" style="text-align: center; padding: 20px;">Tidak ada penyewaan aktif</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../composables/useApi';

const router = useRouter();
const { getActiveRentals } = useApi();
const rentals = ref<any[]>([]);
const pending = ref(true);
const financialRange = ref('monthly');

const fetchData = async () => {
  pending.value = true;
  rentals.value = await getActiveRentals();
  pending.value = false;
};

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
      msg += `\nTotal Tagihan: Rp ${data.total}`;
      
      alert(msg);
      fetchData();
    } catch (err: any) {
      alert('Gagal memproses pengembalian: ' + err.message);
    }
  }
};

onMounted(fetchData);
</script>
<style scoped>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
