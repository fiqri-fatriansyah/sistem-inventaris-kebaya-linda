<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="brand">Kebaya Linda</div>
      <nav>
        <NuxtLink to="/" class="nav-link" exact>Utama</NuxtLink>
        <NuxtLink to="/dasbor" class="nav-link">Dasbor</NuxtLink>
        <NuxtLink to="/inventaris" class="nav-link">Inventaris</NuxtLink>
        <NuxtLink to="/penyewaan" class="nav-link">Penyewaan</NuxtLink>
        <NuxtLink to="/pelanggan" class="nav-link">Pelanggan</NuxtLink>
        <NuxtLink to="/audit" class="nav-link">Audit & Log</NuxtLink>
        <NuxtLink to="/pengaturan" class="nav-link">Pengaturan</NuxtLink>
      </nav>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
}
</style>
