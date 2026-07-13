<template>
  <div>
    <h1 class="page-title">Dasbor Ringkasan</h1>
    <div v-if="pending">Memuat data...</div>
    <div v-else-if="error" style="color: var(--danger)">Gagal memuat data dari server.</div>
    <div v-else style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      
      <div class="material-card">
        <h3 style="margin-bottom: 15px; color: var(--primary-color);">Statistik Populer</h3>
        <div style="margin-bottom: 15px;">
          <strong>Kebaya Paling Sering Disewa:</strong><br/>
          <span v-if="stats?.mostRentedKebaya">
            {{ stats.mostRentedKebaya.kebaya.jenis }} ({{ stats.mostRentedKebaya.kebaya.warna }}) - {{ stats.mostRentedKebaya.count }} kali
          </span>
          <span v-else class="text-muted">Belum ada data</span>
        </div>
        <div>
          <strong>Pelanggan Paling Aktif:</strong><br/>
          <span v-if="stats?.mostActiveCustomer">
            {{ stats.mostActiveCustomer.customer.name }} - {{ stats.mostActiveCustomer.count }} kali
          </span>
          <span v-else class="text-muted">Belum ada data</span>
        </div>
      </div>

      <div class="material-card">
        <h3 style="margin-bottom: 15px; color: var(--primary-color);">Acara Penting Terdekat</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li v-for="e in stats?.upcomingEvents" :key="e._id" style="margin-bottom: 10px; border-bottom: 1px solid var(--surface-border); padding-bottom: 5px;">
            <strong>{{ e.name }}</strong> - {{ new Date(e.date).toLocaleDateString('id-ID') }}
            <p style="font-size: 0.85em; color: var(--text-muted);">{{ e.description }}</p>
          </li>
          <li v-if="!stats?.upcomingEvents || stats.upcomingEvents.length === 0" class="text-muted">Tidak ada acara terdekat</li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { getDashboardStats } = useApi();
const stats = ref<any>(null);
const pending = ref(true);
const error = ref(false);

onMounted(async () => {
  try {
    stats.value = await getDashboardStats();
  } catch (e) {
    error.value = true;
  } finally {
    pending.value = false;
  }
});
</script>
<style scoped>.text-muted { color: var(--text-muted); }</style>
