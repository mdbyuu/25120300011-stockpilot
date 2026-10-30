<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Filter,
  FileText
} from 'lucide-vue-next';

const transactions = ref([]);
const loading = ref(false);
const filterType = ref('');

const fetchTransactions = async () => {
  loading.value = true;
  try {
    let url = `/transactions?`;
    if (filterType.value) url += `type=${filterType.value}&`;

    const res = await api.get(url);
    if (res.success) {
      transactions.value = res.data;
    }
  } catch (error) {
    console.error('Gagal mengambil mutasi transaksi:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchTransactions();
});
</script>

<template>
  <div class="page-body">
    <div class="page-header">
      <div>
        <h1 class="page-title">Riwayat Mutasi & Audit Trail</h1>
        <p class="page-subtitle">Ledger pencatatan alur barang masuk, barang keluar, dan penyesuaian stok opname</p>
      </div>
      <div>
        <router-link to="/transactions/new" class="btn btn-primary">
          <PlusCircle :size="16" />
          <span>Catat Mutasi Baru</span>
        </router-link>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card toolbar-card">
      <div class="filter-flex">
        <label class="filter-label">Filter Jenis Mutasi:</label>
        <div class="btn-group-filter">
          <button
            @click="filterType = ''; fetchTransactions()"
            class="btn-filter"
            :class="{ active: filterType === '' }"
          >
            Semua Mutasi
          </button>
          <button
            @click="filterType = 'IN'; fetchTransactions()"
            class="btn-filter filter-in"
            :class="{ active: filterType === 'IN' }"
          >
            Barang Masuk (IN)
          </button>
          <button
            @click="filterType = 'OUT'; fetchTransactions()"
            class="btn-filter filter-out"
            :class="{ active: filterType === 'OUT' }"
          >
            Barang Keluar (OUT)
          </button>
          <button
            @click="filterType = 'ADJUSTMENT'; fetchTransactions()"
            class="btn-filter filter-adj"
            :class="{ active: filterType === 'ADJUSTMENT' }"
          >
            Stock Opname
          </button>
        </div>
      </div>
    </div>

    <!-- Transactions Ledger Table -->
    <div class="card table-card">
      <div v-if="loading" class="loading-state">
        <p>Memuat buku ledger mutasi...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="empty-state">
        <FileText :size="48" class="text-muted mb-2" />
        <h3 class="font-bold text-dark">Belum ada riwayat mutasi</h3>
        <p class="text-muted text-sm">Catat penerimaan atau pengeluaran barang pertama melalui tombol di atas.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>No. Referensi Transaksi</th>
              <th>Waktu Transaksi</th>
              <th>SKU & Nama Barang</th>
              <th>Jenis Mutasi</th>
              <th>Kuantitas Mutasi</th>
              <th>Stok Sebelum -> Sesudah</th>
              <th>Petugas / User</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trx in transactions" :key="trx.id">
              <td>
                <span class="ref-badge">{{ trx.reference_no }}</span>
              </td>
              <td class="text-muted text-sm">{{ formatDate(trx.transaction_date) }}</td>
              <td>
                <div>
                  <div class="font-bold text-dark">{{ trx.product?.name || 'Produk Dihapus' }}</div>
                  <small class="font-mono text-muted">{{ trx.product?.sku }}</small>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge-in': trx.type === 'IN',
                    'badge-out': trx.type === 'OUT',
                    'badge-adjustment': trx.type === 'ADJUSTMENT'
                  }"
                >
                  {{ trx.type }}
                </span>
              </td>
              <td>
                <span class="qty-highlight font-bold" :class="trx.type === 'IN' ? 'text-success' : trx.type === 'OUT' ? 'text-danger' : 'text-warning'">
                  {{ trx.type === 'IN' ? '+' : trx.type === 'OUT' ? '-' : '±' }}{{ trx.quantity }} {{ trx.product?.unit }}
                </span>
              </td>
              <td>
                <span class="stock-shift">
                  {{ trx.previous_stock }} → <strong>{{ trx.current_stock }}</strong> {{ trx.product?.unit }}
                </span>
              </td>
              <td>
                <span class="user-tag">{{ trx.user?.name || '-' }}</span>
              </td>
              <td class="text-sm text-muted">
                {{ trx.note || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
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

.toolbar-card {
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.5rem;
}

.filter-flex {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.btn-group-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-filter {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-muted);
}

.btn-filter:hover {
  background: #f1f5f9;
}

.btn-filter.active {
  background: var(--dark);
  color: #ffffff;
  border-color: var(--dark);
}

.btn-filter.filter-in.active {
  background: var(--success);
  border-color: var(--success);
}

.btn-filter.filter-out.active {
  background: var(--danger);
  border-color: var(--danger);
}

.btn-filter.filter-adj.active {
  background: var(--warning);
  border-color: var(--warning);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.loading-state, .empty-state {
  padding: 3rem;
  text-align: center;
}

.ref-badge {
  font-family: monospace;
  font-weight: 700;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--dark);
}

.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
.text-sm { font-size: 0.8rem; }
.text-success { color: #059669; }
.text-danger { color: #dc2626; }
.text-warning { color: #d97706; }

.stock-shift {
  font-size: 0.85rem;
  color: var(--secondary);
}

.user-tag {
  background: #e2e8f0;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--dark);
}
</style>
