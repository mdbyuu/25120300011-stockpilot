import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import ProductList from '../views/products/ProductList.vue';
import CategoryList from '../views/categories/CategoryList.vue';
import TransactionList from '../views/transactions/TransactionList.vue';
import StockMovementModal from '../views/transactions/StockMovement.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductList,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoryList,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionList,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions/new',
    name: 'StockMovement',
    component: StockMovementModal,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards untuk CPMK 4 (Keamanan & RBAC)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem('inventory_token');
  const user = JSON.parse(localStorage.getItem('inventory_user') || 'null');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Dashboard' });
  }

  if (to.meta.adminOnly && user?.role?.toLowerCase() !== 'admin') {
    alert('Akses Terbatas: Halaman ini hanya dapat diakses oleh Administrator Gudang.');
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
