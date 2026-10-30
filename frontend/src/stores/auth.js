import { defineStore } from 'pinia';
import api from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('inventory_user') || 'null'),
    token: localStorage.getItem('inventory_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role?.toLowerCase() === 'admin',
    userName: (state) => state.user?.name || 'User',
    userRole: (state) => state.user?.role || 'Staff'
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.success && response.data) {
          this.token = response.data.token;
          this.user = response.data.user;
          localStorage.setItem('inventory_token', this.token);
          localStorage.setItem('inventory_user', JSON.stringify(this.user));
          return { success: true };
        }
        throw new Error(response.message || 'Login gagal.');
      } catch (err) {
        this.error = err.message;
        return { success: false, message: err.message };
      } finally {
        this.loading = false;
      }
    },

    async register(name, email, password, role_id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', { name, email, password, role_id });
        if (response.success && response.data) {
          this.token = response.data.token;
          this.user = response.data.user;
          localStorage.setItem('inventory_token', this.token);
          localStorage.setItem('inventory_user', JSON.stringify(this.user));
          return { success: true };
        }
        throw new Error(response.message || 'Registrasi gagal.');
      } catch (err) {
        this.error = err.message;
        return { success: false, message: err.message };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
    }
  }
});
