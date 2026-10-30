<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from '../../composables/useToast';
import { Package, Plus, Search, Edit2, Trash2, ArrowDownRight, ArrowUpRight, X, AlertTriangle } from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('');
const filterLowStock = ref(route.query.low_stock === 'true');

const showModal = ref(false);
const isEditing = ref(false);
const formLoading = ref(false);
const formError = ref('');
const formData = ref({ id: null, sku: '', name: '', category_id: '', stock: 10, min_stock: 5, price: 10000, unit: 'pcs', location: '' });

const fetchCategories = async () => {
  try { const r = await api.get('/categories'); if (r.success) categories.value = r.data; } catch(e) {}
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    let u = `/products?`;
    if (searchQuery.value) u += `search=${encodeURIComponent(searchQuery.value)}&`;
    if (selectedCategory.value) u += `category_id=${selectedCategory.value}&`;
    if (filterLowStock.value) u += `low_stock=true&`;
    const r = await api.get(u);
    if (r.success) products.value = r.data;
  } catch(e) {
    toast.error('Gagal memuat produk', e.message);
  } finally { loading.value = false; }
};

const openCreate = () => {
  isEditing.value = false; formError.value = '';
  formData.value = { id: null, sku: `SKU-${Date.now().toString().slice(-5)}`, name: '', category_id: categories.value[0]?.id || '', stock: 10, min_stock: 5, price: 10000, unit: 'pcs', location: 'Zona A - Rak 01' };
  showModal.value = true;
};

const openEdit = (item) => {
  isEditing.value = true; formError.value = '';
  formData.value = { id: item.id, sku: item.sku, name: item.name, category_id: item.category_id, stock: item.stock, min_stock: item.min_stock, price: item.price, unit: item.unit, location: item.location };
  showModal.value = true;
};

const handleSubmit = async () => {
  formError.value = ''; formLoading.value = true;
  try {
    if (isEditing.value) {
      const r = await api.put(`/products/${formData.value.id}`, formData.value);
      if (r.success) { showModal.value = false; fetchProducts(); toast.success('Berhasil', 'Data produk diperbarui.'); }
    } else {
      const r = await api.post('/products', formData.value);
      if (r.success) { showModal.value = false; fetchProducts(); toast.success('Berhasil', 'Produk baru ditambahkan.'); }
    }
  } catch(e) { formError.value = e.message; }
  finally { formLoading.value = false; }
};

const handleDelete = async (item) => {
  if (!confirm(`Hapus produk "${item.name}"?`)) return;
  try {
    const r = await api.delete(`/products/${item.id}`);
    if (r.success) { fetchProducts(); toast.success('Dihapus', 'Produk berhasil dihapus.'); }
  } catch(e) { toast.error('Gagal menghapus', e.message); }
};

const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);

onMounted(async () => { await fetchCategories(); await fetchProducts(); });
</script>

<template>
  <div class="page-body">
    <div class="page-header">
      <div>
        <h1 class="page-title">Katalog Produk</h1>
        <p class="page-subtitle">Kelola inventaris barang, stok, harga, dan penempatan rak gudang</p>
      </div>
      <button @click="openCreate" class="btn btn-primary">
        <Plus :size="15" />
        <span>Tambah Produk</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="16" class="search-icon" />
        <input v-model="searchQuery" @input="fetchProducts" type="text" placeholder="Cari nama, SKU, atau lokasi..." class="form-control search-input" />
      </div>
      <select v-model="selectedCategory" @change="fetchProducts" class="form-select toolbar-select">
        <option value="">Semua Kategori</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <label class="filter-chip" :class="{ active: filterLowStock }">
        <input type="checkbox" v-model="filterLowStock" @change="fetchProducts" hidden />
        <AlertTriangle :size="13" />
        <span>Low Stock</span>
      </label>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Memuat produk...</p></div>
      <div v-else-if="!products.length" class="empty-state">
        <div class="empty-state-icon"><Package :size="24" /></div>
        <h3>Tidak ada produk</h3>
        <p>Coba ubah filter atau tambahkan produk baru.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Harga</th>
              <th>Stok</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td><code class="sku-code">{{ p.sku }}</code></td>
              <td><span class="font-bold">{{ p.name }}</span></td>
              <td><span class="cat-pill">{{ p.category?.name || '-' }}</span></td>
              <td class="text-muted text-sm">{{ p.location || '-' }}</td>
              <td class="text-sm">{{ formatRupiah(p.price) }}/{{ p.unit }}</td>
              <td>
                <span class="badge" :class="p.stock <= p.min_stock ? 'badge-low-stock' : 'badge-safe-stock'">
                  {{ p.stock }} {{ p.unit }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-row">
                  <router-link :to="`/transactions/new?product_id=${p.id}&type=IN`" class="icon-btn ib-green" title="Stock In"><ArrowDownRight :size="14" /></router-link>
                  <router-link :to="`/transactions/new?product_id=${p.id}&type=OUT`" class="icon-btn ib-red" title="Stock Out"><ArrowUpRight :size="14" /></router-link>
                  <button @click="openEdit(p)" class="icon-btn ib-blue" title="Edit"><Edit2 :size="14" /></button>
                  <button v-if="authStore.isAdmin" @click="handleDelete(p)" class="icon-btn ib-red" title="Hapus"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="card-title">{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
          <button @click="showModal = false" class="btn-ghost"><X :size="18" /></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">SKU *</label>
                <input v-model="formData.sku" class="form-control" required />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Kategori *</label>
                <select v-model="formData.category_id" class="form-select" required>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Nama Produk *</label><input v-model="formData.name" class="form-control" required /></div>
            <div class="form-row">
              <div class="form-group flex-1" v-if="!isEditing"><label class="form-label">Stok Awal</label><input v-model.number="formData.stock" type="number" min="0" class="form-control" required /></div>
              <div class="form-group flex-1"><label class="form-label">Min. Stok</label><input v-model.number="formData.min_stock" type="number" min="0" class="form-control" required /></div>
              <div class="form-group flex-1"><label class="form-label">Unit</label><input v-model="formData.unit" class="form-control" required /></div>
            </div>
            <div class="form-row">
              <div class="form-group flex-1"><label class="form-label">Harga (Rp) *</label><input v-model.number="formData.price" type="number" min="0" class="form-control" required /></div>
              <div class="form-group flex-1"><label class="form-label">Lokasi Rak</label><input v-model="formData.location" class="form-control" /></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">{{ formLoading ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 240px; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); }
.search-input { padding-left: 2.25rem; }
.toolbar-select { width: auto; min-width: 170px; }
.filter-chip { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.75rem; border: 1.5px solid var(--slate-200); border-radius: var(--radius-sm); cursor: pointer; background: #fff; color: var(--slate-500); transition: all 0.2s; }
.filter-chip.active { background: var(--danger-bg); border-color: #fca5a5; color: #dc2626; }
.table-card { padding: 0; overflow: hidden; }
.sku-code { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: var(--slate-100); padding: 0.125rem 0.375rem; border-radius: var(--radius-xs); color: var(--slate-700); font-weight: 600; }
.cat-pill { background: var(--primary-50); color: var(--primary-700); font-size: 0.6875rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); }
.action-row { display: flex; align-items: center; justify-content: flex-end; gap: 0.3rem; }
.icon-btn { width: 30px; height: 30px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--slate-200); background: #fff; color: var(--slate-500); cursor: pointer; transition: all 0.15s; text-decoration: none; }
.ib-green:hover { background: var(--success); color: #fff; border-color: var(--success); }
.ib-red:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
.ib-blue:hover { background: var(--primary-600); color: #fff; border-color: var(--primary-600); }
.form-row { display: flex; gap: 0.875rem; }
.flex-1 { flex: 1; }
.btn-ghost { background: none; border: none; cursor: pointer; color: var(--slate-400); padding: 0.25rem; border-radius: var(--radius-xs); }
.btn-ghost:hover { color: var(--slate-700); background: var(--slate-100); }
</style>
