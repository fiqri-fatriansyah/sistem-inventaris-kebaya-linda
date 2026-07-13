<template>
  <div>
    <h1 class="page-title">Utama</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      <div class="material-card" style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 10px;">Pelanggan Baru</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Tambah data pelanggan secara cepat</p>
        <NuxtLink to="/pelanggan"><button class="btn">Input Pelanggan</button></NuxtLink>
      </div>
      <div class="material-card" style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 10px;">Sewa Kebaya</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Proses order penyewaan baru</p>
        <NuxtLink to="/penyewaan"><button class="btn">Input Penyewaan</button></NuxtLink>
      </div>
      <div class="material-card" style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 10px;">Cek Stok</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Lihat ketersediaan kebaya</p>
        <NuxtLink to="/inventaris"><button class="btn">Lihat Stok</button></NuxtLink>
      </div>
    </div>
  </div>
</template>
