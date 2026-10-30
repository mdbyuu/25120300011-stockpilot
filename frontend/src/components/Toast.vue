<!-- Toast Notification Component -->
<script setup>
import { ref, watch } from 'vue';
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next';

const props = defineProps({
  toasts: { type: Array, default: () => [] }
});

const emit = defineEmits(['dismiss']);

const dismiss = (id) => {
  emit('dismiss', id);
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type || 'info'}`"
        >
          <div class="toast-icon">
            <CheckCircle v-if="toast.type === 'success'" :size="20" style="color: var(--success)" />
            <XCircle v-else-if="toast.type === 'error'" :size="20" style="color: var(--danger)" />
            <Info v-else :size="20" style="color: var(--info)" />
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click="dismiss(toast.id)">
            <X :size="14" />
          </button>
          <div class="toast-progress" :style="{ animationDuration: (toast.duration || 3500) + 'ms' }"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  animation: toastIn 0.4s var(--ease-spring) both;
}
.toast-leave-active {
  animation: toastOut 0.3s var(--ease-smooth) both;
}
</style>
