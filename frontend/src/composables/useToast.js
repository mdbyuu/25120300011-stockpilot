import { reactive } from 'vue';

const state = reactive({
  toasts: []
});

let toastIdCounter = 0;

function addToast({ title, message = '', type = 'info', duration = 3500 }) {
  const id = ++toastIdCounter;
  state.toasts.push({ id, title, message, type, duration });
  setTimeout(() => {
    removeToast(id);
  }, duration);
  return id;
}

function removeToast(id) {
  const idx = state.toasts.findIndex(t => t.id === id);
  if (idx !== -1) state.toasts.splice(idx, 1);
}

export function useToast() {
  return {
    toasts: state.toasts,
    success: (title, message) => addToast({ title, message, type: 'success' }),
    error: (title, message) => addToast({ title, message, type: 'error' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
    dismiss: removeToast
  };
}
