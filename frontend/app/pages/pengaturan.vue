<template>
  <div>
    <h1 class="page-title">Pengaturan Sistem</h1>
    
    <div class="material-card" style="max-width: 600px;">
      <h2 style="margin-bottom: 20px; color: var(--primary-color);">Pengaturan Denda Keterlambatan</h2>
      
      <div v-if="pending">Memuat konfigurasi...</div>
      <div v-else>
        <div style="margin-bottom: 15px;">
          <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Tipe Denda Global</label>
          <select v-model="form.penaltyType" class="input">
            <option value="None">Tanpa Denda</option>
            <option value="One-time">Satu Kali (Flat)</option>
            <option value="Daily">Per Hari</option>
            <option value="Weekly">Per Minggu</option>
          </select>
          <small style="color: var(--text-muted); display: block; margin-top: 5px;">Aturan ini akan berlaku secara otomatis untuk semua penyewaan yang telat dikembalikan.</small>
        </div>

        <div style="margin-bottom: 20px;" v-if="form.penaltyType !== 'None'">
          <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Biaya Denda (Rp)</label>
          <input type="number" v-model="form.penaltyCost" class="input" />
        </div>

        <button class="btn" @click="saveConfig" :disabled="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="material-card" style="max-width: 600px; margin-top: 30px; border-left: 5px solid var(--danger);">
      <h2 style="margin-bottom: 20px; color: var(--danger);">Zona Bahaya (Danger Zone)</h2>
      <p style="margin-bottom: 15px; font-size: 0.9em; line-height: 1.5;">
        Gunakan fitur ini hanya jika Anda ingin mereset seluruh sistem kembali ke kondisi awal (Clean Slate). Semua data Pelanggan, Inventaris, dan Penyewaan akan <strong>dihapus permanen</strong>.
      </p>
      
      <div style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" v-model="wipeAudit" style="width: 18px; height: 18px;" />
          <span style="font-weight: bold; color: var(--danger);">Hapus juga seluruh Log Audit</span>
        </label>
        <small style="color: var(--text-muted); display: block; margin-top: 5px; margin-left: 28px;">
          Jika tidak dicentang, riwayat Log Audit sebelumnya akan dipertahankan sebagai jejak historikal permanen.
        </small>
      </div>

      <button class="btn" style="background: var(--danger);" @click="executeFactoryReset" :disabled="wiping">
        {{ wiping ? 'Sedang Menghapus Data...' : 'Hapus Semua Data (Factory Reset)' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const pending = ref(true);
const saving = ref(false);
const form = ref({ penaltyType: 'None', penaltyCost: 0 });

const wipeAudit = ref(false);
const wiping = ref(false);

const fetchConfig = async () => {
  pending.value = true;
  try {
    const res = await fetch('http://localhost:3001/api/config');
    const data = await res.json();
    if(data) {
      form.value.penaltyType = data.penaltyType;
      form.value.penaltyCost = data.penaltyCost;
    }
  } catch (err) {
    console.error(err);
  }
  pending.value = false;
};

const saveConfig = async () => {
  saving.value = true;
  try {
    await fetch('http://localhost:3001/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    alert('Pengaturan Denda berhasil disimpan!');
  } catch (err) {
    alert('Gagal menyimpan pengaturan');
  }
  saving.value = false;
};

const executeFactoryReset = async () => {
  const pin = prompt('Tindakan ini SANGAT BERBAHAYA. Masukkan Master PIN Anda untuk melanjutkan:');
  if (!pin) return; // user cancelled

  if (confirm('PERINGATAN TERAKHIR: Semua data akan hilang selamanya. Anda yakin?')) {
    wiping.value = true;
    try {
      const res = await fetch('http://localhost:3001/api/config/wipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, wipeAudit: wipeAudit.value })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('SUKSES: ' + data.message);
        window.location.reload();
      } else {
        alert('GAGAL: ' + data.error);
      }
    } catch (err: any) {
      alert('Gagal mengeksekusi factory reset: ' + err.message);
    }
    wiping.value = false;
  }
};

onMounted(fetchConfig);
</script>
