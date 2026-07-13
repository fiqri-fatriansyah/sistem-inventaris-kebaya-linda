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

    <!-- The rest remains identical -->
    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Penyewaan Aktif</h2>
        <button class="btn" @click="showForm = true">Sewa Kebaya</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--surface-border); border-radius: 8px;">
        <label>Pelanggan</label>
        <select v-model="form.customerId" class="input">
          <option value="" disabled>Pilih Pelanggan</option>
          <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
        
        <label>Kebaya</label>
        <select v-model="form.kebayaId" class="input">
          <option value="" disabled>Pilih Kebaya</option>
          <option v-for="k in availableKebayas" :key="k._id" :value="k._id">
            {{ k.jenis }} - {{ k.warna }} (Stok: {{ k.availableStock }})
          </option>
        </select>

        <button class="btn" @click="rentKebaya" style="margin-top: 10px">Sewa</button>
        <button class="btn" @click="showForm = false" style="background: #e0e0e0; color: #000; margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Pelanggan</th>
            <th>Kebaya</th>
            <th>Waktu Pinjam</th>
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
              <button class="btn" style="background: var(--success); padding: 5px 10px; font-size: 0.9em; color: #fff;" @click="returnKebaya(r._id, r.kebayaId?.price || 0)">Kembalikan</button>
            </td>
          </tr>
          <tr v-if="rentals.length === 0">
            <td colspan="4" style="text-align: center; padding: 20px;">Tidak ada penyewaan aktif</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '../composables/useApi';

const { getActiveRentals, getKebayas, getCustomers } = useApi();
const rentals = ref<any[]>([]);
const kebayas = ref<any[]>([]);
const customers = ref<any[]>([]);
const pending = ref(true);
const showForm = ref(false);
const form = ref({ customerId: '', kebayaId: '' });
const financialRange = ref('monthly');

const availableKebayas = computed(() => kebayas.value.filter(k => k.availableStock > 0));

const fetchData = async () => {
  pending.value = true;
  rentals.value = await getActiveRentals();
  kebayas.value = await getKebayas();
  customers.value = await getCustomers();
  pending.value = false;
};

const rentKebaya = async () => {
  if (!form.value.customerId || !form.value.kebayaId) return alert('Silakan pilih pelanggan dan kebaya');
  
  try {
    await fetch('http://localhost:3001/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    showForm.value = false;
    form.value = { customerId: '', kebayaId: '' };
    fetchData();
  } catch (err) {
    alert('Gagal menyewa kebaya');
  }
};

const returnKebaya = async (rentalId: string, price: number) => {
  if (confirm('Selesaikan penyewaan dan kembalikan kebaya?')) {
    try {
      await fetch(`http://localhost:3001/api/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountToPay: price })
      });
      alert(`Kebaya berhasil dikembalikan!\nTotal Bayar: Rp ${price}`);
      fetchData();
    } catch (err) {
      alert('Gagal memproses pengembalian');
    }
  }
};

onMounted(fetchData);
</script>
<style scoped>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
