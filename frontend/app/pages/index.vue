<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-section" style="display: flex; gap: 20px; align-items: center; background: linear-gradient(135deg, var(--primary-color), var(--primary-hover)); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
      <div style="flex: 1;">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Sistem Inventaris Kebaya Linda</h1>
        <p style="font-size: 1.1rem; opacity: 0.9;">Kelola penyewaan dan inventaris butik dengan mudah dan elegan.</p>
      </div>
      <div style="width: 150px; height: 150px; background: rgba(255,255,255,0.2); border-radius: 50%; overflow: hidden; border: 4px solid rgba(255,255,255,0.4);">
        <img src="/img/kebaya_hero.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>

    <!-- 1. Quick Rent Integrated Form -->
    <div class="material-card" style="margin-bottom: 30px;">
      <h2 style="margin-bottom: 20px; color: var(--primary-color);">1. Penyewaan Cepat</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Data Pelanggan -->
        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Data Pelanggan</h3>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Pilih Pelanggan (Ketik untuk mencari)</label>
            <input list="customerList" v-model="quickForm.customerSearch" class="input" placeholder="Cari nama atau nomor HP..." @change="onCustomerSelect" />
            <datalist id="customerList">
              <option v-for="c in customers" :key="c._id" :value="c.name + ' (' + c.telephone + ')'"></option>
            </datalist>
          </div>

          <div v-if="isNewCustomer" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px dashed var(--primary-color);">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">Pelanggan baru terdeteksi. Silakan lengkapi:</p>
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Telephone *</label>
            <input v-model="quickForm.newCustomerPhone" class="input" />
          </div>
        </div>

        <!-- Pilih Kebaya -->
        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Pilih Kebaya</h3>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Pilih Kebaya Tersedia</label>
            <select v-model="quickForm.kebayaId" class="input" @change="calculateCost">
              <option value="" disabled>-- Pilih Kebaya --</option>
              <option v-for="k in availableKebayas" :key="k._id" :value="k._id">
                {{ k.jenis }} - {{ k.warna }} (Rp {{ k.price }})
              </option>
            </select>
            <!-- Tampilkan gambar kebaya yang dipilih -->
            <div v-if="selectedKebaya && selectedKebaya.imageUrl" style="margin-top: 10px;">
              <img :src="'http://localhost:3001' + selectedKebaya.imageUrl" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid var(--surface-border);" />
            </div>
          </div>
        </div>
      </div>

      <!-- Durasi & Harga -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--surface-border); display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Durasi & Waktu</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Waktu Sewa</label>
              <input type="date" v-model="quickForm.startDate" class="input" @change="calculateCost" />
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Kembali (Ekspektasi)</label>
              <input type="date" v-model="quickForm.returnDate" class="input" @change="calculateCost" />
            </div>
          </div>
          <p style="font-weight: bold;">Durasi: <span style="color: var(--primary-color);">{{ rentalDuration }} Hari</span></p>
          <p style="font-weight: bold; font-size: 1.2rem;">Total Biaya: <span style="color: var(--success);">Rp {{ totalCost }}</span></p>
        </div>

        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Pengaturan Denda (Opsional)</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Tipe Denda</label>
              <select v-model="quickForm.penaltyType" class="input">
                <option value="None">Tanpa Denda</option>
                <option value="One-time">Satu Kali (Flat)</option>
                <option value="Daily">Per Hari</option>
                <option value="Weekly">Per Minggu</option>
              </select>
            </div>
            <div style="flex: 1;" v-if="quickForm.penaltyType !== 'None'">
              <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Biaya Denda (Rp)</label>
              <input type="number" v-model="quickForm.penaltyCost" class="input" />
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn" @click="processQuickRent" :disabled="processing">
          {{ processing ? 'Memproses...' : 'Proses Penyewaan' }}
        </button>
      </div>
    </div>

    <!-- 2. Daftar Kebaya Telat / Jatuh Tempo -->
    <div class="material-card" style="margin-bottom: 30px; border-left: 5px solid var(--danger);">
      <h2 style="margin-bottom: 20px; color: var(--danger);">2. Peringatan: Telat & Jatuh Tempo</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Pelanggan</th>
            <th>Kebaya</th>
            <th>Jatuh Tempo</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in dueRentals" :key="r._id">
            <td>{{ r.customerId?.name }}</td>
            <td>{{ r.kebayaId?.jenis }} ({{ r.kebayaId?.warna }})</td>
            <td>{{ new Date(r.expectedReturnDate).toLocaleDateString('id-ID') }}</td>
            <td>
              <strong v-if="new Date(r.expectedReturnDate) < new Date()" style="color: red;">TELAT</strong>
              <strong v-else style="color: orange;">SEGERA</strong>
            </td>
            <td><button class="btn" style="background: var(--success); padding: 5px 10px; font-size: 0.8rem;" @click="goToReturn(r._id)">Kembalikan</button></td>
          </tr>
          <tr v-if="dueRentals.length === 0">
            <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Tidak ada kebaya yang telat atau jatuh tempo dalam waktu dekat.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. Small Dashboard (Top 5) -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div class="material-card">
        <h3 style="margin-bottom: 15px; color: var(--primary-color);">Top 5 Kebaya Terpopuler</h3>
        <ol style="padding-left: 20px; line-height: 1.8;">
          <li v-for="k in stats?.topKebayas" :key="k.kebaya._id">
            <strong>{{ k.kebaya.jenis }} ({{ k.kebaya.warna }})</strong> - Dipinjam {{ k.count }} kali
          </li>
          <li v-if="!stats?.topKebayas?.length" style="list-style: none; color: var(--text-muted);">Belum ada data</li>
        </ol>
      </div>

      <div class="material-card">
        <h3 style="margin-bottom: 15px; color: var(--success);">Top 5 Pelanggan Teraktif</h3>
        <ol style="padding-left: 20px; line-height: 1.8;">
          <li v-for="c in stats?.topCustomers" :key="c.customer._id">
            <strong>{{ c.customer.name }}</strong> - Menyewa {{ c.count }} kali
          </li>
          <li v-if="!stats?.topCustomers?.length" style="list-style: none; color: var(--text-muted);">Belum ada data</li>
        </ol>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../composables/useApi';

const router = useRouter();
const { getDashboardStats, getCustomers, getKebayas } = useApi();

const stats = ref<any>(null);
const dueRentals = ref<any[]>([]);
const customers = ref<any[]>([]);
const kebayas = ref<any[]>([]);
const processing = ref(false);

const todayStr = new Date().toISOString().split('T')[0];
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split('T')[0];

const quickForm = ref({
  customerSearch: '',
  existingCustomerId: '',
  newCustomerPhone: '',
  kebayaId: '',
  startDate: todayStr,
  returnDate: nextWeekStr,
  penaltyType: 'None',
  penaltyCost: 0
});

const isNewCustomer = ref(false);
const rentalDuration = ref(7);
const totalCost = ref(0);

const availableKebayas = computed(() => kebayas.value.filter(k => k.availableStock > 0));
const selectedKebaya = computed(() => kebayas.value.find(k => k._id === quickForm.value.kebayaId));

const onCustomerSelect = () => {
  const input = quickForm.value.customerSearch;
  const found = customers.value.find(c => `${c.name} (${c.telephone})` === input);
  if (found) {
    quickForm.value.existingCustomerId = found._id;
    isNewCustomer.value = false;
  } else if (input.trim() !== '') {
    quickForm.value.existingCustomerId = '';
    isNewCustomer.value = true;
  } else {
    quickForm.value.existingCustomerId = '';
    isNewCustomer.value = false;
  }
};

const calculateCost = () => {
  const start = new Date(quickForm.value.startDate);
  const end = new Date(quickForm.value.returnDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  let days = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  if (days < 1) days = 1;
  rentalDuration.value = days;

  if (selectedKebaya.value) {
    totalCost.value = days * selectedKebaya.value.price;
  } else {
    totalCost.value = 0;
  }
};

const fetchData = async () => {
  stats.value = await getDashboardStats();
  customers.value = await getCustomers();
  kebayas.value = await getKebayas();
  
  // Fetch due rentals
  const dueRes = await fetch('http://localhost:3001/api/dashboard/due');
  dueRentals.value = await dueRes.json();
};

const goToReturn = (id: string) => {
  router.push('/penyewaan');
};

const processQuickRent = async () => {
  if (!quickForm.value.kebayaId) return alert('Pilih kebaya');
  if (!quickForm.value.customerSearch) return alert('Masukkan data pelanggan');
  
  processing.value = true;
  let finalCustomerId = quickForm.value.existingCustomerId;

  try {
    if (isNewCustomer.value) {
      if (!quickForm.value.newCustomerPhone) {
        processing.value = false;
        return alert('Telephone pelanggan baru wajib diisi');
      }
      const custName = quickForm.value.customerSearch;
      
      const custRes = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: custName, telephone: quickForm.value.newCustomerPhone })
      });
      const custData = await custRes.json();
      finalCustomerId = custData._id;
    }

    await fetch('http://localhost:3001/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: finalCustomerId, 
        kebayaId: quickForm.value.kebayaId,
        expectedReturnDate: quickForm.value.returnDate,
        penaltyType: quickForm.value.penaltyType,
        penaltyCost: quickForm.value.penaltyCost
      })
    });

    alert('Penyewaan berhasil diproses!');
    
    // Reset form
    quickForm.value.customerSearch = '';
    quickForm.value.existingCustomerId = '';
    quickForm.value.newCustomerPhone = '';
    quickForm.value.kebayaId = '';
    quickForm.value.penaltyType = 'None';
    quickForm.value.penaltyCost = 0;
    isNewCustomer.value = false;
    totalCost.value = 0;
    
    fetchData(); 
  } catch (err) {
    alert('Gagal memproses penyewaan');
  } finally {
    processing.value = false;
  }
};

onMounted(fetchData);
</script>
