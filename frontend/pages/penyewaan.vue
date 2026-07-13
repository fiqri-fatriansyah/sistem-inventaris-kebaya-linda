<template>
  <div>
    <h1 class="page-title">Data Penyewaan</h1>
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Penyewaan Aktif</h2>
        <button class="btn" @click="showForm = true">Sewa Kebaya</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <select v-model="form.customerId" class="input">
          <option value="" disabled>Pilih Pelanggan</option>
          <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
        <select v-model="form.kebayaId" class="input">
          <option value="" disabled>Pilih Kebaya</option>
          <option v-for="k in availableKebayas" :key="k._id" :value="k._id">{{ k.name }} (Stok Tersedia: {{ k.availableStock }})</option>
        </select>
        <button class="btn" @click="rentKebaya" style="margin-top: 10px">Sewa</button>
        <button class="btn" @click="showForm = false" style="background: var(--surface-border); margin-left: 10px;">Batal</button>
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
            <td>{{ r.kebayaId?.name || 'Unknown' }}</td>
            <td>{{ new Date(r.rentalStartTime).toLocaleString('id-ID') }}</td>
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
