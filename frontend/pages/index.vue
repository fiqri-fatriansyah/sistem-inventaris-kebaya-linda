<template>
  <div>
    <h1 class="page-title">Dasbor</h1>
    <div class="glass-card">
      <h2>Ringkasan</h2>
      <div v-if="pending">Memuat data...</div>
      <div v-else-if="error" style="color: var(--danger)">Gagal memuat data dari server.</div>
      <div v-else style="display: flex; gap: 20px; margin-top: 15px">
        <div class="stat-box">
          <h3>Penyewaan Aktif</h3>
          <p>{{ rentals.length }}</p>
        </div>
        <div class="stat-box">
          <h3>Total Jenis Kebaya</h3>
          <p>{{ kebayas.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { getActiveRentals, getKebayas } = useApi();
const rentals = ref<any[]>([]);
const kebayas = ref<any[]>([]);
const pending = ref(true);
const error = ref(false);

onMounted(async () => {
  try {
    rentals.value = await getActiveRentals();
    kebayas.value = await getKebayas();
  } catch (e) {
    error.value = true;
  } finally {
    pending.value = false;
  }
});
</script>

<style scoped>
.stat-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  min-width: 150px;
  text-align: center;
}
.stat-box h3 { font-size: 1rem; color: var(--text-muted); }
.stat-box p { font-size: 2.5rem; font-weight: bold; color: var(--primary-color); margin-top: 10px;}
</style>
