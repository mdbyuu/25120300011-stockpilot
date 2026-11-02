<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToast } from '../../composables/useToast';
import { Warehouse, LogIn, Eye, EyeOff, ArrowRight } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  const result = await authStore.login(email.value, password.value);
  if (result.success) {
    toast.success('Login Berhasil', `Selamat datang kembali, ${authStore.userName}!`);
    router.push('/');
  } else {
    errorMessage.value = result.message || 'Kredensial tidak valid.';
  }
};

</script>

<template>
  <div class="login-page">
    <!-- Ambient Background -->
    <div class="login-bg">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="login-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <Warehouse :size="20" />
            <span>Warehouse Management</span>
          </div>
          <h1 class="hero-title">
            Kelola Inventaris<br>
            Gudang Anda<br>
            <span class="gradient-text">Dengan Mudah.</span>
          </h1>
          <p class="hero-desc">
            Sistem informasi manajemen gudang modern untuk mencatat alur barang masuk,
            barang keluar, dan audit stok secara akurat dan efisien.
          </p>

        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="login-form-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <h2 class="form-title">Masuk ke Sistem</h2>
            <p class="form-subtitle">Gunakan kredensial akun gudang Anda</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                placeholder="user@gudang.local"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Kata Sandi</label>
              <div class="password-field">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="••••••••"
                  required
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block login-btn" :disabled="authStore.loading">
              <span>{{ authStore.loading ? 'Memproses...' : 'Masuk' }}</span>
              <ArrowRight :size="16" />
            </button>
          </form>

          <p class="auth-switch">
            Belum punya akun?
            <router-link to="/register" class="auth-link">Daftar di sini</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-950);
  position: relative;
  overflow: hidden;
  padding: 1rem;
}

/* Ambient Background Orbs */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.orb-1 {
  width: 400px; height: 400px;
  background: var(--primary-600);
  top: -10%; left: -5%;
  animation: orbFloat1 8s ease-in-out infinite;
}

.orb-2 {
  width: 350px; height: 350px;
  background: var(--accent-violet);
  bottom: -5%; right: -5%;
  animation: orbFloat2 10s ease-in-out infinite;
}

.orb-3 {
  width: 200px; height: 200px;
  background: var(--accent-cyan);
  top: 50%; left: 40%;
  animation: orbFloat3 12s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.1); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -40px) scale(1.05); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(0.95); }
}

/* Container */
.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
  animation: containerIn 0.6s var(--ease-out) both;
}

@keyframes containerIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Hero Panel */
.login-hero {
  flex: 1.1;
  background: linear-gradient(160deg, var(--slate-900) 0%, var(--slate-950) 100%);
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.2);
  color: var(--primary-300);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1.75rem;
  width: fit-content;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-400), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 0.875rem;
  color: var(--slate-400);
  line-height: 1.7;
  max-width: 380px;
  margin-bottom: 2rem;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.stat-text {
  font-size: 0.6875rem;
  color: var(--slate-500);
  font-weight: 600;
}

/* Form Panel */
.login-form-panel {
  flex: 0.9;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
}

.form-wrapper {
  width: 100%;
  max-width: 340px;
}

.form-header {
  margin-bottom: 1.75rem;
}

.form-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--slate-900);
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 0.8125rem;
  color: var(--slate-500);
  margin-top: 0.25rem;
}

.password-field {
  position: relative;
}

.password-field .form-control {
  padding-right: 2.75rem;
}

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
  border-radius: var(--radius-xs);
  transition: color 0.15s;
}

.password-toggle:hover {
  color: var(--slate-600);
}

.login-btn {
  margin-top: 0.5rem;
  padding: 0.6875rem;
  font-size: 0.875rem;
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

.auth-link:hover {
  text-decoration: underline;
}
</style>
