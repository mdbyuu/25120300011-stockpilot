<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  LayoutDashboard,
  Package,
  Layers,
  ArrowLeftRight,
  LogOut,
  Warehouse,
  ShieldCheck,
  User
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Katalog Produk', icon: Package },
  { path: '/categories', label: 'Kategori Barang', icon: Layers, adminOnly: true },
  { path: '/transactions', label: 'Mutasi Stok', icon: ArrowLeftRight },
];
</script>

<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-mark">
        <Warehouse :size="22" />
      </div>
      <div class="brand-text">
        <span class="brand-name">W-Inventory</span>
        <span class="brand-edition">Warehouse v2.0</span>
      </div>
    </div>

    <!-- User Card -->
    <div class="sidebar-user">
      <div class="user-avatar">
        {{ authStore.userName.charAt(0).toUpperCase() }}
      </div>
      <div class="user-info">
        <span class="user-name">{{ authStore.userName }}</span>
        <span class="user-role" :class="authStore.isAdmin ? 'role-admin' : 'role-staff'">
          <ShieldCheck v-if="authStore.isAdmin" :size="11" />
          <User v-else :size="11" />
          {{ authStore.userRole }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <span class="nav-label">NAVIGASI</span>

      <template v-for="item in navItems" :key="item.path">
        <router-link
          v-if="!item.adminOnly || authStore.isAdmin"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <component :is="item.icon" :size="18" class="nav-icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.adminOnly" class="nav-badge">Admin</span>
        </router-link>
      </template>
    </nav>

    <!-- Footer -->
    <div class="sidebar-bottom">
      <button @click="handleLogout" class="logout-btn">
        <LogOut :size="17" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--slate-900);
  color: var(--slate-300);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Brand */
.sidebar-brand {
  padding: 1.5rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-violet));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.45);
  flex-shrink: 0;
}

.brand-name {
  display: block;
  font-size: 1.0625rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-edition {
  font-size: 0.625rem;
  color: var(--slate-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* User Card */
.sidebar-user {
  margin: 1rem 0.875rem;
  padding: 0.75rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent-cyan), var(--primary-500));
  color: #fff;
  font-weight: 800;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-xs);
  width: fit-content;
  margin-top: 0.2rem;
}

.role-admin {
  background: rgba(239,68,68,0.15);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.25);
}

.role-staff {
  background: rgba(16,185,129,0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16,185,129,0.25);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0.75rem;
}

.nav-label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--slate-600);
  letter-spacing: 0.1em;
  padding: 0.5rem 0.5rem 0.375rem;
  margin-top: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: var(--slate-400);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all 0.2s var(--ease-smooth);
  margin-bottom: 2px;
  position: relative;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255,255,255,0.06);
}

.nav-link.active {
  color: #fff;
  background: var(--primary-600);
  box-shadow: 0 2px 10px rgba(79,70,229,0.4);
}

.nav-link.active .nav-icon {
  color: #fff;
}

.nav-badge {
  margin-left: auto;
  font-size: 0.5625rem;
  font-weight: 800;
  background: rgba(255,255,255,0.1);
  color: var(--slate-400);
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nav-link.active .nav-badge {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

/* Footer */
.sidebar-bottom {
  padding: 0.875rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5625rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(239,68,68,0.2);
  color: var(--slate-400);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.4);
  color: #fca5a5;
}
</style>
