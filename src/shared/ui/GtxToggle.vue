<template>
  <label class="gtx-toggle">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="toggle-input"
    />
    <span class="toggle-slider"></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.gtx-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333; /* Fondo cuando está desactivado */
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Verde Pasto cuando está activo */
.toggle-input:checked + .toggle-slider {
  background-color: #4FD16C;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Estado Focus para accesibilidad */
.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 1px #4FD16C;
}
</style>