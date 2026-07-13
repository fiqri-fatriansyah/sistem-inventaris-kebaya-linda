<template>
  <div>
    <h1 class="page-title">Inventaris Kebaya</h1>
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Daftar Kebaya</h2>
        <button class="btn" @click="showForm = true">Tambah Kebaya</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <input v-model="form.name" placeholder="Nama Kebaya" class="input" />
        <input v-model="form.type" placeholder="Jenis" class="input" />
        <input v-model.number="form.price" type="number" placeholder="Harga" class="input" />
        <input v-model.number="form.totalStock" type="number" placeholder="Total Stok" class="input" />
        <button class="btn" @click="addKebaya" style="margin-top: 10px">Simpan</button>
        <button class="btn" @click="showForm = false" style="background: var(--surface-border); margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Jenis</th>
            <th>Harga</th>
            <th>Total Stok</th>
            <th>Tersedia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in kebayas" :key="k._id">
            <td>{{ k.name }}</td>
            <td>{{ k.type }}</td>
            <td>Rp {{ k.price }}</td>
            <td>{{ k.totalStock }}</td>
            <td>{{ k.availableStock }}</td>
          </tr>
          <tr v-if="kebayas.length === 0">
            <td colspan="5" style="text-align: center; padding: 20px">Belum ada data kebaya</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { getKebayas } = useApi();
const kebayas = ref<any[]>([]);
const pending = ref(true);
const showForm = ref(false);
const form = ref({ name: '', type: '', price: 0, totalStock: 0, availableStock: 0 });

const fetchKebayas = async () => {
  pending.value = true;
  kebayas.value = await getKebayas();
  pending.value = false;
};

const addKebaya = async () => {
  if (!form.value.name || !form.value.type) return alert('Nama dan Jenis harus diisi');
  
  form.value.availableStock = form.value.totalStock; // Available starts as total
  try {
    await fetch('http://localhost:3001/api/kebayas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    showForm.value = false;
    form.value = { name: '', type: '', price: 0, totalStock: 0, availableStock: 0 };
    fetchKebayas();
  } catch (err) {
    alert('Gagal menambah data');
  }
};

onMounted(fetchKebayas);
</script>

<style>
.input { width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 4px; border: 1px solid var(--surface-border); background: #111; color: white; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--surface-border); }
.table th { color: var(--primary-color); }
</style>
