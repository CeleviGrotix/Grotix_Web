<template>
  <div class="profile-card">
    <div class="profile-info">
      <img :src="profile.avatarUrl" :alt="profile.fullName" class="avatar" />
      <div class="details">
        <h3>{{ profile.fullName }}</h3>
        <p>{{ profile.role }}</p>
      </div>
    </div>
    
    <div class="actions">
      <GtxBadge :text="profile.status" />
      </div>
  </div>
</template>

<script setup>
import { Profile } from '../../domain/Profile';
import GtxBadge from '@/shared/ui/GtxBadge.vue';

defineProps({
  profile: {
    type: Profile,
    required: true
  }
});
</script>

<style scoped>
.profile-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #161819; /* Color de tus cards en Figma */
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
}

.details h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--white);
}

.details p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--light-grey);
}
</style>