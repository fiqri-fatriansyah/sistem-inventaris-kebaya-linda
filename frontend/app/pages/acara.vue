<template>
  <div>
    <h1 class="page-title">Acara & Hari Libur</h1>
    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Daftar Acara</h2>
        <button class="btn" @click="showForm = true">Tambah Acara</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--surface-border); border-radius: 8px;">
        <label>Nama Acara</label>
        <input v-model="form.name" class="input" />
        <label>Tanggal</label>
        <input v-model="form.date" type="date" class="input" />
        <label>Deskripsi</label>
        <input v-model="form.description" class="input" />
        <button class="btn" @click="addEvent">Simpan</button>
        <button class="btn" @click="showForm = false" style="background: #e0e0e0; color: #000; margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Acara</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in events" :key="e._id">
            <td>{{ new Date(e.date).toLocaleDateString('id-ID') }}</td>
            <td>{{ e.name }}</td>
            <td>{{ e.description }}</td>
            <td>
              <button class="btn" style="background: var(--danger); padding: 5px 10px; font-size: 0.8em;" @click="deleteEvent(e._id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { getEvents } = useApi();
const events = ref<any[]>([]);
const pending = ref(true);
const showForm = ref(false);
const form = ref({ name: '', date: '', description: '' });

const fetchEvents = async () => {
  pending.value = true;
  events.value = await getEvents();
  pending.value = false;
};

const addEvent = async () => {
  if (!form.value.name || !form.value.date) return alert('Nama dan Tanggal harus diisi');
  try {
    await fetch('http://localhost:3001/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    showForm.value = false;
    form.value = { name: '', date: '', description: '' };
    fetchEvents();
  } catch (err) {
    alert('Gagal menambah acara');
  }
};

const deleteEvent = async (id: string) => {
  if (confirm('Hapus acara ini?')) {
    await fetch(`http://localhost:3001/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  }
};

onMounted(fetchEvents);
</script>
<style>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
