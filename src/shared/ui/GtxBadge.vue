<template>
  <span :class="['gtx-badge', statusClass]">
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success' // success, error, warning, neutral
  }
});

const statusClass = computed(() => {
  const t = props.text.toUpperCase();
  if (t === 'ONLINE' || t === 'ACTIVE' || t === 'RENEWED') return 'badge-success';
  if (t === 'OFFLINE' || t === 'INACTIVE' || t === 'TERMINATED' || t === 'EXPIRED') return 'badge-error';
  if (t === 'DRAFT' || t === 'PENDING') return 'badge-warning';
  return 'badge-neutral';
});
</script>

<style scoped>
.gtx-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background-color: rgba(79, 209, 108, 0.2);
  color: var(--green-grass, #4FD16C);
  border: 1px solid rgba(79, 209, 108, 0.4);
}

.badge-error {
  background-color: rgba(255, 87, 87, 0.2);
  color: var(--red-coral, #FF5757);
  border: 1px solid rgba(255, 87, 87, 0.4);
}

.badge-warning {
  background-color: rgba(64, 191, 226, 0.2);
  color: var(--blue-cerulean, #40BFE2);
  border: 1px solid rgba(64, 191, 226, 0.4);
}

.badge-neutral {
  background-color: rgba(221, 221, 221, 0.2);
  color: var(--light-grey, #DDDDDD);
  border: 1px solid rgba(221, 221, 221, 0.4);
}
</style>