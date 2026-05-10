<template>
  <div class="crop-card" @click="$emit('select', crop)">
    <img :src="crop.imageUrl" :alt="crop.commonName" class="crop-image" />
    <span class="crop-name">{{ crop.commonName }}</span>
  </div>
</template>

<script setup>
import { Crop } from '../../domain/Crop';

defineProps({
  crop: { type: Crop, required: true }
});
</script>

<style scoped>
.crop-card {
  display: flex;
  align-items: center;
  background-color: #161819;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s;
  gap: 16px;
}

.crop-card:hover {
  transform: translateY(-3px);
  background-color: #1e2122;
}

.crop-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.crop-name {
  color: var(--white, #ffffff);
  font-weight: 600;
  font-size: 1.1rem;
}
</style>