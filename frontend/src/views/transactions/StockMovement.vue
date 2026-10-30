<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const products = ref([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = ref({
  product_id: route.query.product_id ? parseInt(route.query.product_id) : '',
  type: route.query.type || 'IN',
  quantity: 1,
  note: ''
});

const selectedProduct = ref(null);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await api.get('/products');
    if (res.success) {
      products.value = res.data;
      if (form.value.product_id) {
        onProductChange();
      }
    }
  } catch (err) {
    console.error('Gagal mengambil daftar produk:', err);
  } finally {
    loading.value = false;
  }
};

const onProductChange = () => {
  selectedProduct.value = products.value.find(p => p.id === parseInt(form.value.product_id)) || null;
};

const handleTransactionSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  submitting.value = true;

  try {
    if (!form.value.product_id) {
      throw new Error('Silakan pilih produk yang akan dimutasi.');
    }

    if (form.value.type === 'OUT' && selectedProduct.value) {
      if (selectedProduct.value.stock < form.value.quantity) {
        throw new Error(`Stok tidak mencukupi! Stok saat ini: ${selectedProduct.value.stock} ${selectedProduct.value.unit}, kuantitas diminta: ${form.value.quantity}.`);
      }
    }

    const payload = {
      product_id: parseInt(form.value.product_id),
      type: form.value.type,
      quantity: parseInt(form.value.quantity),
      note: form.value.note
    };

    const res = await api.post('/transactions', payload);
    if (res.success) {
      successMessage.value = res.message || 'Transaksi mutasi berhasil dicatat!';
      setTimeout(() => {
        router.push('/transactions');
      }, 1200);
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memproses mutasi inventaris.';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="page-body">
    <div class="page-header">
      <div>
        <router-link to="/transactions" class="back-link">
          <ArrowLeft :size="16" />
          <span>Kembali ke Riwayat Mutasi</span>
        </router-link>
        <h1 class="page-title mt-2">Pencatatan Mutasi Stok Gudang</h1>
        <p class="page-subtitle">Formulir penerimaan barang masuk, pengeluaran logistik, dan stock opname</p>
      </div>
    </div>

    <div class="form-container">
      <div class="card form-card">
        <div v-if="errorMessage" class="alert alert-danger">
          <AlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="alert alert-success">
          <CheckCircle :size="18" />
          <span>{{ successMessage }}</span>
        </div>

        <form @submit.prevent="handleTransactionSubmit">
          <!-- Selection Jenis Mutasi -->
          <div class="form-group">
            <label class="form-label">Jenis Transaksi Mutasi *</label>
            <div class="type-selector-grid">
              <!-- Masuk (IN) -->
              <label class="type-option" :class="{ selected: form.type === 'IN' }">
                <input type="radio" v-model="form.type" value="IN" />
                <div class="type-option-icon icon-in">
                  <ArrowDownRight :size="20" />
                </div>
                <div>
                  <div class="type-title">Barang Masuk (Stock In)</div>
                  <div class="type-desc">Penerimaan dari supplier / pembelian</div>
                </div>
              </label>

              <!-- Keluar (OUT) -->
              <label class="type-option" :class="{ selected: form.type === 'OUT' }">
                <input type="radio" v-model="form.type" value="OUT" />
                <div class="type-option-icon icon-out">
                  <ArrowUpRight :size="20" />
                </div>
                <div>
                  <div class="type-title">Barang Keluar (Stock Out)</div>
                  <div class="type-desc">Pengiriman konsumen / pemakaian produksi</div>
                </div>
              </label>

              <!-- Opname (ADJUSTMENT) -->
              <label
                v-if="authStore.isAdmin"
                class="type-option"
                :class="{ selected: form.type === 'ADJUSTMENT' }"
              >
                <input type="radio" v-model="form.type" value="ADJUSTMENT" />
                <div class="type-option-icon icon-adj">
                  <RefreshCw :size="18" />
                </div>
                <div>
                  <div class="type-title">Stock Opname (Adjustment)</div>
                  <div class="type-desc">Penyesuaian stok fisik aktual (Admin)</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Select Product -->
          <div class="form-group">
            <label class="form-label">Pilih Produk Inventaris *</label>
            <select
              v-model="form.product_id"
              @change="onProductChange"
              class="form-select"
              required
            >
              <option value="" disabled>-- Pilih Barang yang Mengalami Perubahan --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                [{{ p.sku }}] {{ p.name }} (Stok Saat Ini: {{ p.stock }} {{ p.unit }})
              </option>
            </select>
          </div>

          <!-- Preview Info Box -->
          <div v-if="selectedProduct" class="product-preview-box">
            <div class="preview-item">
              <span class="preview-label">Kode SKU:</span>
              <span class="preview-value font-mono">{{ selectedProduct.sku }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Lokasi Gudang:</span>
              <span class="preview-value">{{ selectedProduct.location || '-' }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Stok Tercatat:</span>
              <span class="preview-value font-bold text-primary">
                {{ selectedProduct.stock }} {{ selectedProduct.unit }}
              </span>
            </div>
          </div>

          <!-- Quantity -->
          <div class="form-group">
            <label class="form-label">
              {{ form.type === 'ADJUSTMENT' ? 'Jumlah Stok Fisik Riil Hasil Opname *' : 'Jumlah Kuantitas Barang *' }}
            </label>
            <div class="input-with-addon">
              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                class="form-control"
                required
              />
              <span class="input-addon">{{ selectedProduct?.unit || 'unit' }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Catatan Transaksi / Referensi Faktur</label>
            <textarea
              v-model="form.note"
              rows="3"
              class="form-control"
              placeholder="Contoh: No. Faktur PO-2026-992 dari Supplier Logistik / Pengiriman Pesanan Konsumen"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <router-link to="/transactions" class="btn btn-outline">Batal</router-link>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting || !selectedProduct"
            >
              {{ submitting ? 'Menyimpan Mutasi...' : 'Konfirmasi & Simpan Mutasi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}
.back-link:hover {
  color: var(--primary);
}

.mt-2 {
  margin-top: 0.5rem;
}

.form-container {
  max-width: 680px;
  margin-top: 1.5rem;
}

.form-card {
  padding: 2rem;
}

.type-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.type-option {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  background: #ffffff;
}

.type-option input {
  display: none;
}

.type-option:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.type-option.selected {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.type-option-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-in { background: #dcfce7; color: #166534; }
.icon-out { background: #fee2e2; color: #991b1b; }
.icon-adj { background: #fef3c7; color: #92400e; }

.type-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dark);
}

.type-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.product-preview-box {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.875rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.preview-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.preview-value {
  font-size: 0.85rem;
  color: var(--dark);
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.text-primary { color: var(--primary); }

.input-with-addon {
  display: flex;
}

.input-with-addon input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-addon {
  background: #f1f5f9;
  border: 1px solid var(--border);
  border-left: none;
  padding: 0.625rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  border-top-right-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.alert-danger {
  background-color: var(--danger-light);
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.alert-success {
  background-color: var(--success-light);
  color: #065f46;
  border: 1px solid #a7f3d0;
}
</style>
