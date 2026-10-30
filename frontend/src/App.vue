<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import Toast from './components/Toast.vue';
import { useToast } from './composables/useToast';

const route = useRoute();
const { toasts, dismiss } = useToast();

const isAuthPage = computed(() => {
  return route.name === 'Login' || route.name === 'Register';
});
</script>

<template>
  <!-- Toast Notifications (Global) -->
  <Toast :toasts="toasts" @dismiss="dismiss" />

  <div v-if="isAuthPage">
    <router-view />
  </div>
  <div v-else class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
