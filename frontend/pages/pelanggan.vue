<template>
  <div>
    <h1 class="page-title">Daftar Pelanggan</h1>
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Pelanggan</h2>
        <button class="btn" @click="showForm = true">Tambah Pelanggan</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <input v-model="form.name" placeholder="Nama Pelanggan" class="input" />
        <input v-model="form.contactInfo" placeholder="Kontak Info" class="input" />
        <button class="btn" @click="addCustomer" style="margin-top: 10px">Simpan</button>
        <button class="btn" @click="showForm = false" style="background: var(--surface-border); margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kontak Info</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c._id">
            <td>{{ c.name }}</td>
            <td>{{ c.contactInfo }}</td>
          </tr>
          <tr v-if="customers.length === 0">
            <td colspan="2" style="text-align: center; padding: 20px">Belum ada data pelanggan</td>
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
const form = ref({ name: '', contactInfo: '' });

const fetchCustomers = async () => {
  pending.value = true;
  customers.value = await getCustomers();
  pending.value = false;
};

const addCustomer = async () => {
  if (!form.value.name) return alert('Nama pelanggan harus diisi');

  try {
    await fetch('http://localhost:3001/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    showForm.value = false;
    form.value = { name: '', contactInfo: '' };
    fetchCustomers();
  } catch (err) {
    alert('Gagal menambah pelanggan');
  }
};

onMounted(fetchCustomers);
</script>
