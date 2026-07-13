<template>
  <div>
    <!-- Hero Section with Kebaya Image -->
    <div class="hero-section" style="display: flex; gap: 20px; align-items: center; background: linear-gradient(135deg, var(--primary-color), var(--primary-hover)); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
      <div style="flex: 1;">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Sistem Inventaris Kebaya Linda</h1>
        <p style="font-size: 1.1rem; opacity: 0.9;">Kelola penyewaan dan inventaris butik dengan mudah dan elegan.</p>
      </div>
      <div style="width: 150px; height: 150px; background: rgba(255,255,255,0.2); border-radius: 50%; overflow: hidden; border: 4px solid rgba(255,255,255,0.4);">
        <img src="/img/kebaya_hero.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>

    <!-- Glanceable Info -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
      <div class="material-card" style="border-top: 4px solid var(--primary-color);">
        <h4 style="color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; font-size: 0.8rem;">Kebaya Terpopuler</h4>
        <h2 v-if="stats?.mostRentedKebaya">{{ stats.mostRentedKebaya.kebaya.jenis }}</h2>
        <h2 v-else>-</h2>
      </div>
      <div class="material-card" style="border-top: 4px solid var(--success);">
        <h4 style="color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; font-size: 0.8rem;">Pelanggan Teraktif</h4>
        <h2 v-if="stats?.mostActiveCustomer">{{ stats.mostActiveCustomer.customer.name }}</h2>
        <h2 v-else>-</h2>
      </div>
      <div class="material-card" style="border-top: 4px solid var(--danger);">
        <h4 style="color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; font-size: 0.8rem;">Acara Terdekat</h4>
        <h2 v-if="stats?.upcomingEvents && stats.upcomingEvents.length > 0">{{ stats.upcomingEvents[0].name }}</h2>
        <h2 v-else>Tidak ada</h2>
      </div>
    </div>

    <!-- Quick Rent/Customer Integrated Form -->
    <div class="material-card">
      <h2 style="margin-bottom: 20px; color: var(--primary-color);">Penyewaan Cepat</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Masukkan pelanggan baru dan pilih kebaya dalam satu langkah.</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Customer Details -->
        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">1. Data Pelanggan</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Pilih Pelanggan Tersedia</label>
            <select v-model="quickForm.existingCustomerId" class="input">
              <option value="">-- BUAT PELANGGAN BARU --</option>
              <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }} ({{ c.telephone }})</option>
            </select>
          </div>

          <div v-if="!quickForm.existingCustomerId" style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Nama Pelanggan Baru *</label>
            <input v-model="quickForm.newCustomerName" class="input" />
            
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Telephone *</label>
            <input v-model="quickForm.newCustomerPhone" class="input" />
          </div>
        </div>

        <!-- Kebaya Details -->
        <div>
          <h3 style="margin-bottom: 10px; font-size: 1.1rem;">2. Pilih Kebaya</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Kebaya Tersedia (Stok > 0)</label>
            <select v-model="quickForm.kebayaId" class="input" style="height: 150px;" multiple>
              <option v-for="k in availableKebayas" :key="k._id" :value="k._id">
                {{ k.jenis }} - {{ k.warna }} (Rp {{ k.price }})
              </option>
            </select>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Tahan tombol Ctrl (Windows) atau Cmd (Mac) untuk memilih lebih dari satu.</p>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn" @click="processQuickRent" :disabled="processing">
          {{ processing ? 'Memproses...' : 'Proses Penyewaan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '../composables/useApi';

const { getDashboardStats, getCustomers, getKebayas } = useApi();
const stats = ref<any>(null);
const customers = ref<any[]>([]);
const kebayas = ref<any[]>([]);
const processing = ref(false);

const quickForm = ref({
  existingCustomerId: '',
  newCustomerName: '',
  newCustomerPhone: '',
  kebayaId: [] as string[]
});

const availableKebayas = computed(() => kebayas.value.filter(k => k.availableStock > 0));

const fetchData = async () => {
  stats.value = await getDashboardStats();
  customers.value = await getCustomers();
  kebayas.value = await getKebayas();
};

const processQuickRent = async () => {
  if (quickForm.value.kebayaId.length === 0) return alert('Pilih minimal 1 kebaya');
  
  processing.value = true;
  let finalCustomerId = quickForm.value.existingCustomerId;

  try {
    // 1. Create customer if needed
    if (!finalCustomerId) {
      if (!quickForm.value.newCustomerName || !quickForm.value.newCustomerPhone) {
        processing.value = false;
        return alert('Nama dan Telephone pelanggan baru wajib diisi');
      }
      const custRes = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quickForm.value.newCustomerName, telephone: quickForm.value.newCustomerPhone })
      });
      const custData = await custRes.json();
      finalCustomerId = custData._id;
    }

    // 2. Create rentals
    for (const kId of quickForm.value.kebayaId) {
      await fetch('http://localhost:3001/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: finalCustomerId, kebayaId: kId })
      });
    }

    alert('Penyewaan berhasil diproses!');
    quickForm.value = { existingCustomerId: '', newCustomerName: '', newCustomerPhone: '', kebayaId: [] };
    fetchData(); // refresh data
  } catch (err) {
    alert('Gagal memproses penyewaan');
  } finally {
    processing.value = false;
  }
};

onMounted(fetchData);
</script>
