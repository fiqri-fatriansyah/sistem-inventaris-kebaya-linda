<template>
  <div>
    <h1 class="page-title">Inventaris Kebaya</h1>
    <div class="material-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Daftar Kebaya</h2>
        <button class="btn" @click="showForm = true">Tambah Kebaya</button>
      </div>

      <div v-if="showForm" style="margin-bottom: 20px; padding: 20px; border: 1px solid var(--surface-border); border-radius: 8px;">
        <label>Jenis Kebaya</label>
        <input v-model="form.jenis" placeholder="Contoh: Kutu Baru" class="input" />
        
        <label>Warna</label>
        <input v-model="form.warna" placeholder="Contoh: Merah Maroon" class="input" />
        
        <label>Harga Sewa (Rp)</label>
        <input v-model.number="form.price" type="number" class="input" />
        
        <label>Total Stok</label>
        <input v-model.number="form.totalStock" type="number" class="input" />
        
        <label>Foto Kebaya (Opsional)</label>
        <input type="file" @change="onFileChange" class="input" accept="image/*" />

        <button class="btn" @click="addKebaya">Simpan</button>
        <button class="btn" @click="showForm = false" style="background: #e0e0e0; color: #000; margin-left: 10px;">Batal</button>
      </div>

      <div v-if="pending">Memuat...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Jenis</th>
            <th>Warna</th>
            <th>Harga</th>
            <th>Stok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in kebayas" :key="k._id">
            <td>
              <img v-if="k.imageUrl" :src="'http://localhost:3001' + k.imageUrl" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
              <div v-else style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: #999;">-</div>
            </td>
            <td>{{ k.jenis }}</td>
            <td>{{ k.warna }}</td>
            <td>Rp {{ k.price }}</td>
            <td>{{ k.availableStock }} / {{ k.totalStock }}</td>
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

const form = ref({ jenis: '', warna: '', price: '', totalStock: '' });
const file = ref<File | null>(null);

const fetchKebayas = async () => {
  pending.value = true;
  kebayas.value = await getKebayas();
  pending.value = false;
};

const onFileChange = (e: any) => {
  file.value = e.target.files[0];
};

const addKebaya = async () => {
  if (!form.value.jenis || !form.value.warna) return alert('Jenis dan Warna harus diisi');
  
  const formData = new FormData();
  formData.append('jenis', form.value.jenis);
  formData.append('warna', form.value.warna);
  formData.append('price', form.value.price || '0');
  formData.append('totalStock', form.value.totalStock || '0');
  formData.append('availableStock', form.value.totalStock || '0');
  if (file.value) {
    formData.append('image', file.value);
  }

  try {
    await fetch('http://localhost:3001/api/kebayas', {
      method: 'POST',
      body: formData
    });
    showForm.value = false;
    form.value = { jenis: '', warna: '', price: '', totalStock: '' };
    file.value = null;
    fetchKebayas();
  } catch (err) {
    alert('Gagal menambah data');
  }
};

onMounted(fetchKebayas);
</script>
<style scoped>label { font-size: 0.9em; font-weight: 500; display: block; margin-bottom: 5px; color: var(--text-muted); }</style>
