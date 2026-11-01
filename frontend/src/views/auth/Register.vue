<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToast } from '../../composables/useToast';
import { Warehouse, ArrowRight, Eye, EyeOff } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const name = ref('');
const email = ref('');
const password = ref('');
const role_id = ref(2);
const showPassword = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';
  const result = await authStore.register(name.value, email.value, password.value, role_id.value);
  if (result.success) {
    toast.success('Akun Terdaftar', 'Selamat datang di sistem inventaris gudang!');
    router.push('/');
  } else {
    errorMessage.value = result.message || 'Registrasi gagal.';
  }
};
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="brand-row">
        <div class="brand-mark">
          <Warehouse :size="22" />
        </div>
        <span class="brand-label">StockPilot</span>
      </div>

      <h2 class="form-title">Buat Akun Baru</h2>
      <p class="form-subtitle">Registrasi pengguna sistem inventaris gudang</p>

      <div v-if="errorMessage" class="alert alert-danger">
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input v-model="name" type="text" class="form-control" placeholder="Contoh: Andi Wijaya" required />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="nama@gudang.local" required />
        </div>

        <div class="form-group">
          <label class="form-label">Kata Sandi</label>
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" placeholder="Minimal 6 karakter" required minlength="6" />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <Eye v-if="!showPassword" :size="16" />
              <EyeOff v-else :size="16" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Peran</label>
          <select v-model="role_id" class="form-select">
            <option :value="2">Staff Gudang</option>
            <option :value="1">Administrator</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="authStore.loading" style="margin-top: 0.5rem; padding: 0.6875rem;">
          <span>{{ authStore.loading ? 'Memproses...' : 'Buat Akun' }}</span>
          <ArrowRight :size="16" />
        </button>
      </form>

      <p class="auth-switch">
        Sudah punya akun?
        <router-link to="/login" class="auth-link">Masuk di sini</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-950);
  padding: 1.5rem;
}

.register-card {
  background: #fff;
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
  animation: containerIn 0.5s var(--ease-out) both;
}

@keyframes containerIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-violet));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}

.brand-label {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--slate-900);
  letter-spacing: -0.02em;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--slate-900);
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 0.8125rem;
  color: var(--slate-500);
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
}

.password-field {
  position: relative;
}
.password-field .form-control { padding-right: 2.75rem; }
.password-toggle {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--slate-400);
  cursor: pointer;
  padding: 0.25rem;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: var(--slate-500);
}

.auth-link {
  color: var(--primary-600);
  font-weight: 700;
  margin-left: 0.25rem;
}

.auth-link:hover { text-decoration: underline; }
</style>
