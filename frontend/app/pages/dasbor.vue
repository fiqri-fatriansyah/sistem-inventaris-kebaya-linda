<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 class="page-title" style="margin-bottom: 0;">Dasbor Analitik</h1>
      <div style="display: flex; gap: 10px;">
        <a href="http://localhost:3001/api/reports/dashboard?format=pdf" target="_blank">
          <button class="btn" style="background: #c62828;">Export PDF</button>
        </a>
        <a href="http://localhost:3001/api/reports/dashboard?format=excel" target="_blank">
          <button class="btn" style="background: #107c41;">Export Excel</button>
        </a>
        <a href="http://localhost:3001/api/reports/dashboard?format=word" target="_blank">
          <button class="btn" style="background: #2b579a;">Export Word</button>
        </a>
      </div>
    </div>

    <div v-if="pending">Memuat grafik...</div>
    <div v-else-if="error" style="color: var(--danger)">Gagal memuat data dari server.</div>
    <div v-else>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div class="material-card">
          <h3 style="margin-bottom: 15px; color: var(--primary-color);">Pendapatan per Bulan (Rp)</h3>
          <div style="height: 300px;">
            <Bar :data="revenueChartData" :options="chartOptions" />
          </div>
        </div>

        <div class="material-card">
          <h3 style="margin-bottom: 15px; color: var(--primary-color);">Tren Penyewaan</h3>
          <div style="height: 300px;">
            <Line :data="rentalsChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="material-card" style="width: 50%; margin: 0 auto;">
        <h3 style="margin-bottom: 15px; color: var(--primary-color); text-align: center;">Kebaya Terpopuler</h3>
        <div style="height: 300px;">
          <Pie :data="popularityChartData" :options="pieOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '../composables/useApi';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement } from 'chart.js';
import { Bar, Line, Pie } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement);

const { getDashboardStats } = useApi();
const stats = ref<any>(null);
const pending = ref(true);
const error = ref(false);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const chartOptions = { responsive: true, maintainAspectRatio: false };
const pieOptions = { responsive: true, maintainAspectRatio: false };

const revenueChartData = computed(() => {
  return {
    labels: months,
    datasets: [{
      label: 'Pendapatan',
      backgroundColor: '#6200ea',
      data: stats.value?.charts?.revenuePerMonth || []
    }]
  };
});

const rentalsChartData = computed(() => {
  return {
    labels: months,
    datasets: [{
      label: 'Jumlah Penyewaan',
      borderColor: '#388e3c',
      backgroundColor: 'rgba(56, 142, 60, 0.2)',
      data: stats.value?.charts?.rentalsPerMonth || [],
      fill: true
    }]
  };
});

const popularityChartData = computed(() => {
  const popData = stats.value?.charts?.kebayaPopularity || [];
  return {
    labels: popData.map((d: any) => d.label),
    datasets: [{
      backgroundColor: ['#6200ea', '#3700b3', '#03dac6', '#cf6679', '#bb86fc'],
      data: popData.map((d: any) => d.count)
    }]
  };
});

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
