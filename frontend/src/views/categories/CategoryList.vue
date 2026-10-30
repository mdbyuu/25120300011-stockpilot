<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import { Layers, Plus, Edit2, Trash2, X } from 'lucide-vue-next';

const authStore = useAuthStore();

const categories = ref([]);
const loading = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const formLoading = ref(false);
const formError = ref('');

const formData = ref({
  id: null,
  name: '',
  code: '',
  description: ''
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    if (res.success) {
      categories.value = res.data;
    }
  } catch (error) {
    console.error('Gagal memuat kategori:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formError.value = '';
  formData.value = {
    id: null,
    name: '',
    code: '',
    description: ''
  };
  showModal.value = true;
};

const openEditModal = (cat) => {
  isEditing.value = true;
  formError.value = '';
  formData.value = {
    id: cat.id,
    name: cat.name,
    code: cat.code,
    description: cat.description
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  formError.value = '';
  formLoading.value = true;
  try {
    if (isEditing.value) {
      const res = await api.put(`/categories/${formData.value.id}`, formData.value);
      if (res.success) {
        closeModal();
        fetchCategories();
      }
    } else {
      const res = await api.post('/categories', formData.value);
      if (res.success) {
        closeModal();
        fetchCategories();
      }
    }
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan kategori.';
  } finally {
    formLoading.value = false;
  }
};

const handleDelete = async (cat) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kategori '${cat.name}'?`)) {
    try {
      const res = await api.delete(`/categories/${cat.id}`);
      if (res.success) {
        alert('Kategori berhasil dihapus.');
        fetchCategories();
      }
    } catch (err) {
      alert(`Gagal: ${err.message}`);
    }
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="page-body">
    <div class="page-header">
      <div>
        <h1 class="page-title">Kategori Master Barang</h1>
        <p class="page-subtitle">Kelola pengelompokan klasifikasi produk gudang (Khusus Administrator)</p>
      </div>
      <div>
        <button @click="openCreateModal" class="btn btn-primary">
          <Plus :size="16" />
          <span>Tambah Kategori</span>
        </button>
      </div>
    </div>

    <div class="card table-card">
      <div v-if="loading" class="loading-state">
        <p>Memuat data kategori...</p>
      </div>

      <div v-else-if="categories.length === 0" class="empty-state">
        <Layers :size="48" class="text-muted mb-2" />
        <h3 class="font-bold text-dark">Belum ada kategori</h3>
        <p class="text-muted text-sm">Tambahkan kategori pertama untuk mengklasifikasikan produk gudang.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Kode Kategori</th>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th>Jumlah Produk Terdaftar</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id">
              <td>
                <span class="code-badge">{{ cat.code }}</span>
              </td>
              <td><strong>{{ cat.name }}</strong></td>
              <td>{{ cat.description || '-' }}</td>
              <td>
                <span class="product-count-tag">{{ cat.product_count }} Item</span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button @click="openEditModal(cat)" class="btn-icon btn-icon-edit" title="Ubah Kategori">
                    <Edit2 :size="15" />
                  </button>
                  <button @click="handleDelete(cat)" class="btn-icon btn-icon-delete" title="Hapus Kategori">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="card-title">{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h2>
          <button @click="closeModal" class="btn-close">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger mb-3">
              {{ formError }}
            </div>

            <div class="form-group">
              <label class="form-label">Kode Kategori (Singkat & Huruf Kapital) *</label>
              <input
                v-model="formData.code"
                type="text"
                class="form-control"
                placeholder="Contoh: MAT, PRT, ELK"
                required
                maxlength="20"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Nama Kategori *</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control"
                placeholder="Contoh: Material Bahan Baku"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Deskripsi Keterangan</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="form-control"
                placeholder="Penjelasan isi kelompok barang ini..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-outline">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan Kategori') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--dark);
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.loading-state, .empty-state {
  padding: 3rem;
  text-align: center;
}

.code-badge {
  font-family: monospace;
  font-weight: 800;
  background: var(--primary-light);
  color: var(--primary);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.product-count-tag {
  background: #f1f5f9;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary);
}

.text-right {
  text-align: right;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.btn-icon-edit:hover {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.btn-icon-delete:hover {
  background: var(--danger);
  color: #ffffff;
  border-color: var(--danger);
}

.btn-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
}
</style>
