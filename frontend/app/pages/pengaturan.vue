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

    <!-- Audit Log Security -->
    <div class="material-card" style="margin-top: 30px;">
      <h2 style="margin-bottom: 20px; color: var(--primary-color);">Log Sistem & Audit</h2>
      
      <div v-if="!auditAuthenticated" style="text-align: center; padding: 20px;">
        <p style="margin-bottom: 15px;">Fitur ini dikunci. Masukkan Master PIN untuk melihat riwayat aktivitas sistem.</p>
        <input type="password" v-model="auditPin" class="input" placeholder="Masukkan PIN" style="max-width: 200px; display: inline-block; text-align: center;" @keyup.enter="authenticateAudit" />
        <br/><br/>
        <button class="btn" @click="authenticateAudit">Buka Kunci</button>
      </div>

      <div v-else>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">Riwayat Aktivitas</h3>
          <a :href="'http://localhost:3001/api/audit/export/pdf?pin=' + auditPin" target="_blank">
            <button class="btn" style="background: #c62828; padding: 5px 15px; font-size: 0.9em;">Print PDF Log</button>
          </a>
        </div>

        <div v-if="pendingAudit">Memuat log...</div>
        <table v-else class="table" style="font-size: 0.9em;">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aksi</th>
              <th>Entitas</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in auditLogs" :key="log._id">
              <td>{{ new Date(log.timestamp).toLocaleString('id-ID') }}</td>
              <td>
                <span :style="{ fontWeight: 'bold', color: getActionColor(log.action) }">
                  {{ log.action }}
                </span>
              </td>
              <td>{{ log.entity }}</td>
              <td>{{ log.details }}</td>
            </tr>
            <tr v-if="auditLogs.length === 0">
              <td colspan="4" style="text-align: center; padding: 20px;">Tidak ada aktivitas terekam.</td>
            </tr>
          </tbody>
        </table>
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

const auditAuthenticated = ref(false);
const auditPin = ref('');
const auditLogs = ref<any[]>([]);
const pendingAudit = ref(false);

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

const authenticateAudit = async () => {
  pendingAudit.value = true;
  try {
    const res = await fetch(`http://localhost:3001/api/audit?pin=${auditPin.value}`);
    if (res.ok) {
      auditLogs.value = await res.json();
      auditAuthenticated.value = true;
    } else {
      alert('PIN Salah!');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan koneksi.');
  }
  pendingAudit.value = false;
};

const getActionColor = (action: string) => {
  switch(action) {
    case 'CREATE': return 'var(--success)';
    case 'UPDATE': return '#f39c12';
    case 'DELETE': return 'var(--danger)';
    case 'CANCEL': return 'var(--danger)';
    case 'RENT': return '#2980b9';
    case 'RETURN': return '#8e44ad';
    default: return 'var(--text-main)';
  }
};

onMounted(fetchConfig);
</script>
