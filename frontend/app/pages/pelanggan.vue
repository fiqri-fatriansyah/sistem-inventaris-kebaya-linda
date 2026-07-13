<template>
  <div>
    <h1 class="page-title">Daftar Pelanggan</h1>
    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Pelanggan</h2>
        <button class="btn" @click="showForm = true">Tambah Pelanggan</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--surface-border); border-radius: 8px;">
        <label>Nama Pelanggan *</label>
        <input v-model="form.name" class="input" />
        <label>Telephone *</label>
        <input v-model="form.telephone" class="input" />
        <label>Alamat (Opsional)</label>
        <input v-model="form.address" class="input" />
        <label>Email (Opsional)</label>
        <input v-model="form.email" type="email" class="input" />
        <button class="btn" @click="addCustomer">Simpan</button>
        <button class="btn" @click="showForm = false" style="background: #e0e0e0; color: #000; margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Telephone</th>
            <th>Alamat</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c._id">
            <td>{{ c.name }}</td>
            <td>{{ c.telephone }}</td>
            <td>{{ c.address || '-' }}</td>
            <td>{{ c.email || '-' }}</td>
          </tr>
          <tr v-if="customers.length === 0">
            <td colspan="4" style="text-align: center; padding: 20px">Belum ada data pelanggan</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { getCustomers } = useApi();
const customers = ref<any[]>([]);
const pending = ref(true);
const showForm = ref(false);
const form = ref({ name: '', telephone: '', address: '', email: '' });

const fetchCustomers = async () => {
  pending.value = true;
  customers.value = await getCustomers();
  pending.value = false;
};

const addCustomer = async () => {
  if (!form.value.name || !form.value.telephone) return alert('Nama dan Telephone harus diisi');

  try {
    await fetch('http://localhost:3001/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    showForm.value = false;
    form.value = { name: '', telephone: '', address: '', email: '' };
    fetchCustomers();
  } catch (err) {
    alert('Gagal menambah pelanggan');
  }
};

onMounted(fetchCustomers);
</script>
<style scoped>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
