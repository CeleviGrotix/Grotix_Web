<template>
  <div class="profile-card" @click="$emit('select', profile)">
    <div class="card-left">
      <img :src="profile.profilePicture" :alt="profile.name" class="avatar" />
      <div class="info">
        <h3 class="name">{{ profile.name }}</h3>
        <p class="role">{{ profile.roleName }}</p>
      </div>
    </div>
    
    <div class="card-right" @click.stop>
      <label class="switch">
        <input type="checkbox" v-model="profile.isActive">
        <span class="slider round"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { Profile } from '../../domain/Profile';

defineProps({
  profile: { type: Profile, required: true }
});
</script>

<style scoped>
.profile-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #161819;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s;
}
.profile-card:hover {
  transform: translateY(-3px);
  background-color: #1e2122;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.name {
  color: var(--white);
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.role {
  color: var(--light-grey);
  margin: 0;
  font-size: 0.85rem;
}

/* ESTILOS DEL TOGGLE SWITCH */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--red-coral); transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--emerald-green); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }
</style>