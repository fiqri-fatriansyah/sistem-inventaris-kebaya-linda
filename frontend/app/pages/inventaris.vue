<template>
  <div>
    <h1 class="page-title">Inventaris Kebaya</h1>
    
    <div class="material-card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 15px; align-items: center;">
        <input type="text" v-model="searchQuery" class="input" placeholder="Cari Jenis atau Warna..." style="flex: 2; margin-bottom: 0;" />
        
        <select v-model="sortBy" class="input" style="flex: 1; margin-bottom: 0;">
          <option value="jenis_asc">Jenis (A-Z)</option>
          <option value="jenis_desc">Jenis (Z-A)</option>
          <option value="price_asc">Harga (Terendah)</option>
          <option value="price_desc">Harga (Tertinggi)</option>
          <option value="stock_asc">Stok (Terendah)</option>
          <option value="stock_desc">Stok (Tertinggi)</option>
        </select>
        
        <button class="btn" @click="showForm = true" style="flex: 1;">Tambah Kebaya</button>
      </div>
    </div>

    <!-- Add / Edit Form -->
    <div v-if="showForm" class="material-card" style="margin-bottom: 20px; border-left: 4px solid var(--primary-color);">
      <h3 style="margin-bottom: 15px;">{{ isEditing ? 'Edit Kebaya' : 'Tambah Kebaya Baru' }}</h3>
      
      <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Jenis</label>
      <input v-model="form.jenis" class="input" placeholder="Contoh: Kutubaru" />
      
      <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Warna</label>
      <input v-model="form.warna" class="input" placeholder="Contoh: Putih Tulang" />
      
      <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Harga Sewa (Rp)</label>
      <input type="number" v-model="form.price" class="input" placeholder="100000" />
      
      <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Total Stok</label>
      <input type="number" v-model="form.totalStock" class="input" placeholder="5" />

      <label style="display: block; font-size: 0.9em; margin-bottom: 5px;">Gambar Kebaya (Opsional)</label>
      <input type="file" class="input" accept="image/*" @change="handleFileUpload" style="padding: 10px;" />
      
      <div style="margin-top: 15px;">
        <button class="btn" @click="saveKebaya">{{ isEditing ? 'Simpan Perubahan' : 'Simpan Baru' }}</button>
        <button class="btn" @click="cancelEdit" style="background: #e0e0e0; color: #000; margin-left: 10px;">Batal</button>
      </div>
    </div>

    <div v-if="pending">Memuat...</div>
    <div v-else class="material-card">
      <table class="table">
        <thead>
          <tr>
            <th>Gambar</th>
            <th>Jenis</th>
            <th>Warna</th>
            <th>Harga (Rp)</th>
            <th>Total Stok</th>
            <th>Tersedia</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="k in filteredAndSortedKebayas" :key="k._id">
            <tr style="cursor: pointer; transition: background 0.2s;" @click="toggleRow(k._id)" :style="expandedRow === k._id ? 'background: #f0f0f0;' : ''">
              <td>
                <img v-if="k.imageUrl" :src="'http://localhost:3001' + k.imageUrl" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />
                <span v-else style="color: var(--text-muted); font-size: 0.8em;">No Image</span>
              </td>
              <td>{{ k.jenis }}</td>
              <td>{{ k.warna }}</td>
              <td>{{ k.price }}</td>
              <td>
                <button @click.stop="adjustStock(k, -1)" style="border:none; background:#eee; cursor:pointer; padding: 2px 6px;">-</button>
                <span style="margin: 0 5px;">{{ k.totalStock }}</span>
                <button @click.stop="adjustStock(k, 1)" style="border:none; background:#eee; cursor:pointer; padding: 2px 6px;">+</button>
              </td>
              <td><strong :style="k.availableStock > 0 ? 'color: var(--success);' : 'color: var(--danger);'">{{ k.availableStock }}</strong></td>
              <td>
                <button class="btn" style="padding: 2px 8px; font-size: 0.8rem; background: var(--primary-hover);" @click.stop="toggleRow(k._id)">
                  {{ expandedRow === k._id ? 'Tutup' : 'Penyewa' }}
                </button>
                <button class="btn" style="padding: 2px 8px; font-size: 0.8rem; margin-left: 5px; background: #f39c12;" @click.stop="editKebaya(k)">Edit</button>
                <button class="btn" style="padding: 2px 8px; font-size: 0.8rem; margin-left: 5px; background: var(--danger);" @click.stop="deleteKebaya(k._id)">Hapus</button>
              </td>
            </tr>
            <!-- Expandable Row Content -->
            <tr v-if="expandedRow === k._id">
              <td colspan="7" style="background: #fafafa; padding: 15px; border-bottom: 1px solid var(--surface-border); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                <div v-if="getRentalsForKebaya(k._id).length > 0">
                  <h4 style="margin-bottom: 10px; color: var(--primary-color);">Sedang Disewa Oleh:</h4>
                  <ul style="padding-left: 20px; font-size: 0.9rem;">
                    <li v-for="r in getRentalsForKebaya(k._id)" :key="r._id" style="margin-bottom: 5px;">
                      <strong>{{ r.customerId.name }}</strong> ({{ r.customerId.telephone }}) - 
                      <em>Jatuh Tempo: {{ new Date(r.expectedReturnDate).toLocaleDateString('id-ID') }}</em>
                      <span v-if="new Date(r.expectedReturnDate) < new Date()" style="color: red; font-weight: bold; margin-left: 10px;">[TELAT]</span>
                    </li>
                  </ul>
                </div>
                <div v-else style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">
                  Tidak ada stok yang sedang disewa saat ini.
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="filteredAndSortedKebayas.length === 0">
            <td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data yang cocok dengan pencarian.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '../composables/useApi';

const { getKebayas, getActiveRentals } = useApi();
const kebayas = ref<any[]>([]);
const activeRentals = ref<any[]>([]);
const pending = ref(true);
const showForm = ref(false);

const searchQuery = ref('');
const sortBy = ref('jenis_asc');
const expandedRow = ref<string | null>(null);
const isEditing = ref(false);
const editId = ref<string | null>(null);

const form = ref({ jenis: '', warna: '', price: '', totalStock: '' });
const imageFile = ref<File | null>(null);

const fetchData = async () => {
  pending.value = true;
  kebayas.value = await getKebayas();
  activeRentals.value = await getActiveRentals();
  pending.value = false;
};

const handleFileUpload = (e: any) => {
  imageFile.value = e.target.files[0];
};

const saveKebaya = async () => {
  if (!form.value.jenis || !form.value.warna || !form.value.price || !form.value.totalStock) {
    return alert('Harap isi semua field');
  }

  const formData = new FormData();
  formData.append('jenis', form.value.jenis);
  formData.append('warna', form.value.warna);
  formData.append('price', String(form.value.price));
  formData.append('totalStock', String(form.value.totalStock));
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }

  try {
    const url = isEditing.value ? `http://localhost:3001/api/kebayas/${editId.value}` : 'http://localhost:3001/api/kebayas';
    const method = isEditing.value ? 'PUT' : 'POST';

    await fetch(url, { method, body: formData });
    cancelEdit();
    fetchData();
  } catch (err) {
    alert('Gagal menyimpan kebaya');
  }
};

const cancelEdit = () => {
  showForm.value = false;
  isEditing.value = false;
  editId.value = null;
  form.value = { jenis: '', warna: '', price: '', totalStock: '' };
  imageFile.value = null;
};

const editKebaya = (k: any) => {
  isEditing.value = true;
  editId.value = k._id;
  form.value = { jenis: k.jenis, warna: k.warna, price: k.price, totalStock: k.totalStock };
  showForm.value = true;
};

const deleteKebaya = async (id: string) => {
  if (confirm('Anda yakin ingin menghapus katalog kebaya ini secara permanen?')) {
    try {
      await fetch(`http://localhost:3001/api/kebayas/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Gagal menghapus kebaya');
    }
  }
};

const adjustStock = async (k: any, amount: number) => {
  const newStock = Number(k.totalStock) + amount;
  if (newStock < 0) return;
  const newAvailable = Number(k.availableStock) + amount;
  
  const formData = new FormData();
  formData.append('totalStock', String(newStock));
  formData.append('availableStock', String(newAvailable));
  
  await fetch(`http://localhost:3001/api/kebayas/${k._id}`, { method: 'PUT', body: formData });
  fetchData();
};

const toggleRow = (id: string) => {
  expandedRow.value = expandedRow.value === id ? null : id;
};

const getRentalsForKebaya = (kebayaId: string) => {
  return activeRentals.value.filter(r => r.kebayaId && r.kebayaId._id === kebayaId);
};

const filteredAndSortedKebayas = computed(() => {
  let result = [...kebayas.value];
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(k => k.jenis.toLowerCase().includes(q) || k.warna.toLowerCase().includes(q));
  }
  
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'jenis_asc': return a.jenis.localeCompare(b.jenis);
      case 'jenis_desc': return b.jenis.localeCompare(a.jenis);
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'stock_asc': return a.availableStock - b.availableStock;
      case 'stock_desc': return b.availableStock - a.availableStock;
      default: return 0;
    }
  });
  
  return result;
});

onMounted(fetchData);
</script>
