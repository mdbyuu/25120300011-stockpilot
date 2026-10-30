<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { useToast } from '../../composables/useToast';
import {
  Package,
  Layers,
  AlertTriangle,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-vue-next';

const toast = useToast();
const loading = ref(true);

const stats = ref({
  kpi: {
    total_products: 0,
    total_categories: 0,
    total_stock_physical: 0,
    total_inventory_value: 0,
    low_stock_count: 0,
    today_transactions: 0
  },
  low_stock_items: [],
  recent_transactions: []
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/stats');
    if (res.success && res.data) stats.value = res.data;
  } catch (err) {
    toast.error('Gagal memuat dashboard', err.message);
  } finally {
    loading.value = false;
  }
};

const formatRupiah = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const kpiCards = computed(() => [
  {
    label: 'Total SKU Produk',
    value: stats.value.kpi.total_products,
    suffix: '',
    sub: `${stats.value.kpi.total_categories} kategori`,
    icon: Package,
    color: 'primary',
    gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
  },
  {
    label: 'Stok Fisik Gudang',
    value: stats.value.kpi.total_stock_physical,
    suffix: 'unit',
    sub: 'Tersimpan seluruh zona',
    icon: Layers,
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #ecfeff, #cffafe)'
  },
  {
    label: 'Valuasi Total Aset',
    value: formatRupiah(stats.value.kpi.total_inventory_value),
    suffix: '',
    sub: 'Nilai inventaris pokok',
    icon: Coins,
    color: 'emerald',
    gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    isFormatted: true
  },
  {
    label: 'Peringatan Stok',
    value: stats.value.kpi.low_stock_count,
    suffix: 'item kritis',
    sub: 'Butuh segera restock',
    icon: AlertTriangle,
    color: 'rose',
    gradient: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    danger: stats.value.kpi.low_stock_count > 0
  }
]);

onMounted(fetchData);
</script>

<template>
  <div class="page-body">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Ringkasan operasional gudang & monitoring inventaris</p>
      </div>
      <div class="dash-actions">
        <button @click="fetchData" class="btn btn-outline" :disabled="loading">
          <RefreshCw :size="15" :class="{ spinning: loading }" />
          <span>Refresh</span>
        </button>
        <router-link to="/transactions/new" class="btn btn-primary">
          <PlusCircle :size="15" />
          <span>Catat Mutasi</span>
        </router-link>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div
        v-for="(card, idx) in kpiCards"
        :key="idx"
        class="kpi-card"
        :class="{ 'kpi-danger': card.danger }"
        :style="{ animationDelay: `${idx * 80}ms` }"
      >
        <div class="kpi-icon" :style="{ background: card.gradient }">
          <component :is="card.icon" :size="22" />
        </div>
        <div class="kpi-data">
          <span class="kpi-label">{{ card.label }}</span>
          <div class="kpi-value" :class="`kpi-${card.color}`">
            {{ card.isFormatted ? card.value : card.value }}
            <small v-if="card.suffix">{{ card.suffix }}</small>
          </div>
          <span class="kpi-sub">{{ card.sub }}</span>
        </div>
      </div>
    </div>

    <!-- Two Column Section -->
    <div class="dash-grid">
      <!-- Low Stock Alert -->
      <div class="card dash-card">
        <div class="card-top">
          <div class="card-top-left">
            <h3 class="card-title">Peringatan Stok Rendah</h3>
            <span v-if="stats.low_stock_items.length" class="badge badge-low-stock">
              {{ stats.low_stock_items.length }} kritis
            </span>
          </div>
          <router-link to="/products?low_stock=true" class="card-link">Lihat Semua</router-link>
        </div>

        <div v-if="!stats.low_stock_items.length" class="empty-state">
          <div class="empty-state-icon">
            <TrendingUp :size="24" />
          </div>
          <h3>Stok dalam kondisi aman</h3>
          <p>Tidak ada barang yang membutuhkan restok saat ini.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produk</th>
                <th>Stok</th>
                <th>Min</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in stats.low_stock_items" :key="item.id">
                <td><code class="sku-code">{{ item.sku }}</code></td>
                <td class="font-bold">{{ item.name }}</td>
                <td><span class="badge badge-low-stock">{{ item.stock }} {{ item.unit }}</span></td>
                <td class="text-muted">{{ item.min_stock }}</td>
                <td>
                  <router-link :to="`/transactions/new?product_id=${item.id}&type=IN`" class="btn btn-sm btn-primary">
                    Restock
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card dash-card">
        <div class="card-top">
          <h3 class="card-title">Aktivitas Terkini</h3>
          <router-link to="/transactions" class="card-link">Buku Mutasi</router-link>
        </div>

        <div v-if="!stats.recent_transactions.length" class="empty-state">
          <div class="empty-state-icon">
            <Activity :size="24" />
          </div>
          <h3>Belum ada aktivitas</h3>
          <p>Mulai catat mutasi stok pertama Anda.</p>
        </div>

        <div v-else class="activity-list">
          <div
            v-for="trx in stats.recent_transactions"
            :key="trx.id"
            class="activity-item"
          >
            <div
              class="activity-icon"
              :class="{
                'ai-in': trx.type === 'IN',
                'ai-out': trx.type === 'OUT',
                'ai-adj': trx.type === 'ADJUSTMENT'
              }"
            >
              <ArrowDownRight v-if="trx.type === 'IN'" :size="16" />
              <ArrowUpRight v-else-if="trx.type === 'OUT'" :size="16" />
              <RefreshCw v-else :size="14" />
            </div>

            <div class="activity-body">
              <span class="activity-product">{{ trx.product?.name || 'Produk' }}</span>
              <span class="activity-meta">
                {{ trx.reference_no }} · {{ trx.user?.name }} · {{ formatDate(trx.transaction_date) }}
              </span>
            </div>

            <span
              class="badge"
              :class="{
                'badge-in': trx.type === 'IN',
                'badge-out': trx.type === 'OUT',
                'badge-adjustment': trx.type === 'ADJUSTMENT'
              }"
            >
              {{ trx.type === 'IN' ? '+' : trx.type === 'OUT' ? '-' : '±' }}{{ trx.quantity }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

.dash-actions {
  display: flex;
  gap: 0.625rem;
}

.spinning {
  animation: spin 0.7s linear infinite;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.kpi-card {
  background: #fff;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.25s var(--ease-smooth);
  animation: kpiIn 0.5s var(--ease-out) both;
}

@keyframes kpiIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.kpi-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kpi-danger {
  border-left: 3px solid var(--danger);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon svg { color: var(--slate-700); }

.kpi-data { min-width: 0; }

.kpi-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-value {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--slate-900);
  line-height: 1.2;
  margin: 0.15rem 0;
  letter-spacing: -0.02em;
}

.kpi-value small {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--slate-500);
}

.kpi-emerald { color: #059669; }
.kpi-rose { color: #dc2626; }

.kpi-sub {
  font-size: 0.6875rem;
  color: var(--slate-400);
  font-weight: 500;
}

/* Dashboard Grid */
.dash-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.25rem;
}

.dash-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--slate-100);
}

.card-top-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.card-link {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-600);
}
.card-link:hover { text-decoration: underline; }

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--slate-50);
  transition: background 0.15s;
}

.activity-item:last-child { border-bottom: none; }
.activity-item:hover { background: var(--slate-50); }

.activity-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-in { background: #dcfce7; color: #166534; }
.ai-out { background: #fee2e2; color: #991b1b; }
.ai-adj { background: #fef3c7; color: #92400e; }

.activity-body { flex: 1; min-width: 0; }

.activity-product {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--slate-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  font-size: 0.6875rem;
  color: var(--slate-400);
}

.sku-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  background: var(--slate-100);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-xs);
  color: var(--slate-700);
  font-weight: 600;
}
</style>
